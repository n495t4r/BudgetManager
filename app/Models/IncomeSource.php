<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IncomeSource extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'amount',
        'is_active',
        'month_year',
        'team_id',
    ];
    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */

     protected $casts = [
        'amount' => 'decimal:2',
        'is_active' => 'boolean',
        'month_year' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}
