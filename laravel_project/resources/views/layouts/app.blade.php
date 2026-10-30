<!DOCTYPE html>
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
