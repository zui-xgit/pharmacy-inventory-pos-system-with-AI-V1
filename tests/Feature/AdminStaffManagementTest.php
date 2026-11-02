<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
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
}
