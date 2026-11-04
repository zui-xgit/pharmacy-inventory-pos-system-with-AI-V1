<?php

namespace App\Http\Controllers;

use App\Models\Core\Shop;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Throwable;

class ShopStaffController extends Controller
{
    /**
     * Roles a shop can assign to its own staff.
     *
     * @var list<string>
     */
    private const SHOP_ROLES = ['manager', 'cashier'];

    /**
     * Show the staff assigned to the given shop.
     */
    public function staffEdit(Request $request, Shop $shop): Response
    {

        $search = trim($request->string('search')->toString());
        $role = $request->string('role')->toString();
        $status = $request->string('status')->toString();

        $staff = $this->shopStaffQuery($shop)
            ->with(['roles:id,name', 'permissions:id,name', 'shops:id,uuid,name'])
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('firstname', 'like', "%{$search}%")
                        ->orWhere('lastname', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereRaw(
                            "CONCAT(firstname, ' ', lastname) LIKE ?",
                            ["%{$search}%"],
                        );
                });
            })
            ->when($role !== '', fn (Builder $query) => $query->role($role))
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->orderBy('firstname')
            ->orderBy('lastname')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user) => [
                'uuid' => $user->uuid,
                'name' => trim($user->firstname.' '.$user->lastname),
                'firstname' => $user->firstname,
                'lastname' => $user->lastname,
                'username' => $user->username,
                'gender' => $user->gender,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getPermissionNames(),
                'shops' => $user->shops->map(fn (Shop $assignedShop) => [
                    'uuid' => $assignedShop->uuid,
                    'name' => $assignedShop->name,
                ])->values(),
                'created_at' => $user->created_at?->toIso8601String(),
            ]);

        $stats = [
            'total' => $this->shopStaffQuery($shop)->count(),
            'active' => $this->shopStaffQuery($shop)->where('status', 'active')->count(),
            'inactive' => $this->shopStaffQuery($shop)->where('status', 'inactive')->count(),
            'suspended' => $this->shopStaffQuery($shop)->where('status', 'suspended')->count(),
        ];

        return Inertia::render('shop/system/shop-staff', [
            'staff' => $staff,
            'stats' => $stats,
            'available_roles' => $this->assignableRoles(),
            'available_permissions' => Permission::orderBy('name')->pluck('name'),
            'available_shops' => [
                ['uuid' => $shop->uuid, 'name' => $shop->name],
            ],
            'shop' => [
                'uuid' => $shop->uuid,
                'name' => $shop->name,
            ],
            'filters' => [
                'search' => $search,
                'role' => $role,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Create a staff account and assign it to this shop.
     */
    public function createStaff(Request $request, Shop $shop): RedirectResponse
    {

        $validated = $request->validate([
            'firstname' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:255',
                'regex:/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/',
                Rule::unique(User::class),
            ],
            'email' => ['required', 'email', 'max:255', Rule::unique(User::class)],
            'phone' => ['required', 'string', 'max:30'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'string', Rule::exists('roles', 'name'), Rule::in(self::SHOP_ROLES)],
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ]);

        DB::beginTransaction();

        try {
            $user = User::create([
                'firstname' => $validated['firstname'],
                'lastname' => $validated['lastname'],
                'username' => $validated['username'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'gender' => $validated['gender'],
                'password' => $validated['password'],
            ]);

            // Accounts are provisioned by shop management, so no email verification step is needed.
            $user->forceFill(['email_verified_at' => now()])->save();

            $user->assignRole($validated['role']);
            $user->syncPermissions($validated['permissions']);

            // Staff created from a shop are always linked to that shop only.
            $user->shops()->sync([$shop->id]);

            DB::commit();
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Staff created successfully.')]);

            return back();
        } catch (Throwable $e) {
            DB::rollBack();

            return back()->withErrors([
                'staff' => 'Could not create the staff member. Please try again.',
            ]);
        }
    }

    /**
     * Update a staff member that belongs to this shop.
     */
    public function updateStaff(Request $request, Shop $shop, User $user): RedirectResponse
    {

        $validated = $request->validate([
            'firstname' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'phone' => ['required', 'string', 'max:30'],
            'role' => ['required', 'string', Rule::exists('roles', 'name'), Rule::in(self::SHOP_ROLES)],
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ]);

        DB::beginTransaction();

        try {
            $user->forceFill([
                'firstname' => $validated['firstname'],
                'lastname' => $validated['lastname'],
                'email' => $validated['email'],
                'gender' => $validated['gender'],
                'phone' => $validated['phone'],
            ])->save();

            $user->syncRoles($validated['role']);
            $user->syncPermissions($validated['permissions']);

            // Shop assignments are managed per shop, so other shops stay untouched.
            DB::commit();
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Staff updated successfully.')]);

            return back();
        } catch (Throwable $e) {
            DB::rollBack();

            return back()->withErrors([
                'staff' => 'Could not update the staff member. Please try again.',
            ]);
        }
    }

    /**
     * Update the login credentials of a staff member in this shop.
     */
    public function updateCredentials(Request $request, Shop $shop, User $user): RedirectResponse
    {

        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'max:255',
                'regex:/^[A-Za-z0-9._-]+$/',
                Rule::unique(User::class)->ignore($user->id),
            ],
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ]);


        DB::beginTransaction();

        try {
            $user->username = $validated['username'];

            
            if (filled($validated['password'] ?? null)) {
                $user->password = $validated['password'];
            }

            $user->save();

            DB::commit();
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Staff credentials updated successfully.')]);

            return back();
        } catch (Throwable $e) {
            DB::rollBack();

            return back()->withErrors([
                'credentials' => 'Could not update the credentials. Please try again.',
            ]);
        }
    }

    /**
     * Activate a staff member of this shop.
     */
    public function activateStaff(Shop $shop, User $user)
    {
        $user->update(['status' => 'active']);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Staff activated successfully.')]);

        return back();
    }
   

   

    public function suspendStaff(Shop $shop, User $user)
    {

        $user->update(['status' => 'suspended']);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Staff suspended successfully.')]);

        return back();
    }
    /**
     * Base query for users attached to the shop, excluding administrators.
     *
     * @return Builder<User>
     */
    private function shopStaffQuery(Shop $shop): Builder
    {
        return User::query()
            ->whereHas('shops', fn (Builder $query) => $query->where('shops.id', $shop->id))
            ->whereDoesntHave('roles', fn (Builder $query) => $query->where('name', 'admin'));
    }

   
   

    

    /**
     * Roles a shop page is allowed to assign.
     *
     * @return array<int, string>
     */
    private function assignableRoles(): array
    {
        return Role::query()
            ->whereIn('name', self::SHOP_ROLES)
            ->orderBy('name')
            ->pluck('name')
            ->all();
    }
}
