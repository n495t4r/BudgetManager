<?php

namespace App\Http\Controllers;

use App\Models\BudgetPlan;
use App\Services\BudgetService;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected BudgetService $budgetService;
    public function __construct(BudgetService $budgetService)
    {
        $this->budgetService = $budgetService;
    }

    /**
     * Display the dashboard.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $teamId = $user->team_id;

         // Get date range from request or use defaults
         $from = $request->input('from')
         ? Carbon::parse($request->input('from'))
         : Carbon::now()->startOfMonth();

        $to = $request->input('to')
         ? Carbon::parse($request->input('to'))
         : Carbon::now();

     // Get the current period (year-month)
    //  $currentPeriod = $from->format('Y-m');


     $fromP = $from->format('Y-m');
        $toP = $to->format('Y-m');

     // Find the budget plan for this period
     $budgetPlan = BudgetPlan::where('team_id', $teamId)
     ->whereBetween('period', [$fromP, $toP])
         ->first();

    // Check if we need to suggest a rollover
    $suggestRollover = false;
    $previousPlan = null;

    if (!$budgetPlan) {
        // Check if there's a previous plan we could roll over from
        $previousPlan = BudgetPlan::where('team_id', $teamId)
            ->where('period', '<', $fromP)
            ->orderBy('period', 'desc')
            ->first();

        if ($previousPlan) {
            $suggestRollover = true;
        }
    }

        // dd($previousPlan);

        // Get the date range for the dashboard
        $rangeData = $this->budgetService->getRangeData($user, $from, $to);

     return Inertia::render('dashboard', [
        //  'dashboardData' => $dashboardData,
         'rangeData' => $rangeData,
         'currency' => '₦',
            'suggestRollover' => $suggestRollover,
            'hasBudgetPlan' => !!$budgetPlan,
            'previousPlanId' => $previousPlan ? $previousPlan->id : null,
     ]);
    }
}
