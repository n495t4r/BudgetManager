<?php

use App\Models\Expense;
use App\Models\Team;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('an expense can be created and is associated with a team and a line item', function () {
    // Create a team with:
    // - 3 users, and
    // - at least one bucket that has at least 2 line items.
    $team = Team::factory()->hasUsers(3)->has(
        \App\Models\Bucket::factory()->has(
            \App\Models\LineItem::factory()->count(2),
            'lineItems'
        ),
        'buckets'
    )->create();

    // Create an expense for the team.
    $expense = Expense::factory()->for($team)->create();

    // Verify the expense is associated with the team.
    expect($expense->team_id)->toBe($team->id);
    // The after-making/after-creating logic in ExpenseFactory should ensure a line_item_id.
    expect($expense->line_item_id)->not->toBeNull();
});
