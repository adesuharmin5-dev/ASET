const express = require('express');
const router = express.Router();
const multer = require('multer');
const { db } = require('../db');
const { authMiddleware } = require('../auth');

const upload = multer({ storage: multer.memoryStorage() });

// LIST assets with filters
router.get('/', authMiddleware, (req, res) => {
  try {
    const { search, category_id, room_id, condition_id, pic_id } = req.query;

    let query = `SELECT * FROM v_assets_detail WHERE 1=1`;
    const params = [];

    if (search && search.trim()) {
      query += ` AND (code LIKE ? OR name LIKE ? OR category_name LIKE ? OR room_name LIKE ? OR pic_name LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    if (category_id) {
      query += ` AND category_id = ?`;
      params.push(category_id);
    }

    if (room_id) {
      query += ` AND room_id = ?`;
      params.push(room_id);
    }

    if (condition_id) {
      query += ` AND condition_id = ?`;
      params.push(condition_id);
    }

    if (pic_id) {
      query += ` AND pic_id = ?`;
      params.push(pic_id);
    }

    query += ` ORDER BY id DESC`;

    const assets = db.prepare(query).all(...params);
    res.json({ success: true, count: assets.length, data: assets });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat data aset: ' + err.message });
  }
});

// GET single asset detail including maintenance history
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const asset = db.prepare(`SELECT * FROM v_assets_detail WHERE id = ?`).get(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Aset tidak ditemukan.' });
    }

    const maintenanceHistory = db.prepare(`
      SELECT 
        m.id,
        m.ticket_number,
        m.request_date,
        m.status,
        m.scheduled_date,
        m.completion_date,
        m.cost,
        m.technician,
        m.notes,
        rc.name AS result_condition_name
      FROM maintenance m
      LEFT JOIN conditions rc ON m.result_condition_id = rc.id
      WHERE m.asset_id = ?
      ORDER BY m.id DESC
    `).all(req.params.id);

    res.json({
      success: true,
      data: {
        ...asset,
        maintenance_history: maintenanceHistory
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat detail aset: ' + err.message });
  }
});

// CREATE asset
router.post('/', authMiddleware, (req, res) => {
  const { code, name, category_id, room_id, condition_id, pic_id, value, purchase_date, notes, item_no, quantity, equity } = req.body;
  const now = new Date().toISOString();

  if (!name || !category_id || !room_id || !condition_id || !pic_id || !purchase_date) {
    return res.status(400).json({
      success: false,
      message: 'Nama, kategori, ruangan, kondisi, penanggung jawab, dan tanggal beli wajib diisi.'
    });
  }

  const assetCode = code && code.trim() ? code.trim() : `AST-${Date.now()}`;

  // Check code uniqueness if code is provided
  if (code && code.trim()) {
    const existing = db.prepare('SELECT id FROM assets WHERE LOWER(code) = LOWER(?)').get(code.trim());
    if (existing) {
      return res.status(400).json({ success: false, message: `Kode aset '${code}' sudah digunakan.` });
    }
  }

  try {
    const numValue = Number(value) || 0;
    const numQty = Number(quantity) || 1;
    const itemNum = Number(item_no) || (db.prepare('SELECT COALESCE(MAX(item_no), 0) + 1 AS next_no FROM assets').get().next_no);
    const eq = equity && equity.trim() ? equity.trim() : 'AURORA';

    const result = db.prepare(`
      INSERT INTO assets (item_no, code, name, quantity, category_id, equity, room_id, condition_id, pic_id, value, purchase_date, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      itemNum,
      assetCode,
      name.trim(),
      numQty,
      Number(category_id),
      eq,
      Number(room_id),
      Number(condition_id),
      Number(pic_id),
      numValue,
      purchase_date.trim(),
      notes || '',
      now,
      now
    );

    const created = db.prepare('SELECT * FROM v_assets_detail WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, message: 'Aset berhasil disimpan.', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menyimpan aset: ' + err.message });
  }
});

// UPDATE asset
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { code, name, category_id, room_id, condition_id, pic_id, value, purchase_date, notes, item_no, quantity, equity } = req.body;
  const now = new Date().toISOString();

  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'Aset tidak ditemukan.' });
  }

  if (code && code.trim().toLowerCase() !== (asset.code || '').toLowerCase()) {
    const existing = db.prepare('SELECT id FROM assets WHERE LOWER(code) = LOWER(?) AND id != ?').get(code.trim(), id);
    if (existing) {
      return res.status(400).json({ success: false, message: `Kode aset '${code}' sudah digunakan aset lain.` });
    }
  }

  try {
    db.prepare(`
      UPDATE assets SET
        item_no = ?,
        code = ?,
        name = ?,
        quantity = ?,
        category_id = ?,
        equity = ?,
        room_id = ?,
        condition_id = ?,
        pic_id = ?,
        value = ?,
        purchase_date = ?,
        notes = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      item_no !== undefined ? Number(item_no) : (asset.item_no || asset.id),
      code ? code.trim() : asset.code,
      name ? name.trim() : asset.name,
      quantity !== undefined ? Number(quantity) : (asset.quantity || 1),
      category_id ? Number(category_id) : asset.category_id,
      equity ? equity.trim() : (asset.equity || 'AURORA'),
      room_id ? Number(room_id) : asset.room_id,
      condition_id ? Number(condition_id) : asset.condition_id,
      pic_id ? Number(pic_id) : asset.pic_id,
      value !== undefined ? Number(value) : asset.value,
      purchase_date ? purchase_date.trim() : asset.purchase_date,
      notes !== undefined ? notes : asset.notes,
      now,
      id
    );

    const updated = db.prepare('SELECT * FROM v_assets_detail WHERE id = ?').get(id);
    res.json({ success: true, message: 'Data aset berhasil diperbarui.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui aset: ' + err.message });
  }
});

// DELETE asset
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'Aset tidak ditemukan.' });
  }

  try {
    db.prepare('DELETE FROM assets WHERE id = ?').run(id);
    res.json({ success: true, message: `Aset ${asset.code} - ${asset.name} berhasil dihapus.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus aset: ' + err.message });
  }
});

// EXPORT assets to CSV
router.get('/export/csv', (req, res) => {
  try {
    const assets = db.prepare('SELECT * FROM v_assets_detail ORDER BY code ASC').all();

    const headers = [
      'Kode Aset',
      'Nama Aset',
      'Kategori',
      'Kode Kategori',
      'Ruangan',
      'Kode Ruangan',
      'Gedung',
      'Lantai',
      'Kondisi',
      'Nilai Perolehan (Rp)',
      'Tanggal Beli',
      'Penanggung Jawab',
      'NIP PIC',
      'Catatan',
      'Total Biaya Perawatan'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = assets.map(a => [
      escapeCsv(a.code),
      escapeCsv(a.name),
      escapeCsv(a.category_name),
      escapeCsv(a.category_code),
      escapeCsv(a.room_name),
      escapeCsv(a.room_code),
      escapeCsv(a.room_building),
      escapeCsv(a.room_floor),
      escapeCsv(a.condition_name),
      escapeCsv(a.value),
      escapeCsv(a.purchase_date),
      escapeCsv(a.pic_name),
      escapeCsv(a.pic_nip),
      escapeCsv(a.notes || ''),
      escapeCsv(a.total_maintenance_cost || 0)
    ].join(','));

    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="data_aset_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengekspor data: ' + err.message });
  }
});

// IMPORT assets from CSV
router.post('/import/csv', authMiddleware, upload.single('file'), (req, res) => {
  try {
    let content = '';
    if (req.file) {
      content = req.file.buffer.toString('utf8');
    } else if (req.body && req.body.csv_text) {
      content = req.body.csv_text;
    } else {
      return res.status(400).json({ success: false, message: 'File CSV atau data CSV tidak ditemukan.' });
    }

    // Strip BOM
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }

    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      return res.status(400).json({ success: false, message: 'Format CSV kosong atau tidak memiliki baris data.' });
    }

    // Parse simple CSV line handling quotes
    const parseLine = (text) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
          if (inQuotes && text[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const header = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    // Find column indexes
    const idxCode = header.findIndex(h => h.includes('kode') && h.includes('aset')) !== -1 
      ? header.findIndex(h => h.includes('kode') && h.includes('aset'))
      : header.findIndex(h => h === 'code' || h === 'kode');

    const idxName = header.findIndex(h => h.includes('nama')) !== -1 
      ? header.findIndex(h => h.includes('nama'))
      : header.findIndex(h => h === 'name');

    const idxCat = header.findIndex(h => h.includes('kategori')) !== -1 
      ? header.findIndex(h => h.includes('kategori'))
      : header.findIndex(h => h === 'category');

    const idxRoom = header.findIndex(h => h.includes('ruang')) !== -1 
      ? header.findIndex(h => h.includes('ruang'))
      : header.findIndex(h => h === 'room');

    const idxCond = header.findIndex(h => h.includes('kondisi')) !== -1 
      ? header.findIndex(h => h.includes('kondisi'))
      : header.findIndex(h => h === 'condition');

    const idxVal = header.findIndex(h => h.includes('nilai') || h.includes('harga')) !== -1 
      ? header.findIndex(h => h.includes('nilai') || h.includes('harga'))
      : header.findIndex(h => h === 'value');

    const idxDate = header.findIndex(h => h.includes('tanggal') || h.includes('beli')) !== -1 
      ? header.findIndex(h => h.includes('tanggal') || h.includes('beli'))
      : header.findIndex(h => h === 'purchase_date' || h === 'date');

    const idxPic = header.findIndex(h => h.includes('pic') || h.includes('penanggung') || h.includes('jawab')) !== -1 
      ? header.findIndex(h => h.includes('pic') || h.includes('penanggung') || h.includes('jawab'))
      : header.findIndex(h => h === 'pic');

    const idxNotes = header.findIndex(h => h.includes('catatan') || h.includes('ket') || h.includes('notes'));

    // Cache master records
    const categories = db.prepare('SELECT id, code, name FROM categories').all();
    const rooms = db.prepare('SELECT id, code, name FROM rooms').all();
    const conditions = db.prepare('SELECT id, code, name FROM conditions').all();
    const pics = db.prepare('SELECT id, code, name FROM pics').all();

    const findMaster = (list, searchVal) => {
      if (!searchVal) return list[0]?.id || 1;
      const clean = searchVal.trim().toLowerCase();
      const match = list.find(item => 
        item.code.toLowerCase() === clean || 
        item.name.toLowerCase() === clean || 
        item.name.toLowerCase().includes(clean)
      );
      return match ? match.id : (list[0]?.id || 1);
    };

    let inserted = 0;
    let skipped = 0;
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO assets (code, name, category_id, room_id, condition_id, pic_id, value, purchase_date, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.length < 2) continue;

      const code = (idxCode !== -1 ? cols[idxCode] : cols[0])?.trim();
      const name = (idxName !== -1 ? cols[idxName] : cols[1])?.trim();

      if (!code || !name) {
        skipped++;
        continue;
      }

      // Check if already exists
      const existing = db.prepare('SELECT id FROM assets WHERE LOWER(code) = LOWER(?)').get(code);
      if (existing) {
        skipped++;
        continue;
      }

      const catVal = idxCat !== -1 ? cols[idxCat] : '';
      const roomVal = idxRoom !== -1 ? cols[idxRoom] : '';
      const condVal = idxCond !== -1 ? cols[idxCond] : '';
      const picVal = idxPic !== -1 ? cols[idxPic] : '';
      const numVal = idxVal !== -1 ? parseFloat(cols[idxVal].replace(/[^0-9.-]/g, '')) || 0 : 0;
      const dateVal = idxDate !== -1 && cols[idxDate] ? cols[idxDate].trim() : now.slice(0, 10);
      const notesVal = idxNotes !== -1 ? cols[idxNotes] : '';

      const categoryId = findMaster(categories, catVal);
      const roomId = findMaster(rooms, roomVal);
      const conditionId = findMaster(conditions, condVal);
      const picId = findMaster(pics, picVal);

      insertStmt.run(code, name, categoryId, roomId, conditionId, picId, numVal, dateVal, notesVal, now, now);
      inserted++;
    }

    res.json({
      success: true,
      message: `Impor CSV selesai. ${inserted} data aset berhasil ditambahkan, ${skipped} dilewati (kode duplikat atau data tidak lengkap).`,
      inserted,
      skipped
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengimpor data CSV: ' + err.message });
  }
});

module.exports = router;
