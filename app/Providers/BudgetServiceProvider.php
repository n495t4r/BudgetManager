<?php

namespace App\Providers;

use App\Services\ActivityLogService;
use App\Services\BudgetService;
use Illuminate\Support\ServiceProvider;

class BudgetServiceProvider extends ServiceProvider
{
    /**
     * The application's service providers.
     *
     * @var array<int, class-string>
     */
    protected $defer = true;

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(BudgetService::class, function ($app) {
            return new BudgetService();
        });

        $this->app->singleton(ActivityLogService::class, function ($app) {
            return new ActivityLogService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
