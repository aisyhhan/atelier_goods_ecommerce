export interface LaravelFile {
  path: string;
  name: string;
  category: 'Route' | 'Controller' | 'Model' | 'Migration' | 'Seeder' | 'Blade View' | 'Config';
  content: string;
}

export const LARAVEL_PROJECT_FILES: LaravelFile[] = [
  {
    path: 'routes/web.php',
    name: 'web.php',
    category: 'Route',
    content: `<?php

use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\ProductController;
use App\\Http\\Controllers\\OrderController;

/*
|--------------------------------------------------------------------------
| Web Routes - E-Commerce Minimalis Atelier Goods
|--------------------------------------------------------------------------
*/

// Halaman utama toko (Katalog produk & landing e-commerce)
Route::get('/', [ProductController::class, 'index'])->name('shop.index');

// Halaman detail satu produk
Route::get('/product/{slug}', [ProductController::class, 'show'])->name('shop.show');

// Alur Checkout & Pesanan
Route::post('/checkout', [OrderController::class, 'store'])->name('order.store');
Route::get('/orders', [OrderController::class, 'index'])->name('order.index');
`,
  },
  {
    path: 'app/Http/Controllers/ProductController.php',
    name: 'ProductController.php',
    category: 'Controller',
    content: `<?php

namespace App\\Http\\Controllers;

use App\\Models\\Product;
use Illuminate\\Http\\Request;

class ProductController extends Controller
{
    /**
     * Menampilkan katalog toko online dengan filter kategori & pencarian
     */
    public function index(Request $request)
    {
        $query = Product::where('is_active', true);

        // Filter berdasarkan kategori jika dipilih
        if ($request->filled('category') && $request->category !== 'Semua Kategori') {
            $query->where('category', $request->category);
        }

        // Pencarian berdasarkan nama produk atau deskripsi
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Pengurutan harga / terpopuler
        if ($request->sort === 'price-asc') {
            $query->orderBy('price', 'asc');
        } elseif ($request->sort === 'price-desc') {
            $query->orderBy('price', 'desc');
        } elseif ($request->sort === 'popular') {
            $query->orderBy('review_count', 'desc');
        } else {
            $query->latest();
        }

        $products = $query->get();

        $categories = [
            'Semua Kategori',
            'Perabotan & Dapur',
            'Fashion & Tekstil',
            'Penerangan',
            'Dekorasi & Lifestyle',
        ];

        return view('shop.index', compact('products', 'categories'));
    }

    /**
     * Menampilkan halaman detail spesifik untuk satu produk
     */
    public function show(string $slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();
        $relatedProducts = Product::where('category', $product->category)
            ->where('id', '!=', $product->id)
            ->take(3)
            ->get();

        return view('shop.show', compact('product', 'relatedProducts'));
    }
}
`,
  },
  {
    path: 'app/Http/Controllers/OrderController.php',
    name: 'OrderController.php',
    category: 'Controller',
    content: `<?php

namespace App\\Http\\Controllers;

use App\\Models\\Order;
use App\\Models\\OrderItem;
use App\\Models\\Product;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\DB;

class OrderController extends Controller
{
    /**
     * Menampilkan daftar riwayat pesanan (Pesanan Saya)
     */
    public function index()
    {
        $orders = Order::with('items')->latest()->take(10)->get();
        return view('shop.orders', compact('orders'));
    }

    /**
     * Memproses pesanan dari formulir checkout
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name'    => 'required|string|max:150',
            'customer_phone'   => 'required|string|max:30',
            'shipping_address' => 'required|string',
            'payment_method'   => 'required|in:cod,qris,bank_transfer',
            'items'            => 'required|array|min:1',
            'items.*.id'       => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'coupon_code'      => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $subtotal = 0;
            $itemsToCreate = [];

            // Hitung subtotal & kurangi stok produk
            foreach ($validated['items'] as $itemData) {
                $product = Product::lockForUpdate()->findOrFail($itemData['id']);

                if ($product->stock < $itemData['quantity']) {
                    return back()->withErrors(['stock' => "Stok produk {$product->name} tidak mencukupi."]);
                }

                $itemSubtotal = $product->price * $itemData['quantity'];
                $subtotal += $itemSubtotal;

                // Kurangi stok barang di database
                $product->decrement('stock', $itemData['quantity']);

                $itemsToCreate[] = [
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'price'        => $product->price,
                    'quantity'     => $itemData['quantity'],
                    'subtotal'     => $itemSubtotal,
                ];
            }

            // Hitung diskon voucher jika ada
            $discount = 0;
            if (strtoupper($request->coupon_code) === 'DISKON10') {
                $discount = (int) round($subtotal * 0.10);
            }

            // Ongkir gratis di atas Rp 300.000
            $shipping = ($subtotal >= 300000) ? 0 : 20000;
            $totalAmount = max(0, $subtotal - $discount + $shipping);

            // Buat Invoice Nomor Unik
            $orderNumber = 'INV-' . date('Ym') . '-' . rand(1000, 9999);

            $order = Order::create([
                'order_number'     => $orderNumber,
                'customer_name'    => $validated['customer_name'],
                'customer_phone'   => $validated['customer_phone'],
                'shipping_address' => $validated['shipping_address'],
                'payment_method'   => $validated['payment_method'],
                'subtotal'         => $subtotal,
                'discount'         => $discount,
                'shipping_fee'     => $shipping,
                'total_amount'     => $totalAmount,
                'status'           => $validated['payment_method'] === 'cod' ? 'Diproses' : 'Menunggu Pembayaran',
            ]);

            foreach ($itemsToCreate as $item) {
                $order->items()->create($item);
            }

            return redirect()->route('order.index')
                ->with('success', "Pesanan {$orderNumber} berhasil dibuat! Segera kami proses.");
        });
    }
}
`,
  },
  {
    path: 'app/Models/Product.php',
    name: 'Product.php',
    category: 'Model',
    content: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'category',
        'price',
        'stock',
        'description',
        'image_url',
        'rating',
        'review_count',
        'is_active',
    ];

    protected $casts = [
        'price'        => 'integer',
        'stock'        => 'integer',
        'rating'       => 'float',
        'review_count' => 'integer',
        'is_active'    => 'boolean',
    ];

    /**
     * Accessor format Rupiah: {{ $product->formatted_price }}
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }
}
`,
  },
  {
    path: 'app/Models/Order.php',
    name: 'Order.php',
    category: 'Model',
    content: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_name',
        'customer_phone',
        'shipping_address',
        'payment_method',
        'subtotal',
        'discount',
        'shipping_fee',
        'total_amount',
        'status',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getFormattedTotalAttribute(): string
    {
        return 'Rp ' . number_format($this->total_amount, 0, ',', '.');
    }
}
`,
  },
  {
    path: 'app/Models/OrderItem.php',
    name: 'OrderItem.php',
    category: 'Model',
    content: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'price',
        'quantity',
        'subtotal',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
`,
  },
  {
    path: 'database/migrations/2026_10_29_000001_create_products_table.php',
    name: 'create_products_table.php',
    category: 'Migration',
    content: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category');
            $table->unsignedBigInteger('price');
            $table->integer('stock')->default(0);
            $table->text('description');
            $table->string('image_url')->nullable();
            $table->decimal('rating', 3, 1)->default(5.0);
            $table->integer('review_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
`,
  },
  {
    path: 'database/migrations/2026_10_29_000002_create_orders_table.php',
    name: 'create_orders_table.php',
    category: 'Migration',
    content: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->text('shipping_address');
            $table->string('payment_method')->default('cod');
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('discount')->default(0);
            $table->unsignedBigInteger('shipping_fee')->default(0);
            $table->unsignedBigInteger('total_amount');
            $table->string('status')->default('Diproses');
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->unsignedBigInteger('price');
            $table->integer('quantity');
            $table->unsignedBigInteger('subtotal');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
`,
  },
  {
    path: 'database/seeders/ProductSeeder.php',
    name: 'ProductSeeder.php',
    category: 'Seeder',
    content: `<?php

namespace Database\\Seeders;

use App\\Models\\Product;
use Illuminate\\Database\\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name'         => 'Cangkir Keramik Artisan Glaze',
                'slug'         => 'cangkir-keramik-artisan-glaze',
                'category'     => 'Perabotan & Dapur',
                'price'        => 145000,
                'stock'        => 28,
                'rating'       => 4.9,
                'review_count' => 42,
                'description'  => 'Cangkir kopi buatan tangan berbahan keramik stoneware alami dengan tekstur sentuhan matte yang nyaman digenggam. Tahan microwave dan mesin pencuci piring.',
                'image_url'    => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
            ],
            [
                'name'         => 'Tas Jinjing Tote Linen Alami',
                'slug'         => 'tas-jinjing-tote-linen-alami',
                'category'     => 'Fashion & Tekstil',
                'price'        => 195000,
                'stock'        => 19,
                'rating'       => 4.8,
                'review_count' => 38,
                'description'  => 'Tote bag berkapasitas luas dari serat katun dan linen organik alami. Ringan, kokoh, dengan jahitan ganda untuk belanja harian, kuliah, atau santai.',
                'image_url'    => 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
            ],
            [
                'name'         => 'Lampu Meja Geometris Matte Black',
                'slug'         => 'lampu-meja-geometris-matte-black',
                'category'     => 'Penerangan',
                'price'        => 420000,
                'stock'        => 12,
                'rating'       => 5.0,
                'review_count' => 26,
                'description'  => 'Lampu meja arsitektural dengan material baja solid berlapis matte powder coating. Sudut pencahayaan hangat yang nyaman untuk membaca dan bekerja.',
                'image_url'    => 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
            ],
            [
                'name'         => 'Buku Jurnal Linen & Sabun Herbal',
                'slug'         => 'buku-jurnal-linen-sabun-herbal',
                'category'     => 'Dekorasi & Lifestyle',
                'price'        => 210000,
                'stock'        => 35,
                'rating'       => 4.7,
                'review_count' => 19,
                'description'  => 'Paket relaksasi harian berisi buku catatan bercover linen halus dengan kertas bebas asam 120gsm dan sabun batang herbal alami beraroma cedarwood.',
                'image_url'    => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
            ],
            [
                'name'         => 'Set Wadah Keramik Minimalis',
                'slug'         => 'set-wadah-keramik-minimalis',
                'category'     => 'Perabotan & Dapur',
                'price'        => 280000,
                'stock'        => 8,
                'rating'       => 4.9,
                'review_count' => 15,
                'description'  => 'Set mangkuk keramik earthy tones dengan tekstur matte halus. Sangat cocok untuk sajian sarapan sehat, salad buah, atau estetika meja makan.',
                'image_url'    => 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80',
            ],
        ];

        foreach ($products as $p) {
            Product::updateOrCreate(['slug' => $p['slug']], $p);
        }
    }
}
`,
  },
  {
    path: 'resources/views/layouts/app.blade.php',
    name: 'app.blade.php',
    category: 'Blade View',
    content: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Atelier Goods') - Toko E-Commerce Minimalis</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    </style>
</head>
<body class="bg-neutral-50 text-neutral-900 antialiased min-h-screen flex flex-col selection:bg-neutral-900 selection:text-white">

    <!-- Top Minimal Promo Bar -->
    <div class="bg-neutral-900 text-neutral-200 text-[11px] py-1.5 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2">
        <span>Gunakan kode <strong>DISKON10</strong> untuk potongan 10% &middot; Gratis Ongkir &gt; Rp300.000</span>
    </div>

    <!-- Main Navigation Bar -->
    <header class="border-b border-neutral-200 bg-white/95 backdrop-blur-md sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
            <!-- Brand Wordmark -->
            <a href="{{ route('shop.index') }}" class="text-xl font-bold tracking-tight text-neutral-900 whitespace-nowrap">
                Atelier Goods
            </a>

            <!-- Navigation Links -->
            <nav class="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
                <a href="{{ route('shop.index') }}" class="hover:text-neutral-900 transition-colors">Katalog Produk</a>
                <a href="{{ route('shop.index') }}#unggulan" class="hover:text-neutral-900 transition-colors">Koleksi Unggulan</a>
                <a href="{{ route('order.index') }}" class="hover:text-neutral-900 transition-colors flex items-center gap-1.5">
                    <span>Pesanan Saya</span>
                </a>
            </nav>

            <!-- Actions -->
            <div class="flex items-center gap-3">
                <button onclick="toggleCartDrawer()" class="relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    <span>Keranjang</span>
                    <span id="cart-badge" class="w-5 h-5 rounded-full bg-neutral-900 text-white text-[11px] font-bold flex items-center justify-center">0</span>
                </button>
            </div>
        </div>
    </header>

    <!-- Flash Message Notification -->
    @if(session('success'))
        <div class="max-w-7xl mx-auto px-6 mt-4 w-full">
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between">
                <span>{{ session('success') }}</span>
                <button onclick="this.parentElement.remove()" class="text-emerald-700 font-bold">&times;</button>
            </div>
        </div>
    @endif

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="border-t border-neutral-200 bg-white mt-auto py-12">
        <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-neutral-600 mb-8">
            <div class="space-y-3">
                <div class="text-base font-bold text-neutral-900">Atelier Goods</div>
                <p class="leading-relaxed text-neutral-500">Toko perlengkapan rumah, linen organik, dan penerangan fungsional dengan desain minimalis.</p>
            </div>
            <div>
                <div class="font-semibold text-neutral-900 uppercase tracking-wider text-[11px] mb-2">Tautan Cepat</div>
                <ul class="space-y-1.5 text-neutral-500">
                    <li><a href="{{ route('shop.index') }}" class="hover:text-neutral-900">Katalog Produk</a></li>
                    <li><a href="{{ route('order.index') }}" class="hover:text-neutral-900">Pesanan Saya</a></li>
                </ul>
            </div>
            <div>
                <div class="font-semibold text-neutral-900 uppercase tracking-wider text-[11px] mb-2">Layanan Pelanggan</div>
                <ul class="space-y-1.5 text-neutral-500">
                    <li>Bisa Bayar di Tempat (COD)</li>
                    <li>Gratis Ongkir &gt; Rp300.000</li>
                    <li>Garansi Pengembalian 100%</li>
                </ul>
            </div>
            <div>
                <div class="font-semibold text-neutral-900 uppercase tracking-wider text-[11px] mb-2">Metode Pembayaran</div>
                <p class="text-neutral-500 text-[11px] mb-2">Mendukung COD, QRIS, dan Transfer Bank.</p>
                <div class="flex gap-1.5 text-[10px] text-neutral-700 font-medium">
                    <span class="px-2 py-0.5 bg-neutral-100 rounded">COD</span>
                    <span class="px-2 py-0.5 bg-neutral-100 rounded">QRIS</span>
                    <span class="px-2 py-0.5 bg-neutral-100 rounded">BCA</span>
                    <span class="px-2 py-0.5 bg-neutral-100 rounded">Mandiri</span>
                </div>
            </div>
        </div>
        <div class="max-w-7xl mx-auto px-6 pt-6 border-t border-neutral-100 text-[11px] text-neutral-400 text-center">
            &copy; {{ date('Y') }} Atelier Goods. Dibuat dengan Framework Laravel 11 & Tailwind CSS.
        </div>
    </footer>

    <!-- Cart Drawer JS Client-Side -->
    @include('shop.partials.cart_drawer')

</body>
</html>
`,
  },
  {
    path: 'resources/views/shop/index.blade.php',
    name: 'index.blade.php',
    category: 'Blade View',
    content: `@extends('layouts.app')

@section('title', 'Katalog Toko')

@section('content')
<div class="space-y-16">

    <!-- 1. Hero Showcase Banner -->
    <section class="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
        <div class="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div class="lg:col-span-6 p-8 lg:p-14 flex flex-col justify-center space-y-6">
                <div class="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Koleksi Perlengkapan Rumah Minimalis
                </div>
                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
                    Kesederhanaan &amp; Kualitas untuk Setiap Ruang
                </h1>
                <p class="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl">
                    Koleksi terkurasi berupa keramik artisan buatan tangan, tekstil linen organik, dan pencahayaan modern dengan bahan alami ramah lingkungan.
                </p>
                <div class="flex flex-wrap items-center gap-3 pt-2">
                    <a href="#katalog" class="px-6 py-3 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs">
                        Lihat Koleksi Terbaru &rarr;
                    </a>
                    <span class="text-xs text-neutral-500">Tersedia Bayar di Tempat (COD)</span>
                </div>
            </div>
            <div class="lg:col-span-6 relative bg-neutral-100 min-h-[320px] lg:min-h-full">
                <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1000&auto=format&fit=crop&q=80" alt="Hero Minimalist E-Commerce" class="w-full h-full object-cover">
            </div>
        </div>
    </section>

    <!-- 2. Customer Trust Strip -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 border border-neutral-200 bg-white rounded-xl p-6 text-xs">
        <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center font-bold text-neutral-800">🚚</div>
            <div>
                <div class="font-semibold text-neutral-900 text-sm">Gratis Ongkir</div>
                <div class="text-neutral-500 text-xs">Otomatis untuk belanja di atas Rp 300.000</div>
            </div>
        </div>
        <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center font-bold text-neutral-800">🛡️</div>
            <div>
                <div class="font-semibold text-neutral-900 text-sm">100% Kualitas Asli</div>
                <div class="text-neutral-500 text-xs">Pengerjaan tangan dengan bahan premium</div>
            </div>
        </div>
        <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center font-bold text-neutral-800">💵</div>
            <div>
                <div class="font-semibold text-neutral-900 text-sm">Bisa Bayar di Tempat (COD)</div>
                <div class="text-neutral-500 text-xs">Pembayaran tunai aman saat paket tiba</div>
            </div>
        </div>
    </div>

    <!-- 3. Product Catalog Section -->
    <section id="katalog" class="space-y-6 pt-2">
        <!-- Search & Filter Bar -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
            <div>
                <h2 class="text-2xl font-bold tracking-tight text-neutral-900">Katalog Produk</h2>
                <p class="text-xs text-neutral-500 mt-0.5">Menampilkan {{ $products->count() }} pilihan barang siap kirim</p>
            </div>

            <!-- Search Form -->
            <form method="GET" action="{{ route('shop.index') }}" class="flex items-center gap-2">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari nama produk..." class="px-3 py-2 text-xs border border-neutral-300 rounded-lg w-52 sm:w-64 focus:outline-none focus:ring-2 focus:ring-neutral-900">
                <button type="submit" class="px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg">Cari</button>
            </form>
        </div>

        <!-- Category Filters -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2">
            @foreach($categories as $cat)
                <a href="{{ route('shop.index', ['category' => $cat]) }}" class="px-4 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap {{ (request('category', 'Semua Kategori') == $cat) ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900' }}">
                    {{ $cat }}
                </a>
            @endforeach
        </div>

        <!-- Product Cards Grid -->
        @if($products->count() > 0)
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                @foreach($products as $product)
                    <article class="group flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-neutral-300 transition-all shadow-xs">
                        <a href="{{ route('shop.show', $product->slug) }}" class="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden block">
                            <img src="{{ $product->image_url }}" alt="{{ $product->name }}" class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300">
                            @if($product->stock <= 5 && $product->stock > 0)
                                <div class="absolute top-3 left-3 bg-white/95 text-amber-800 text-[11px] font-medium px-2 py-0.5 rounded-md border border-amber-200 shadow-xs">
                                    Sisa {{ $product->stock }} unit
                                </div>
                            @elseif($product->stock == 0)
                                <div class="absolute top-3 left-3 bg-white/95 text-rose-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-rose-200 shadow-xs">
                                    Stok Habis
                                </div>
                            @endif
                        </a>

                        <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                                <div class="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                                    <span>{{ $product->category }}</span>
                                    <span class="text-amber-500 font-semibold">★ {{ $product->rating }} ({{ $product->review_count }})</span>
                                </div>
                                <a href="{{ route('shop.show', $product->slug) }}" class="font-semibold text-base text-neutral-900 hover:underline line-clamp-1 block">
                                    {{ $product->name }}
                                </a>
                                <p class="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                                    {{ $product->description }}
                                </p>
                            </div>

                            <div class="pt-3 border-t border-neutral-100 flex items-center justify-between">
                                <span class="font-bold text-base text-neutral-900 tabular-nums">
                                    {{ $product->formatted_price }}
                                </span>
                                <button onclick="addToCart({{ $product->id }}, '{{ addslashes($product->name) }}', {{ $product->price }}, '{{ $product->image_url }}', {{ $product->stock }})" {{ $product->stock == 0 ? 'disabled' : '' }} class="px-3.5 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-900 hover:text-white disabled:opacity-40 rounded-lg transition-colors">
                                    + Beli
                                </button>
                            </div>
                        </div>
                    </article>
                @endforeach
            </div>
        @else
            <div class="py-16 text-center bg-white border border-neutral-200 rounded-xl space-y-2">
                <p class="text-sm font-semibold text-neutral-800">Tidak ada produk yang cocok dengan pencarian.</p>
                <a href="{{ route('shop.index') }}" class="text-xs text-neutral-600 underline">Tampilkan Semua Produk</a>
            </div>
        @endif
    </section>

</div>
@endsection
`,
  },
  {
    path: 'resources/views/shop/partials/cart_drawer.blade.php',
    name: 'cart_drawer.blade.php',
    category: 'Blade View',
    content: `<!-- Slide-over Cart & Checkout Drawer -->
<div id="cart-drawer-backdrop" class="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs hidden justify-end">
    <div class="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
        <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 class="font-bold text-neutral-900 text-base">Keranjang Belanja</h3>
            <button onclick="toggleCartDrawer()" class="p-1.5 text-neutral-400 hover:text-neutral-700">&times;</button>
        </div>

        <!-- Form Pemesanan Laravel (POST /checkout) -->
        <form action="{{ route('order.store') }}" method="POST" id="checkout-form" class="flex-1 overflow-y-auto p-6 space-y-4">
            @csrf
            <div id="cart-items-container" class="space-y-3">
                <!-- Diisi otomatis oleh JavaScript -->
            </div>

            <div class="pt-4 border-t border-neutral-200 space-y-3">
                <div>
                    <label class="block text-xs font-semibold text-neutral-700 mb-1">Nama Lengkap Penerima *</label>
                    <input type="text" name="customer_name" required placeholder="Contoh: Budi Santoso" class="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-neutral-700 mb-1">No. WhatsApp / HP *</label>
                    <input type="tel" name="customer_phone" required placeholder="08xxxxxxxxxx" class="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-neutral-700 mb-1">Alamat Pengiriman Lengkap *</label>
                    <textarea name="shipping_address" required rows="2" placeholder="Jalan, No Rumah, Kota, Kode Pos" class="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"></textarea>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-neutral-700 mb-1">Metode Pembayaran</label>
                    <select name="payment_method" class="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white">
                        <option value="cod">COD (Bayar Tunai di Tempat)</option>
                        <option value="qris">QRIS (GoPay, OVO, ShopeePay, BCA)</option>
                        <option value="bank_transfer">Transfer Bank Virtual Account</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-neutral-700 mb-1">Kupon Diskon (Gunakan: DISKON10)</label>
                    <input type="text" name="coupon_code" placeholder="DISKON10" class="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-lg uppercase">
                </div>
            </div>
        </form>

        <div class="p-6 border-t border-neutral-200 bg-neutral-50/60 space-y-3">
            <div class="flex justify-between text-sm font-bold text-neutral-900">
                <span>Total Estimasi:</span>
                <span id="cart-total-text">Rp 0</span>
            </div>
            <button type="submit" form="checkout-form" class="w-full py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors">
                Konfirmasi Pesanan Sekarang
            </button>
        </div>
    </div>
</div>

<script>
let cart = JSON.parse(localStorage.getItem('atelier_laravel_cart') || '[]');

function updateBadge() {
    const totalCount = cart.reduce((acc, i) => acc + i.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) badge.innerText = totalCount;
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-text');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-xs text-neutral-400 text-center py-8">Keranjang belanja masih kosong.</p>';
        if (totalEl) totalEl.innerText = 'Rp 0';
        return;
    }

    let subtotal = 0;
    let html = '';

    cart.forEach((item, index) => {
        subtotal += item.price * item.quantity;
        html += \`
            <div class="flex items-center justify-between gap-3 text-xs border-b border-neutral-100 pb-2">
                <input type="hidden" name="items[\${index}][id]" value="\${item.id}">
                <input type="hidden" name="items[\${index}][quantity]" value="\${item.quantity}">
                <div class="flex-1">
                    <div class="font-semibold text-neutral-900">\${item.name}</div>
                    <div class="text-neutral-500">Rp \${Number(item.price).toLocaleString('id-ID')} &times; \${item.quantity}</div>
                </div>
                <button type="button" onclick="removeFromCart(\${item.id})" class="text-rose-500 hover:text-rose-700 text-xs">&times; Hapus</button>
            </div>
        \`;
    });

    container.innerHTML = html;
    if (totalEl) totalEl.innerText = 'Rp ' + Number(subtotal).toLocaleString('id-ID');
}

function addToCart(id, name, price, img, maxStock) {
    const existing = cart.find(i => i.id === id);
    if (existing) {
        if (existing.quantity < maxStock) {
            existing.quantity++;
        }
    } else {
        cart.push({ id, name, price, img, quantity: 1 });
    }
    localStorage.setItem('atelier_laravel_cart', JSON.stringify(cart));
    updateBadge();
    renderCart();
    toggleCartDrawer(true);
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem('atelier_laravel_cart', JSON.stringify(cart));
    updateBadge();
    renderCart();
}

function toggleCartDrawer(forceOpen = null) {
    const drawer = document.getElementById('cart-drawer-backdrop');
    if (!drawer) return;
    if (forceOpen === true) {
        drawer.classList.remove('hidden');
        drawer.classList.add('flex');
    } else if (forceOpen === false) {
        drawer.classList.add('hidden');
        drawer.classList.remove('flex');
    } else {
        drawer.classList.toggle('hidden');
        drawer.classList.toggle('flex');
    }
    renderCart();
}

document.addEventListener('DOMContentLoaded', () => {
    updateBadge();
    renderCart();
});
</script>
`,
  },
  {
    path: 'resources/views/shop/show.blade.php',
    name: 'show.blade.php',
    category: 'Blade View',
    content: `@extends('layouts.app')

@section('title', $product->name)

@section('content')
<div class="max-w-4xl mx-auto space-y-8">
    <a href="{{ route('shop.index') }}" class="text-xs text-neutral-500 hover:text-neutral-900 font-medium inline-block">
        &larr; Kembali ke Katalog
    </a>

    <div class="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-2">
        <div class="bg-neutral-100 aspect-4/3 md:aspect-auto">
            <img src="{{ $product->image_url }}" alt="{{ $product->name }}" class="w-full h-full object-cover">
        </div>

        <div class="p-8 flex flex-col justify-between space-y-6">
            <div class="space-y-4">
                <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">{{ $product->category }}</span>
                <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900">{{ $product->name }}</h1>
                <div class="text-2xl font-bold text-neutral-900 tabular-nums">{{ $product->formatted_price }}</div>
                <div class="text-xs text-neutral-500 flex items-center gap-2">
                    <span class="text-emerald-700 font-semibold">Tersedia {{ $product->stock }} unit</span>
                    <span>&middot;</span>
                    <span class="text-amber-500">★ {{ $product->rating }} ({{ $product->review_count }} ulasan)</span>
                </div>
                <div class="pt-3 border-t border-neutral-100">
                    <h4 class="text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">Deskripsi Produk</h4>
                    <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed">{{ $product->description }}</p>
                </div>
            </div>

            <div class="pt-6 border-t border-neutral-100">
                <button onclick="addToCart({{ $product->id }}, '{{ addslashes($product->name) }}', {{ $product->price }}, '{{ $product->image_url }}', {{ $product->stock }})" {{ $product->stock == 0 ? 'disabled' : '' }} class="w-full py-3 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 rounded-lg transition-colors">
                    + Tambah ke Keranjang Belanja
                </button>
            </div>
        </div>
    </div>
</div>
@endsection
`,
  },
  {
    path: 'resources/views/shop/orders.blade.php',
    name: 'orders.blade.php',
    category: 'Blade View',
    content: `@extends('layouts.app')

@section('title', 'Pesanan Saya')

@section('content')
<div class="max-w-3xl mx-auto space-y-6">
    <div class="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight text-neutral-900">Riwayat Pesanan Saya</h1>
            <p class="text-xs text-neutral-500 mt-0.5">Daftar transaksi dan pengiriman belanja Anda</p>
        </div>
        <a href="{{ route('shop.index') }}" class="text-xs text-neutral-600 hover:underline">&larr; Lanjut Belanja</a>
    </div>

    @if($orders->count() > 0)
        <div class="space-y-4">
            @foreach($orders as $order)
                <div class="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 shadow-xs">
                    <div class="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <div>
                            <span class="font-mono font-bold text-xs text-neutral-900">{{ $order->order_number }}</span>
                            <span class="text-[11px] text-neutral-400 block">{{ $order->created_at->format('d M Y, H:i') }} WIB</span>
                        </div>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {{ $order->status }}
                        </span>
                    </div>

                    <div class="space-y-1.5 text-xs text-neutral-700">
                        @foreach($order->items as $item)
                            <div class="flex justify-between">
                                <span>{{ $item->product_name }} &times; {{ $item->quantity }}</span>
                                <span class="font-semibold text-neutral-900">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</span>
                            </div>
                        @endforeach
                    </div>

                    <div class="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-900">
                        <span class="text-neutral-500 font-normal">Metode: {{ strtoupper($order->payment_method) }}</span>
                        <span class="text-sm">Total: {{ $order->formatted_total }}</span>
                    </div>
                </div>
            @endforeach
        </div>
    @else
        <div class="py-16 text-center bg-white border border-neutral-200 rounded-xl space-y-3">
            <p class="text-sm font-semibold text-neutral-800">Belum ada pesanan.</p>
            <a href="{{ route('shop.index') }}" class="inline-block px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800">
                Mulai Berbelanja Sekarang
            </a>
        </div>
    @endif
</div>
@endsection
`,
  },
  {
    path: '.env.example',
    name: '.env.example',
    category: 'Config',
    content: `APP_NAME="Atelier Goods"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=Asia/Jakarta
APP_URL=http://localhost:8000

LOG_CHANNEL=stack

# Database SQLite (Sangat ringan tanpa konfigurasi MySQL, langsung jalan)
DB_CONNECTION=sqlite

# Jika ingin MySQL, ganti menjadi:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=atelier_ecommerce
# DB_USERNAME=root
# DB_PASSWORD=
`,
  },
  {
    path: 'README.md',
    name: 'README.md',
    category: 'Config',
    content: `# Project Laravel E-Commerce Minimalis - Atelier Goods

Aplikasi toko daring e-commerce siap pakai menggunakan **Framework Laravel 11** dan **Tailwind CSS**.

---

## 🚀 Cara Menjalankan di Visual Studio Code (Local Komputer)

### 1. Buka Terminal di VS Code
Buka folder proyek ini di VS Code, lalu buka Terminal (\`Ctrl + \`\`\`).

### 2. Install Dependensi PHP
\`\`\`bash
composer install
\`\`\`

### 3. Buat File .env dan Kunci Aplikasi
\`\`\`bash
copy .env.example .env
php artisan key:generate
\`\`\`

### 4. Jalankan Migrasi & Database Seeder
\`\`\`bash
php artisan migrate --seed
\`\`\`

### 5. Jalankan Server Laravel
\`\`\`bash
php artisan serve
\`\`\`
Buka browser Anda di: **http://127.0.0.1:8000** 🎉
`,
  },
];
