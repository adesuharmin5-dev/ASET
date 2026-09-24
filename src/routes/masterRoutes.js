const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authMiddleware } = require('../auth');

const VALID_KINDS = ['categories', 'rooms', 'conditions', 'pics'];

// Helper to validate kind
function checkKind(req, res, next) {
  const kind = req.params.kind;
  if (!VALID_KINDS.includes(kind)) {
    return res.status(404).json({ success: false, message: `Master data '${kind}' tidak valid.` });
  }
  next();
}

// GET all items for a master type
router.get('/:kind', authMiddleware, checkKind, (req, res) => {
  const { kind } = req.params;
  const items = db.prepare(`SELECT * FROM ${kind} ORDER BY name ASC`).all();
  res.json({ success: true, kind, data: items });
});

// GET single item
router.get('/:kind/:id', authMiddleware, checkKind, (req, res) => {
  const { kind, id } = req.params;
  const item = db.prepare(`SELECT * FROM ${kind} WHERE id = ?`).get(id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
  }
  res.json({ success: true, data: item });
});

// CREATE item
router.post('/:kind', authMiddleware, checkKind, (req, res) => {
  const { kind } = req.params;
  const body = req.body;
  const now = new Date().toISOString();

  if (!body.code || !body.name) {
    return res.status(400).json({ success: false, message: 'Kode dan Nama wajib diisi.' });
  }

  // Check code uniqueness
  const existing = db.prepare(`SELECT id FROM ${kind} WHERE LOWER(code) = LOWER(?)`).get(body.code.trim());
  if (existing) {
    return res.status(400).json({ success: false, message: `Kode '${body.code}' sudah terdaftar.` });
  }

  try {
    let result;
    if (kind === 'categories') {
      result = db.prepare(`
        INSERT INTO categories (code, name, description, created_at)
        VALUES (?, ?, ?, ?)
      `).run(body.code.trim(), body.name.trim(), body.description || '', now);
    } else if (kind === 'rooms') {
      result = db.prepare(`
        INSERT INTO rooms (code, name, building, floor, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(body.code.trim(), body.name.trim(), body.building || '', body.floor || '', body.description || '', now);
    } else if (kind === 'conditions') {
      result = db.prepare(`
        INSERT INTO conditions (code, name, level, description, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(body.code.trim(), body.name.trim(), body.level || 'BAIK', body.description || '', now);
    } else if (kind === 'pics') {
      result = db.prepare(`
        INSERT INTO pics (code, name, nip, department, phone, email, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(body.code.trim(), body.name.trim(), body.nip || '', body.department || '', body.phone || '', body.email || '', now);
    }

    const created = db.prepare(`SELECT * FROM ${kind} WHERE id = ?`).get(result.lastInsertRowid);
    res.status(201).json({ success: true, message: 'Data master berhasil ditambahkan.', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menyimpan data master: ' + err.message });
  }
});

// UPDATE item
router.put('/:kind/:id', authMiddleware, checkKind, (req, res) => {
  const { kind, id } = req.params;
  const body = req.body;

  const item = db.prepare(`SELECT * FROM ${kind} WHERE id = ?`).get(id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
  }

  if (body.code && body.code.trim().toLowerCase() !== item.code.toLowerCase()) {
    const existing = db.prepare(`SELECT id FROM ${kind} WHERE LOWER(code) = LOWER(?) AND id != ?`).get(body.code.trim(), id);
    if (existing) {
      return res.status(400).json({ success: false, message: `Kode '${body.code}' sudah digunakan data lain.` });
    }
  }

  try {
    const code = body.code ? body.code.trim() : item.code;
    const name = body.name ? body.name.trim() : item.name;

    if (kind === 'categories') {
      db.prepare(`
        UPDATE categories SET code = ?, name = ?, description = ? WHERE id = ?
      `).run(code, name, body.description !== undefined ? body.description : item.description, id);
    } else if (kind === 'rooms') {
      db.prepare(`
        UPDATE rooms SET code = ?, name = ?, building = ?, floor = ?, description = ? WHERE id = ?
      `).run(code, name, body.building !== undefined ? body.building : item.building, body.floor !== undefined ? body.floor : item.floor, body.description !== undefined ? body.description : item.description, id);
    } else if (kind === 'conditions') {
      db.prepare(`
        UPDATE conditions SET code = ?, name = ?, level = ?, description = ? WHERE id = ?
      `).run(code, name, body.level || item.level, body.description !== undefined ? body.description : item.description, id);
    } else if (kind === 'pics') {
      db.prepare(`
        UPDATE pics SET code = ?, name = ?, nip = ?, department = ?, phone = ?, email = ? WHERE id = ?
      `).run(code, name, body.nip !== undefined ? body.nip : item.nip, body.department !== undefined ? body.department : item.department, body.phone !== undefined ? body.phone : item.phone, body.email !== undefined ? body.email : item.email, id);
    }

    const updated = db.prepare(`SELECT * FROM ${kind} WHERE id = ?`).get(id);
    res.json({ success: true, message: 'Data master berhasil diperbarui.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui data master: ' + err.message });
  }
});

// DELETE item
router.delete('/:kind/:id', authMiddleware, checkKind, (req, res) => {
  const { kind, id } = req.params;

  // Check foreign key references in assets
  let refCount = 0;
  if (kind === 'categories') {
    refCount = db.prepare('SELECT COUNT(*) as count FROM assets WHERE category_id = ?').get(id).count;
  } else if (kind === 'rooms') {
    refCount = db.prepare('SELECT COUNT(*) as count FROM assets WHERE room_id = ?').get(id).count;
  } else if (kind === 'conditions') {
    refCount = db.prepare('SELECT COUNT(*) as count FROM assets WHERE condition_id = ?').get(id).count;
  } else if (kind === 'pics') {
    refCount = db.prepare('SELECT COUNT(*) as count FROM assets WHERE pic_id = ?').get(id).count;
  }

  if (refCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Tidak dapat menghapus data ini karena sedang digunakan oleh ${refCount} aset. Ubah referensi aset terlebih dahulu.`
    });
  }

  const result = db.prepare(`DELETE FROM ${kind} WHERE id = ?`).run(id);
  if (result.changes === 0) {
    return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
  }

  res.json({ success: true, message: 'Data master berhasil dihapus.' });
});

module.exports = router;
