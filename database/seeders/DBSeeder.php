<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Team;
use App\Models\User;
use App\Models\BudgetPlan;
use App\Models\Bucket;
use App\Models\LineItem;
use App\Models\IncomeSource;
use App\Models\Expense;
use Carbon\Carbon;

class DBSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1) Create 4 teams
        Team::factory(4)->create()->each(function (Team $team) {
            // 2) Create 3 users in that team, assign first as owner
            $users = User::factory(3)->create([
                'team_id' => $team->id,
            ]);
            $team->owner_id = $users->first()->id;
            $team->save();

            // 3) For each of the last 3 months, build a BudgetPlan
            for ($i = 0; $i < 3; $i++) {
                $period = Carbon::now()->subMonths($i)->format('Y-m');
                $plan = BudgetPlan::create([
                    'team_id' => $team->id,
                    'period' => $period,
                ]);

                // 4) Buckets & 5) Line Items
                Bucket::factory(rand(1, 3))
                    ->for($plan, 'plan')
                    ->create()
                    ->each(function (Bucket $bucket) {
                        LineItem::factory(rand(2, 6))
                            ->for($bucket, 'bucket')
                            ->create();
                    });

                // 6) IncomeSources (1–2)
                foreach (range(1, rand(1, 2)) as $_) {
                    $user = $users->random();
                    IncomeSource::factory()->create([
                        'user_id' => $user->id,
                        'team_id' => $team->id,
                        'budget_plan_id' => $plan->id
                    ]);
                }

                // 7) Expenses (5–10)
                $lineItems = LineItem::whereHas('bucket', function ($q) use ($plan) {
                    $q->where('budget_plan_id', $plan->id);
                })->get();

                foreach (range(1, rand(5, 10)) as $_) {
                    $user = $users->random();
                    $li = $lineItems->random();

                    Expense::factory()->create([
                        'user_id' => $user->id,
                        'team_id' => $team->id,
                        'budget_plan_id' => $plan->id,
                        'line_item_id' => $li->id,
                        // date somewhere in that month
                        'date' => Carbon::parse($period . '-' . rand(1, 28)),
                    ]);
                }
            }
        });
    }
}
