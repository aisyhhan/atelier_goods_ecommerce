@extends('layouts.app')

@section('title', 'Pesanan Saya')

@section('content')
<div class="max-w-3xl mx-auto space-y-6">
    <div class="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight text-neutral-900">Riwayat Pesanan Saya</h1>
            <p class="text-xs text-neutral-500 mt-0.5">Daftar transaksi dan pengiriman belanja Anda</p>
        </div>
        <a href="{{ route('shop.index') }}" class="text-xs text-neutral-600 hover:underline">&larr; Lanjut Belanja</a>
    </div>

    @if($orders->count() > 0)
        <div class="space-y-4">
            @foreach($orders as $order)
                <div class="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 shadow-xs">
                    <div class="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <div>
                            <span class="font-mono font-bold text-xs text-neutral-900">{{ $order->order_number }}</span>
                            <span class="text-[11px] text-neutral-400 block">{{ $order->created_at->format('d M Y, H:i') }} WIB</span>
                        </div>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {{ $order->status }}
                        </span>
                    </div>

                    <div class="space-y-1.5 text-xs text-neutral-700">
                        @foreach($order->items as $item)
                            <div class="flex justify-between">
                                <span>{{ $item->product_name }} &times; {{ $item->quantity }}</span>
                                <span class="font-semibold text-neutral-900">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</span>
                            </div>
                        @endforeach
                    </div>

                    <div class="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-900">
                        <span class="text-neutral-500 font-normal">Metode: {{ strtoupper($order->payment_method) }}</span>
                        <span class="text-sm">Total: {{ $order->formatted_total }}</span>
                    </div>
                </div>
            @endforeach
        </div>
    @else
        <div class="py-16 text-center bg-white border border-neutral-200 rounded-xl space-y-3">
            <p class="text-sm font-semibold text-neutral-800">Belum ada pesanan.</p>
            <a href="{{ route('shop.index') }}" class="inline-block px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800">
                Mulai Berbelanja Sekarang
            </a>
        </div>
    @endif
</div>
@endsection
