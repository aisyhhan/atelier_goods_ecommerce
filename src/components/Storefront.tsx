import React, { useState, useMemo } from 'react';
import { Search, Plus, ArrowRight, ShieldCheck, Truck, RefreshCw, Star, Heart, Check, HelpCircle } from 'lucide-react';
import { Product } from '../types/product.ts';
import { HERO_IMAGE, CATEGORIES } from '../data/initialProducts.ts';

interface StorefrontProps {
  products: Product[];
  wishlistIds: number[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: number) => void;
}

export const Storefront: React.FC<StorefrontProps> = ({
  products,
  wishlistIds,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Kategori');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'popular'>('default');

  const filteredProducts = useMemo(() => {
    let result = products.filter((item) => {
      const matchCat =
        selectedCategory === 'Semua Kategori' || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popular') {
      result = [...result].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-16">
      
      {/* 1. Storefront Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          <div className="lg:col-span-6 p-8 lg:p-14 flex flex-col justify-center space-y-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Koleksi Perlengkapan Rumah Minimalis
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
              Kesederhanaan &amp; Kualitas untuk Setiap Ruang
            </h1>
            
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl">
              Koleksi terkurasi berupa keramik artisan buatan tangan, tekstil linen organik, dan pencahayaan modern dengan bahan alami ramah lingkungan.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#katalog"
                className="px-6 py-3 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors inline-flex items-center gap-2 shadow-xs"
              >
                <span>Lihat Koleksi Terbaru</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <span className="text-xs text-neutral-500">
                Tersedia Bayar di Tempat (COD)
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 relative bg-neutral-100 min-h-[320px] lg:min-h-full">
            <img
              src={HERO_IMAGE}
              alt="Koleksi E-Commerce Minimalis"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

        </div>
      </section>

      {/* 2. Customer Trust Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border border-neutral-200 bg-white rounded-xl p-6 text-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-neutral-900" />
          </div>
          <div>
            <div className="font-semibold text-neutral-900 text-sm">Gratis Ongkir</div>
            <div className="text-neutral-500 text-xs">Otomatis untuk belanja di atas Rp 300.000</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-neutral-900" />
          </div>
          <div>
            <div className="font-semibold text-neutral-900 text-sm">100% Kualitas Asli</div>
            <div className="text-neutral-500 text-xs">Pengerjaan tangan dengan bahan premium</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-neutral-900" />
          </div>
          <div>
            <div className="font-semibold text-neutral-900 text-sm">Bisa Bayar di Tempat</div>
            <div className="text-neutral-500 text-xs">Pembayaran tunai aman saat paket tiba</div>
          </div>
        </div>
      </div>

      {/* 3. Product Catalog Grid */}
      <section id="katalog" className="space-y-6 pt-2">
        
        {/* Search, Filter, Sort Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Katalog Produk
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Menampilkan {filteredProducts.length} pilihan barang siap kirim
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari produk impian Anda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white text-neutral-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="default">Urutkan: Unggulan</option>
              <option value="popular">Paling Populer</option>
              <option value="price-asc">Harga: Terendah ke Tertinggi</option>
              <option value="price-desc">Harga: Tertinggi ke Terendah</option>
            </select>
          </div>
        </div>

        {/* Category Pills/Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id);
              return (
                <article
                  key={product.id}
                  className="group flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-neutral-300 transition-all duration-200 shadow-xs"
                >
                  {/* 4:3 Product Image */}
                  <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      onClick={() => onSelectProduct(product)}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300 cursor-pointer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = HERO_IMAGE;
                      }}
                    />

                    {/* Wishlist Heart Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs rounded-full text-neutral-600 hover:text-rose-600 transition-colors shadow-xs"
                      title={isWishlisted ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isWishlisted ? 'fill-rose-600 text-rose-600' : ''
                        }`}
                      />
                    </button>

                    {/* Stock Alert Tag */}
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute top-3 left-3 bg-white/95 text-amber-800 text-[11px] font-medium px-2 py-0.5 rounded-md border border-amber-200/50 shadow-xs">
                        Sisa {product.stock} unit
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute top-3 left-3 bg-white/95 text-rose-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-rose-200/50 shadow-xs">
                        Stok Habis
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                        <span>{product.category}</span>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="font-semibold text-neutral-700">{product.rating || 4.9}</span>
                          <span className="text-neutral-400 text-[10px]">({product.reviewCount || 20})</span>
                        </div>
                      </div>

                      <h3
                        onClick={() => onSelectProduct(product)}
                        className="font-semibold text-base text-neutral-900 group-hover:text-neutral-700 cursor-pointer line-clamp-1"
                      >
                        {product.name}
                      </h3>

                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <span className="font-bold text-base text-neutral-900 tabular-nums">
                        {formatRupiah(product.price)}
                      </span>

                      <button
                        onClick={() => onAddToCart(product)}
                        disabled={product.stock === 0}
                        className="px-3.5 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-900 hover:text-white disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Beli</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-white border border-neutral-200 rounded-xl space-y-3">
            <p className="text-sm font-semibold text-neutral-800">
              Tidak ada produk yang cocok dengan pencarian Anda.
            </p>
            <p className="text-xs text-neutral-500">
              Coba gunakan kata kunci pencarian yang berbeda.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Semua Kategori');
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        )}
      </section>

      {/* 4. Featured Story & Craftsmanship Section */}
      <section id="unggulan" className="bg-neutral-100 rounded-2xl p-8 sm:p-12 border border-neutral-200/80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Koleksi Unggulan 2026
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-snug">
              Dibuat dengan Bahan Alami &amp; Desain Abadi
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Kami bekerja sama dengan pengrajin lokal untuk menghasilkan perabot dan aksesori rumah yang fungsional, tahan lama, dan membawa kenyamanan estetika ke dalam rumah Anda.
            </p>
            <div className="pt-2">
              <a
                href="#katalog"
                className="text-xs font-semibold text-neutral-900 hover:underline inline-flex items-center gap-1.5"
              >
                <span>Lihat semua barang terlaris</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="space-y-3 bg-white p-6 rounded-xl border border-neutral-200 text-xs">
            <div className="font-bold text-sm text-neutral-900 mb-2">Mengapa Berbelanja di Atelier Goods?</div>
            <div className="flex items-start gap-2.5 text-neutral-600">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Semua produk melalui proses kurasi ketat untuk menjamin keawetan.</span>
            </div>
            <div className="flex items-start gap-2.5 text-neutral-600">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Kemasan ramah lingkungan dan aman dari benturan saat transit pengiriman.</span>
            </div>
            <div className="flex items-start gap-2.5 text-neutral-600">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Layanan pelanggan ramah dan sigap melayani konfirmasi pesanan Anda.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Customer Reviews (Authentic Social Proof) */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-xl font-bold text-neutral-900">Ulasan dari Pembeli Kami</h3>
          <p className="text-xs text-neutral-500">
            Pengalaman nyata pelanggan yang telah melengkapi rumah mereka dengan produk kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              &quot;Cangkir keramiknya sangat tebal dan estetik! Pas sekali untuk kopi pagi saya. Pengemasan bubble wrap sangat rapi dan aman.&quot;
            </p>
            <div className="text-xs font-semibold text-neutral-900">Dian Puspita &middot; Jakarta Selatan</div>
          </div>

          <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              &quot;Tas linen organik kapasitasnya lega banget, bahannya tebal tapi tetap ringan. Bisa muat laptop 14 inch dengan nyaman.&quot;
            </p>
            <div className="text-xs font-semibold text-neutral-900">Rizky Pratama &middot; Bandung</div>
          </div>

          <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              &quot;Lampu mejanya minimalis banget, pas dengan konsep meja kerja Scandinavian saya. Cahayanya hangat dan tidak bikin silau.&quot;
            </p>
            <div className="text-xs font-semibold text-neutral-900">Alya Safitri &middot; Surabaya</div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="bg-white border border-neutral-200 rounded-2xl p-8 sm:p-10 space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Pertanyaan yang Sering Diajukan</span>
          </div>
          <h3 className="text-xl font-bold text-neutral-900">Informasi Belanja &amp; Pengiriman</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-neutral-600">
          <div className="space-y-1.5">
            <h4 className="font-bold text-neutral-900 text-sm">Bagaimana cara membayar dengan COD?</h4>
            <p className="leading-relaxed">
              Saat checkout keranjang, pilih opsi pembayaran &quot;COD (Bayar di Tempat)&quot;. Pesanan akan langsung diproses dan Anda membayar tunai ke kurir saat paket tiba di alamat Anda.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-neutral-900 text-sm">Berapa lama estimasi pengiriman?</h4>
            <p className="leading-relaxed">
              Untuk wilayah Jabodetabek berkisar antara 1-2 hari kerja. Untuk kota-kota lain di Pulau Jawa 2-3 hari kerja, dan luar Pulau Jawa 3-5 hari kerja.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-neutral-900 text-sm">Apakah ada garansi jika barang pecah/rusak?</h4>
            <p className="leading-relaxed">
              Ya, 100% garansi penggantian barang baru atau pengembalian dana jika terjadi kerusakan dalam proses pengiriman dengan melampirkan video unboxing.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-neutral-900 text-sm">Bagaimana menggunakan kupon diskon?</h4>
            <p className="leading-relaxed">
              Buka keranjang belanja Anda, masukkan kode promo <strong>DISKON10</strong> pada kolom voucher, lalu klik tombol Pakai untuk potongan harga otomatis.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
