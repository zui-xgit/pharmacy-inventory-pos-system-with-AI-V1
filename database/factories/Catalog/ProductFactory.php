<?php

namespace Database\Factories\Catalog;

use App\Models\Catalog\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
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
            
        return [
            'name' => fake()->unique()->randomElement($products),
        ];
    }
}
