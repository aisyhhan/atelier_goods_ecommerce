import React from 'react';
import { X, Heart, Plus, Trash2 } from 'lucide-react';
import { Product } from '../types/product.ts';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveWishlist: (productId: number) => void;
  onAddToCart: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveWishlist,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-lg w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
            <h2 className="text-base font-bold text-neutral-900">
              Produk Favorit Disukai ({wishlistProducts.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items */}
        <div className="p-6 max-h-[460px] overflow-y-auto space-y-4">
          {wishlistProducts.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Heart className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-semibold text-neutral-800">
                Belum ada produk favorit
              </p>
              <p className="text-xs text-neutral-400">
                Klik ikon hati pada produk untuk menyimpannya ke daftar ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3 divide-y divide-neutral-100">
              {wishlistProducts.map((product) => (
                <div key={product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-neutral-900 line-clamp-1">
                        {product.name}
                      </h4>
                      <div className="text-[11px] text-neutral-400">{product.category}</div>
                      <div className="text-xs font-bold text-neutral-900 tabular-nums mt-0.5">
                        {formatRupiah(product.price)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={product.stock === 0}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Beli</span>
                    </button>
                    <button
                      onClick={() => onRemoveWishlist(product.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors"
                      title="Hapus dari favorit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
