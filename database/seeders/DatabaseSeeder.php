<?php

namespace Database\Seeders;

use App\Models\Catalog\DosageForm;
use App\Models\Core\Shop;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $owner_role = Role::create(['name' => 'owner']);
        $manager_role = Role::create(['name' => 'manager']);
        $cashier_role = Role::create(['name' => 'cashier']);

        // User A (owner)
        $userA = User::factory()->create([
            'username' => 'owner.owner',
            'firstname' => 'jacob',
            'lastname' => 'athuman',
        ]);
        $userA->assignRole($owner_role);

        $userB = User::factory()->create([
            'username' => 'manager.manager',
            'firstname' => 'manager',
            'lastname' => 'juma',
        ]);
        $userB->assignRole($manager_role);

        $shop = Shop::factory()->create();
        $userB->shops()->attach($shop->id);

        DosageForm::factory(10)->create([
            'shop_id' => $shop->id,
        ]);

    }
}
