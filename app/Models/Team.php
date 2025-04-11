<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'owner_id'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function buckets(): HasMany
    {
        return $this->hasMany(Bucket::class);
    }

    public function incomeSources(): HasMany
    {
        return $this->hasMany(IncomeSource::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }
}
