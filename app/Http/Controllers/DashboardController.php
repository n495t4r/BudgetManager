<?php

namespace App\Http\Controllers;

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
         // Get date range from request or use defaults
         $from = $request->input('from')
         ? Carbon::parse($request->input('from'))
         : Carbon::now()->startOfMonth();

     $to = $request->input('to')
         ? Carbon::parse($request->input('to'))
         : Carbon::now();

     // Get dashboard data
     $dashboardData = $this->budgetService->getDashboardData($request->user(), $from, $to);

     return Inertia::render('dashboard', [
         'dashboardData' => $dashboardData,
         'currency' => '₦',
     ]);
    }
}
