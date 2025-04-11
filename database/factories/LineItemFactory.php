<?php

namespace Database\Factories;

use App\Models\LineItem;
use App\Models\Bucket;
use Illuminate\Database\Eloquent\Factories\Factory;

class LineItemFactory extends Factory
{
    protected $model = LineItem::class;

    public function definition(): array
    {
        return [
            // 'bucket_id' => Bucket::factory(),
            'title' => $this->faker->word,
            'percentage' => $this->faker->randomFloat(2, 0, 100),
        ];
    }

   }
