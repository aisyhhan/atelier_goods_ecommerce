# Project E-Commerce Minimalis - Laravel 11

Aplikasi toko daring e-commerce menggunakan **Framework Laravel 11** dan **Tailwind CSS**.

---

## 🚀 Panduan Menjalankan di Visual Studio Code (Local Komputer)

### 1. Buka Folder Ini di Visual Studio Code
Buka aplikasi VS Code > **File** > **Open Folder...** > Pilih folder `atelier-laravel-ecommerce`.

### 2. Buka Terminal di VS Code
Tekan tombol keyboard: **`Ctrl + ~`** (tanda backtick di samping angka 1).

### 3. Install Dependensi PHP (Jika Baru)
```bash
composer install
```

### 4. Salin File .env dan Generate App Key
```bash
copy .env.example .env
php artisan key:generate
```

### 5. Jalankan Migrasi & Database Seeder (Membuat Tabel & Contoh Barang)
```bash
php artisan migrate --seed
```

### 6. Jalankan Server Laravel
```bash
php artisan serve
```

Buka browser Anda di: **http://127.0.0.1:8000** 🎉
Aplikasi e-commerce siap digunakan!
