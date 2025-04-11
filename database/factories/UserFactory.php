<?php

namespace Database\Factories;

use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Define name as 'Francis Onah' email as onahfa@gmail.com for the first user
        // and generate a random name and email for the rest.

        static $isFirstUser = true;

        if ($isFirstUser) {
            $name = 'Francis Onah';
            $email = 'onahfa@gmail.com';
            $isFirstUser = false;
        } else {
            // Generate a random name and email for all other users
            $name = fake()->name();
            $email = fake()->unique()->safeEmail();
        }

        return [
            'name' => $name,
            'email' => $email,
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'team_id' => null, // Associate the user with a team

        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
