const fs = require('fs');
const path = require('path');
const { db, hashPassword } = require('./src/db');

function runSeed() {
  console.log('--- Memulai Migrasi Data PT. AURORA (77 Aset & Perawatan) ---');

  const now = new Date().toISOString();

  // 1. Recreate tables with expanded columns
  db.exec(`
    DROP TABLE IF EXISTS maintenance;
    DROP TABLE IF EXISTS assets;
    DROP TABLE IF EXISTS pics;
    DROP TABLE IF EXISTS conditions;
    DROP TABLE IF EXISTS rooms;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS company_profile;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL
    );

    CREATE TABLE company_profile (
      id INTEGER PRIMARY KEY,
      app_name TEXT NOT NULL DEFAULT 'Aurora Aset',
      company_name TEXT NOT NULL DEFAULT 'PT. AURORA',
      address TEXT DEFAULT 'Gedung Menara Aurora, Jl. Batununggal No. 88',
      phone TEXT DEFAULT '(022) 750-1234',
      email TEXT DEFAULT 'aset@aurora.co.id',
      website TEXT DEFAULT 'www.aurora.co.id',
      logo_url TEXT DEFAULT '',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      building TEXT,
      floor TEXT,
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE conditions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'BAIK',
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE pics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      nip TEXT,
      department TEXT,
      phone TEXT,
      email TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_no INTEGER NOT NULL,
      code TEXT,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      equity TEXT NOT NULL DEFAULT 'AURORA',
      room_id INTEGER REFERENCES rooms(id) ON DELETE RESTRICT,
      condition_id INTEGER REFERENCES conditions(id) ON DELETE RESTRICT,
      pic_id INTEGER REFERENCES pics(id) ON DELETE RESTRICT,
      value REAL NOT NULL DEFAULT 0,
      purchase_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE maintenance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_number TEXT UNIQUE NOT NULL,
      item_no INTEGER,
      asset_id INTEGER REFERENCES assets(id) ON DELETE SET NULL,
      item_name TEXT NOT NULL,
      category_name TEXT,
      maint_type TEXT DEFAULT 'Terencana',
      request_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Selesai',
      scheduled_date TEXT,
      completion_date TEXT,
      quantity INTEGER DEFAULT 1,
      unit TEXT DEFAULT 'Buah',
      cost REAL NOT NULL DEFAULT 0,
      proof TEXT DEFAULT '-',
      technician TEXT,
      notes TEXT,
      section TEXT NOT NULL DEFAULT 'BULAN_KEMARIN',
      result_condition_id INTEGER REFERENCES conditions(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX idx_assets_code ON assets(code);
    CREATE INDEX idx_assets_category ON assets(category_id);
    CREATE INDEX idx_assets_room ON assets(room_id);
    CREATE INDEX idx_assets_condition ON assets(condition_id);
    CREATE INDEX idx_maintenance_asset ON maintenance(asset_id);

    -- Views
    DROP VIEW IF EXISTS v_assets_detail;
    CREATE VIEW v_assets_detail AS
    SELECT 
      a.id,
      a.item_no,
      COALESCE(a.code, '') AS code,
      a.name,
      a.quantity,
      a.equity,
      a.category_id,
      c.code AS category_code,
      c.name AS category_name,
      a.room_id,
      r.code AS room_code,
      COALESCE(r.name, 'Tidak Diketahui') AS room_name,
      r.building AS room_building,
      r.floor AS room_floor,
      a.condition_id,
      cd.code AS condition_code,
      COALESCE(cd.name, 'Baik') AS condition_name,
      cd.level AS condition_level,
      a.pic_id,
      p.code AS pic_code,
      COALESCE(p.name, 'PT. AURORA') AS pic_name,
      a.value,
      COALESCE(a.purchase_date, '') AS purchase_date,
      COALESCE(a.notes, '') AS notes,
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
      m.item_no,
      m.asset_id,
      COALESCE(a.code, '') AS asset_code,
      m.item_name AS asset_name,
      COALESCE(m.category_name, c.name, '') AS category_name,
      COALESCE(r.name, '') AS room_name,
      m.maint_type,
      m.request_date,
      m.status,
      m.scheduled_date,
      m.completion_date,
      m.quantity,
      m.unit,
      m.cost,
      m.proof,
      m.technician,
      m.notes,
      m.section,
      m.result_condition_id,
      rc.name AS result_condition_name,
      m.created_at,
      m.updated_at
    FROM maintenance m
    LEFT JOIN assets a ON m.asset_id = a.id
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN rooms r ON a.room_id = r.id
    LEFT JOIN conditions rc ON m.result_condition_id = rc.id;
  `);

  console.log('   ✓ Struktur tabel dan view terstruktur berhasil diperbarui.');

  // 2. Admin User & Company Profile
  const passwordHash = hashPassword('Admin@12345');
  db.prepare(`
    INSERT INTO users (username, password_hash, name, role, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run('admin', passwordHash, 'Administrator PT. AURORA', 'admin', now);

  db.prepare(`
    INSERT INTO company_profile (id, app_name, company_name, address, phone, email, website, logo_url, updated_at)
    VALUES (1, 'Aurora Aset', 'PT. AURORA', 'Gedung Menara Aurora, Jl. Batununggal No. 88, Bandung', '(022) 750-1234', 'aset@aurora.co.id', 'www.aurora.co.id', '', ?)
  `).run(now);

  console.log('   ✓ Pengguna admin & profil PT. AURORA berhasil disiapkan.');

  // 3. Categories (Elektronik, Furnitur, Dll (Bangunan & Tanah))
  const insertCat = db.prepare('INSERT INTO categories (code, name, description, created_at) VALUES (?, ?, ?, ?)');
  insertCat.run('KAT-ELK', 'Elektronik', 'Perangkat elektronik & IT', now);
  insertCat.run('KAT-FUR', 'Furnitur', 'Mebel dan furniture', now);
  insertCat.run('KAT-DLL', 'Dll (Bangunan & Tanah)', 'Aset tidak berwujud/tetap', now);

  const catMap = {};
  db.prepare('SELECT id, name FROM categories').all().forEach(c => catMap[c.name] = c.id);

  // 4. Rooms (from document)
  const roomNames = [
    'Ruang Kerja',
    'Ruang Rapat',
    'Ruang Administrasi',
    'Dapur',
    'Ruang Manager',
    'Ruang Olahraga',
    'Ruang Direksi',
    'Tidak Diketahui',
    'Cabang Garut kota',
    'Kantor Batununggal',
    'Ruang Keuangan',
    'Tempat Parkir'
  ];

  const insertRoom = db.prepare('INSERT INTO rooms (code, name, building, floor, description, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  roomNames.forEach((r, idx) => {
    const code = 'R-' + String(idx + 1).padStart(2, '0');
    insertRoom.run(code, r, 'Gedung PT. AURORA', '', 'Lokasi unit aset PT. AURORA', now);
  });

  const roomMap = {};
  db.prepare('SELECT id, name FROM rooms').all().forEach(r => roomMap[r.name] = r.id);

  // 5. Conditions (from document)
  const condNames = [
    { name: 'Sangat Baik', level: 'BAIK' },
    { name: 'Baik', level: 'BAIK' },
    { name: 'Cukup', level: 'PERHATIAN' },
    { name: 'Tidak Diketahui', level: 'UNKNOWN' },
    { name: 'Rusak', level: 'RUSAK_RINGAN' },
    { name: 'Rusak Biasa', level: 'RUSAK_RINGAN' },
    { name: 'Rusak Parah', level: 'RUSAK_BERAT' }
  ];

  const insertCond = db.prepare('INSERT INTO conditions (code, name, level, description, created_at) VALUES (?, ?, ?, ?, ?)');
  condNames.forEach((c, idx) => {
    const code = 'KND-' + String(idx + 1).padStart(2, '0');
    insertCond.run(code, c.name, c.level, `Status kondisi fisik aset ${c.name}`, now);
  });

  const condMap = {};
  db.prepare('SELECT id, name FROM conditions').all().forEach(c => condMap[c.name] = c.id);

  // 6. PIC
  const insertPic = db.prepare('INSERT INTO pics (code, name, nip, department, phone, email, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertPic.run('PIC-01', 'Penanggung Jawab Aset', '198504122010011005', 'Bagian Umum & Aset', '(022) 750-1234', 'aset@aurora.co.id', now);
  const defaultPicId = db.prepare('SELECT id FROM pics LIMIT 1').get().id;

  // 7. Insert 77 Assets
  const assetsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'aurora_assets.json'), 'utf8'));

  const insertAsset = db.prepare(`
    INSERT INTO assets (
      item_no, code, name, quantity, category_id, equity, room_id, 
      condition_id, pic_id, value, purchase_date, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let totalValue = 0;
  for (const item of assetsData) {
    const catId = catMap[item.category] || catMap['Elektronik'];
    
    // Normalize room name
    let roomSearch = item.room || 'Tidak Diketahui';
    if (roomSearch.includes('Dapur') || roomSearch.includes('Ruang Dapur')) roomSearch = 'Dapur';
    if (roomSearch.includes('Batunungga')) roomSearch = 'Kantor Batununggal';
    const roomId = roomMap[roomSearch] || roomMap['Tidak Diketahui'];

    const condId = condMap[item.condition] || condMap['Baik'];

    insertAsset.run(
      item.no,
      item.code || '',
      item.name,
      item.qty || 1,
      catId,
      item.equity || 'AURORA',
      roomId,
      condId,
      defaultPicId,
      item.value || 0,
      item.date || '',
      '',
      now,
      now
    );

    totalValue += (item.value || 0);
  }

  console.log(`   ✓ ${assetsData.length} Aset berhasil diinput ke database.`);
  console.log(`   ✓ Total Valuasi Nilai Perolehan: Rp ${totalValue.toLocaleString('id-ID')}`);

  // 8. Insert Maintenance (Page 5)
  const maintData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'aurora_maintenance.json'), 'utf8'));
  const insertMaint = db.prepare(`
    INSERT INTO maintenance (
      ticket_number, item_no, asset_id, item_name, category_name, maint_type,
      request_date, status, scheduled_date, completion_date, quantity, unit,
      cost, proof, technician, notes, section, result_condition_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let totalMaintCost = 0;
  for (const m of maintData) {
    // Find matching asset if exists
    const ast = db.prepare('SELECT id FROM assets WHERE name LIKE ? LIMIT 1').get(`%${m.name}%`);
    const assetId = ast ? ast.id : null;
    const ticketNo = `MNT-2026-000${m.no}`;

    insertMaint.run(
      ticketNo,
      m.no,
      assetId,
      m.name,
      m.category,
      m.maint_type,
      m.date,
      'Selesai',
      m.date,
      m.date,
      m.qty,
      m.unit,
      m.cost,
      m.proof,
      m.notes,
      m.notes,
      m.section,
      condMap['Baik'],
      now,
      now
    );

    totalMaintCost += m.cost;
  }

  console.log(`   ✓ ${maintData.length} Data Pemeliharaan Aset berhasil diinput.`);
  console.log(`   ✓ Total Biaya Pemeliharaan: Rp ${totalMaintCost.toLocaleString('id-ID')}`);
  console.log('--- Migrasi Data Selesai 100% ---');
}

runSeed();
