import React, { useState } from 'react';
import { X, Trash2, ArrowRight, CheckCircle2, CreditCard, Banknote, QrCode } from 'lucide-react';
import { CartItem, Order } from '../types/product.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckoutSuccess: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutSuccess,
}) => {
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'qris' | 'bank_transfer'>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const shipping = subtotal > 300000 || subtotal === 0 ? 0 : 20000;
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'DISKON10') {
      setDiscountPercent(10);
      setCouponError('');
    } else if (couponCode.toUpperCase() === 'ATELIER20') {
      setDiscountPercent(20);
      setCouponError('');
    } else {
      setCouponError('Kode voucher tidak valid (coba: DISKON10)');
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) return;

    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      shippingAddress: address.trim(),
      paymentMethod,
      items: [...cartItems],
      totalAmount: total,
      status: paymentMethod === 'cod' ? 'Diproses' : 'Menunggu Pembayaran',
      createdAt: new Date().toISOString(),
    };

    onCheckoutSuccess(newOrder);
    setIsCheckoutStep(false);
    setName('');
    setPhone('');
    setAddress('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-neutral-900 text-base">
              {isCheckoutStep ? 'Checkout & Pembayaran' : 'Keranjang Belanja'}
            </h3>
            <span className="text-xs text-neutral-400">
              ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} barang)
            </span>
          </div>
          <button
            onClick={() => {
              setIsCheckoutStep(false);
              onClose();
            }}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
              <p className="text-sm font-semibold text-neutral-800">
                Keranjang belanja masih kosong
              </p>
              <p className="text-xs text-neutral-500 max-w-xs">
                Pilih produk yang Anda sukai dari katalog untuk mulai memesan.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Mulai Belanja
              </button>
            </div>
          ) : !isCheckoutStep ? (
            /* Itemized Cart List */
            <div className="space-y-4">
              <div className="space-y-4 divide-y divide-neutral-100">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="pt-4 first:pt-0 flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-neutral-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-neutral-400 hover:text-rose-600 transition-colors p-0.5"
                            title="Hapus barang"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          {item.product.category}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-bold text-neutral-900 tabular-nums">
                          {formatRupiah(item.product.price * item.quantity)}
                        </span>

                        <div className="flex items-center border border-neutral-200 rounded-md bg-white">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-l transition-colors"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-medium text-neutral-900 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 rounded-r transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo code voucher */}
              <div className="pt-4 border-t border-neutral-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Kode Voucher (DISKON10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-neutral-300 rounded-lg uppercase tracking-wider"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                  >
                    Pakai
                  </button>
                </div>
                {discountPercent > 0 && (
                  <p className="text-[11px] text-emerald-600 mt-1">
                    Voucher aktif: Hemat {discountPercent}%!
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-500 mt-1">{couponError}</p>
                )}
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Nama Penerima *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  No. Telepon / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08xxxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Alamat Lengkap Pengiriman *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Jalan, No Rumah, RT/RW, Kelurahan, Kota, Kode Pos"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Metode Pembayaran *
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === 'cod'
                        ? 'border-neutral-900 bg-neutral-50/80 ring-1 ring-neutral-900'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-neutral-900"
                    />
                    <Banknote className="w-4 h-4 text-neutral-700" />
                    <div className="text-xs">
                      <div className="font-semibold text-neutral-900">COD (Bayar di Tempat)</div>
                      <div className="text-[11px] text-neutral-500">Bayar tunai ke kurir saat barang sampai</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === 'qris'
                        ? 'border-neutral-900 bg-neutral-50/80 ring-1 ring-neutral-900'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'qris'}
                      onChange={() => setPaymentMethod('qris')}
                      className="text-neutral-900"
                    />
                    <QrCode className="w-4 h-4 text-neutral-700" />
                    <div className="text-xs">
                      <div className="font-semibold text-neutral-900">QRIS (BCA, GoPay, OVO, ShopeePay)</div>
                      <div className="text-[11px] text-neutral-500">Pindai kode QR instan</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-neutral-900 bg-neutral-50/80 ring-1 ring-neutral-900'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="text-neutral-900"
                    />
                    <CreditCard className="w-4 h-4 text-neutral-700" />
                    <div className="text-xs">
                      <div className="font-semibold text-neutral-900">Transfer Bank Otomatis</div>
                      <div className="text-[11px] text-neutral-500">BCA, Mandiri, BRI Virtual Account</div>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-neutral-200 bg-neutral-50/60 space-y-3">
            <div className="space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal Produk</span>
                <span className="tabular-nums font-medium text-neutral-900">
                  {formatRupiah(subtotal)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Diskon Voucher ({discountPercent}%)</span>
                  <span className="tabular-nums font-medium">
                    -{formatRupiah(discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Ongkos Kirim</span>
                <span className="tabular-nums font-medium text-neutral-900">
                  {shipping === 0 ? (
                    <span className="text-emerald-700">Gratis (di atas 300rb)</span>
                  ) : (
                    formatRupiah(shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-bold text-neutral-900">
                <span>Total Pembayaran</span>
                <span className="tabular-nums">{formatRupiah(total)}</span>
              </div>
            </div>

            {!isCheckoutStep ? (
              <button
                onClick={() => setIsCheckoutStep(true)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="submit"
                  form="checkout-form"
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Buat Pesanan Sekarang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCheckoutStep(false)}
                  className="w-full py-1 text-xs text-neutral-600 hover:text-neutral-900 text-center"
                >
                  &larr; Kembali ke Daftar Barang
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
