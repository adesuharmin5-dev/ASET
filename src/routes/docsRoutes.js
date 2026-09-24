const express = require('express');
const router = express.Router();

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Aurora Aset REST API',
    version: '1.0.0',
    description: 'Dokumentasi REST API Aplikasi Manajemen Aset dan Perawatan Aurora Aset. Mendukung integrasi sistem eksternal, skrip automasi, dan klien database.'
  },
  servers: [
    { url: '/api', description: 'Server API Lokal' }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Masukkan token JWT yang diperoleh dari endpoint /auth/login.'
      }
    }
  },
  paths: {
    '/auth/login': {
      post: {
        summary: 'Autentikasi Pengguna',
        description: 'Menerima username dan password untuk menghasilkan JWT bearer token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string', example: 'admin' },
                  password: { type: 'string', example: 'Admin@12345' }
                },
                required: ['username', 'password']
              }
            }
          }
        },
        responses: {
          200: { description: 'Login berhasil dan mengembalikan token.' },
          401: { description: 'Kredensial tidak valid.' }
        }
      }
    },
    '/auth/me': {
      get: {
        summary: 'Data Profil Pengguna Aktif',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Data user yang sedang login.' }
        }
      }
    },
    '/dashboard': {
      get: {
        summary: 'Ringkasan Eksekutif & KPI Dashboard',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'KPI aset, nilai total, perawatan aktif, biaya, dan grafik kondisi.' }
        }
      }
    },
    '/assets': {
      get: {
        summary: 'Daftar Seluruh Aset',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Pencarian kode atau nama' },
          { name: 'category_id', in: 'query', schema: { type: 'integer' }, description: 'Filter ID Kategori' },
          { name: 'room_id', in: 'query', schema: { type: 'integer' }, description: 'Filter ID Ruangan' },
          { name: 'condition_id', in: 'query', schema: { type: 'integer' }, description: 'Filter ID Kondisi' }
        ],
        responses: {
          200: { description: 'Daftar aset terstruktur beserta relasi master.' }
        }
      },
      post: {
        summary: 'Tambah Aset Baru',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'AST-2026-099' },
                  name: { type: 'string', example: 'Scanner Canon LiDE 300' },
                  category_id: { type: 'integer', example: 1 },
                  room_id: { type: 'integer', example: 2 },
                  condition_id: { type: 'integer', example: 1 },
                  pic_id: { type: 'integer', example: 1 },
                  value: { type: 'number', example: 1250000 },
                  purchase_date: { type: 'string', example: '2026-01-10' },
                  notes: { type: 'string', example: 'Kelengkapan kabel USB lengkap' }
                },
                required: ['code', 'name', 'category_id', 'room_id', 'condition_id', 'pic_id', 'purchase_date']
              }
            }
          }
        },
        responses: {
          201: { description: 'Aset berhasil dibuat.' }
        }
      }
    },
    '/assets/{id}': {
      get: {
        summary: 'Detail Aset & Riwayat Perawatan',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Detail aset lengkap dengan histori perawatan.' } }
      },
      put: {
        summary: 'Perbarui Data Aset',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Aset berhasil diperbarui.' } }
      },
      delete: {
        summary: 'Hapus Data Aset',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Aset berhasil dihapus.' } }
      }
    },
    '/assets/export/csv': {
      get: {
        summary: 'Ekspor Data Aset ke Format CSV',
        responses: { 200: { description: 'File data_aset.csv siap diunduh.' } }
      }
    },
    '/assets/import/csv': {
      post: {
        summary: 'Impor Data Aset dari File CSV',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { file: { type: 'string', format: 'binary' } }
              }
            }
          }
        },
        responses: { 200: { description: 'Hasil impor data aset.' } }
      }
    },
    '/maintenance': {
      get: {
        summary: 'Daftar Tiket Perawatan',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'asset_id', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Daftar tiket perawatan.' } }
      },
      post: {
        summary: 'Input Permintaan Perawatan Baru',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  asset_id: { type: 'integer', example: 1 },
                  request_date: { type: 'string', example: '2026-02-15' },
                  notes: { type: 'string', example: 'Lampu indikator berkedip merah' }
                },
                required: ['asset_id', 'request_date']
              }
            }
          }
        },
        responses: { 201: { description: 'Tiket berhasil dibuat.' } }
      }
    },
    '/maintenance/{id}': {
      put: {
        summary: 'Perbarui Status, Jadwal, Pelaksanaan, Biaya Perawatan',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Tiket berhasil diperbarui.' } }
      }
    },
    '/maintenance/export/csv': {
      get: {
        summary: 'Ekspor Riwayat Perawatan ke Format CSV',
        responses: { 200: { description: 'File data_perawatan.csv siap diunduh.' } }
      }
    },
    '/master/{kind}': {
      get: {
        summary: 'Daftar Master Data (categories, rooms, conditions, pics)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'kind', in: 'path', required: true, schema: { type: 'string', enum: ['categories', 'rooms', 'conditions', 'pics'] } }
        ],
        responses: { 200: { description: 'Data master terpilih.' } }
      }
    },
    '/reports/detail': {
      get: {
        summary: 'Laporan Detail Aset & Perawatan',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Data detail dengan filter lengkap.' } }
      }
    },
    '/reports/recap': {
      get: {
        summary: 'Laporan Rekapitulasi per Kategori, Ruangan, Kondisi, Periode',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Ringkasan angka dan valuasi per dimensi.' } }
      }
    },
    '/settings/database': {
      get: {
        summary: 'Informasi Koneksi Navicat & Statistik Skema Database',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Path SQLite, struktur tabel, dan views.' } }
      }
    }
  }
};

router.get('/spec', (req, res) => {
  res.json(openApiSpec);
});

module.exports = {
  router,
  openApiSpec
};
