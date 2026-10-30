@extends('layouts.app')

@section('title', $product->name)

@section('content')
<div class="max-w-4xl mx-auto space-y-8">
    <a href="{{ route('shop.index') }}" class="text-xs text-neutral-500 hover:text-neutral-900 font-medium inline-block">
        &larr; Kembali ke Katalog
    </a>

    <div class="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-2">
        <div class="bg-neutral-100 aspect-4/3 md:aspect-auto">
            <img src="{{ $product->image_url }}" alt="{{ $product->name }}" class="w-full h-full object-cover">
        </div>

        <div class="p-8 flex flex-col justify-between space-y-6">
            <div class="space-y-4">
                <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">{{ $product->category }}</span>
                <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900">{{ $product->name }}</h1>
                <div class="text-2xl font-bold text-neutral-900 tabular-nums">{{ $product->formatted_price }}</div>
                <div class="text-xs text-neutral-500 flex items-center gap-2">
                    <span class="text-emerald-700 font-semibold">Tersedia {{ $product->stock }} unit</span>
                    <span>&middot;</span>
                    <span class="text-amber-500">★ {{ $product->rating }} ({{ $product->review_count }} ulasan)</span>
                </div>
                <div class="pt-3 border-t border-neutral-100">
                    <h4 class="text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">Deskripsi Produk</h4>
                    <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed">{{ $product->description }}</p>
                </div>
            </div>

            <div class="pt-6 border-t border-neutral-100">
                <button onclick="addToCart({{ $product->id }}, '{{ addslashes($product->name) }}', {{ $product->price }}, '{{ $product->image_url }}', {{ $product->stock }})" {{ $product->stock == 0 ? 'disabled' : '' }} class="w-full py-3 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 rounded-lg transition-colors">
                    + Tambah ke Keranjang Belanja
                </button>
            </div>
        </div>
    </div>
</div>
@endsection
