<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\Request;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Standard API response
     */
    protected function success($data = null, string $message = 'Success', int $status = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    /**
     * Error response
     */
    protected function error(string $message = 'Error', int $status = 400, $errors = null)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }

    /**
     * Paginated response
     */
    protected function paginated($paginator, string $message = 'Success')
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $paginator->items(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        ]);
    }

    /**
     * Validate and return validated data
     */
    protected function validateRequest(Request $request, array $rules, array $messages = [], array $customAttributes = [])
    {
        return $request->validate($rules, $messages, $customAttributes);
    }

    /**
     * Handle file uploads
     */
    protected function uploadFile(Request $request, string $field, string $directory = 'uploads'): ?string
    {
        if ($request->hasFile($field)) {
            $file = $request->file($field);
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path($directory), $filename);
            return $directory . '/' . $filename;
        }

        return null;
    }

    /**
     * Delete file
     */
    protected function deleteFile(?string $path): bool
    {
        if ($path && file_exists(public_path($path))) {
            return unlink(public_path($path));
        }

        return false;
    }

    /**
     * Get authenticated user with eager loading
     */
    protected function getAuthenticatedUser()
    {
        return auth()->user()->load(['profile', 'notifications' => function($query) {
            $query->unread()->limit(5);
        }]);
    }

    /**
     * Cache data for performance
     */
    protected function remember(string $key, $callback, int $minutes = 60)
    {
        return cache()->remember($key, $minutes, $callback);
    }

    /**
     * Forget cache
     */
    protected function forget(string $key): void
    {
        cache()->forget($key);
    }

    /**
     * Log activity
     */
    protected function logActivity(string $action, $subject = null, string $description = null, array $properties = [])
    {
        $activityLogService = app(\App\Services\ActivityLogService::class);
        $activityLogService->log($action, $subject, auth()->user(), $description, $properties);
    }
}