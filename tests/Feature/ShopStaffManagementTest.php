<?php

namespace Tests\Feature;

use App\Models\Core\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ShopStaffManagementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function makeUser(array $attributes = []): User
    {
        return User::factory()->create([
            'email' => fake()->unique()->safeEmail(),
            'status' => 'active',
            ...$attributes,
        ]);
    }

    private function makeStaffOf(Shop $shop, string $role, array $attributes = []): User
    {
        $user = $this->makeUser($attributes);
        $user->assignRole(Role::findOrCreate($role));
        $user->shops()->attach($shop->id);

        return $user;
    }

    public function test_manager_only_sees_staff_assigned_to_their_shop(): void
    {
        $shop = Shop::factory()->create();
        $otherShop = Shop::factory()->create();

        $manager = $this->makeStaffOf($shop, 'manager', [
            'firstname' => 'Amina',
            'lastname' => 'Yusuf',
        ]);

        $shopCashier = $this->makeStaffOf($shop, 'cashier', [
            'firstname' => 'Baraka',
            'lastname' => 'Juma',
        ]);

        $otherShopCashier = $this->makeStaffOf($otherShop, 'cashier', [
            'firstname' => 'Faraja',
            'lastname' => 'Mushi',
        ]);

        $unassigned = $this->makeUser(['firstname' => 'Neema']);
        $unassigned->assignRole(Role::findOrCreate('cashier'));

        $this->actingAs($manager)
            ->get(route('shop.staff-edit', ['shop' => $shop->uuid]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('shop/system/shop-staff')
                ->where('shop.uuid', $shop->uuid)
                ->has('staff.data', 2)
                ->where('stats.total', 2)
                ->where('filters.search', '')
            );

        $this->actingAs($manager)
            ->get(route('shop.staff-edit', ['shop' => $shop->uuid, 'search' => 'Baraka']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('staff.data', 1)
                ->where('staff.data.0.name', 'Baraka Juma')
                ->where('staff.data.0.uuid', $shopCashier->uuid)
            );

        $this->assertNotSame($otherShopCashier->uuid, $shopCashier->uuid);
    }

    public function test_cashiers_and_non_members_cannot_manage_shop_staff(): void
    {
        $shop = Shop::factory()->create();
        $otherShop = Shop::factory()->create();

        $cashier = $this->makeStaffOf($shop, 'cashier');
        $outsiderManager = $this->makeStaffOf($otherShop, 'manager');

        $this->actingAs($cashier)
            ->get(route('shop.staff-edit', ['shop' => $shop->uuid]))
            ->assertForbidden();

        $this->actingAs($outsiderManager)
            ->get(route('shop.staff-edit', ['shop' => $shop->uuid]))
            ->assertForbidden();
    }

    public function test_manager_can_create_staff_assigned_only_to_their_shop(): void
    {
        $shop = Shop::factory()->create();
        $otherShop = Shop::factory()->create();
        $manager = $this->makeStaffOf($shop, 'manager');

        $permission = Permission::findOrCreate('shop inventory and stock management');
        Role::findOrCreate('cashier');

        $this->actingAs($manager)
            ->post(route('shop.staff-create', ['shop' => $shop->uuid]), [
                'firstname' => 'Neema',
                'lastname' => 'Mushi',
                'username' => 'neema.mushi',
                'email' => 'neema@example.com',
                'phone' => '0712345678',
                'gender' => 'female',
                'password' => 'password',
                'password_confirmation' => 'password',
                'role' => 'cashier',
                'permissions' => [$permission->name],
                'shops' => [$otherShop->uuid],
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $user = User::where('username', 'neema.mushi')->firstOrFail();

        $this->assertTrue($user->hasRole('cashier'));
        $this->assertTrue($user->hasPermissionTo($permission->name));
        $this->assertTrue($user->shops->contains($shop));
        $this->assertFalse($user->shops->contains($otherShop));
    }

    public function test_shop_staff_cannot_be_created_with_an_admin_role(): void
    {
        $shop = Shop::factory()->create();
        $manager = $this->makeStaffOf($shop, 'manager');
        Role::findOrCreate('admin');

        $this->actingAs($manager)
            ->post(route('shop.staff-create', ['shop' => $shop->uuid]), [
                'firstname' => 'Juma',
                'lastname' => 'Ally',
                'username' => 'juma.ally',
                'email' => 'juma@example.com',
                'phone' => '0712345679',
                'gender' => 'male',
                'password' => 'password',
                'password_confirmation' => 'password',
                'role' => 'admin',
                'permissions' => [],
                'shops' => [$shop->uuid],
            ])
            ->assertSessionHasErrors('role');

        $this->assertDatabaseMissing('users', ['username' => 'juma.ally']);
    }

    public function test_manager_can_update_a_staff_member_without_touching_other_shop_assignments(): void
    {
        $shop = Shop::factory()->create();
        $otherShop = Shop::factory()->create();
        $manager = $this->makeStaffOf($shop, 'manager');

        $cashier = $this->makeStaffOf($shop, 'cashier', [
            'firstname' => 'Baraka',
            'lastname' => 'Juma',
        ]);
        $cashier->shops()->attach($otherShop->id);

        $this->actingAs($manager)
            ->patch(route('shop.staff-update', ['shop' => $shop->uuid, 'user' => $cashier->uuid]), [
                'firstname' => 'Baraka',
                'lastname' => 'Juma',
                'email' => $cashier->email,
                'gender' => $cashier->gender,
                'phone' => $cashier->phone,
                'role' => 'manager',
                'permissions' => [],
                'shops' => [],
            ])
            ->assertRedirect();

        $cashier->refresh();

        $this->assertTrue($cashier->hasRole('manager'));
        $this->assertTrue($cashier->shops->contains($shop));
        $this->assertTrue($cashier->shops->contains($otherShop));
    }

    public function test_manager_cannot_update_staff_from_another_shop(): void
    {
        $shop = Shop::factory()->create();
        $otherShop = Shop::factory()->create();
        $manager = $this->makeStaffOf($shop, 'manager');
        $outsider = $this->makeStaffOf($otherShop, 'cashier');

        $this->actingAs($manager)
            ->patch(route('shop.staff-update', ['shop' => $shop->uuid, 'user' => $outsider->uuid]), [
                'firstname' => 'Hacked',
                'lastname' => 'Name',
                'email' => $outsider->email,
                'gender' => $outsider->gender,
                'phone' => $outsider->phone,
                'role' => 'cashier',
                'permissions' => [],
                'shops' => [],
            ])
            ->assertForbidden();

        $this->assertNotSame('Hacked', $outsider->fresh()->firstname);
    }

    public function test_manager_can_change_the_status_of_a_staff_member_but_not_their_own(): void
    {
        $shop = Shop::factory()->create();
        $manager = $this->makeStaffOf($shop, 'manager');
        $cashier = $this->makeStaffOf($shop, 'cashier');

        $this->actingAs($manager)
            ->patch(route('shop.staff-suspend', ['shop' => $shop->uuid, 'user' => $cashier->uuid]))
            ->assertRedirect();

        $this->assertSame('suspended', $cashier->fresh()->status);

        $this->actingAs($manager)
            ->patch(route('shop.staff-deactivate', ['shop' => $shop->uuid, 'user' => $manager->uuid]))
            ->assertForbidden();

        $this->assertSame('active', $manager->fresh()->status);
    }
}
