<?php

namespace Database\Factories\Catalog;

use App\Models\Catalog\DosageForm;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DosageForm>
 */
class DosageFormFactory extends Factory
{


    protected static ?array $shuffledForms = null;
    protected static int $index = 0;
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

        // Shuffle the array once when a new batch starts or resets
        if (self::$shuffledForms === null || self::$index >= count(self::$shuffledForms)) {
            self::$shuffledForms = collect($dosageForms)->shuffle()->values()->all();
            self::$index = 0;
        }

        $name = self::$shuffledForms[self::$index];
        self::$index++;

        return [
            'name' => $name,
        ];
    }
}
