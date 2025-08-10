<?php


namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;


class CustomAuth
{
    public function handle(Request $request, Closure $next)
    {
        if (empty(session('user'))) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            return redirect('/login');
        }

        return $next($request);
    }
}
