<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class BudgetService
{
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
    private function getMonthlyData(User $user, Carbon $from, Carbon $to, $totalIncome): Collection
    {
        $months = collect();
        $currentDate = $from->copy()->startOfMonth();
        $endDate = $to->copy()->endOfMonth();

        while ($currentDate->lte($endDate)) {
            $monthStart = $currentDate->copy()->startOfMonth();
            $monthEnd = $currentDate->copy()->endOfMonth();

            $monthlyExpenses = $user->teamExpenses()
                ->whereBetween('date', [$monthStart, $monthEnd])
                ->sum('amount');

            $months->push([
                'name' => $currentDate->format('M'),
                'income' => $totalIncome,
                'expenses' => $monthlyExpenses,
            ]);

            $currentDate->addMonth();
        }

        return $months;
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

