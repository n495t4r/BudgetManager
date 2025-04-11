<?php

namespace Database\Factories;

use App\Models\Expense;
use App\Models\Bucket;
use App\Models\LineItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    public function definition(): array
    {
        return [
            'user_id' => null, // Will be set via relationship or left for later assignment
            // Remove direct assignment of line_item_id from here:
            // 'line_item_id' => LineItem::factory(),
            'date' => $this->faker->dateTimeThisMonth()->format('Y-m-d'),
            'description' => $this->faker->sentence,
            'amount' => $this->faker->randomFloat(2, 10, 1000),
            // Do not assign team_id here; let it be set via parent relationship.
        ];
    }

    // public function configure()
    // {
    //     return $this->afterMaking(function (Expense $expense) {
    //         if (!$expense->line_item_id && $expense->team_id) {
    //             // Try to find a bucket that belongs to the same team
    //             $bucket = \App\Models\Bucket::where('team_id', $expense->team_id)->inRandomOrder()->first();
    //             if ($bucket) {
    //                 // Try to get a random line item from the bucket
    //                 $lineItem = $bucket->lineItems()->inRandomOrder()->first();
    //                 if (!$lineItem) {
    //                     // Create a new line item for the bucket if none exists
    //                     $lineItem = LineItem::factory()->create(['bucket_id' => $bucket->id]);
    //                 }
    //                 $expense->line_item_id = $lineItem->id;
    //             } else {
    //                 // If no bucket exists for this team, create one and a line item
    //                 $bucket = \App\Models\Bucket::factory()->create(['team_id' => $expense->team_id]);
    //                 $lineItem = LineItem::factory()->create(['bucket_id' => $bucket->id]);
    //                 $expense->line_item_id = $lineItem->id;
    //             }
    //         }
    //     })->afterCreating(function (Expense $expense) {
    //         if (!$expense->line_item_id && $expense->team_id) {
    //             $bucket = \App\Models\Bucket::where('team_id', $expense->team_id)->inRandomOrder()->first();
    //             if ($bucket) {
    //                 $lineItem = $bucket->lineItems()->inRandomOrder()->first();
    //                 if (!$lineItem) {
    //                     $lineItem = LineItem::factory()->create(['bucket_id' => $bucket->id]);
    //                 }
    //                 $expense->line_item_id = $lineItem->id;
    //                 $expense->save();
    //             }
    //         }
    //     });
    // }
}
