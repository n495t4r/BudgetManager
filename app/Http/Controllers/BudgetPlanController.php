<?php

namespace App\Http\Controllers;

use App\Models\BudgetPlan;
use Illuminate\Http\Request;

class BudgetPlanController extends Controller
{
    public function store(Request $r)
    {
        $r->validate(['period'=>'required|date_format:Y-m']);
        $plan = BudgetPlan::create([
            'team_id'=>auth()->user()->team_id,
            'period'=>$r->period
        ]);
        return back()->with('success','Plan created');
    }
}
