<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Team;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create 4 teams. Each team will have:
        // - 3 users,
        // - 1 to 3 buckets (each with 2 to 6 line items),
        // - 5 to 10 expenses,
        // - 1 to 2 income sources,
        // - 4 to 8 activity logs.
        Team::factory(4)
            ->hasUsers(3) // Using a relationship defined in Team model (e.g., users())
            ->has(
                // For each team, create buckets and attach line items
                \App\Models\Bucket::factory(rand(1, 3))
                    ->has(\App\Models\LineItem::factory(rand(2, 6)), 'lineItems'),
                'buckets'
            )
            ->has(\App\Models\Expense::factory(rand(5, 10)), 'expenses')
            ->has(\App\Models\IncomeSource::factory(rand(1, 2)), 'incomeSources')
            ->has(\App\Models\ActivityLog::factory(rand(4, 8)), 'activityLogs')
            ->create();
    }
}
