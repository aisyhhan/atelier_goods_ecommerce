import { useState, useEffect } from 'react';
import { Product, CartItem, Order } from './types/product.ts';
import { INITIAL_PRODUCTS } from './data/initialProducts.ts';
import { Navbar } from './components/Navbar.tsx';
import { Storefront } from './components/Storefront.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { OrderHistoryModal } from './components/OrderHistoryModal.tsx';
import { WishlistModal } from './components/WishlistModal.tsx';
import { Toast } from './components/Toast.tsx';

const PRODUCTS_STORAGE_KEY = 'atelier_ecommerce_products_v3';
const CART_STORAGE_KEY = 'atelier_ecommerce_cart_v3';
const ORDERS_STORAGE_KEY = 'atelier_ecommerce_orders_v3';
const WISHLIST_STORAGE_KEY = 'atelier_ecommerce_wishlist_v3';

export default function App() {
  // 1. Persistent Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_PRODUCTS;
  });

  // 2. Persistent Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // 3. Persistent Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // 4. Persistent Wishlist (Array of product IDs)
  const [wishlistIds, setWishlistIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // 5. Modal States
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  // Wishlist toggle
  const handleToggleWishlist = (productId: number) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        setToastMessage('Produk dihapus dari daftar favorit.');
        return prev.filter((id) => id !== productId);
      } else {
        setToastMessage('Produk ditambahkan ke daftar favorit!');
        return [...prev, productId];
      }
    });
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > product.stock) {
          setToastMessage(`Jumlah melebihi stok yang ada (${product.stock} unit).`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: nextQty } : item
        );
      }
      return [...prev, { product, quantity }];
    });

    setToastMessage(`"${product.name}" (${quantity}x) ditambahkan ke keranjang!`);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((i): i is CartItem => i !== null)
    );
  };

  const handleRemoveCartItem = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCheckoutSuccess = (order: Order) => {
    // Deduct stock
    setProducts((prev) =>
      prev.map((prod) => {
        const itemInOrder = order.items.find((i) => i.product.id === prod.id);
        if (itemInOrder) {
          const newStock = Math.max(0, prod.stock - itemInOrder.quantity);
          return { ...prod, stock: newStock };
        }
        return prod;
      })
    );

    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setIsCartOpen(false);
    setToastMessage(`Pesanan ${order.orderNumber} berhasil dibuat! Segera kami proses.`);
  };

  const totalCartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const scrollToCatalog = () => {
    const el = document.getElementById('katalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToAbout = () => {
    const el = document.getElementById('unggulan');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-neutral-900 selection:text-white">
      
      {/* 1. Standard E-Commerce Top Bar */}
      <Navbar
        cartCount={totalCartCount}
        ordersCount={orders.length}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onScrollToCatalog={scrollToCatalog}
        onScrollToAbout={scrollToAbout}
      />

      {/* 2. Main E-Commerce Storefront */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <Storefront
          products={products}
          wishlistIds={wishlistIds}
          onSelectProduct={(p) => setDetailProduct(p)}
          onAddToCart={(p) => handleAddToCart(p, 1)}
          onToggleWishlist={handleToggleWishlist}
        />
      </main>

      {/* 3. Pure Retail Footer */}
      <footer className="border-t border-neutral-200 bg-white mt-auto py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-neutral-600 mb-8">
          
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="text-base font-bold text-neutral-900">Atelier Goods</div>
            <p className="leading-relaxed text-neutral-500">
              Toko perabotan rumah, linen organik, dan penerangan fungsional dengan desain minimalis terkurasi.
            </p>
            <div className="text-[11px] text-neutral-400">
              Pengiriman ke seluruh Nusantara &middot; Aman &amp; Bergaransi
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <div className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
              Tautan Toko
            </div>
            <ul className="space-y-1.5 text-neutral-500">
              <li><button onClick={scrollToCatalog} className="hover:text-neutral-900">Katalog Produk</button></li>
              <li><button onClick={() => setIsCartOpen(true)} className="hover:text-neutral-900">Keranjang Belanja</button></li>
              <li><button onClick={() => setIsOrdersOpen(true)} className="hover:text-neutral-900">Lacak Pesanan Saya</button></li>
              <li><button onClick={() => setIsWishlistOpen(true)} className="hover:text-neutral-900">Daftar Disukai</button></li>
            </ul>
          </div>

          {/* Customer service */}
          <div className="space-y-2">
            <div className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
              Layanan Pelanggan
            </div>
            <ul className="space-y-1.5 text-neutral-500">
              <li><a href="#faq" className="hover:text-neutral-900">Pertanyaan Umum (FAQ)</a></li>
              <li><span className="text-neutral-500">Kebijakan Garansi &amp; Retur</span></li>
              <li><span className="text-neutral-500">Bisa Bayar di Tempat (COD)</span></li>
              <li><span className="text-neutral-500">Jam Kerja: 08.00 - 20.00 WIB</span></li>
            </ul>
          </div>

          {/* Payment methods */}
          <div className="space-y-2">
            <div className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
              Metode Pembayaran
            </div>
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Mendukung transaksi aman melalui COD (Bayar di Tempat), QRIS (GoPay, OVO, ShopeePay), dan Transfer Bank.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-neutral-700 font-medium">
              <span className="px-2 py-0.5 bg-neutral-100 rounded">COD</span>
              <span className="px-2 py-0.5 bg-neutral-100 rounded">QRIS</span>
              <span className="px-2 py-0.5 bg-neutral-100 rounded">BCA</span>
              <span className="px-2 py-0.5 bg-neutral-100 rounded">Mandiri</span>
              <span className="px-2 py-0.5 bg-neutral-100 rounded">BRI</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
          <div>
            &copy; {new Date().getFullYear()} Atelier Goods. Hak Cipta Dilindungi.
          </div>
          <div>
            Kenyamanan &amp; Estetika untuk Ruang Anda
          </div>
        </div>
      </footer>

      {/* 4. Modals & Drawers */}
      <ProductDetailModal
        product={detailProduct}
        isWishlisted={detailProduct ? wishlistIds.includes(detailProduct.id) : false}
        onClose={() => setDetailProduct(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        onBuyNow={(p, qty) => handleBuyNow(p, qty)}
        onToggleWishlist={handleToggleWishlist}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveWishlist={handleToggleWishlist}
        onAddToCart={(p) => handleAddToCart(p, 1)}
      />

      {/* 5. Toast Feedback */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

    </div>
  );
}
