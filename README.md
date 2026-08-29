# List Anime — Struktur Project

```
anime-list-web/
├── index.html          Halaman publik (tampilan utama)
├── admin/
│   ├── admin.html       Halaman login + panel kelola admin
│   ├── admin.css         Style khusus admin
│   └── admin.js           Logic login & CRUD anime
├── css/
│   └── style.css        Style utama (dipakai halaman publik & admin)
└── js/
    ├── db.js              "Database" — penyimpanan data via localStorage
    └── app.js             Logic halaman publik (carousel, menu, tema)
```

## Cara menjalankan
Cukup buka `index.html` langsung di browser (double click). Tidak perlu
server atau instalasi apa pun.

## Login Admin
- URL: `admin/admin.html` (atau lewat menu ☰ → Admin)
- Username: `LIST`
- Password: `LIST`

## Tentang "database"-nya
Karena ini murni file statis (tanpa server), data anime, catatan, dan tema
disimpan di **localStorage** browser lewat `js/db.js`. Ini berfungsi
sepenuhnya seperti database untuk kebutuhan satu perangkat/browser —
tambah, ubah, hapus anime dari admin langsung tersimpan dan langsung
muncul di halaman publik.

Konsekuensinya: data tersimpan per-browser, bukan di server pusat. Kalau
nanti mau datanya bisa diakses dari HP dan laptop sekaligus (atau dari
banyak orang), `db.js` tinggal diganti supaya nembak ke backend beneran
(misalnya Firebase, Supabase, atau server Node.js + database). Struktur
fungsinya (`getAll`, `save`, `remove`, dst) sudah dibuat mirip API supaya
gampang disambungkan nanti.

## Fitur yang sudah jalan
- Kartu anime full (cover besar, judul, sinopsis, karakter penting)
  dengan navigasi geser kiri/kanan (tombol & tombol panah keyboard)
- Menu ☰ kiri atas: Admin, Tema (gelap/terang), Catatan
- Tombol lingkaran bolong kanan atas: daftar "Segel Tamat", klik judul
  langsung lompat ke kartu anime tersebut
- Admin: login, tambah/ubah/hapus anime, atur cover, sinopsis, karakter
  (tambah/hapus per-chip), tandai tamat, dan ubah teks Catatan
- Tema tersimpan dan konsisten di semua halaman
