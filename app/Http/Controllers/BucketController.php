<?php

namespace App\Http\Controllers;

use App\Http\Requests\Bucket\StoreBucketRequest;
use App\Http\Requests\Bucket\UpdateBucketRequest;
use App\Models\Bucket;
use App\Models\BudgetPlan;
use App\Services\ActivityLogService;
use App\Services\BudgetService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BucketController extends Controller
{

    protected ActivityLogService $activityLogService;
    protected BudgetService $budgetService;

    public function __construct(BudgetService $budgetService,
    ActivityLogService $activityLogService)
    {
        $this->budgetService = $budgetService;
        $this->activityLogService = $activityLogService;
        // $this->authorizeResource(Bucket::class, 'bucket');
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
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBucketRequest $request, BudgetPlan $budgetPlan): RedirectResponse
    {
        $teamId = $request->user()->team_id;
        $period = now()->format('Y-m');
        $plan = BudgetPlan::firstOrCreate(
            ['team_id' => $teamId, 'period' => $period]
        );

        // dd($plan);
        //Check if total percentage would exceed 100%
        $currentTotal = $plan->sum("percentage");
        $newTotal = $currentTotal + $request->percentage;
        if ($newTotal > 100) {
            return redirect()->back()->withErrors([
                'percentage' => 'The total percentage cannot exceed 100%.',
            ]);
        }
        // $bucket = $request->user()->teamBuckets()->create($request->validated());
        $bucket = $plan->buckets()->create([
            // 'team_id' => $request->user()->team_id,
            // 'user_id' => $request->user()->id,
            // 'budget_plan_id' => $plan->id,
            ...$request->validated() ]);

        // Log the activity
        $this->activityLogService->log(
            null,
            $request->user(),
            $bucket,
            'created',
            null,
            $bucket->toArray()
        );

        return back()->with('success','Bucket created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Bucket $bucket)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Bucket $bucket)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBucketRequest $request, Bucket $bucket)
    {
        //check if total percentage would exceed 100%
        $currentTotal = $request->user()->teamBuckets()->where('id', '!=', $bucket->id)->sum("percentage");
        $newTotal = $currentTotal + $request->percentage;
        if ($newTotal > 100) {
            return redirect()->back()->withErrors([
                'percentage' => 'The total percentage cannot exceed 100%.',
            ]);
        }
        $oldValues = $bucket->toArray();
        $bucket->update($request->validated());

        // Log the activity
        $this->activityLogService->log(
            null,
            $request->user(),
            $bucket,
            'updated',
            $oldValues,
            $bucket->toArray()
        );
        return back()->with('success','Bucket updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Bucket $bucket)
    {
        $oldValues = $bucket->toArray();
        $bucket->delete();
        // Log the activity
        $this->activityLogService->log(
            null,
            $request->user(),
            $bucket,
            'deleted',
            $oldValues,
            null
        );
        return back()->with('success','Bucket deleted successfully');
    }
}
