<?php

namespace Database\Seeders;

use App\Models\Catalog\DosageForm;
use App\Models\Catalog\Product;
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
        $casher_role = Role::create(['name' => 'cashier']);

        // User A (owner)
        $owner_user = User::factory()->create([
            'username' => 'owner.owner',
            'firstname' => 'jacob',
            'lastname' => 'athuman',
        ]);
        $owner_user->assignRole($owner_role);


        // SHOP 1
        $manager_user_1 = User::factory()->create([
            'username' => 'manager.1',
            'firstname' => 'manager_1',
            'lastname' => 'juma',
        ]);
        $manager_user_1->assignRole($manager_role);

       

        $shop_1 = Shop::factory()->create();
        $manager_user_1->shops()->attach($shop_1->id);

        $dosageForm_shop_1 = DosageForm::factory(10)->create([
            'shop_id' => $shop_1->id,
        ]);


        Product::factory(10)->create([
            'shop_id' => $shop_1->id, 
            'dosage_form_id' => fn () => $dosageForm_shop_1->random()->id,
        ]);
        

        // SHOP 2
         $manager_user_2 = User::factory()->create([
            'username' => 'manager.2',
            'firstname' => 'manager_2',
            'lastname' => 'juma',
        ]);
        $manager_user_2->assignRole($manager_role);

        $shop_2 = Shop::factory()->create();
        $manager_user_2->shops()->attach($shop_2->id);

        $dosageForm_shop_2 = DosageForm::factory(10)->create([
            'shop_id' => $shop_2->id,
        ]);


        Product::factory(10)->create([
            'shop_id' => $shop_2->id, 
            'dosage_form_id' => fn () => $dosageForm_shop_2->random()->id,
        ]);
        

    }
}
