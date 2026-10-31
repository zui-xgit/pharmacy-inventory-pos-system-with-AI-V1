<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProfileUpdateTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        Role::findOrCreate('admin', 'web');

        return User::factory()->create()->assignRole('admin');
    }

    public function test_profile_page_is_displayed()
    {
        $user = $this->adminUser();

        $response = $this
            ->actingAs($user)
            ->get(route('profile.edit'));

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated()
    {
        $user = $this->adminUser();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'firstname' => 'Test',
                'lastname' => 'User',
                'username' => $user->username,
                'gender' => 'male',
                'phone' => '0712345678',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $user->refresh();

        $this->assertSame('Test', $user->firstname);
        $this->assertSame('User', $user->lastname);
        $this->assertSame('male', $user->gender);
        $this->assertSame('0712345678', $user->phone);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged()
    {
        $user = $this->adminUser();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'firstname' => 'Test',
                'lastname' => 'User',
                'username' => $user->username,
                'gender' => 'male',
                'phone' => '0712345678',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account()
    {
        $user = $this->adminUser();

        $response = $this
            ->actingAs($user)
            ->delete(route('profile.destroy'), [
                'password' => '123456789',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account()
    {
        $user = $this->adminUser();

        $response = $this
            ->actingAs($user)
            ->from(route('profile.edit'))
            ->delete(route('profile.destroy'), [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect(route('profile.edit'));

        $this->assertNotNull($user->fresh());
    }
}
