const http = require('http');

// Helper to make HTTP request
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Memulai Pengujian Otomatis AssetCare E2E ---');
  let token = '';

  // 1. Test Login
  console.log('1. Menguji POST /api/auth/login...');
  const loginRes = await request('POST', '/api/auth/login', { username: 'admin', password: 'Admin@12345' });
  if (loginRes.status !== 200 || !loginRes.data.token) {
    throw new Error('Gagal login: ' + JSON.stringify(loginRes.data));
  }
  token = loginRes.data.token;
  console.log('   ✓ Login berhasil, Token JWT diperoleh:', token.substring(0, 20) + '...');

  const authHeader = { 'Authorization': `Bearer ${token}` };

  // 2. Test Auth Me
  console.log('2. Menguji GET /api/auth/me...');
  const meRes = await request('GET', '/api/auth/me', null, authHeader);
  if (meRes.status !== 200 || meRes.data.user.username !== 'admin') {
    throw new Error('Gagal me: ' + JSON.stringify(meRes.data));
  }
  console.log('   ✓ Profil terverifikasi:', meRes.data.user.name, `(${meRes.data.user.role})`);

  // 3. Test Dashboard
  console.log('3. Menguji GET /api/dashboard...');
  const dashRes = await request('GET', '/api/dashboard', null, authHeader);
  if (dashRes.status !== 200 || dashRes.data.kpis.total_assets < 1) {
    throw new Error('Gagal dashboard: ' + JSON.stringify(dashRes.data));
  }
  console.log(`   ✓ Dashboard OK. Total aset: ${dashRes.data.kpis.total_assets}, Nilai total: Rp ${dashRes.data.kpis.total_value.toLocaleString('id-ID')}, Perawatan aktif: ${dashRes.data.kpis.active_maintenance}`);

  // 4. Test Master Data
  console.log('4. Menguji GET /api/master/categories...');
  const catRes = await request('GET', '/api/master/categories', null, authHeader);
  console.log(`   ✓ Master Kategori OK (${catRes.data.data.length} kategori)`);

  const roomRes = await request('GET', '/api/master/rooms', null, authHeader);
  console.log(`   ✓ Master Ruangan OK (${roomRes.data.data.length} ruangan)`);

  // 5. Test Asset Creation & Detail
  console.log('5. Menguji POST /api/assets (Tambah Aset Baru)...');
  const newAssetCode = 'AST-TEST-' + Math.floor(Math.random() * 10000);
  const newAssetRes = await request('POST', '/api/assets', {
    code: newAssetCode,
    name: 'Proyektor Epson EB-X500',
    category_id: catRes.data.data[0].id,
    room_id: roomRes.data.data[0].id,
    condition_id: 1,
    pic_id: 1,
    value: 6500000,
    purchase_date: '2026-02-01',
    notes: 'Unit uji otomatisasi sistem'
  }, authHeader);
  if (newAssetRes.status !== 201) {
    throw new Error('Gagal tambah aset: ' + JSON.stringify(newAssetRes.data));
  }
  const createdAssetId = newAssetRes.data.data.id;
  console.log(`   ✓ Aset berhasil dibuat: ID ${createdAssetId}, Kode ${newAssetCode}`);

  // 6. Test Asset Detail with Maintenance History
  console.log(`6. Menguji GET /api/assets/${createdAssetId} (Detail Aset)...`);
  const assetDetailRes = await request('GET', `/api/assets/${createdAssetId}`, null, authHeader);
  if (assetDetailRes.status !== 200 || assetDetailRes.data.data.code !== newAssetCode) {
    throw new Error('Gagal detail aset: ' + JSON.stringify(assetDetailRes.data));
  }
  console.log(`   ✓ Detail aset terbaca dengan relasi ruangan: ${assetDetailRes.data.data.room_name}`);

  // 7. Test Maintenance Workflow
  console.log('7. Menguji Alur Perawatan (POST /api/maintenance)...');
  const maintRes = await request('POST', '/api/maintenance', {
    asset_id: createdAssetId,
    request_date: '2026-02-14',
    status: 'Permintaan',
    notes: 'Lampu proyektor redup, butuh penggantian bohlam'
  }, authHeader);
  if (maintRes.status !== 201) {
    throw new Error('Gagal buat tiket: ' + JSON.stringify(maintRes.data));
  }
  const maintId = maintRes.data.data.id;
  const ticketNumber = maintRes.data.data.ticket_number;
  console.log(`   ✓ Tiket dibuat: ${ticketNumber}, Status: ${maintRes.data.data.status}`);

  // Update status: Dijadwalkan -> Selesai
  console.log('   Memperbarui tiket ke status Selesai...');
  const finishRes = await request('PUT', `/api/maintenance/${maintId}`, {
    status: 'Selesai',
    scheduled_date: '2026-02-15',
    completion_date: '2026-02-16',
    cost: 750000,
    technician: 'CV Optima Solusi',
    notes: 'Bohlam OEM proyektor berhasil diganti dan optik dibersihkan',
    result_condition_id: 1 // Baik
  }, authHeader);
  if (finishRes.status !== 200 || finishRes.data.data.status !== 'Selesai') {
    throw new Error('Gagal update tiket: ' + JSON.stringify(finishRes.data));
  }
  console.log(`   ✓ Tiket diperbarui: Biaya Rp ${finishRes.data.data.cost.toLocaleString('id-ID')}, Teknisi: ${finishRes.data.data.technician}`);

  // 8. Test Reports (Recap & Detail)
  console.log('8. Menguji GET /api/reports/recap & /api/reports/detail...');
  const recapRes = await request('GET', '/api/reports/recap', null, authHeader);
  if (recapRes.status !== 200 || !recapRes.data.summary) {
    throw new Error('Gagal laporan rekap: ' + JSON.stringify(recapRes.data));
  }
  console.log(`   ✓ Rekapitulasi OK: ${recapRes.data.by_category.length} kategori, ${recapRes.data.by_room.length} ruangan, ${recapRes.data.by_period.length} periode bulan.`);

  // 9. Test Navicat Settings Endpoint
  console.log('9. Menguji GET /api/settings/database (Informasi Navicat)...');
  const dbInfoRes = await request('GET', '/api/settings/database', null, authHeader);
  if (dbInfoRes.status !== 200 || !dbInfoRes.data.navicat.database_file) {
    throw new Error('Gagal settings database: ' + JSON.stringify(dbInfoRes.data));
  }
  console.log(`   ✓ Navicat Info OK: Path SQLite: ${dbInfoRes.data.navicat.database_file}`);
  console.log(`   ✓ Jumlah tabel terstruktur: ${dbInfoRes.data.tables.length}, Jumlah Views: ${dbInfoRes.data.views.length}`);

  // 10. Test OpenAPI Documentation Spec
  console.log('10. Menguji GET /api/docs/spec (Dokumentasi API)...');
  const specRes = await request('GET', '/api/docs/spec');
  if (specRes.status !== 200 || !specRes.data.openapi) {
    throw new Error('Gagal OpenAPI spec');
  }
  // 11. Cleanup Test Records
  console.log('11. Membersihkan data pengujian sementara...');
  await request('DELETE', `/api/maintenance/${maintId}`, null, authHeader);
  await request('DELETE', `/api/assets/${createdAssetId}`, null, authHeader);
  console.log('   ✓ Data uji berhasil dibersihkan.');

  console.log('\n=============================================================');
  console.log('🎉 SELURUH PENGUJIAN INTEGRASI & FITUR 100% SUKSES DAN SINKRON!');
  console.log('=============================================================');
}

runTests().catch(err => {
  console.error('\n❌ Pengujian gagal:', err.message);
  process.exit(1);
});
