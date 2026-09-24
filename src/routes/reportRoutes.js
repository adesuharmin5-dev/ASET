const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authMiddleware } = require('../auth');

// GET Company info helper
function getCompanyProfile() {
  let profile = db.prepare('SELECT * FROM company_profile WHERE id = 1').get();
  if (!profile) {
    profile = {
      app_name: 'Aurora Aset',
      company_name: 'PT. AURORA',
      address: 'Gedung Menara Aurora, Jl. Batununggal No. 88',
      phone: '(022) 750-1234',
      email: 'aset@aurora.co.id',
      website: 'www.aurora.co.id',
      logo_url: ''
    };
  }
  return profile;
}

// GET Aurora Rekap (Hal 1 PDF)
router.get('/aurora-rekap', authMiddleware, (req, res) => {
  try {
    const profile = getCompanyProfile();

    // 1. Overall stats
    const totalAssetsRow = db.prepare(`SELECT COUNT(*) as count, COALESCE(SUM(value), 0) as total_value FROM assets`).get();
    const totalMaintRow = db.prepare(`SELECT COUNT(*) as count, COALESCE(SUM(cost), 0) as total_cost FROM maintenance`).get();
    const totalCategoryCount = db.prepare(`SELECT COUNT(DISTINCT id) as count FROM categories`).get().count;
    const totalRoomCount = db.prepare(`SELECT COUNT(DISTINCT id) as count FROM rooms`).get().count;

    const totalAssets = totalAssetsRow.count || 0;
    const totalValue = totalAssetsRow.total_value || 0;
    const totalMaint = totalMaintRow.count || 0;
    const totalCost = totalMaintRow.total_cost || 0;

    // 2. Rekap Jenis Barang (Kategori)
    const categoryRows = db.prepare(`
      SELECT 
        c.id,
        c.name AS category_name,
        COUNT(a.id) AS total_unit,
        COALESCE(SUM(a.value), 0) AS total_nilai
      FROM categories c
      LEFT JOIN assets a ON a.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY total_nilai DESC, total_unit DESC
    `).all();

    const rekapJenisBarang = categoryRows.map(row => ({
      name: row.category_name,
      unit: row.total_unit,
      pct_unit: totalAssets > 0 ? ((row.total_unit / totalAssets) * 100).toFixed(2) : '0.00',
      nilai: row.total_nilai,
      pct_nilai: totalValue > 0 ? ((row.total_nilai / totalValue) * 100).toFixed(2) : '0.00'
    }));

    // 3. Rekap Lokasi (Ruangan)
    const roomRows = db.prepare(`
      SELECT 
        r.id,
        r.name AS room_name,
        r.building,
        r.floor,
        COUNT(a.id) AS total_unit,
        COALESCE(SUM(a.value), 0) AS total_nilai
      FROM rooms r
      LEFT JOIN assets a ON a.room_id = r.id
      GROUP BY r.id, r.name, r.building, r.floor
      ORDER BY total_unit DESC, total_nilai DESC
    `).all();

    const rekapLokasi = roomRows.map(row => ({
      name: row.room_name,
      building: row.building || '',
      floor: row.floor || '',
      unit: row.total_unit,
      pct_unit: totalAssets > 0 ? ((row.total_unit / totalAssets) * 100).toFixed(2) : '0.00',
      nilai: row.total_nilai
    }));

    // 4. Rekap Kondisi Aset
    const conditionRows = db.prepare(`
      SELECT 
        cd.id,
        cd.name AS condition_name,
        cd.level,
        COUNT(a.id) AS total_unit,
        COALESCE(SUM(a.value), 0) AS total_nilai
      FROM conditions cd
      LEFT JOIN assets a ON a.condition_id = cd.id
      GROUP BY cd.id, cd.name, cd.level
      ORDER BY cd.id ASC
    `).all();

    const rekapKondisi = conditionRows.map(row => ({
      name: row.condition_name,
      level: row.level,
      unit: row.total_unit,
      pct_unit: totalAssets > 0 ? ((row.total_unit / totalAssets) * 100).toFixed(2) : '0.00',
      nilai: row.total_nilai
    }));

    // 5. Rekap Jenis Pemeliharaan
    const maintTypes = db.prepare(`
      SELECT 
        COALESCE(maint_type, 'Terencana') AS maint_type,
        COUNT(id) AS frequency,
        COALESCE(SUM(cost), 0) AS total_cost
      FROM maintenance
      GROUP BY maint_type
      ORDER BY total_cost DESC
    `).all();

    const rekapPemeliharaan = maintTypes.map(row => ({
      maint_type: row.maint_type,
      frequency: row.frequency,
      total_cost: row.total_cost,
      pct_cost: totalCost > 0 ? ((row.total_cost / totalCost) * 100).toFixed(2) : '0.00'
    }));

    res.json({
      success: true,
      company: profile,
      period: 'Februari 2026',
      summary: {
        total_assets: totalAssets,
        total_value: totalValue,
        total_maintenance: totalMaint,
        total_cost: totalCost,
        total_categories: totalCategoryCount,
        total_rooms: totalRoomCount
      },
      rekap_jenis_barang: rekapJenisBarang,
      rekap_lokasi: rekapLokasi,
      rekap_kondisi: rekapKondisi,
      rekap_pemeliharaan: rekapPemeliharaan
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat laporan rekapitulasi: ' + err.message });
  }
});

// GET Aurora Detail (Hal 2-4 PDF)
router.get('/aurora-detail', authMiddleware, (req, res) => {
  try {
    const profile = getCompanyProfile();
    const assets = db.prepare(`
      SELECT 
        a.id,
        COALESCE(a.item_no, a.id) AS item_no,
        COALESCE(a.code, '') AS code,
        a.name,
        COALESCE(a.quantity, 1) AS quantity,
        c.name AS category_name,
        COALESCE(a.equity, 'AURORA') AS equity,
        COALESCE(r.name, '-') AS room_name,
        COALESCE(a.purchase_date, '-') AS purchase_date,
        a.value,
        COALESCE(cd.name, 'Baik') AS condition_name,
        COALESCE(cd.level, 'BAIK') AS condition_level
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN rooms r ON a.room_id = r.id
      LEFT JOIN conditions cd ON a.condition_id = cd.id
      ORDER BY COALESCE(a.item_no, a.id) ASC
    `).all();

    const totalValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);
    const totalQuantity = assets.reduce((sum, a) => sum + (a.quantity || 1), 0);

    res.json({
      success: true,
      company: profile,
      total_items: assets.length,
      total_quantity: totalQuantity,
      total_value: totalValue,
      data: assets
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat detail data aset: ' + err.message });
  }
});

// GET Aurora Maintenance (Hal 5 PDF)
router.get('/aurora-maintenance', authMiddleware, (req, res) => {
  try {
    const profile = getCompanyProfile();
    const tickets = db.prepare(`
      SELECT 
        m.id,
        COALESCE(m.item_no, m.id) AS item_no,
        m.ticket_number,
        m.item_name,
        COALESCE(m.category_name, c.name, 'Elektronik') AS category_name,
        COALESCE(m.maint_type, 'Terencana') AS maint_type,
        m.request_date,
        m.scheduled_date,
        m.completion_date,
        COALESCE(m.quantity, 1) AS quantity,
        COALESCE(m.unit, 'Buah') AS unit,
        m.cost,
        COALESCE(m.proof, '-') AS proof,
        COALESCE(m.notes, '') AS notes,
        COALESCE(m.section, 'BULAN_KEMARIN') AS section,
        m.status
      FROM maintenance m
      LEFT JOIN assets a ON m.asset_id = a.id
      LEFT JOIN categories c ON a.category_id = c.id
      ORDER BY m.id ASC
    `).all();

    const bulanIni = tickets.filter(t => t.section === 'BULAN_INI');
    const bulanKemarin = tickets.filter(t => t.section === 'BULAN_KEMARIN');

    const totalCost = tickets.reduce((sum, t) => sum + (t.cost || 0), 0);
    const costBulanIni = bulanIni.reduce((sum, t) => sum + (t.cost || 0), 0);
    const costBulanKemarin = bulanKemarin.reduce((sum, t) => sum + (t.cost || 0), 0);

    res.json({
      success: true,
      company: profile,
      summary: {
        total_tickets: tickets.length,
        total_cost: totalCost,
        cost_bulan_ini: costBulanIni,
        cost_bulan_kemarin: costBulanKemarin
      },
      sections: {
        bulan_ini: bulanIni,
        bulan_kemarin: bulanKemarin
      },
      all: tickets
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat daftar pemeliharaan: ' + err.message });
  }
});

// Standard Detail Reports (filter supported)
router.get('/detail', authMiddleware, (req, res) => {
  try {
    const { category_id, room_id, condition_id, status, start_date, end_date } = req.query;

    let assetQuery = `SELECT * FROM v_assets_detail WHERE 1=1`;
    const assetParams = [];

    if (category_id) {
      assetQuery += ` AND category_id = ?`;
      assetParams.push(category_id);
    }
    if (room_id) {
      assetQuery += ` AND room_id = ?`;
      assetParams.push(room_id);
    }
    if (condition_id) {
      assetQuery += ` AND condition_id = ?`;
      assetParams.push(condition_id);
    }
    assetQuery += ` ORDER BY COALESCE(item_no, id) ASC`;
    const assets = db.prepare(assetQuery).all(...assetParams);

    let maintQuery = `SELECT * FROM v_maintenance_detail WHERE 1=1`;
    const maintParams = [];

    if (status && status !== 'Semua') {
      maintQuery += ` AND status = ?`;
      maintParams.push(status);
    }
    if (start_date) {
      maintQuery += ` AND request_date >= ?`;
      maintParams.push(start_date);
    }
    if (end_date) {
      maintQuery += ` AND request_date <= ?`;
      maintParams.push(end_date);
    }
    maintQuery += ` ORDER BY request_date DESC`;
    const maintenance = db.prepare(maintQuery).all(...maintParams);

    res.json({
      success: true,
      assets: {
        count: assets.length,
        total_value: assets.reduce((sum, a) => sum + (a.value || 0), 0),
        data: assets
      },
      maintenance: {
        count: maintenance.length,
        total_cost: maintenance.reduce((sum, m) => sum + (m.cost || 0), 0),
        data: maintenance
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat laporan detail: ' + err.message });
  }
});

// Standard Recap Reports
router.get('/recap', authMiddleware, (req, res) => {
  try {
    const byCategory = db.prepare(`SELECT * FROM v_rekap_kategori ORDER BY total_aset DESC`).all();
    const byRoom = db.prepare(`SELECT * FROM v_rekap_ruangan ORDER BY total_aset DESC`).all();
    const byCondition = db.prepare(`SELECT * FROM v_rekap_kondisi ORDER BY condition_id ASC`).all();
    const byPeriod = db.prepare(`SELECT * FROM v_rekap_periode LIMIT 12`).all();

    const grandTotalAssets = byCategory.reduce((sum, c) => sum + c.total_aset, 0);
    const grandTotalValue = byCategory.reduce((sum, c) => sum + c.total_nilai, 0);
    const grandTotalCost = byPeriod.reduce((sum, p) => sum + p.total_biaya, 0);
    const grandTotalMaintenance = byPeriod.reduce((sum, p) => sum + p.total_perawatan, 0);

    res.json({
      success: true,
      summary: {
        total_assets: grandTotalAssets,
        total_value: grandTotalValue,
        total_maintenance: grandTotalMaintenance,
        total_cost: grandTotalCost
      },
      by_category: byCategory,
      by_room: byRoom,
      by_condition: byCondition,
      by_period: byPeriod
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat laporan rekapitulasi: ' + err.message });
  }
});

module.exports = router;
