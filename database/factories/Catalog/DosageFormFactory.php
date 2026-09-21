<?php

namespace Database\Factories\Catalog;

use App\Models\Catalog\DosageForm;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DosageForm>
 */
class DosageFormFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        $dosageForms = [
            'tablet',
            'capsule',
            'syrup',
            'suspension',
            'injection',
            'ointment',
            'cream',
            'gel',
            'inhaler',
            'drops',
        ];

        return [
            'name' => fake()->unique()->randomElement($dosageForms),
        ];
    }
}
