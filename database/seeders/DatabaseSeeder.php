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

       
        // SHOP 1
        $shop_1 = Shop::factory()->create();
        $dosageForm_shop_1 = DosageForm::factory(10)->create([
            'shop_id' => $shop_1->id,
        ]);

        Product::factory(10)->create([
            'shop_id' => $shop_1->id,
            'dosage_form_id' => fn () => $dosageForm_shop_1->random()->id,
        ]);

        // SHOP 2
       
        $shop_2 = Shop::factory()->create();
        $dosageForm_shop_2 = DosageForm::factory(10)->create([
            'shop_id' => $shop_2->id,
        ]);
        Product::factory(10)->create([
            'shop_id' => $shop_2->id,
            'dosage_form_id' => fn () => $dosageForm_shop_2->random()->id,
        ]);

    }
}
