<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CacheResponse
{
    public function handle(Request $request, Closure $next, int $minutes = 5)
    {
        if ($request->isMethod('GET') && !$request->user()) {
            $cacheKey = 'response_' . md5($request->fullUrl());
            
            return Cache::remember($cacheKey, $minutes, function () use ($request, $next) {
                return $next($request);
            });
        }

        return $next($request);
    }
}