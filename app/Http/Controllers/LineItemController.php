<?php

namespace App\Http\Controllers;

use App\Http\Requests\LineItem\StoreLineItemRequest;
use App\Models\Bucket;
use App\Models\LineItem;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LineItemController extends Controller
{
    protected ActivityLogService $activityLogService;
    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
        // $this->authorizeResource(LineItem::class, 'lineItem');
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
    public function store(StoreLineItemRequest $request, Bucket $bucket): RedirectResponse
    {
        //Check if total percentage would exceed 100%
        $currentTotal = $bucket->lineItems()->sum("percentage");
        $newTotal = $currentTotal + $request->percentage;
        if ($newTotal > 100) {
            return redirect()->back()->withErrors([
                'percentage' => 'The total percentage cannot exceed 100%.',
            ]);
        }
        $lineItem = $bucket->lineItems()->create($request->validated());
        // Log the activity
        $this->activityLogService->log(
            null,
            $request->user(),
            $lineItem,
            'created',
            null,
            $lineItem->toArray()
        );
        return back()->with('success', 'Line item created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(LineItem $lineItem)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(LineItem $lineItem)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LineItem $lineItem)
    {
        //Check if total percentage would exceed 100%
        $currentTotal = $lineItem->bucket->lineItems()->where('id', '!=', $lineItem->id)->sum("percentage");
        $newTotal = $currentTotal + $request->percentage;
        if ($newTotal > 100) {
            return redirect()->back()->withErrors([
                'percentage' => 'The total percentage cannot exceed 100%.',
            ]);
        }
        $oldValues = $lineItem->toArray();
        $lineItem->update($request->validated());
        // Log the activity
        $this->activityLogService->log(
            null,
            $request->user(),
            $lineItem,
            'updated',
            $oldValues,
            $lineItem->toArray()
        );
        return back()->with('success', 'Line item updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LineItem $lineItem)
    {
        //
    }
}
