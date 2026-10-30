<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Menampilkan katalog toko online dengan filter kategori & pencarian
     */
    public function index(Request $request)
    {
        $query = Product::where('is_active', true);

        // Filter berdasarkan kategori jika dipilih
        if ($request->filled('category') && $request->category !== 'Semua Kategori') {
            $query->where('category', $request->category);
        }

        // Pencarian berdasarkan nama produk atau deskripsi
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Pengurutan harga / terpopuler
        if ($request->sort === 'price-asc') {
            $query->orderBy('price', 'asc');
        } elseif ($request->sort === 'price-desc') {
            $query->orderBy('price', 'desc');
        } elseif ($request->sort === 'popular') {
            $query->orderBy('review_count', 'desc');
        } else {
            $query->latest();
        }

        $products = $query->get();

        $categories = [
            'Semua Kategori',
            'Perabotan & Dapur',
            'Fashion & Tekstil',
            'Penerangan',
            'Dekorasi & Lifestyle',
        ];

        return view('shop.index', compact('products', 'categories'));
    }

    /**
     * Menampilkan halaman detail spesifik untuk satu produk
     */
    public function show(string $slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();
        $relatedProducts = Product::where('category', $product->category)
            ->where('id', '!=', $product->id)
            ->take(3)
            ->get();

        return view('shop.show', compact('product', 'relatedProducts'));
    }
}
