<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        $user = $request->user(); 
        
        if ($user && in_array($user->status, ['inactive', 'suspended'])) {
            $route = $user->status === 'suspended'
                ? 'account.suspended'
                : 'account.inactive';

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route($route);
        }
        return $next($request);
    }
}
