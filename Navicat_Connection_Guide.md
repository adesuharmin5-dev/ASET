# Panduan Membuka Database AssetCare di Navicat

Aplikasi AssetCare menggunakan database **SQLite 3** dengan mode WAL (*Write-Ahead Logging*). Keuntungan utamanya adalah Anda dapat membuka dan mengelola database ini langsung di **Navicat** tanpa perlu menyalakan service terpisah seperti MySQL/PostgreSQL, serta aplikasi web dan Navicat dapat membaca data secara bersamaan tanpa saling mengunci (*zero lock*).

---

## 1. Lokasi File Database
File database tersimpan rapi di direktori proyek Anda:
```text
D:\Aurora\ASET\data\assetcare.db
```

---

## 2. Cara Menghubungkan Navicat ke Database

### Opsi A: Menggunakan Navicat for SQLite atau Navicat Premium (Sangat Disarankan)

1. Buka aplikasi **Navicat** di komputer Anda.
2. Di pojok kiri atas, klik **Connection** (Koneksi) -> pilih **SQLite**.
3. Pada jendela pengaturan koneksi yang muncul, isi kolom berikut:
   - **Connection Name:** `AssetCare_Local`
   - **Type:** Pilih `Existing Database File`
   - **Database File:** Klik tombol browse `[...]`, lalu arahkan ke file:
     `D:\Aurora\ASET\data\assetcare.db`
4. Klik tombol **Test Connection** di sudut kiri bawah jendela. Jika muncul notifikasi *"Connection Successful"*, klik **OK**.
5. Klik ganda pada koneksi `AssetCare_Local` yang baru dibuat di panel sebelah kiri untuk membukanya.

---

## 3. Struktur Tabel & View yang Tersedia di Navicat

Setelah terkoneksi, Anda akan melihat struktur database relasional yang bersih:

### Tabel Utama:
- **`assets`** : Menyimpan data aset lengkap (kode aset, nama, relasi kategori, ruangan, kondisi, penanggung jawab, nilai/harga, tanggal beli, catatan).
- **`maintenance`** : Menyimpan tiket pekerjaan perawatan (nomor tiket, alur status 5 tahap, jadwal, tanggal selesai, biaya, teknisi, catatan).
- **`categories`** : Master data kelompok/kategori aset.
- **`rooms`** : Master data ruangan lengkap dengan nama gedung dan lantai.
- **`conditions`** : Master data kondisi fisik aset (Baik, Rusak Ringan, Rusak Berat, Afkir).
- **`pics`** : Master data personil penanggung jawab (NIP, Departemen, Kontak, Email).
- **`users`** : Data kredensial pengguna admin terenkripsi scrypt.

### View Relasional (Siap Pakai untuk Analisis & Query Cepat):
- **`v_assets_detail`** : View gabungan seluruh aset beserta nama kategori, nama ruangan, nama penanggung jawab, serta akumulasi biaya dan jumlah perawatan.
- **`v_maintenance_detail`** : View tiket perawatan beserta informasi detail aset dan lokasi ruangan.
- **`v_rekap_kategori`** : Rekapitulasi otomatis jumlah unit aset dan total valuasi nilai per kategori.
- **`v_rekap_ruangan`** : Rekapitulasi otomatis jumlah unit aset dan nilai per ruangan / lantai.
- **`v_rekap_kondisi`** : Rekapitulasi distribusi kondisi aset.
- **`v_rekap_periode`** : Rekapitulasi perawatan bulanan beserta akumulasi biaya pemeliharaan.

---

## 4. Opsi B: Menggunakan Navicat for MySQL / MariaDB

Jika Anda memiliki server MySQL lokal (seperti XAMPP atau Laragon) dan ingin mengimpor data ini ke Navicat MySQL:

1. Buat database baru di MySQL, misalnya bernama `assetcare_db`.
2. Buka file `D:\Aurora\ASET\schema.sql`.
3. Jalankan query SQL tersebut di Navicat MySQL untuk membuat seluruh tabel dan view.
4. Anda juga dapat mengunduh dump data terbaru dari menu **Pengaturan -> Ekspor SQL Dump** di aplikasi web.
