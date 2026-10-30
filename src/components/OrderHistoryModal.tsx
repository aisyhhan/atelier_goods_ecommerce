import React from 'react';
import { X, PackageCheck, Clock, MapPin, Phone } from 'lucide-react';
import { Order } from '../types/product.ts';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
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
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-neutral-800" />
            <h2 className="text-base font-bold text-neutral-900">
              Riwayat Pesanan Anda
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders list */}
        <div className="p-6 max-h-[500px] overflow-y-auto space-y-4">
          {orders.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Clock className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-semibold text-neutral-700">
                Belum ada pesanan aktif
              </p>
              <p className="text-xs text-neutral-400">
                Barang yang Anda pesan melalui checkout akan tersimpan di sini.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-4 border border-neutral-200 rounded-xl space-y-3 bg-neutral-50/50"
              >
                <div className="flex items-center justify-between border-b border-neutral-200/70 pb-2">
                  <div>
                    <span className="font-mono font-bold text-xs text-neutral-900">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-neutral-400 block">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1.5 text-xs text-neutral-700">
                  {order.items.map((it) => (
                    <div key={it.product.id} className="flex justify-between items-center">
                      <span className="line-clamp-1 max-w-[240px]">
                        {it.product.name} &times; {it.quantity}
                      </span>
                      <span className="tabular-nums font-medium text-neutral-900">
                        {formatRupiah(it.product.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div className="pt-2 border-t border-neutral-200/70 text-[11px] text-neutral-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{order.shippingAddress}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{order.customerPhone} ({order.customerName})</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-2 border-t border-neutral-200/70 flex justify-between items-center text-xs font-bold text-neutral-900">
                  <span>Metode: {order.paymentMethod.toUpperCase()}</span>
                  <span className="text-sm tabular-nums">
                    Total: {formatRupiah(order.totalAmount)}
                  </span>
                </div>
              </div>
            ))
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
