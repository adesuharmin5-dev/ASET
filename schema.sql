-- ============================================================
-- AssetCare: Skema Database & Relasi (Kompatibel SQLite & MySQL)
-- Dapat dibuka / dieksekusi langsung di Navicat
-- ============================================================

-- 1. Tabel Master Pengguna
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at VARCHAR(50) NOT NULL
);

-- 2. Tabel Master Kategori
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  created_at VARCHAR(50) NOT NULL
);

-- 3. Tabel Master Ruangan
CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  building VARCHAR(100),
  floor VARCHAR(50),
  description TEXT,
  created_at VARCHAR(50) NOT NULL
);

-- 4. Tabel Master Kondisi
CREATE TABLE IF NOT EXISTS conditions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  level VARCHAR(50) NOT NULL DEFAULT 'BAIK',
  description TEXT,
  created_at VARCHAR(50) NOT NULL
);

-- 5. Tabel Master Penanggung Jawab (PIC)
CREATE TABLE IF NOT EXISTS pics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  nip VARCHAR(50),
  department VARCHAR(150),
  phone VARCHAR(50),
  email VARCHAR(100),
  created_at VARCHAR(50) NOT NULL
);

-- 6. Tabel Data Aset
CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  condition_id INTEGER NOT NULL REFERENCES conditions(id) ON DELETE RESTRICT,
  pic_id INTEGER NOT NULL REFERENCES pics(id) ON DELETE RESTRICT,
  value DOUBLE NOT NULL DEFAULT 0,
  purchase_date VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at VARCHAR(50) NOT NULL,
  updated_at VARCHAR(50) NOT NULL
);

-- 7. Tabel Perawatan & Pemeliharaan
CREATE TABLE IF NOT EXISTS maintenance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_number VARCHAR(100) UNIQUE NOT NULL,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  request_date VARCHAR(20) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Permintaan',
  scheduled_date VARCHAR(20),
  completion_date VARCHAR(20),
  cost DOUBLE NOT NULL DEFAULT 0,
  technician VARCHAR(150),
  notes TEXT,
  result_condition_id INTEGER REFERENCES conditions(id) ON DELETE SET NULL,
  created_at VARCHAR(50) NOT NULL,
  updated_at VARCHAR(50) NOT NULL
);

-- Indeks Kinerja
CREATE INDEX IF NOT EXISTS idx_assets_code ON assets(code);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_room ON assets(room_id);
CREATE INDEX IF NOT EXISTS idx_assets_condition ON assets(condition_id);
CREATE INDEX IF NOT EXISTS idx_assets_pic ON assets(pic_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_asset ON maintenance(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance(status);

-- View Relasi Detail Aset
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

-- View Relasi Detail Perawatan
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

-- View Rekapitulasi per Kategori
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

-- View Rekapitulasi per Ruangan
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

-- View Rekapitulasi per Kondisi
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
