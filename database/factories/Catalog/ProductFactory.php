<?php

namespace Database\Factories\Catalog;

use App\Models\Catalog\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected static ?array $shuffledProducts = null;

    protected static int $index = 0;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $products = [
            'Paracetamol 500mg',
            'Amoxicillin 250mg',
            'Ibuprofen 400mg',
            'Cetirizine 10mg',
            'Omeprazole 20mg',
            'Metformin 500mg',
            'Azithromycin 500mg',
            'Ciprofloxacin 500mg',
            'Salbutamol 100mcg',
            'Loperamide 2mg',
        ];

        // Shuffle once when a new batch starts or resets
        if (self::$shuffledProducts === null || self::$index >= count(self::$shuffledProducts)) {
            self::$shuffledProducts = collect($products)->shuffle()->values()->all();
            self::$index = 0;
        }

        $name = self::$shuffledProducts[self::$index];
        self::$index++;

        return [
            'name' => $name,
        ];
    }
}
