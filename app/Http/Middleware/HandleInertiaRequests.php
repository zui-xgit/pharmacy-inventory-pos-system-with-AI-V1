<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

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

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? [
                    'username' => $request->user()->username,
                    'firstname' => $request->user()->firstname,
                    'lastname' => $request->user()->lastname,
                    'email' => $request->user()->email,
                    'roles' => $request->user()->getRoleNames(),

                    // Add this line to attach their shop UUID dynamically (for manager or cashier)
                    // 'shop_uuid' => $request->user()->isManagerOrCashier()
                    //     ? $request->user()->shops()->first()?->uuid
                    //     : null,

                    // ⭐ Pass clean, simple flags directly to frontend
                    'isOwner' => $request->user()->hasRole('owner'),
                    'isManager' => $request->user()->hasRole('manager'),
                    'isCashier' => $request->user()->hasRole('cashier'),
                    'isOwnerOrManager' => $request->user()->hasAnyRole(['owner', 'manager']),
                    'isManagerOrCashier' => $request->user()->hasAnyRole(['manager', 'cashier']),
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
