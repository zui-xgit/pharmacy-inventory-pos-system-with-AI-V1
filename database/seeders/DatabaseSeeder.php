<?php

namespace Database\Seeders;

use App\Models\Catalog\DosageForm;
use App\Models\Catalog\Product;
use App\Models\Core\Shop;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $admin_role = Role::create(['name' => 'admin']);
        $manager_role = Role::create(['name' => 'manager']);
        $cashier_role = Role::create(['name' => 'cashier']);

        // permissions 
        $permissions = [
            'shop inventory and stock management',
            'shop reports and insights management',
            'shop staff management',
            'shop profile management',
            'shop security management',
        ];

        foreach ($permissions as $name) {   
            Permission::findOrCreate($name);
        } 
        

        // User A (admin)
        $admin_user = User::factory()->create([
            'username' => 'admin.admin',
            'firstname' => 'jacob',
            'lastname' => 'athuman',
            'email' => 'benardbenny90@gmail.com',
            'status' => 'active'
        ]);
        $admin_user->assignRole($admin_role);

        // USER B (MANAGER)
         $manager_user_1 = User::factory()->create([
            'username' => 'manager.1',
            'firstname' => 'manager_1',
            'lastname' => 'juma',
            'email' => 'benardbenny10@gmail.com', 

        ]);
        $manager_user_1->assignRole($manager_role);


        // USER C (manager)
         $manager_user_2 = User::factory()->create([
            'username' => 'manager.2',
            'firstname' => 'manager_2',
            'lastname' => 'juma',
            'email' => 'benardbenny20@gmail.com', 

        ]);
        $manager_user_2->assignRole($manager_role);

         // USER 4 (cashier)
         $cashier_user_1 = User::factory()->create([
            'username' => 'cashier.1',  
            'firstname' => 'cashier',
            'lastname' => 'juma',
            'email' => 'benardbenny30@gmail.com', 
            'status' => 'inactive'

        ]);
        $cashier_user_1->assignRole($cashier_role);

        // SHOP 1
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
