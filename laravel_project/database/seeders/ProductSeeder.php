<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name'         => 'Cangkir Keramik Artisan Glaze',
                'slug'         => 'cangkir-keramik-artisan-glaze',
                'category'     => 'Perabotan & Dapur',
                'price'        => 145000,
                'stock'        => 28,
                'rating'       => 4.9,
                'review_count' => 42,
                'description'  => 'Cangkir kopi buatan tangan berbahan keramik stoneware alami dengan tekstur sentuhan matte yang nyaman digenggam. Tahan microwave dan mesin pencuci piring.',
                'image_url'    => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
            ],
            [
                'name'         => 'Tas Jinjing Tote Linen Alami',
                'slug'         => 'tas-jinjing-tote-linen-alami',
                'category'     => 'Fashion & Tekstil',
                'price'        => 195000,
                'stock'        => 19,
                'rating'       => 4.8,
                'review_count' => 38,
                'description'  => 'Tote bag berkapasitas luas dari serat katun dan linen organik alami. Ringan, kokoh, dengan jahitan ganda untuk belanja harian, kuliah, atau santai.',
                'image_url'    => 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
            ],
            [
                'name'         => 'Lampu Meja Geometris Matte Black',
                'slug'         => 'lampu-meja-geometris-matte-black',
                'category'     => 'Penerangan',
                'price'        => 420000,
                'stock'        => 12,
                'rating'       => 5.0,
                'review_count' => 26,
                'description'  => 'Lampu meja arsitektural dengan material baja solid berlapis matte powder coating. Sudut pencahayaan hangat yang nyaman untuk membaca dan bekerja.',
                'image_url'    => 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
            ],
            [
                'name'         => 'Buku Jurnal Linen & Sabun Herbal',
                'slug'         => 'buku-jurnal-linen-sabun-herbal',
                'category'     => 'Dekorasi & Lifestyle',
                'price'        => 210000,
                'stock'        => 35,
                'rating'       => 4.7,
                'review_count' => 19,
                'description'  => 'Paket relaksasi harian berisi buku catatan bercover linen halus dengan kertas bebas asam 120gsm dan sabun batang herbal alami beraroma cedarwood.',
                'image_url'    => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
            ],
            [
                'name'         => 'Set Wadah Keramik Minimalis',
                'slug'         => 'set-wadah-keramik-minimalis',
                'category'     => 'Perabotan & Dapur',
                'price'        => 280000,
                'stock'        => 8,
                'rating'       => 4.9,
                'review_count' => 15,
                'description'  => 'Set mangkuk keramik earthy tones dengan tekstur matte halus. Sangat cocok untuk sajian sarapan sehat, salad buah, atau estetika meja makan.',
                'image_url'    => 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80',
            ],
        ];

        foreach ($products as $p) {
            Product::updateOrCreate(['slug' => $p['slug']], $p);
        }
    }
}
