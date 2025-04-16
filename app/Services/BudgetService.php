<?php

namespace App\Services;

use App\Models\BudgetPlan;
use App\Models\Expense;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class BudgetService
{

    public function getRangeData(User $u, Carbon $from, Carbon $to): array
    {
        $teamId = $u->team_id;
        $fromP = $from->format('Y-m');
        $toP = $to->format('Y-m');

        // 1) Fetch all plans in the range
        $plans = BudgetPlan::where('team_id', $teamId)
            ->whereBetween('period', [$fromP, $toP])
            ->with('buckets.lineItems.expenses')
            ->get();
        //income sources
        $incomeSources = $u->teamIncomeSources()
            ->whereIn('budget_plan_id', $plans->pluck('id'))
            ->get();

            // 2) Total income & expenses in range
        $totalIncome = $incomeSources
            ->sum('amount');

        $totalExpenses = $u->teamExpenses()
            ->whereIn('budget_plan_id', $plans->pluck('id'))
            ->sum('amount');

        // 3) Build bucket + line‑item summaries
        $buckets = [];
        foreach ($plans as $plan) {
            foreach ($plan->buckets as $pb) {
                $bucketKey = $pb->id;
                // Planned for this bucket (uses totalIncome for all months)
                $bucketAmount = $totalIncome * ($pb->percentage / 100);

                // Build line‑items for this bucket
                $lineItems = [];
                foreach ($pb->lineItems as $pli) {
                    // Sum expenses on this line‑item in date range
                    $spent = $pli->expenses
                        ->sum('amount');

                    $liAmount = $bucketAmount * ($pli->percentage / 100);
                    $liRemaining = $liAmount - $spent;

                    $lineItems[] = [
                        'id' => $pli->id,
                        'title' => $pli->title,
                        'percentage' => (float) $pli->percentage,
                        'amount' => (float) $liAmount,
                        'spent' => (float) $spent,
                        'remaining' => (float) $liRemaining,
                    ];
                }

                // Sum spent across line‑items
                $bucketSpent = array_sum(array_column($lineItems, 'spent'));
                $bucketRemaining = $bucketAmount - $bucketSpent;

                // Initialize or accumulate
                if (!isset($buckets[$bucketKey])) {
                    $buckets[$bucketKey] = [
                        'id' => $pb->id,
                        'title' => $pb->title,
                        'percentage' => (float) $pb->percentage,
                        'amount' => 0.0,
                        'spent' => 0.0,
                        'remaining' => 0.0,
                        'lineItems' => [],
                    ];
                }

                // Accumulate across multiple plans
                $buckets[$bucketKey]['amount'] += $bucketAmount;
                $buckets[$bucketKey]['spent'] += $bucketSpent;
                $buckets[$bucketKey]['remaining'] += $bucketRemaining;
                // Merge line‑items
                $buckets[$bucketKey]['lineItems'] = array_merge(
                    $buckets[$bucketKey]['lineItems'],
                    $lineItems
                );
            }
        }

        // Reindex buckets
        $buckets = array_values($buckets);

        // 4) Fetch all expenses in range, with relationships
        $expenses = Expense::with('lineItem.bucket')
            ->where('team_id', $teamId)
            ->whereIn('budget_plan_id', $plans->pluck('id'))
            ->orderBy('date', 'desc')
            ->get()
            ->map(function (Expense $e) {
                return [
                    'id' => $e->id,
                    'date' => $e->date->toDateString(),
                    'description' => $e->description,
                    'amount' => (float) $e->amount,
                    'bucket' => $e->lineItem->bucket->title,
                    'lineItem' => $e->lineItem->title,
                ];
            });

        // 5) Recent 5 expenses
        $recentExpenses = $expenses->take(5)->values();

        // 6) Monthly data (income vs expense)
        $monthlyData = $this->getMonthlyData($u,  $plans);

        return [
            'totalIncome' => (float) $totalIncome,
            'totalExpenses' => (float) $totalExpenses,
            'remainingBalance' => (float) ($totalIncome - $totalExpenses),
            'buckets' => $buckets,
            'recentExpenses' => $recentExpenses,
            'expenses' => $expenses,
            'monthlyData' => $monthlyData,
            'incomeSources' => $incomeSources,
        ];
    }

    public function getDashboardData(
        User $user,
        Carbon $from,
        Carbon $to
    ): array {
        //Get total income amount for the users team
        $totalIncome = $user->teamIncomeSources()
            ->whereBetween('month_year', [$from, $to])
            ->where('is_active', true)
            ->sum('amount');

        // Get the user's team buckets with their line items and expenses
        $buckets = $user->teamBuckets()->with([
            'lineItems.expenses' => function ($query) use ($from, $to) {
                $query->whereBetween('date', [$from, $to]);
            }
        ])->get();


        // Get the user's team expenses with their line items
        $expenses = $user->teamExpenses()
            ->with('lineItem.bucket')
            ->whereBetween('date', [$from, $to])
            ->latest()
            ->get();

        $totalExpenses = $expenses->sum('amount');
        $remainingBalance = $totalIncome - $totalExpenses;



        // Calculate monthly data for charts
        $monthlyData = $this->getMonthlyData($user, $from, $to, $totalIncome);

        return [
            'totalIncome' => $totalIncome,
            'totalExpenses' => $totalExpenses,
            'remainingBalance' => $remainingBalance,
            'buckets' => $buckets->map(function ($bucket) use ($totalIncome, $from, $to) {
                $bucketAmount = $totalIncome * ($bucket->percentage / 100);
                $lineItems = $bucket->lineItems->map(function ($lineItem) use ($bucketAmount, $from, $to) {
                    $lineItemAmount = $bucketAmount * ($lineItem->percentage / 100);
                    $spent = $lineItem->expenses
                        ->whereBetween('date', [$from, $to])
                        ->sum('amount');

                    return [
                        'id' => $lineItem->id,
                        'title' => $lineItem->title,
                        'percentage' => $lineItem->percentage,
                        'amount' => $lineItemAmount,
                        'spent' => $spent,
                        'remaining' => $lineItemAmount - $spent,
                    ];
                });

                return [
                    'id' => $bucket->id,
                    'title' => $bucket->title,
                    'percentage' => $bucket->percentage,
                    'amount' => $bucketAmount,
                    'spent' => $lineItems->sum('spent'),
                    'remaining' => $bucketAmount - $lineItems->sum('spent'),
                    'lineItems' => $lineItems,
                ];
            }),
            'recentExpenses' => $expenses->take(5)->values(),
            'expenses' => $expenses,
            'monthlyData' => $monthlyData,
        ];
    }

    /**
     * Get monthly income and expense data for charts
     */
    private function getMonthlyData(User $user, Collection $plans): Collection
    {
        return $plans->map(function ($plan) use ($user) {
            // Ensure the period is a Carbon instance
            $month = Carbon::parse($plan->period)->startOfMonth();

            // Sum team expenses for this month
            $monthlyExpenses = $user->teamExpenses()
            ->where('budget_plan_id', $plan->id)
            ->sum('amount');

            // Sum total income for this plan (if income is tied to plan)
            $monthlyTotalIncome = $user->teamIncomeSources()
                ->where('budget_plan_id', $plan->id)
                ->sum('amount');

            return [
                'name' => $month->format('M'),
                'income' => $monthlyTotalIncome,
                'expenses' => $monthlyExpenses,
            ];
        });
    }

    /**
     * Validate that bucket percentages add up to 100%
     */
    public function validateBucketPercentages(User $user): bool
    {
        $totalPercentage = $user->teamBuckets()->sum('percentage');
        return $totalPercentage == 100;
    }

    /**
     * Validate that line item percentages for a bucket add up to 100%
     */
    public function validateLineItemPercentages(int $bucketId): bool
    {
        $bucket = \App\Models\Bucket::findOrFail($bucketId);
        $totalPercentage = $bucket->lineItems()->sum('percentage');
        return $totalPercentage == 100;
    }
}

