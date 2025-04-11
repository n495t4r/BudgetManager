<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TeamController extends Controller
{

    protected ActivityLogService $activityLogService;
    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }
    //
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $team = $request->user()->teamOwner()->create([
            'name' => $request->name,
        ]);

        // Log the activity
        $this->activityLogService->log(
            $team->id,
            $request->user(),
            $team,
            'created',
            null,
            $team->toArray()
        );

        return back()->with('success', 'Team created successfully');
        // return response()->json($team, 201);

    }
    public function update(Request $request, Team $team)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'owner_id' => 'required|exists:users,id',
        ]);

        // Ensure the authenticated user belongs to the team
        if ($request->user()->userTeam->id !== $team->id) {
            return back()->with('error','You are not allowed to update this team');
        }

        // Update the model only if attributes are dirty
        $team->fill($request->only(['name', 'owner_id']));

        if ($team->isDirty()) {  // Check if any changes were made
            $originalData = $team->getOriginal();  // Get original data before update
            $team->save(); // Only updates if something actually changed

            // Log the activity
            $this->activityLogService->log(
                $request->user()->userTeam->id,
                $request->user(),
                $team,
                'updated',
                $originalData,
                $team->toArray()
            );
        }

        return back()->with('success', 'Team updated successfully');
    }

    public function destroy(Request $request, Team $team)
    {

        // Ensure the authenticated user belongs to the team
        if ($request->user()->userTeam->id !== $team->id) {
            return back()->with('error', 'You are not allowed to delete this team');
        }

        $team->delete();

        // Log the activity
        $this->activityLogService->log(
            null,
            $request->user(),
            $team,
            'deleted',
            null,
            $team->toArray()
        );

        return back()->with('success', 'Team deleted successfully');
    }
}
