<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('confirm password screen can be rendered', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/confirm-password');

    $response->assertStatus(200);
});

test('password can be confirmed', function () {
    $this->get('/login'); // Initialize session if needed
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/confirm-password', [
        '_token' => session('_token'),
        'password' => 'password',
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();
});

test('password is not confirmed with invalid password', function () {
    $this->get('/login'); // Initialize session if needed
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/confirm-password', [
        '_token' => session('_token'),
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors();
});
