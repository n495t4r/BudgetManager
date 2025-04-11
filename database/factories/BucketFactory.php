<?php

namespace Database\Factories;

use App\Models\Bucket;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

class BucketFactory extends Factory
{
    protected $model = Bucket::class;

    public function definition(): array
    {
        return [
            // We remove user_id from here since team_id isn't available yet
            'title' => $this->faker->word,
            'percentage' => $this->faker->randomFloat(2, 0, 100),
        ];
    }

    public function configure()
    {
        return $this->afterMaking(function (Bucket $bucket) {
            // After making, if team_id is set and user_id is not, then set user_id from team's owner
            if ($bucket->team_id && !$bucket->user_id) {
                $team = Team::find($bucket->team_id);
                if ($team) {
                    $bucket->user_id = $team->owner_id;
                }
            }
        })->afterCreating(function (Bucket $bucket) {
            // In case it wasn't set during making, do it after creation and persist the change
            if ($bucket->team_id && !$bucket->user_id) {
                $team = Team::find($bucket->team_id);
                if ($team) {
                    $bucket->user_id = $team->owner_id;
                    $bucket->save();
                }
            }
        });
    }
}
