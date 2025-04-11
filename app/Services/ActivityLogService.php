<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ActivityLogService {

    //Log an activity
    public function log(
        ?int $team_id,
        User $user,
        Model $model,
        string $action,
        ?array $oldValues = null,
        ?array $newValues = null
    ): ActivityLog {


        return ActivityLog::create([
            'team_id' => $team_id ? $team_id : null,
            'user_id' => $user->id,
            'action' => $action,
            'loggable_type' => get_class($model),
            'loggable_id' => $model->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
        ]);
    }

    //Get all activity logs for a user
    public function getUserLogs(User $user, int $limit = 20): array {
        // return ActivityLog::where('user_id', $user->id)
        //     ->orderBy('created_at', 'desc')
        //     ->take($limit)
        //     ->get()
        //     ->toArray();

        return $user->activityLogs()
            ->with('loggable')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($activityLog) {
                $modelName = class_basename($activityLog->loggable_type);
                $actionText = match ($activityLog->action) {
                    'created' => 'created a new',
                    'updated' => 'updated a',
                    'deleted' => 'deleted a',
                    default => $activityLog->action,
                };
                return [
                    'id' => $activityLog->id,
                    'description' => "{$activityLog->user->name} {$actionText} {$modelName}",
                    'timestamp' => $activityLog->created_at->diffForHumans(),
                    'details' => $activityLog->new_values,
                ];
            })
            ->toArray();
    }

}
