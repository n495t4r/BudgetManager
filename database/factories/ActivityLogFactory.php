<?php

namespace Database\Factories;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Factories\Factory;

class ActivityLogFactory extends Factory
{
    protected $model = ActivityLog::class;

    public function definition(): array
    {
        return [
            'user_id' => null,
            // 'team_id' => null,
            'loggable_type' => $this->faker->randomElement(['App\Models\Expense', 'App\Models\IncomeSource', 'App\Models\Bucket', 'App\Models\LineItem',]),
            'loggable_id' => $this->faker->randomNumber(),
            'action' => $this->faker->word,
            'old_values' => $this->faker->randomElements(),
            'new_values' => $this->faker->randomElements(),
        ];
    }
}
