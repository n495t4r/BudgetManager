<?php

namespace App\Traits;

use App\Models\Team;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

trait HasTeam
{
    public function team(): HasOne
    {
        return $this->hasOne(Team::class);
    }

    public function scopeOfTeam($query, $teamId)
    {
        return $query->where('team_id', $teamId);
    }

    /**
     * Check if the user is the owner of a team.
     */
    public function isTeamOwner(Team $team): bool
    {
        return $this->id === $team->owner_id;
    }

    //return BelongTo team owner relationship
    public function teamOwner(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'owner_id');
    }

    //return the user's team
    public function userTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_id');
    }



}
