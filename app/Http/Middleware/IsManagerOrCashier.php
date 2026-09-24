<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class IsManagerOrCashier
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        $user = $request->user();

        if ($user && $user->isManagerOrCashier()) {
            $shop_uuid = $request->user()->shops()->first()?->uuid;
            Inertia::share('active_shop', [
                'uuid' => $shop_uuid,
            ]);
        }

        return $next($request);
    }
}
