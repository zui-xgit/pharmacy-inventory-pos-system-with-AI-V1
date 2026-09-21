<?php

namespace Database\Factories\Catalog;

use App\Models\Catalog\PackageUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PackageUnit>
 */
class PackageUnitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $packageUnits = [
            'box',
            'bottle',
            'tin',
            'strip',
            'carton',
            'sachet',
            'tube',
            'pack',
        ];

        return [
            'name' => fake()->unique()->randomElement($packageUnits),
        ];
    }
}
