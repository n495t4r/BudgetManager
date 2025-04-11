<?php

namespace App\Http\Controllers;

use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use App\Models\BudgetPlan;
use App\Models\Expense;
use App\Services\ActivityLogService;
use App\Services\BudgetService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    protected ActivityLogService $activityLogService;
    protected BudgetService $bucketLogService;

    public function __construct(
        BudgetService $budgetService,
        ActivityLogService $activityLogService
    ) {
        $this->bucketLogService = $budgetService;
        $this->activityLogService = $activityLogService;
        // $this->authorizeResource(Expense::class, 'expense');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreExpenseRequest $request): RedirectResponse
    {
        $teamId = $request->user()->team_id;
        $period = $request->date->format('Y-m');
        $plan = BudgetPlan::firstOrCreate(
            ['team_id' => $teamId, 'period' => $period]
        );

        $data = $request->validated() + [
            'budget_plan_id'            => $plan->id,
            'line_item_id'  => $request->line_item_id,
        ];

        $expense = $request->user()->team()->expenses()->create($data);

        // Log the activity
        $this->activityLogService->log(
            null,
            $request->user(),
            $expense,
            'created',
            null,
            $expense->toArray()
        );
        return back()->with('success', 'Expense recorded');
    }

    /**
     * Display the specified resource.
     */
    public function show(Expense $expense)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Expense $expense)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateExpenseRequest $request, Expense $expense)
    {
        $oldValues = $expense->toArray();
        $expense->update($request->validated());
        // Log the activity
        $this->activityLogService->log(
            null,
            $request->user(),
            $expense,
            'updated',
            $oldValues,
            $expense->toArray()
        );
        return back()->with('success', 'Expense updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Expense $expense): RedirectResponse
    {
        $oldValues = $expense->toArray();
        $expense->delete();
        // Log the activity
        $this->activityLogService->log(
            null,
            $request->user(),
            $expense,
            'deleted',
            $oldValues,
            null
        );
        return back()->with('success', 'Expense deleted successfully.');
    }
}
