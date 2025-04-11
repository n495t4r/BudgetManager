<?php

namespace Database\Factories;

use App\Models\IncomeSource;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\IncomeSource>
 */
class IncomeSourceFactory extends Factory
{
    protected $model = IncomeSource::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // We remove the direct team creation so that parent's team_id is used.
            // 'team_id' => Team::factory(),
            'name' => $this->faker->word, // Generate a random name for the income source
                // For example, we can use the date() method to generate a date string in the format 'Y-m-d' and then use the month() and year() methods to extract the month and year values.
            'amount' => $this->faker->randomFloat(2, 100, 10000), // Random amount
            'is_active' => $this->faker->boolean, // Active status
            // We also remove the direct assignment for user_id, so it can be set in our callbacks.
        ];
    }

    // public function configure()
    // {
    //     return $this->afterMaking(function (IncomeSource $incomeSource) {
    //         // If the income source has a team_id but no user_id, pick a random user from that team.
    //         if ($incomeSource->team_id && !$incomeSource->user_id) {
    //             $team = Team::find($incomeSource->team_id);
    //             if ($team && $team->users()->count() > 0) {
    //                 $incomeSource->user_id = $team->users()->inRandomOrder()->first()->id;
    //             } else {
    //                 // Fallback: if no users found, create a new user and attach to team
    //                 $user = User::factory()->create(['team_id' => $incomeSource->team_id]);
    //                 $incomeSource->user_id = $user->id;
    //             }
    //         }
    //     })->afterCreating(function (IncomeSource $incomeSource) {
    //         // After creation, ensure user_id is set properly (in case it wasn't set during making)
    //         if ($incomeSource->team_id && !$incomeSource->user_id) {
    //             $team = Team::find($incomeSource->team_id);
    //             if ($team && $team->users()->count() > 0) {
    //                 $incomeSource->user_id = $team->users()->inRandomOrder()->first()->id;
    //                 $incomeSource->save();
    //             }
    //         }
    //     });
    // }
}
