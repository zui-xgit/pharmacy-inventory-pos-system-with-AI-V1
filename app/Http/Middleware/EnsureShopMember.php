<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureShopMember
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        $user = $request->user();

        // using route model binding which is a laravel default feature.
        $shop = $request->route('shop');

        // 1. First, make sure we actually have a logged-in user and a valid shop model
        if (! $user || ! $shop) {
            abort(403, 'Invalid request or unauthenticated session.');
        }

        // Owners can access any shop
        if (! $user->hasRole('owner')) {
            // Managers/cashiers must belong to this shop
            if (! $user->belongsToShop($shop->id)) {
                abort(
                    403,
                    'You do not have permission to access this pharmacy branch.'
                );
            }
        }

        Inertia::share('activeShop', [
            'uuid' => $shop->uuid,
            'name' => $shop->name,
        ]);

        return $next($request);
    }
}
