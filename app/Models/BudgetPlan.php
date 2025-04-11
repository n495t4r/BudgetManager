<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudgetPlan extends Model
{
    use HasFactory;

    protected $fillable = ['team_id','period'];

    public function team() {
        return $this->belongsTo(Team::class);
    }

    public function buckets() {
        return $this->hasMany(Bucket::class);
    }
}
