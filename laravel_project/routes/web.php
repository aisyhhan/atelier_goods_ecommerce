<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;

/*
|--------------------------------------------------------------------------
| Web Routes - E-Commerce Minimalis Atelier Goods
|--------------------------------------------------------------------------
|
| Rute untuk katalog toko, detail produk, keranjang belanja, dan pesanan.
|
*/

// Halaman utama toko (Katalog produk & landing e-commerce)
Route::get('/', [ProductController::class, 'index'])->name('shop.index');

// Halaman detail spesifik satu produk
Route::get('/product/{slug}', [ProductController::class, 'show'])->name('shop.show');

// Alur Checkout & Pesanan
Route::post('/checkout', [OrderController::class, 'store'])->name('order.store');
Route::get('/orders', [OrderController::class, 'index'])->name('order.index');
