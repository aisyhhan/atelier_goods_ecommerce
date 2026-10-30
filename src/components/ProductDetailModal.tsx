import React, { useState } from 'react';
import { X, Plus, Star, Heart, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Product } from '../types/product.ts';

interface ProductDetailModalProps {
  product: Product | null;
  isWishlisted: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  onToggleWishlist: (productId: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isWishlisted,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-2xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="text-xs text-neutral-400">
            {product.category}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`p-2 rounded-lg transition-colors ${
                isWishlisted
                  ? 'text-rose-600 bg-rose-50'
                  : 'text-neutral-400 hover:text-rose-600 hover:bg-neutral-100'
              }`}
              title="Tambah ke Favorit"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Image */}
          <div className="relative aspect-4/3 md:aspect-auto bg-neutral-100 overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                  {product.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-snug">
                  {product.name}
                </h2>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="ml-1 font-bold text-neutral-800">{product.rating || 4.9}</span>
                </div>
                <span className="text-neutral-300">&middot;</span>
                <span className="text-neutral-500 underline">{product.reviewCount || 24} ulasan pembeli</span>
              </div>

              {/* Price */}
              <div className="text-2xl font-bold text-neutral-900 tabular-nums">
                {formatRupiah(product.price)}
              </div>

              {/* Stock and Availability */}
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Stok Siap Kirim
                </span>
                <span>&middot;</span>
                <span className="tabular-nums">{product.stock} unit tersedia</span>
              </div>

              {/* Description */}
              <div className="pt-3 border-t border-neutral-100">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Deskripsi Produk
                </h4>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Perks */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Garansi Pengiriman</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Bisa COD</span>
                </div>
              </div>
            </div>

            {/* Purchase Controls */}
            <div className="pt-4 border-t border-neutral-100 space-y-3">
              
              {/* Quantity Counter */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-700">Jumlah:</span>
                <div className="flex items-center border border-neutral-300 rounded-lg bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-100 rounded-l"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-neutral-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 rounded-r"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  disabled={product.stock === 0}
                  className="py-2.5 px-4 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Keranjang</span>
                </button>

                <button
                  onClick={() => {
                    onBuyNow(product, quantity);
                    onClose();
                  }}
                  disabled={product.stock === 0}
                  className="py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Beli Sekarang</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
