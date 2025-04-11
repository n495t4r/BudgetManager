<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'user_id',
        'action',
        'loggable_type',
        'loggable_id',
        'old_values',
        'new_values',
        'team_id',
    ];
    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function loggable(): MorphTo
    {
        return $this->morphTo();
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}
