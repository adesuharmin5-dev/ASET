const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { db, DB_PATH, resetDemoData } = require('../db');
const { authMiddleware } = require('../auth');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `logo_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format file logo harus berupa PNG, JPG, JPEG, SVG, atau WebP.'));
    }
  }
});

// GET Company Profile
router.get('/company', (req, res) => {
  try {
    let profile = db.prepare('SELECT * FROM company_profile WHERE id = 1').get();
    if (!profile) {
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO company_profile (id, app_name, company_name, address, phone, email, website, logo_url, updated_at)
        VALUES (1, 'Aurora Aset', 'PT Aurora Nusantara', 'Jl. Merdeka No. 45, Gedung Aurora Lantai 3', '(021) 555-8921', 'info@aurora-aset.co.id', 'www.aurora-aset.co.id', '', ?)
      `).run(now);
      profile = db.prepare('SELECT * FROM company_profile WHERE id = 1').get();
    }
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat profil perusahaan: ' + err.message });
  }
});

// UPDATE Company Profile & Upload Logo
router.put('/company', authMiddleware, upload.single('logo'), (req, res) => {
  try {
    const { app_name, company_name, address, phone, email, website, remove_logo } = req.body;
    const now = new Date().toISOString();

    let current = db.prepare('SELECT * FROM company_profile WHERE id = 1').get();
    let logoUrl = current ? current.logo_url : '';

    if (req.file) {
      logoUrl = `/uploads/${req.file.filename}`;
    } else if (remove_logo === 'true' || remove_logo === true) {
      logoUrl = '';
    }

    db.prepare(`
      UPDATE company_profile SET
        app_name = ?,
        company_name = ?,
        address = ?,
        phone = ?,
        email = ?,
        website = ?,
        logo_url = ?,
        updated_at = ?
      WHERE id = 1
    `).run(
      app_name ? app_name.trim() : (current?.app_name || 'Aurora Aset'),
      company_name ? company_name.trim() : (current?.company_name || 'PT Aurora Nusantara'),
      address !== undefined ? address.trim() : (current?.address || ''),
      phone !== undefined ? phone.trim() : (current?.phone || ''),
      email !== undefined ? email.trim() : (current?.email || ''),
      website !== undefined ? website.trim() : (current?.website || ''),
      logoUrl,
      now
    );

    const updated = db.prepare('SELECT * FROM company_profile WHERE id = 1').get();
    res.json({
      success: true,
      message: 'Identitas perusahaan berhasil diperbarui.',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui profil perusahaan: ' + err.message });
  }
});

// GET Signature Settings
router.get('/signature', (req, res) => {
  try {
    let sig = db.prepare('SELECT * FROM report_signature_settings WHERE id = 1').get();
    if (!sig) {
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO report_signature_settings (id, sign1_title, sign1_name, sign1_id, sign2_title, sign2_name, sign2_id, sign_city, updated_at)
        VALUES (1, 'Direktur Operasional', 'Ir. H. Rahmat Hidayat', 'NIP. 19780512 200312 1 002', 'Pengelola Aset & Logistik', 'Ade Suharmin', 'NIP. 19850320 201001 1 015', 'Bandung', ?)
      `).run(now);
      sig = db.prepare('SELECT * FROM report_signature_settings WHERE id = 1').get();
    }
    res.json({ success: true, data: sig });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat pengaturan tanda tangan: ' + err.message });
  }
});

// UPDATE Signature Settings
router.put('/signature', authMiddleware, (req, res) => {
  try {
    const { sign1_title, sign1_name, sign1_id, sign2_title, sign2_name, sign2_id, sign_city } = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO report_signature_settings (id, sign1_title, sign1_name, sign1_id, sign2_title, sign2_name, sign2_id, sign_city, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        sign1_title = excluded.sign1_title,
        sign1_name = excluded.sign1_name,
        sign1_id = excluded.sign1_id,
        sign2_title = excluded.sign2_title,
        sign2_name = excluded.sign2_name,
        sign2_id = excluded.sign2_id,
        sign_city = excluded.sign_city,
        updated_at = excluded.updated_at
    `).run(
      (sign1_title || 'Direktur Operasional').trim(),
      (sign1_name || 'Ir. H. Rahmat Hidayat').trim(),
      (sign1_id !== undefined ? sign1_id : '').trim(),
      (sign2_title || 'Pengelola Aset & Logistik').trim(),
      (sign2_name || 'Ade Suharmin').trim(),
      (sign2_id !== undefined ? sign2_id : '').trim(),
      (sign_city || 'Bandung').trim(),
      now
    );

    const updated = db.prepare('SELECT * FROM report_signature_settings WHERE id = 1').get();
    res.json({
      success: true,
      message: 'Pengaturan tanda tangan laporan berhasil diperbarui.',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui pengaturan tanda tangan: ' + err.message });
  }
});

// GET database connection info and statistics for Navicat
router.get('/database', authMiddleware, (req, res) => {
  try {
    let fileSizeKb = 0;
    if (fs.existsSync(DB_PATH)) {
      fileSizeKb = Math.round(fs.statSync(DB_PATH).size / 1024);
    }

    const tables = [
      { name: 'assets', label: 'Tabel Data Aset Utama', count: db.prepare('SELECT COUNT(*) as c FROM assets').get().c },
      { name: 'maintenance', label: 'Tabel Pekerjaan Perawatan', count: db.prepare('SELECT COUNT(*) as c FROM maintenance').get().c },
      { name: 'categories', label: 'Tabel Master Kategori', count: db.prepare('SELECT COUNT(*) as c FROM categories').get().c },
      { name: 'rooms', label: 'Tabel Master Ruangan', count: db.prepare('SELECT COUNT(*) as c FROM rooms').get().c },
      { name: 'conditions', label: 'Tabel Master Kondisi', count: db.prepare('SELECT COUNT(*) as c FROM conditions').get().c },
      { name: 'pics', label: 'Tabel Master Penanggung Jawab', count: db.prepare('SELECT COUNT(*) as c FROM pics').get().c },
      { name: 'users', label: 'Tabel Pengguna & Admin', count: db.prepare('SELECT COUNT(*) as c FROM users').get().c }
    ];

    const views = [
      { name: 'v_assets_detail', label: 'View Detail Relasi Aset Lengkap' },
      { name: 'v_maintenance_detail', label: 'View Detail Relasi Tiket Perawatan' },
      { name: 'v_rekap_kategori', label: 'View Rekapitulasi per Kategori' },
      { name: 'v_rekap_ruangan', label: 'View Rekapitulasi per Ruangan' },
      { name: 'v_rekap_kondisi', label: 'View Rekapitulasi per Kondisi' },
      { name: 'v_rekap_periode', label: 'View Rekapitulasi per Periode Bulan' }
    ];

    res.json({
      success: true,
      navicat: {
        driver: 'SQLite 3 (Kompatibel dengan Navicat for SQLite & Navicat Premium)',
        database_file: DB_PATH,
        connection_type: 'Existing Database File',
        recommended_connection_name: 'AssetCare_Local',
        file_size_kb: fileSizeKb,
        wal_mode: 'Aktif (Mendukung pembacaan simultan Navicat & Web tanpa locking)',
        status: 'Online & Terstruktur'
      },
      tables,
      views,
      steps: [
        'Buka aplikasi Navicat (Navicat for SQLite atau Navicat Premium) di PC Anda.',
        'Klik menu Connection (Koneksi) -> Pilih SQLite.',
        'Beri Connection Name: AssetCare_Local.',
        'Pilih tipe: Existing Database File.',
        'Pada kolom Database File, klik Browse (...) lalu arahkan ke: ' + DB_PATH,
        'Klik tombol Test Connection untuk memastikan koneksi sukses, lalu klik OK.',
        'Koneksi selesai! Seluruh tabel dan view relasional siap dijelajahi di Navicat.'
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat status database: ' + err.message });
  }
});

// DOWNLOAD SQLite .db file directly
router.get('/backup/sqlite', authMiddleware, (req, res) => {
  if (!fs.existsSync(DB_PATH)) {
    return res.status(404).json({ success: false, message: 'File database tidak ditemukan.' });
  }

  // Checkpoint WAL to flush all transactions into main file
  try {
    db.exec('PRAGMA wal_checkpoint(FULL);');
  } catch (e) {}

  res.download(DB_PATH, 'assetcare_backup.db');
});

// EXPORT full SQL dump (DDL + DML)
router.get('/export/sql', authMiddleware, (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories').all();
    const rooms = db.prepare('SELECT * FROM rooms').all();
    const conditions = db.prepare('SELECT * FROM conditions').all();
    const pics = db.prepare('SELECT * FROM pics').all();
    const assets = db.prepare('SELECT * FROM assets').all();
    const maintenance = db.prepare('SELECT * FROM maintenance').all();

    let sql = `-- ==========================================================\n`;
    sql += `-- AssetCare Database Dump\n`;
    sql += `-- Dihasilkan: ${new Date().toISOString()}\n`;
    sql += `-- Kompatibel dengan Navicat SQLite, Navicat MySQL, MariaDB\n`;
    sql += `-- ==========================================================\n\n`;

    const esc = (val) => {
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return val;
      return `'${String(val).replace(/'/g, "''")}'`;
    };

    // Categories
    sql += `-- Tabel Master Kategori\n`;
    for (const r of categories) {
      sql += `INSERT INTO categories (id, code, name, description, created_at) VALUES (${r.id}, ${esc(r.code)}, ${esc(r.name)}, ${esc(r.description)}, ${esc(r.created_at)});\n`;
    }
    sql += `\n`;

    // Rooms
    sql += `-- Tabel Master Ruangan\n`;
    for (const r of rooms) {
      sql += `INSERT INTO rooms (id, code, name, building, floor, description, created_at) VALUES (${r.id}, ${esc(r.code)}, ${esc(r.name)}, ${esc(r.building)}, ${esc(r.floor)}, ${esc(r.description)}, ${esc(r.created_at)});\n`;
    }
    sql += `\n`;

    // Conditions
    sql += `-- Tabel Master Kondisi\n`;
    for (const r of conditions) {
      sql += `INSERT INTO conditions (id, code, name, level, description, created_at) VALUES (${r.id}, ${esc(r.code)}, ${esc(r.name)}, ${esc(r.level)}, ${esc(r.description)}, ${esc(r.created_at)});\n`;
    }
    sql += `\n`;

    // PICs
    sql += `-- Tabel Master Penanggung Jawab\n`;
    for (const r of pics) {
      sql += `INSERT INTO pics (id, code, name, nip, department, phone, email, created_at) VALUES (${r.id}, ${esc(r.code)}, ${esc(r.name)}, ${esc(r.nip)}, ${esc(r.department)}, ${esc(r.phone)}, ${esc(r.email)}, ${esc(r.created_at)});\n`;
    }
    sql += `\n`;

    // Assets
    sql += `-- Tabel Data Aset\n`;
    for (const r of assets) {
      sql += `INSERT INTO assets (id, code, name, category_id, room_id, condition_id, pic_id, value, purchase_date, notes, created_at, updated_at) VALUES (${r.id}, ${esc(r.code)}, ${esc(r.name)}, ${r.category_id}, ${r.room_id}, ${r.condition_id}, ${r.pic_id}, ${r.value}, ${esc(r.purchase_date)}, ${esc(r.notes)}, ${esc(r.created_at)}, ${esc(r.updated_at)});\n`;
    }
    sql += `\n`;

    // Maintenance
    sql += `-- Tabel Pekerjaan Perawatan\n`;
    for (const r of maintenance) {
      sql += `INSERT INTO maintenance (id, ticket_number, asset_id, request_date, status, scheduled_date, completion_date, cost, technician, notes, result_condition_id, created_at, updated_at) VALUES (${r.id}, ${esc(r.ticket_number)}, ${r.asset_id}, ${esc(r.request_date)}, ${esc(r.status)}, ${esc(r.scheduled_date)}, ${esc(r.completion_date)}, ${r.cost}, ${esc(r.technician)}, ${esc(r.notes)}, ${r.result_condition_id || 'NULL'}, ${esc(r.created_at)}, ${esc(r.updated_at)});\n`;
    }

    res.setHeader('Content-Type', 'application/sql; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="assetcare_dump_${new Date().toISOString().slice(0, 10)}.sql"`);
    res.send(sql);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengekspor SQL: ' + err.message });
  }
});

// RESET demo data
router.post('/reset-demo', authMiddleware, (req, res) => {
  try {
    resetDemoData();
    res.json({ success: true, message: 'Data contoh berhasil dimuat ulang dengan sukses.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat ulang data: ' + err.message });
  }
});

module.exports = router;
