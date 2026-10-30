@extends('layouts.app')

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
