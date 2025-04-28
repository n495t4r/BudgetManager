<?php

namespace App\Http\Middleware;

use App\Models\Team;
use App\Services\DailyPrayerChain;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $tz = $request->cookie('user_tz') ?: 'UTC';
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $dailyPrayerList = DailyPrayerChain::getPrayersForSession($tz);

        // dd($dailyPrayerList);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'dailyPrayerChain' => $dailyPrayerList,
            'allPrayersLazy' => DailyPrayerChain::getAllPrayers($tz),
            'userTz' => $tz,
            'auth' => [
                'user' => $request->user(),
            ],
            'teams' => $request->user() ? Team::all() : null,
            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => $request->cookie('sidebar_state') === 'true',
        ];
    }
}
