<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bucket extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'percentage',
        'team_id',
    ];
    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */

     protected $casts = [
        'percentage' => 'decimal:2',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lineItems(): HasMany
    {
        return $this->hasMany(LineItem::class);
    }

    public function getUserAmountAttribute(): float
    {
        return $this->user->total_income * ($this->percentage / 100);
    }

    public function getAmountAttribute(): float
    {
        return $this->total_income * ($this->percentage / 100);
    }
}
