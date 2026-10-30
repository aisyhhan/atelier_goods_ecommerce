<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'category',
        'price',
        'stock',
        'description',
        'image_url',
        'rating',
        'review_count',
        'is_active',
    ];

    protected $casts = [
        'price'        => 'integer',
        'stock'        => 'integer',
        'rating'       => 'float',
        'review_count' => 'integer',
        'is_active'    => 'boolean',
    ];

    /**
     * Accessor format Rupiah: {{ $product->formatted_price }}
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }
}
