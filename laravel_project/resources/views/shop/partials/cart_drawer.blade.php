<!-- Slide-over Cart & Checkout Drawer -->
<div id="cart-drawer-backdrop" class="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs hidden justify-end">
    <div class="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
        <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 class="font-bold text-neutral-900 text-base">Keranjang Belanja</h3>
            <button onclick="toggleCartDrawer()" class="p-1.5 text-neutral-400 hover:text-neutral-700 text-lg">&times;</button>
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
        html += `
            <div class="flex items-center justify-between gap-3 text-xs border-b border-neutral-100 pb-2">
                <input type="hidden" name="items[${index}][id]" value="${item.id}">
                <input type="hidden" name="items[${index}][quantity]" value="${item.quantity}">
                <div class="flex-1">
                    <div class="font-semibold text-neutral-900">${item.name}</div>
                    <div class="text-neutral-500">Rp ${Number(item.price).toLocaleString('id-ID')} &times; ${item.quantity}</div>
                </div>
                <button type="button" onclick="removeFromCart(${item.id})" class="text-rose-500 hover:text-rose-700 text-xs">&times; Hapus</button>
            </div>
        `;
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
