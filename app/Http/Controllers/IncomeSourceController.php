<?php

namespace App\Http\Controllers;

use App\Http\Requests\IncomeSource\StoreIncomeSourceRequest;
use App\Http\Requests\IncomeSource\UpdateIncomeSourceRequest;
use App\Models\BudgetPlan;
use App\Models\IncomeSource;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class IncomeSourceController extends Controller
{
    protected ActivityLogService $activityLogService;
    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
        // $this->authorizeResource(IncomeSource::class, 'incomeSource');
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $incomeSources = $request->user()->incomeSources();
        $incomeSources2 = $request->incomeSources();

        return Inertia::render('Settings/IncomeSources/Index', [
            // 'incomeSources' => $incomeSources,
            'incomeSources' => $incomeSources->get(),
            'currency' => '₦',
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreIncomeSourceRequest $request): RedirectResponse
    {
        dd($request->all());
        $teamId = $request->user()->team_id;
        $period = now()->format('Y-m');
        $plan = BudgetPlan::firstOrCreate(
            ['team_id' => $teamId, 'period' => $period]
        );


        $incomeSource = $request->user()->incomeSources()->create([
            'team_id' => $teamId,
            'budget_plan_id' => $plan->id,
            ...$request->validated() // merge other validated fields
        ]);

        // Log the activity
        $this->activityLogService->log(
            $request->user()->team_id,
            $request->user(),
            $incomeSource,
            'created',
            null,
            $incomeSource->toArray()
        );

        return back()->with('success', 'Income recorded');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(IncomeSource $incomeSource)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateIncomeSourceRequest $request, IncomeSource $incomeSource)
    {
        // $oldValues = $incomeSource->toArray();

        // Ensure the authenticated user belongs to the income source
        if ($request->user()->team_id !== $incomeSource->team_id) {
            return back()->with('error', 'You are not allowed to update this income source');
        }

        // Update the model only if attributes are dirty
        $incomeSource->fill($request->validated());
        if ($incomeSource->isDirty()) {  // Check if any changes were made
            $oldValues = $incomeSource->getOriginal();  // Get original data before update
            $incomeSource->save(); // Only updates if something actually changed
        }

        // Log the activity
        $this->activityLogService->log(
            $request->user()->team_id,
            $request->user(),
            $incomeSource,
            'updated',
            $oldValues,
            $incomeSource->toArray()
        );
        return back()->with('success', 'Income source updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, IncomeSource $incomeSource)
    {
        $oldValues = $incomeSource->toArray();
        $incomeSource->delete();

        // Ensure the authenticated user belongs to the income source team
        if ($request->user()->team_id !== $incomeSource->team_id) {
            return back()->with('error', 'You are not allowed to delete this income source');
        }

        // Log the activity
        $this->activityLogService->log(
            $request->user()->team_id,
            $request->user(),
            $incomeSource,
            'deleted',
            $oldValues,
            null
        );
        return back()->with('success', 'Income source deleted successfully');
    }
}
