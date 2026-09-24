const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'assetcare.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys for high performance and Navicat concurrency
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS company_profile (
      id INTEGER PRIMARY KEY,
      app_name TEXT NOT NULL DEFAULT 'Aurora Aset',
      company_name TEXT NOT NULL DEFAULT 'PT Aurora Nusantara',
      address TEXT DEFAULT 'Jl. Merdeka No. 45, Gedung Aurora Lantai 3',
      phone TEXT DEFAULT '(021) 555-8921',
      email TEXT DEFAULT 'info@aurora-aset.co.id',
      website TEXT DEFAULT 'www.aurora-aset.co.id',
      logo_url TEXT DEFAULT '',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS report_signature_settings (
      id INTEGER PRIMARY KEY,
      sign1_title TEXT NOT NULL DEFAULT 'Direktur Operasional',
      sign1_name TEXT NOT NULL DEFAULT 'Ir. H. Rahmat Hidayat',
      sign1_id TEXT DEFAULT '',
      sign2_title TEXT NOT NULL DEFAULT 'Pengelola Aset & Logistik',
      sign2_name TEXT NOT NULL DEFAULT 'Ade Suharmin',
      sign2_id TEXT DEFAULT '',
      sign_city TEXT NOT NULL DEFAULT 'Bandung',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      building TEXT,
      floor TEXT,
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conditions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'BAIK',
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      nip TEXT,
      department TEXT,
      phone TEXT,
      email TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
      condition_id INTEGER NOT NULL REFERENCES conditions(id) ON DELETE RESTRICT,
      pic_id INTEGER NOT NULL REFERENCES pics(id) ON DELETE RESTRICT,
      value REAL NOT NULL DEFAULT 0,
      purchase_date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS maintenance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_number TEXT UNIQUE NOT NULL,
      asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
      request_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Permintaan',
      scheduled_date TEXT,
      completion_date TEXT,
      cost REAL NOT NULL DEFAULT 0,
      technician TEXT,
      notes TEXT,
      result_condition_id INTEGER REFERENCES conditions(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_assets_code ON assets(code);
    CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category_id);
    CREATE INDEX IF NOT EXISTS idx_assets_room ON assets(room_id);
    CREATE INDEX IF NOT EXISTS idx_assets_condition ON assets(condition_id);
    CREATE INDEX IF NOT EXISTS idx_assets_pic ON assets(pic_id);
    CREATE INDEX IF NOT EXISTS idx_maintenance_asset ON maintenance(asset_id);
    CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance(status);
    CREATE INDEX IF NOT EXISTS idx_maintenance_request_date ON maintenance(request_date);

    -- Views for clean queries and direct Navicat browsing
    DROP VIEW IF EXISTS v_assets_detail;
    CREATE VIEW v_assets_detail AS
    SELECT 
      a.id,
      a.code,
      a.name,
      a.category_id,
      c.code AS category_code,
      c.name AS category_name,
      a.room_id,
      r.code AS room_code,
      r.name AS room_name,
      r.building AS room_building,
      r.floor AS room_floor,
      a.condition_id,
      cd.code AS condition_code,
      cd.name AS condition_name,
      cd.level AS condition_level,
      a.pic_id,
      p.code AS pic_code,
      p.name AS pic_name,
      p.nip AS pic_nip,
      p.department AS pic_department,
      p.phone AS pic_phone,
      a.value,
      a.purchase_date,
      a.notes,
      a.created_at,
      a.updated_at,
      COALESCE((SELECT COUNT(*) FROM maintenance m WHERE m.asset_id = a.id), 0) AS maintenance_count,
      COALESCE((SELECT SUM(m.cost) FROM maintenance m WHERE m.asset_id = a.id), 0) AS total_maintenance_cost
    FROM assets a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN rooms r ON a.room_id = r.id
    LEFT JOIN conditions cd ON a.condition_id = cd.id
    LEFT JOIN pics p ON a.pic_id = p.id;

    DROP VIEW IF EXISTS v_maintenance_detail;
    CREATE VIEW v_maintenance_detail AS
    SELECT 
      m.id,
      m.ticket_number,
      m.asset_id,
      a.code AS asset_code,
      a.name AS asset_name,
      c.name AS category_name,
      r.name AS room_name,
      m.request_date,
      m.status,
      m.scheduled_date,
      m.completion_date,
      m.cost,
      m.technician,
      m.notes,
      m.result_condition_id,
      rc.name AS result_condition_name,
      m.created_at,
      m.updated_at
    FROM maintenance m
    JOIN assets a ON m.asset_id = a.id
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN rooms r ON a.room_id = r.id
    LEFT JOIN conditions rc ON m.result_condition_id = rc.id;

    DROP VIEW IF EXISTS v_rekap_kategori;
    CREATE VIEW v_rekap_kategori AS
    SELECT 
      c.id AS category_id,
      c.code AS category_code,
      c.name AS category_name,
      COUNT(a.id) AS total_aset,
      COALESCE(SUM(a.value), 0) AS total_nilai
    FROM categories c
    LEFT JOIN assets a ON a.category_id = c.id
    GROUP BY c.id, c.code, c.name;

    DROP VIEW IF EXISTS v_rekap_ruangan;
    CREATE VIEW v_rekap_ruangan AS
    SELECT 
      r.id AS room_id,
      r.code AS room_code,
      r.name AS room_name,
      r.building AS room_building,
      r.floor AS room_floor,
      COUNT(a.id) AS total_aset,
      COALESCE(SUM(a.value), 0) AS total_nilai
    FROM rooms r
    LEFT JOIN assets a ON a.room_id = r.id
    GROUP BY r.id, r.code, r.name, r.building, r.floor;

    DROP VIEW IF EXISTS v_rekap_kondisi;
    CREATE VIEW v_rekap_kondisi AS
    SELECT 
      cd.id AS condition_id,
      cd.code AS condition_code,
      cd.name AS condition_name,
      cd.level AS condition_level,
      COUNT(a.id) AS total_aset,
      COALESCE(SUM(a.value), 0) AS total_nilai
    FROM conditions cd
    LEFT JOIN assets a ON a.condition_id = cd.id
    GROUP BY cd.id, cd.code, cd.name, cd.level;

    DROP VIEW IF EXISTS v_rekap_periode;
    CREATE VIEW v_rekap_periode AS
    SELECT 
      SUBSTR(m.request_date, 1, 7) AS periode,
      COUNT(m.id) AS total_perawatan,
      SUM(CASE WHEN m.status = 'Selesai' THEN 1 ELSE 0 END) AS selesai,
      SUM(CASE WHEN m.status IN ('Permintaan', 'Dijadwalkan', 'Dilaksanakan') THEN 1 ELSE 0 END) AS aktif,
      SUM(CASE WHEN m.status = 'Dibatalkan' THEN 1 ELSE 0 END) AS dibatalkan,
      COALESCE(SUM(m.cost), 0) AS total_biaya
    FROM maintenance m
    GROUP BY SUBSTR(m.request_date, 1, 7)
    ORDER BY periode DESC;
  `);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, key] = stored.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

function seedInitialData() {
  const now = new Date().toISOString();

  // Admin user
  const adminCheck = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!adminCheck) {
    const passwordHash = hashPassword('Admin@12345');
    db.prepare(`
      INSERT INTO users (username, password_hash, name, role, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin', passwordHash, 'Administrator Aset', 'admin', now);
  }

  // Company Profile default
  const cpCheck = db.prepare('SELECT id FROM company_profile WHERE id = 1').get();
  if (!cpCheck) {
    db.prepare(`
      INSERT INTO company_profile (id, app_name, company_name, address, phone, email, website, logo_url, updated_at)
      VALUES (1, 'Aurora Aset', 'PT Aurora Nusantara', 'Jl. Merdeka No. 45, Gedung Aurora Lantai 3', '(021) 555-8921', 'info@aurora-aset.co.id', 'www.aurora-aset.co.id', '', ?)
    `).run(now);
  }

  // Signature Settings default
  const sigCheck = db.prepare('SELECT id FROM report_signature_settings WHERE id = 1').get();
  if (!sigCheck) {
    db.prepare(`
      INSERT INTO report_signature_settings (id, sign1_title, sign1_name, sign1_id, sign2_title, sign2_name, sign2_id, sign_city, updated_at)
      VALUES (1, 'Direktur Operasional', 'Ir. H. Rahmat Hidayat', '', 'Pengelola Aset & Logistik', 'Ade Suharmin', '', 'Bandung', ?)
    `).run(now);
  }

  // Categories
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (catCount === 0) {
    const insertCat = db.prepare('INSERT INTO categories (code, name, description, created_at) VALUES (?, ?, ?, ?)');
    insertCat.run('KAT-ELK', 'Peralatan Elektronik & IT', 'Komputer, printer, switch jaringan, UPS', now);
    insertCat.run('KAT-FUR', 'Furnitur & Perabot Kantor', 'Meja kerja, kursi ergonomis, lemari berkas', now);
    insertCat.run('KAT-KND', 'Kendaraan Operasional', 'Mobil dinas dan sepeda motor operasional', now);
    insertCat.run('KAT-MES', 'Mesin & Utilitas Gedung', 'AC, genset, proyektor ruang rapat', now);
  }

  // Rooms
  const roomCount = db.prepare('SELECT COUNT(*) as count FROM rooms').get().count;
  if (roomCount === 0) {
    const insertRoom = db.prepare('INSERT INTO rooms (code, name, building, floor, description, created_at) VALUES (?, ?, ?, ?, ?, ?)');
    insertRoom.run('R-SRV', 'Ruang Server & NOC', 'Gedung Utama', 'Lantai 2', 'Data center dan panel jaringan utama', now);
    insertRoom.run('R-KEU', 'Ruang Keuangan & Anggaran', 'Gedung Utama', 'Lantai 1', 'Operasional staff keuangan dan arsip kasir', now);
    insertRoom.run('R-RAP', 'Ruang Rapat Utama', 'Gedung Utama', 'Lantai 3', 'Ruang pertemuan VIP dan konferensi rapat', now);
    insertRoom.run('R-GDG', 'Gudang Logistik & Aset', 'Gedung Penunjang', 'Lantai 1', 'Penyimpanan suku cadang dan aset cadangan', now);
    insertRoom.run('R-KPG', 'Ruang Kepegawaian & SDM', 'Gedung Utama', 'Lantai 2', 'Administrasi berkas dan kepegawaian', now);
  }

  // Conditions
  const condCount = db.prepare('SELECT COUNT(*) as count FROM conditions').get().count;
  if (condCount === 0) {
    const insertCond = db.prepare('INSERT INTO conditions (code, name, level, description, created_at) VALUES (?, ?, ?, ?, ?)');
    insertCond.run('KND-BAIK', 'Baik', 'BAIK', 'Aset berfungsi prima tanpa kendala teknis', now);
    insertCond.run('KND-PERHATIAN', 'Rusak Ringan', 'RUSAK_RINGAN', 'Aset dapat berfungsi namun butuh servis berkala', now);
    insertCond.run('KND-RUSAK', 'Rusak Berat', 'RUSAK_BERAT', 'Aset tidak berfungsi dan butuh perbaikan teknisi', now);
    insertCond.run('KND-AFKIR', 'Afkir / Usang', 'AFKIR', 'Aset tidak layak pakai dan siap dihapusbukukan', now);
  }

  // PICs
  const picCount = db.prepare('SELECT COUNT(*) as count FROM pics').get().count;
  if (picCount === 0) {
    const insertPic = db.prepare('INSERT INTO pics (code, name, nip, department, phone, email, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertPic.run('PIC-001', 'Ade Suharmin', '198504122010011005', 'Pengelola Aset & BMN', '081234567890', 'ade.suharmin@instansi.go.id', now);
    insertPic.run('PIC-002', 'Budi Santoso', '198806202014021002', 'Teknologi Informasi & Infrastruktur', '081298765432', 'budi.it@instansi.go.id', now);
    insertPic.run('PIC-003', 'Siti Rahmawati', '199203152018032001', 'Subbag Keuangan & Perlengkapan', '081377889900', 'siti.keu@instansi.go.id', now);
    insertPic.run('PIC-004', 'Dedi Kurniawan', '199011082015041003', 'Pemeliharaan Gedung & Umum', '081122334455', 'dedi.umum@instansi.go.id', now);
  }

  // Seed sample Assets if empty
  const assetCount = db.prepare('SELECT COUNT(*) as count FROM assets').get().count;
  if (assetCount === 0) {
    const insertAsset = db.prepare(`
      INSERT INTO assets (code, name, category_id, room_id, condition_id, pic_id, value, purchase_date, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const cElk = db.prepare("SELECT id FROM categories WHERE code = 'KAT-ELK'").get().id;
    const cFur = db.prepare("SELECT id FROM categories WHERE code = 'KAT-FUR'").get().id;
    const cKnd = db.prepare("SELECT id FROM categories WHERE code = 'KAT-KND'").get().id;
    const cMes = db.prepare("SELECT id FROM categories WHERE code = 'KAT-MES'").get().id;

    const rSrv = db.prepare("SELECT id FROM rooms WHERE code = 'R-SRV'").get().id;
    const rKeu = db.prepare("SELECT id FROM rooms WHERE code = 'R-KEU'").get().id;
    const rRap = db.prepare("SELECT id FROM rooms WHERE code = 'R-RAP'").get().id;
    const rKpg = db.prepare("SELECT id FROM rooms WHERE code = 'R-KPG'").get().id;

    const kBaik = db.prepare("SELECT id FROM conditions WHERE code = 'KND-BAIK'").get().id;
    const kRingan = db.prepare("SELECT id FROM conditions WHERE code = 'KND-PERHATIAN'").get().id;
    const kBerat = db.prepare("SELECT id FROM conditions WHERE code = 'KND-RUSAK'").get().id;

    const pAde = db.prepare("SELECT id FROM pics WHERE code = 'PIC-001'").get().id;
    const pBudi = db.prepare("SELECT id FROM pics WHERE code = 'PIC-002'").get().id;
    const pSiti = db.prepare("SELECT id FROM pics WHERE code = 'PIC-003'").get().id;
    const pDedi = db.prepare("SELECT id FROM pics WHERE code = 'PIC-004'").get().id;

    insertAsset.run('AST-2024-001', 'Server Rack Dell PowerEdge R750', cElk, rSrv, kBaik, pBudi, 85000000, '2024-03-15', 'Server database utama unit produksi', now, now);
    insertAsset.run('AST-2024-002', 'Cisco Catalyst Switch 24-Port Gigabit', cElk, rSrv, kBaik, pBudi, 18500000, '2024-03-15', 'Switch distribusi jaringan antar lantai', now, now);
    insertAsset.run('AST-2023-015', 'Laptop ThinkPad T14 Gen 3', cElk, rKeu, kBaik, pSiti, 21500000, '2023-08-20', 'Unit inventaris analis keuangan', now, now);
    insertAsset.run('AST-2022-040', 'AC Split Daikin 2 PK Inverter', cMes, rRap, kRingan, pDedi, 9800000, '2022-05-10', 'Suara kipas blower agak berisik, butuh pembersihan', now, now);
    insertAsset.run('AST-2021-018', 'Printer Laser Multifungsi HP LaserJet Pro', cElk, rKpg, kBerat, pAde, 7400000, '2021-11-04', 'Paper jam berulang kali dan drum roller aus', now, now);
    insertAsset.run('AST-2023-088', 'Kendaraan Operasional Toyota Avanza Veloz', cKnd, rKeu, kBaik, pAde, 265000000, '2023-01-12', 'Plat dinas nomor registrasi operasional', now, now);
    insertAsset.run('AST-2023-052', 'Set Meja Rapat Kayu Jati 12 Kursi', cFur, rRap, kBaik, pDedi, 34000000, '2023-06-25', 'Furnitur ruang rapat utama lantai 3', now, now);
  }

  // Seed sample Maintenance tickets
  const maintCount = db.prepare('SELECT COUNT(*) as count FROM maintenance').get().count;
  if (maintCount === 0) {
    const insertMaint = db.prepare(`
      INSERT INTO maintenance (ticket_number, asset_id, request_date, status, scheduled_date, completion_date, cost, technician, notes, result_condition_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const astPrinter = db.prepare("SELECT id FROM assets WHERE code = 'AST-2021-018'").get();
    const astAC = db.prepare("SELECT id FROM assets WHERE code = 'AST-2022-040'").get();
    const astServer = db.prepare("SELECT id FROM assets WHERE code = 'AST-2024-001'").get();
    const kBaik = db.prepare("SELECT id FROM conditions WHERE code = 'KND-BAIK'").get().id;

    if (astPrinter) {
      insertMaint.run('MNT-2026-001', astPrinter.id, '2026-02-10', 'Permintaan', '', '', 0, '', 'Keluhan roller aus dan sering paper jam saat cetak SK kepegawaian', null, now, now);
    }
    if (astAC) {
      insertMaint.run('MNT-2026-002', astAC.id, '2026-02-08', 'Dijadwalkan', '2026-02-15', '', 450000, 'CV Tirta Aircon Mandiri', 'Servis rutin dan penggantian kapasitor kompresor', null, now, now);
    }
    if (astServer) {
      insertMaint.run('MNT-2026-003', astServer.id, '2026-01-14', 'Selesai', '2026-01-18', '2026-01-18', 1200000, 'PT Mitra Solusi Jaringan', 'Pembersihan debu komprehensif dan pergantian thermal paste prosesor', kBaik, now, now);
    }
  }
}

initSchema();
seedInitialData();

module.exports = {
  db,
  DB_PATH,
  hashPassword,
  verifyPassword,
  resetDemoData: () => {
    db.exec(`
      DELETE FROM maintenance;
      DELETE FROM assets;
      DELETE FROM pics;
      DELETE FROM conditions;
      DELETE FROM rooms;
      DELETE FROM categories;
      DELETE FROM users;
    `);
    seedInitialData();
  }
};
