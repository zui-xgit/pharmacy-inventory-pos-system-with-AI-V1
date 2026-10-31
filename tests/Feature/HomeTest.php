<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomeTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_can_visit_the_home_page()
    {
        $response = $this->get(route('home'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('welcome'));
    }

    public function test_authenticated_users_can_visit_the_home_page()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('home'));

        $response->assertOk();
    }
}
