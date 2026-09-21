<?php

namespace Database\Factories\Core;

use App\Models\Core\Shop;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Shop>
 */
class ShopFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company().' Pharmacy',
            'location' => fake()->city(),
            'address' => fake()->address(),
            'phone' => fake()->phoneNumber(),
        ];
    }
}
