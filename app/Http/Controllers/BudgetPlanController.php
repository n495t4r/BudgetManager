<?php

namespace App\Http\Controllers;

use App\Models\Bucket;
use App\Models\BudgetPlan;
use App\Models\IncomeSource;
use App\Models\LineItem;
use App\Services\ActivityLogService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;
use Inertia\Inertia;

class BudgetPlanController extends Controller
{

    protected $activityLogService;

    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    // public function store(Request $r)
    // {
    //     $r->validate(['period'=>'required|date_format:Y-m']);
    //     $plan = BudgetPlan::create([
    //         'team_id'=>auth()->user()->team_id,
    //         'period'=>$r->period
    //     ]);
    //     return back()->with('success','Plan created');
    // }

     /**
     * Show the form for creating a new budget plan.
     */
    public function create(Request $request): Response
    {
        $teamId = $request->user()->team_id;
        $currentPeriod = now()->format('Y-m');

        // Check if there's a previous plan to copy from
        $previousPlans = BudgetPlan::where('team_id', $teamId)
            ->where('period', '<', $currentPeriod)
            ->orderBy('period', 'desc')
            ->get();

        return Inertia::render('BudgetPlans/Create', [
            'previousPlans' => $previousPlans,
            'currentPeriod' => $currentPeriod
        ]);
    }

    /**
     * Store a newly created budget plan.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'period' => 'required|date_format:Y-m',
            'copy_from_plan_id' => 'nullable|exists:budget_plans,id'
        ]);

        $teamId = $request->user()->team_id;
        $period = $request->period;

        // Check if a plan already exists for this period
        $existingPlan = BudgetPlan::where('team_id', $teamId)
            ->where('period', $period)
            ->first();

        if ($existingPlan) {
            return redirect()->back()->withErrors([
                'period' => 'A budget plan already exists for this period.'
            ]);
        }

        DB::beginTransaction();

        try {
            // Create the new plan
            $newPlan = BudgetPlan::create([
                'team_id' => $teamId,
                'period' => $period
            ]);

            // If copying from a previous plan
            if ($request->copy_from_plan_id) {
                $this->copyFromPreviousPlan($request->user(), $newPlan, $request->copy_from_plan_id);
            }

            DB::commit();

            // Log the activity
            $this->activityLogService->log(
                $teamId,
                $request->user(),
                $newPlan,
                'created',
                null,
                $newPlan->toArray()
            );

            return redirect()->route('budget-plans.show', $newPlan->id)
                ->with('success', 'Budget plan created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Failed to create budget plan: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Copy data from a previous plan to a new plan.
     */
    private function copyFromPreviousPlan($user, BudgetPlan $newPlan, $previousPlanId): void
    {
        $previousPlan = BudgetPlan::findOrFail($previousPlanId);

        // Copy income sources
        $previousIncomeSources = IncomeSource::where('budget_plan_id', $previousPlan->id)->get();
        foreach ($previousIncomeSources as $source) {
            $newSource = $source->replicate();
            $newSource->budget_plan_id = $newPlan->id;
            $newSource->save();
        }

        // Copy buckets and their line items
        $previousBuckets = Bucket::where('budget_plan_id', $previousPlan->id)->get();
        foreach ($previousBuckets as $bucket) {
            $newBucket = $bucket->replicate();
            $newBucket->budget_plan_id = $newPlan->id;
            // $newBucket->user_id = $user->id;
            $newBucket->save();

            // Copy line items for this bucket
            $lineItems = LineItem::where('bucket_id', $bucket->id)->get();
            foreach ($lineItems as $item) {
                $newItem = $item->replicate();
                $newItem->bucket_id = $newBucket->id;
                $newItem->save();
            }
        }
    }

    /**
     * Handle one click rollover from dashboard: Roll over a budget plan from the previous month to the current month.
     */
    public function rollover(Request $request): RedirectResponse
    {
        $teamId = $request->user()->team_id;

        $period = $request->input('period')
         ? Carbon::parse($request->input('period')): now();

        if (!$period) {
            return back()->with('error', 'Invalid period provided.');
        }

        $currentPeriod = $period->format('Y-m');

        // Check if a plan already exists for the current period
        $existingPlan = BudgetPlan::where('team_id', $teamId)
            ->where('period', $currentPeriod)
            ->first();

        if ($existingPlan) {
            return back()->with('info', 'A budget plan already exists for this period.');
        }

        // Find the most recent previous plan
        $previousPlan = BudgetPlan::where('team_id', $teamId)
            ->where('period', '<', $currentPeriod)
            ->orderBy('period', 'desc')
            ->first();

        if (!$previousPlan) {
            return back()->with('info', 'No previous plan found to copy from. Please create a new plan.');
        }

        DB::beginTransaction();

        try {
            // Create the new plan
            $newPlan = BudgetPlan::create([
                'team_id' => $teamId,
                'period' => $currentPeriod
            ]);

            // Copy data from the previous plan
            $this->copyFromPreviousPlan($request->user(), $newPlan, $previousPlan->id);

            DB::commit();

            // Log the activity
            $this->activityLogService->log(
                $teamId,
                $request->user(),
                $newPlan,
                'created',
                null,
                ['note' => 'Rolled over from plan ' . $previousPlan->period]
            );

            return back()->with('success', 'Budget plan rolled over successfully from previous month');
        } catch (\Exception $e) {
            DB::rollBack();
            // dd('got here');
            return back()->with(
                'error', 'Failed to roll over budget plan: ' . $e->getMessage()
            );
        }
    }

}
