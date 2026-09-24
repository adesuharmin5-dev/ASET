const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authMiddleware } = require('../auth');

router.get('/', authMiddleware, (req, res) => {
  try {
    // Total Assets & Total Value
    const assetStats = db.prepare(`
      SELECT 
        COUNT(*) AS total_assets,
        COALESCE(SUM(value), 0) AS total_value
      FROM assets
    `).get();

    // Maintenance Stats
    const maintStats = db.prepare(`
      SELECT 
        COUNT(*) AS total_maintenance,
        COALESCE(SUM(cost), 0) AS total_cost,
        SUM(CASE WHEN status IN ('Permintaan', 'Dijadwalkan', 'Dilaksanakan') THEN 1 ELSE 0 END) AS active_maintenance,
        SUM(CASE WHEN status = 'Selesai' THEN 1 ELSE 0 END) AS completed_maintenance
      FROM maintenance
    `).get();

    // Condition distribution
    const conditionDist = db.prepare(`
      SELECT 
        c.name,
        c.level,
        COUNT(a.id) AS count
      FROM conditions c
      LEFT JOIN assets a ON a.condition_id = c.id
      GROUP BY c.id, c.name, c.level
      ORDER BY c.id ASC
    `).all();

    // Category distribution
    const categoryDist = db.prepare(`
      SELECT 
        c.name,
        COUNT(a.id) AS count,
        COALESCE(SUM(a.value), 0) AS total_value
      FROM categories c
      LEFT JOIN assets a ON a.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `).all();

    // Maintenance Status Pipeline
    const statusOrder = ['Permintaan', 'Dijadwalkan', 'Dilaksanakan', 'Selesai', 'Dibatalkan'];
    const statusCountsRaw = db.prepare(`
      SELECT status, COUNT(*) AS count
      FROM maintenance
      GROUP BY status
    `).all();

    const statusMap = {};
    for (const item of statusCountsRaw) {
      statusMap[item.status] = item.count;
    }
    const statusPipeline = statusOrder.map(status => ({
      status,
      count: statusMap[status] || 0
    }));

    // Recent 6 maintenance activities
    const recentMaintenance = db.prepare(`
      SELECT 
        m.id,
        m.ticket_number,
        m.asset_id,
        a.code AS asset_code,
        a.name AS asset_name,
        m.request_date,
        m.status,
        m.scheduled_date,
        m.cost,
        m.technician,
        m.notes
      FROM maintenance m
      JOIN assets a ON m.asset_id = a.id
      ORDER BY m.id DESC
      LIMIT 6
    `).all();

    // Total rooms and pics count
    const roomCount = db.prepare('SELECT COUNT(*) as count FROM rooms').get().count;
    const picCount = db.prepare('SELECT COUNT(*) as count FROM pics').get().count;
    const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;

    // Room distribution
    const roomDist = db.prepare(`
      SELECT 
        r.name,
        r.building,
        r.floor,
        COUNT(a.id) AS count,
        COALESCE(SUM(a.value), 0) AS total_value
      FROM rooms r
      LEFT JOIN assets a ON a.room_id = r.id
      GROUP BY r.id, r.name, r.building, r.floor
      ORDER BY count DESC
    `).all();

    res.json({
      success: true,
      kpis: {
        total_assets: assetStats.total_assets,
        total_value: assetStats.total_value,
        active_maintenance: maintStats.active_maintenance || 0,
        completed_maintenance: maintStats.completed_maintenance || 0,
        total_maintenance_cost: maintStats.total_cost,
        room_count: roomCount,
        pic_count: picCount,
        category_count: categoryCount
      },
      condition_distribution: conditionDist,
      category_distribution: categoryDist,
      room_distribution: roomDist,
      status_pipeline: statusPipeline,
      recent_maintenance: recentMaintenance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat data dashboard: ' + err.message });
  }
});

module.exports = router;
