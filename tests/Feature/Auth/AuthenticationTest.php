<?php

use App\Models\User;
use Illuminate\Support\Facades\Log;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {

    $this->get('/login'); // Initialize session if needed

    $user = User::factory()->create();

    $response = $this->post('/login', [
        '_token'   => session('_token'),
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {

    $this->get('/login'); // Initialize session if needed
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout', [
        '_token' => session('_token'),

    ]);
    $this->assertGuest();
    $response->assertRedirect('/');
});
