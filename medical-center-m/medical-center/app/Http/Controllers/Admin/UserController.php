<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('profile', 'doctor.specialization');

        // Search
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by role
        if ($request->role) {
            $query->where('role_type', $request->role);
        }

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role_type' => ['required', Rule::in(['admin', 'doctor', 'receptionist'])],
            'status' => ['required', Rule::in(['active', 'inactive', 'suspended'])],
            'profile' => ['nullable', 'array'],
            'profile.date_of_birth' => ['nullable', 'date'],
            'profile.gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'profile.phone' => ['nullable', 'string', 'max:20'],
            'profile.address' => ['nullable', 'string', 'max:500'],
            'profile.city' => ['nullable', 'string', 'max:100'],
            'profile.country' => ['nullable', 'string', 'max:100'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role_type' => $validated['role_type'],
            'status' => $validated['status'],
        ]);

        // Create profile if provided
        if (!empty($validated['profile'])) {
            $user->profile()->create($validated['profile']);
        }

        // Create doctor record if role is doctor
        if ($validated['role_type'] === 'doctor') {
            $user->doctor()->create([
                'license_number' => 'DOC-' . strtoupper(uniqid()),
                'experience_years' => 0,
                'consultation_fee' => 100.00,
                'is_available' => true,
            ]);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'تم إنشاء المستخدم بنجاح');
    }

    public function show(User $user)
    {
        $user->load(['profile', 'doctor.specialization', 'activityLogs' => function($query) {
            $query->latest()->limit(10);
        }]);

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        $user->load(['profile', 'doctor.specialization']);

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'role_type' => ['required', Rule::in(['admin', 'doctor', 'receptionist'])],
            'status' => ['required', Rule::in(['active', 'inactive', 'suspended'])],
            'profile' => ['nullable', 'array'],
            'profile.date_of_birth' => ['nullable', 'date'],
            'profile.gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'profile.phone' => ['nullable', 'string', 'max:20'],
            'profile.address' => ['nullable', 'string', 'max:500'],
            'profile.city' => ['nullable', 'string', 'max:100'],
            'profile.country' => ['nullable', 'string', 'max:100'],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role_type' => $validated['role_type'],
            'status' => $validated['status'],
        ]);

        // Update or create profile
        if (!empty($validated['profile'])) {
            $user->profile()->updateOrCreate([], $validated['profile']);
        }

        // Create doctor record if role changed to doctor
        if ($validated['role_type'] === 'doctor' && !$user->doctor) {
            $user->doctor()->create([
                'license_number' => 'DOC-' . strtoupper(uniqid()),
                'experience_years' => 0,
                'consultation_fee' => 100.00,
                'is_available' => true,
            ]);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'تم تحديث المستخدم بنجاح');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'لا يمكنك حذف حسابك الخاص');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'تم حذف المستخدم بنجاح');
    }

    public function toggleStatus(User $user)
    {
        $newStatus = $user->status === 'active' ? 'inactive' : 'active';
        $user->update(['status' => $newStatus]);

        return back()->with('success', "تم {$newStatus === 'active' ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح");
    }
}