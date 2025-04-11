<?php

// database/migrations/2025_04_08_000001_create_budget_plans_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('budget_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('team_id')->nullable()->constrained()->onDelete('set null');
            $table->string('period', 7)   // "YYYY-MM"
                  ->comment('e.g. 2025-04');
            $table->timestamps();

            $table->unique(['team_id','period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_plans');
    }
};
