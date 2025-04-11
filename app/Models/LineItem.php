<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LineItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'bucket_id',
        'title',
        'percentage',
    ];

    protected $casts = [
        'percentage' => 'decimal:2',
    ];

    public function bucket(): BelongsTo
    {
        return $this->belongsTo(Bucket::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function getAmountAttribute(): float
    {
        return $this->bucket->amount * ($this->percentage / 100);
    }

    public function getSpentAttribute(): float
    {
        return $this->expenses->sum('amount');
    }
    public function getRemainingAttribute(): float
    {
        return $this->amount - $this->spent;
    }
}
