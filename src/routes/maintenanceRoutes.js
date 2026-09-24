const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authMiddleware } = require('../auth');

const VALID_STATUSES = ['Permintaan', 'Dijadwalkan', 'Dilaksanakan', 'Selesai', 'Dibatalkan'];

// Helper to generate ticket number
function generateTicketNumber() {
  const year = new Date().getFullYear();
  const countRow = db.prepare(`
    SELECT COUNT(*) as count FROM maintenance 
    WHERE ticket_number LIKE ?
  `).get(`MNT-${year}-%`);

  const nextSeq = String((countRow.count || 0) + 1).padStart(4, '0');
  return `MNT-${year}-${nextSeq}`;
}

// LIST maintenance tickets with filters
router.get('/', authMiddleware, (req, res) => {
  try {
    const { status, asset_id, start_date, end_date } = req.query;

    let query = `SELECT * FROM v_maintenance_detail WHERE 1=1`;
    const params = [];

    if (status && status !== 'Semua') {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (asset_id) {
      query += ` AND asset_id = ?`;
      params.push(asset_id);
    }

    if (start_date) {
      query += ` AND request_date >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND request_date <= ?`;
      params.push(end_date);
    }

    query += ` ORDER BY id DESC`;

    const tickets = db.prepare(query).all(...params);
    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat data perawatan: ' + err.message });
  }
});

// GET single ticket detail
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const ticket = db.prepare('SELECT * FROM v_maintenance_detail WHERE id = ?').get(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Tiket perawatan tidak ditemukan.' });
    }
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat detail perawatan: ' + err.message });
  }
});

// CREATE maintenance ticket (Input Permintaan)
router.post('/', authMiddleware, (req, res) => {
  const { asset_id, request_date, status, scheduled_date, cost, technician, notes, set_asset_condition_id, maint_type, quantity, unit, proof, section } = req.body;
  const now = new Date().toISOString();

  if (!asset_id || !request_date) {
    return res.status(400).json({
      success: false,
      message: 'Aset dan tanggal permintaan wajib diisi.'
    });
  }

  const asset = db.prepare(`
    SELECT a.id, a.code, a.name, c.name AS category_name 
    FROM assets a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.id = ?
  `).get(asset_id);

  if (!asset) {
    return res.status(404).json({ success: false, message: 'Aset tidak ditemukan.' });
  }

  const ticketStatus = status && VALID_STATUSES.includes(status) ? status : 'Permintaan';
  const ticketNumber = generateTicketNumber();
  const itemNo = (db.prepare('SELECT COALESCE(MAX(item_no), 0) + 1 AS next_no FROM maintenance').get().next_no);

  try {
    const result = db.prepare(`
      INSERT INTO maintenance (
        ticket_number, item_no, asset_id, item_name, category_name, maint_type,
        request_date, status, scheduled_date, completion_date, quantity, unit,
        cost, proof, technician, notes, section, result_condition_id, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      ticketNumber,
      itemNo,
      Number(asset_id),
      asset.name,
      asset.category_name || 'Elektronik',
      maint_type || 'Terencana',
      request_date.trim(),
      ticketStatus,
      scheduled_date ? scheduled_date.trim() : '',
      ticketStatus === 'Selesai' ? (request_date.trim()) : '',
      Number(quantity) || 1,
      unit || 'Buah',
      Number(cost) || 0,
      proof || '-',
      technician ? technician.trim() : '',
      notes || '',
      section || 'BULAN_INI',
      null,
      now,
      now
    );

    // If user specified an updated condition for the asset upon reporting
    if (set_asset_condition_id) {
      db.prepare('UPDATE assets SET condition_id = ?, updated_at = ? WHERE id = ?').run(
        Number(set_asset_condition_id),
        now,
        asset_id
      );
    }

    const created = db.prepare('SELECT * FROM v_maintenance_detail WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      success: true,
      message: `Tiket perawatan ${ticketNumber} berhasil dibuat.`,
      data: created
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal membuat tiket perawatan: ' + err.message });
  }
});

// UPDATE maintenance ticket (Alur: Jadwal, Pelaksanaan, Selesai, Biaya, Batal)
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { status, scheduled_date, completion_date, cost, technician, notes, result_condition_id } = req.body;
  const now = new Date().toISOString();

  const ticket = db.prepare('SELECT * FROM maintenance WHERE id = ?').get(id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Tiket perawatan tidak ditemukan.' });
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'Status perawatan tidak valid.' });
  }

  try {
    const updatedStatus = status || ticket.status;
    const updatedScheduled = scheduled_date !== undefined ? scheduled_date : ticket.scheduled_date;
    let updatedCompletion = completion_date !== undefined ? completion_date : ticket.completion_date;
    const updatedCost = cost !== undefined ? Number(cost) : ticket.cost;
    const updatedTech = technician !== undefined ? technician : ticket.technician;
    const updatedNotes = notes !== undefined ? notes : ticket.notes;
    const updatedResultCond = result_condition_id !== undefined ? (result_condition_id ? Number(result_condition_id) : null) : ticket.result_condition_id;

    // Auto set completion_date if status set to 'Selesai' and completion_date empty
    if (updatedStatus === 'Selesai' && !updatedCompletion) {
      updatedCompletion = now.slice(0, 10);
    }

    db.prepare(`
      UPDATE maintenance SET
        status = ?,
        scheduled_date = ?,
        completion_date = ?,
        cost = ?,
        technician = ?,
        notes = ?,
        result_condition_id = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      updatedStatus,
      updatedScheduled,
      updatedCompletion,
      updatedCost,
      updatedTech,
      updatedNotes,
      updatedResultCond,
      now,
      id
    );

    // Synchronize asset condition if maintenance finished with a result condition
    if (updatedStatus === 'Selesai' && updatedResultCond) {
      db.prepare('UPDATE assets SET condition_id = ?, updated_at = ? WHERE id = ?').run(
        updatedResultCond,
        now,
        ticket.asset_id
      );
    }

    const updated = db.prepare('SELECT * FROM v_maintenance_detail WHERE id = ?').get(id);
    res.json({
      success: true,
      message: `Status tiket ${ticket.ticket_number} berhasil diperbarui menjadi ${updatedStatus}.`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui tiket perawatan: ' + err.message });
  }
});

// DELETE maintenance ticket
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  const ticket = db.prepare('SELECT * FROM maintenance WHERE id = ?').get(id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Tiket perawatan tidak ditemukan.' });
  }

  try {
    db.prepare('DELETE FROM maintenance WHERE id = ?').run(id);
    res.json({ success: true, message: `Tiket perawatan ${ticket.ticket_number} berhasil dihapus.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus tiket perawatan: ' + err.message });
  }
});

// EXPORT maintenance tickets to CSV
router.get('/export/csv', (req, res) => {
  try {
    const tickets = db.prepare('SELECT * FROM v_maintenance_detail ORDER BY id DESC').all();

    const headers = [
      'Nomor Tiket',
      'Kode Aset',
      'Nama Aset',
      'Kategori',
      'Ruangan',
      'Tanggal Permintaan',
      'Status Perawatan',
      'Tanggal Jadwal',
      'Tanggal Selesai',
      'Biaya Perawatan (Rp)',
      'Teknisi / Vendor',
      'Catatan Perawatan',
      'Kondisi Setelah Perawatan'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = tickets.map(t => [
      escapeCsv(t.ticket_number),
      escapeCsv(t.asset_code),
      escapeCsv(t.asset_name),
      escapeCsv(t.category_name),
      escapeCsv(t.room_name),
      escapeCsv(t.request_date),
      escapeCsv(t.status),
      escapeCsv(t.scheduled_date || ''),
      escapeCsv(t.completion_date || ''),
      escapeCsv(t.cost || 0),
      escapeCsv(t.technician || ''),
      escapeCsv(t.notes || ''),
      escapeCsv(t.result_condition_name || '')
    ].join(','));

    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="data_perawatan_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengekspor riwayat perawatan: ' + err.message });
  }
});

module.exports = router;
