<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Menampilkan daftar riwayat pesanan (Pesanan Saya)
     */
    public function index()
    {
        $orders = Order::with('items')->latest()->take(10)->get();
        return view('shop.orders', compact('orders'));
    }

    /**
     * Memproses pesanan dari formulir checkout
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name'    => 'required|string|max:150',
            'customer_phone'   => 'required|string|max:30',
            'shipping_address' => 'required|string',
            'payment_method'   => 'required|in:cod,qris,bank_transfer',
            'items'            => 'required|array|min:1',
            'items.*.id'       => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'coupon_code'      => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $subtotal = 0;
            $itemsToCreate = [];

            // Hitung subtotal & kurangi stok produk
            foreach ($validated['items'] as $itemData) {
                $product = Product::lockForUpdate()->findOrFail($itemData['id']);

                if ($product->stock < $itemData['quantity']) {
                    return back()->withErrors(['stock' => "Stok produk {$product->name} tidak mencukupi."]);
                }

                $itemSubtotal = $product->price * $itemData['quantity'];
                $subtotal += $itemSubtotal;

                // Kurangi stok barang di database
                $product->decrement('stock', $itemData['quantity']);

                $itemsToCreate[] = [
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'price'        => $product->price,
                    'quantity'     => $itemData['quantity'],
                    'subtotal'     => $itemSubtotal,
                ];
            }

            // Hitung diskon voucher jika ada
            $discount = 0;
            if (strtoupper($request->coupon_code) === 'DISKON10') {
                $discount = (int) round($subtotal * 0.10);
            }

            // Ongkir gratis di atas Rp 300.000
            $shipping = ($subtotal >= 300000) ? 0 : 20000;
            $totalAmount = max(0, $subtotal - $discount + $shipping);

            // Buat Invoice Nomor Unik
            $orderNumber = 'INV-' . date('Ym') . '-' . rand(1000, 9999);

            $order = Order::create([
                'order_number'     => $orderNumber,
                'customer_name'    => $validated['customer_name'],
                'customer_phone'   => $validated['customer_phone'],
                'shipping_address' => $validated['shipping_address'],
                'payment_method'   => $validated['payment_method'],
                'subtotal'         => $subtotal,
                'discount'         => $discount,
                'shipping_fee'     => $shipping,
                'total_amount'     => $totalAmount,
                'status'           => $validated['payment_method'] === 'cod' ? 'Diproses' : 'Menunggu Pembayaran',
            ]);

            foreach ($itemsToCreate as $item) {
                $order->items()->create($item);
            }

            return redirect()->route('order.index')
                ->with('success', "Pesanan {$orderNumber} berhasil dibuat! Segera kami proses.");
        });
    }
}
