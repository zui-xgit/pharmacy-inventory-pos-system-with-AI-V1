<?php

namespace Tests\Feature;

use App\Models\Core\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminStaffManagementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function makeUser(array $attributes = []): User
    {
        return User::factory()->create([
            'email' => fake()->unique()->safeEmail(),
            ...$attributes,
        ]);
    }

    private function makeAdmin(): User
    {
        $admin = $this->makeUser();
        $admin->assignRole(Role::findOrCreate('admin'));

        return $admin;
    }

    public function test_admin_can_view_the_staff_management_page(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)
            ->get(route('admin.staff'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/management/staff-management')
                ->has('staff.data', 1)
                ->where('staff.data.0.name', "{$admin->firstname} {$admin->lastname}")
                ->has('roles', 1)
                ->where('stats.total', 1)
            );
    }

    public function test_staff_can_be_searched_by_full_name(): void
    {
        $admin = $this->makeAdmin();
        $this->makeUser(['firstname' => 'Asha', 'lastname' => 'Mwinyi']);
        $this->makeUser(['firstname' => 'Baraka', 'lastname' => 'Juma']);

        $this->actingAs($admin)
            ->get(route('admin.staff', ['search' => 'Asha Mwinyi']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('staff.data', 1)
                ->where('staff.data.0.name', 'Asha Mwinyi')
                ->where('filters.search', 'Asha Mwinyi')
            );
    }

    public function test_staff_can_be_filtered_by_role_and_status(): void
    {
        $admin = $this->makeAdmin();

        $manager = $this->makeUser(['status' => 'active']);
        $manager->assignRole(Role::findOrCreate('manager'));

        $suspendedManager = $this->makeUser(['status' => 'suspended']);
        $suspendedManager->assignRole(Role::findOrCreate('manager'));

        $this->actingAs($admin)
            ->get(route('admin.staff', ['role' => 'manager', 'status' => 'suspended']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('staff.data', 1)
                ->where('staff.data.0.name', "{$suspendedManager->firstname} {$suspendedManager->lastname}")
                ->where('staff.data.0.status', 'suspended')
                ->where('filters.role', 'manager')
                ->where('filters.status', 'suspended')
            );
    }

    public function test_non_admins_cannot_view_the_staff_management_page(): void
    {
        $this->actingAs($this->makeUser())
            ->get(route('admin.staff'))
            ->assertForbidden();
    }

    public function test_admin_can_create_a_staff_member(): void
    {
        $admin = $this->makeAdmin();
        $role = Role::findOrCreate('cashier');
        $permission = Permission::findOrCreate('view reports');
        $shop = Shop::factory()->create();

        $this->actingAs($admin)
            ->post(route('admin.create-staff'), [
                'firstname' => 'Neema',
                'lastname' => 'Mushi',
                'username' => 'neema.mushi',
                'email' => 'neema@example.com',
                'phone' => '0712345678',
                'gender' => 'female',
                'password' => 'password',
                'password_confirmation' => 'password',
                'role' => $role->name,
                'permissions' => [$permission->name],
                'shops' => [$shop->uuid],
            ])
            ->assertRedirect();

        $user = User::where('username', 'neema.mushi')->firstOrFail();

        $this->assertSame('Neema', $user->firstname);
        $this->assertSame('inactive', $user->status);
        $this->assertNotNull($user->email_verified_at);
        $this->assertTrue($user->hasRole('cashier'));
        $this->assertTrue($user->hasPermissionTo('view reports'));
        $this->assertTrue($user->shops->contains($shop));
    }

    public function test_admin_accounts_are_not_linked_to_individual_shops(): void
    {
        $admin = $this->makeAdmin();
        $role = Role::findOrCreate('admin');
        $shop = Shop::factory()->create();

        $this->actingAs($admin)
            ->post(route('admin.create-staff'), [
                'firstname' => 'Juma',
                'lastname' => 'Ally',
                'username' => 'juma.ally',
                'email' => 'juma@example.com',
                'phone' => '0712345679',
                'gender' => 'male',
                'password' => 'password',
                'password_confirmation' => 'password',
                'role' => $role->name,
                'permissions' => [],
                'shops' => [$shop->uuid],
            ])
            ->assertRedirect();

        $user = User::where('username', 'juma.ally')->firstOrFail();

        $this->assertTrue($user->hasRole('admin'));
        $this->assertCount(0, $user->shops);
    }

    public function test_non_admins_cannot_create_staff(): void
    {
        $role = Role::findOrCreate('cashier');

        $this->actingAs($this->makeUser())
            ->post(route('admin.create-staff'), [
                'firstname' => 'Neema',
                'lastname' => 'Mushi',
                'username' => 'neema.mushi',
                'email' => 'neema@example.com',
                'phone' => '0712345678',
                'gender' => 'female',
                'password' => 'password',
                'password_confirmation' => 'password',
                'role' => $role->name,
                'permissions' => [],
                'shops' => [],
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('users', ['username' => 'neema.mushi']);
    }
}
