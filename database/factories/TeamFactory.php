<?php

namespace Database\Factories;

use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

class TeamFactory extends Factory
{
    protected $model = Team::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company,
            // Initially set owner_id to null; we'll assign it in the afterCreating callback.
            'owner_id' => null,
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (Team $team) {
            // Check if the team has any users
            if ($team->users()->exists()) {
                // Select one user at random from the team's users
                $owner = $team->users()->inRandomOrder()->first();
                // Update the team with the selected owner_id
                $team->update(['owner_id' => $owner->id]);
            }
        });
    }
}
