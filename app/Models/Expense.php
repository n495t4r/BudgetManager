<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_plan_id',
        'user_id',
        'line_item_id',
        'date',
        'amount',
        'description',
        'team_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date',
    ];
    public function plan() {
        return $this->belongsTo(BudgetPlan::class, 'budget_plan_id');
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lineItem(): BelongsTo
    {
        return $this->belongsTo(LineItem::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}
