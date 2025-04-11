<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Traits\HasTeam;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasTeam;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'team_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function incomeSources(): HasMany
    {
        return $this->hasMany(IncomeSource::class);
    }

    public function teamIncomeSources(): HasMany
    {
        return $this->hasMany(IncomeSource::class, 'team_id', 'team_id');
    }
    public function buckets(): HasMany
    {
        return $this->hasMany(Bucket::class);
    }

    public function teamBuckets(): HasMany
    {
        return $this->hasMany(Bucket::class, 'team_id', 'team_id');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function teamExpenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'team_id', 'team_id');
    }
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function getTotalIncomeAttribute(): float
    {
        return $this->incomeSources()
        ->where('is_active', true)
        ->sum('amount');
    }
}
