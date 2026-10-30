import React from 'react';
import { ShoppingBag, PackageCheck, Heart, Sparkles } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  ordersCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  onOpenWishlist: () => void;
  onScrollToCatalog: () => void;
  onScrollToAbout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  ordersCount,
  wishlistCount,
  onOpenCart,
  onOpenOrders,
  onOpenWishlist,
  onScrollToCatalog,
  onScrollToAbout,
}) => {
  return (
    <div className="sticky top-0 z-40 bg-white">
      {/* 1. Top Minimal Promo Bar */}
      <div className="bg-neutral-900 text-neutral-200 text-[11px] py-1.5 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 text-amber-300" />
        <span>Gunakan kode <strong>DISKON10</strong> untuk potongan 10% &middot; Gratis Ongkir &gt; Rp300.000</span>
      </div>

      {/* 2. Main Navigation Header */}
      <header className="border-b border-neutral-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={onScrollToCatalog}
            className="text-xl font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity text-left"
          >
            Atelier Goods
          </button>

          {/* Zone 2: 4 Clean E-Commerce Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
            <button
              onClick={onScrollToCatalog}
              className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0"
            >
              Katalog Produk
            </button>

            <a
              href="#unggulan"
              className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0"
            >
              Koleksi Unggulan
            </a>

            <button
              onClick={onScrollToAbout}
              className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0"
            >
              Tentang Toko
            </button>

            <button
              onClick={onOpenOrders}
              className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4 text-neutral-500" />
              <span>Pesanan Saya</span>
              {ordersCount > 0 && (
                <span className="text-[10px] bg-neutral-100 text-neutral-800 px-1.5 py-0.2 rounded-full font-bold">
                  {ordersCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Actions (Wishlist + Shopping Bag) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="p-2 text-neutral-600 hover:text-rose-600 hover:bg-neutral-100 rounded-lg transition-colors relative"
              title="Daftar Disukai"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Keranjang Belanja"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Keranjang</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[11px] font-bold flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

          </div>

        </div>

        {/* Mobile quick navigation */}
        <div className="md:hidden flex items-center justify-around border-t border-neutral-100 bg-white px-2 py-2 text-xs font-medium text-neutral-600">
          <button onClick={onScrollToCatalog} className="px-2 py-1 hover:text-neutral-900">
            Katalog
          </button>
          <a href="#unggulan" className="px-2 py-1 hover:text-neutral-900">
            Unggulan
          </a>
          <button onClick={onOpenOrders} className="px-2 py-1 hover:text-neutral-900 flex items-center gap-1">
            <span>Pesanan</span>
            {ordersCount > 0 && <span>({ordersCount})</span>}
          </button>
          <button onClick={onOpenWishlist} className="px-2 py-1 hover:text-neutral-900 flex items-center gap-1">
            <span>Favorit</span>
            {wishlistCount > 0 && <span>({wishlistCount})</span>}
          </button>
        </div>
      </header>
    </div>
  );
};
