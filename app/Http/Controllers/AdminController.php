<?php

namespace App\Http\Controllers;

use App\Models\Catalog\Batch;
use App\Models\Core\Shop;
use App\Models\Sales\Sale;
use App\Models\User;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Throwable;

class AdminController extends Controller
{
    

    public function createShop(Request $request): RedirectResponse
    {

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'phone' => ['required', 'string', 'max:50'],
        ]);

        try {
            DB::beginTransaction();

            Shop::create([
                'name' => $validated['name'],
                'location' => $validated['location'],
                'address' => $validated['address'],
                'phone' => $validated['phone'],
            ]);

            DB::commit();
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Shop created successfully.')]);

            return back();

        } catch (Exception $e) {

            DB::rollBack();

            report($e);

            return back()->withErrors([
                'error' => 'An internal error occurred while creating the shop.',
            ]);
        }
    }

    // return all shops
    public function shops(Request $request): Response
    {
        $today = Carbon::today();

        // 1. Load every shop with its total staff count. Business-wide stats and
        //    the visible list are both derived from this so search never skews
        //    the headline totals.
        $allShops = Shop::query()
            ->withCount('users as staff_count')
            ->orderBy('created_at', 'desc')
            ->get();

        $shopIds = $allShops->pluck('id');

        // 2. Revenue and transaction count for today, grouped by shop.
        $salesToday = Sale::query()
            ->whereIn('shop_id', $shopIds)
            ->where('status', 'completed')
            ->whereDate('created_at', $today)
            ->selectRaw('shop_id, SUM(total_amount) as total_sales, COUNT(*) as transactions')
            ->groupBy('shop_id')
            ->get()
            ->keyBy('shop_id');

        // 3. Low / out of stock counts. Low stock is relative to each shop's
        //    own threshold.
        $lowStockCounts = Batch::query()
            ->join('shops', 'shops.id', '=', 'batches.shop_id')
            ->whereIn('batches.shop_id', $shopIds)
            ->whereNull('batches.deleted_at')
            ->where('batches.units_remaining', '>', 0)
            ->whereColumn('batches.units_remaining', '<=', 'shops.low_stock_threshold')
            ->selectRaw('batches.shop_id as shop_id, COUNT(*) as total')
            ->groupBy('batches.shop_id')
            ->pluck('total', 'shop_id');

        $outOfStockCounts = Batch::query()
            ->whereIn('shop_id', $shopIds)
            ->where('units_remaining', '<=', 0)
            ->selectRaw('shop_id, COUNT(*) as total')
            ->groupBy('shop_id')
            ->pluck('total', 'shop_id');

        // 4. Expiring soon uses each shop's own alert window, so it is grouped
        //    by window rather than run once per shop.
        $expiringSoonCounts = [];
        $allShops
            ->groupBy(fn (Shop $shop) => $shop->expiry_alert_days ?? 30)
            ->each(function ($group, $days) use (&$expiringSoonCounts, $today) {
                $counts = Batch::query()
                    ->whereIn('shop_id', $group->pluck('id'))
                    ->where('units_remaining', '>', 0)
                    ->whereDate('expiry_date', '>=', $today)
                    ->whereDate('expiry_date', '<=', $today->copy()->addDays((int) $days))
                    ->selectRaw('shop_id, COUNT(*) as total')
                    ->groupBy('shop_id')
                    ->pluck('total', 'shop_id');

                foreach ($counts as $shopId => $total) {
                    $expiringSoonCounts[$shopId] = $total;
                }
            });

        // 5. Apply the live search on the already-loaded collection.
        $shops = $allShops;

        if ($request->filled('search')) {
            $search = mb_strtolower(trim($request->string('search')->toString()));

            $shops = $shops
                ->filter(fn (Shop $shop) => str_contains(mb_strtolower($shop->name), $search)
                    || str_contains(mb_strtolower($shop->location), $search))
                ->values();
        }

        // 6. Map the shop payload plus the per-shop stats used by the cards.
        $shops = $shops->map(function (Shop $shop) use ($salesToday, $lowStockCounts, $outOfStockCounts, $expiringSoonCounts): array {
            $sales = $salesToday->get($shop->id);

            return [
                'uuid' => $shop->uuid,
                'name' => $shop->name,
                'location' => $shop->location,
                'address' => $shop->address,
                'phone' => $shop->phone,
                'currency' => $shop->currency,
                'currency_symbol' => $shop->currency_symbol,
                'is_active' => $shop->is_active,
                'created_at' => $shop->created_at?->toIso8601String(),
                'stats' => [
                    'total_sales_today' => (float) ($sales->total_sales ?? 0),
                    'transactions_today' => (int) ($sales->transactions ?? 0),
                    'staff_count' => (int) $shop->staff_count,
                    'low_stock_count' => (int) ($lowStockCounts[$shop->id] ?? 0),
                    'out_of_stock_count' => (int) ($outOfStockCounts[$shop->id] ?? 0),
                    'expiring_soon_count' => (int) ($expiringSoonCounts[$shop->id] ?? 0),
                ],
            ];
        });

        // 7. Business-wide headline numbers, always across every shop.
        $lowStockAlerts = (int) $lowStockCounts->sum();
        $expiringSoonAlerts = (int) array_sum($expiringSoonCounts);

        $businessStats = [
            'totalShops' => $allShops->count(),
            'activeShops' => $allShops->where('is_active', true)->count(),
            'totalSalesToday' => (float) $salesToday->sum('total_sales'),
            'totalTransactionsToday' => (int) $salesToday->sum('transactions'),
            'totalStaff' => (int) $allShops->sum('staff_count'),
            'lowStockAlerts' => $lowStockAlerts,
            'expiringSoonAlerts' => $expiringSoonAlerts,
            'totalAlerts' => $lowStockAlerts + $expiringSoonAlerts,
            'currencySymbol' => $allShops->first()?->currency_symbol ?? 'TSh',
        ];

        // 8. Return the Inertia view with all the payload data
        return Inertia::render('admin/overview/shops', [
            'shops' => $shops,
            'stats' => $businessStats,
            'filters' => $request->only(['search']),
        ]);
    }

    public function staffManagement(Request $request): Response
    {
        $search = trim($request->string('search')->toString());
        $role = $request->string('role')->toString();
        $status = $request->string('status')->toString();
        $shop = $request->string('shop')->toString(); // NEW: shop uuid from the URL

        $staff = User::query()
            ->with(['roles:id,name', 'permissions:id,name', 'shops:id,uuid,name'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
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
            ->when($role !== '', fn ($query) => $query->role($role))
            ->when($status !== '', fn ($query) => $query->where('status', $status))
             // NEW: only users linked to the selected shop
            ->when($shop !== '', fn ($query) => $query->whereHas(
                'shops',
                fn ($q) => $q->where('shops.uuid', $shop),
            ))
            ->orderBy('firstname')
            ->orderBy('lastname')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user) => [
                'uuid' => $user->uuid,
                'firstname' => $user->firstname,
                'lastname' => $user->lastname,
                'username' => $user->username,
                'gender' => $user->gender,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getPermissionNames(),
                'shops' => $user->shops->map(fn ($shop) => [
                    'uuid' => $shop->uuid,
                    'name' => $shop->name,
                ])->values(),
                'created_at' => $user->created_at?->toIso8601String(),
            ]);

        $stats = [
            'total' => User::count(),
            'active' => User::where('status', 'active')->count(),
            'suspended' => User::where('status', 'suspended')->count(),
            'inactive' => User::where('status', 'inactive')->count(),
        ];

        return Inertia::render('admin/management/staff-management', [
            'staff' => $staff,
            'stats' => $stats,
            'available_roles' => Role::pluck('name'),
            'available_permissions' => Permission::pluck('name'),
            'available_shops' => Shop::query()
                ->orderBy('name')
                ->get(['uuid', 'name']),
            'filters' => [
                'search' => $search,
                'role' => $role,
                'status' => $status,
                'shop' => $shop,
            ],
        ]);
    }

    public function updateStaff(Request $request, User $user)
    {

        $validated = $request->validate([
            'firstname' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'phone' => ['required', 'string', 'max:30'],
            'role' => ['required', 'string', Rule::exists('roles', 'name')],
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
            'shops' => ['present', 'array'],
            'shops.*' => ['uuid', Rule::exists('shops', 'uuid')],
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

            // admins already have access to every shop, so keep no individual links
            $shopIds = $validated['role'] === 'admin'
            ? []
            : Shop::whereIn('uuid', $validated['shops'])->pluck('id')->all();

            $user->shops()->sync($shopIds);

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

    public function updateCredentials(Request $request, User $user)
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
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Staff Credentials updated successfully.')]);

            return back();
        } catch (Throwable $e) {
            DB::rollBack();

            return back()->withErrors([
                'credentials' => 'Could not update the credentials. Please try again.',
            ]);
        }
    }

    public function createStaff(Request $request): RedirectResponse
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
            'role' => ['required', 'string', Rule::exists('roles', 'name')],
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
            'shops' => ['present', 'array'],
            'shops.*' => ['uuid', Rule::exists('shops', 'uuid')],
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

            // Accounts are provisioned by an admin, so no email verification step is needed.
            $user->forceFill(['email_verified_at' => now()])->save();

            $user->assignRole($validated['role']);
            $user->syncPermissions($validated['permissions']);

            // admins already have access to every shop, so keep no individual links
            $shopIds = $validated['role'] === 'admin'
                ? []
                : Shop::whereIn('uuid', $validated['shops'])->pluck('id')->all();

            $user->shops()->sync($shopIds);

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

    public function activateStaff(User $user)
    {
        $user->update(['status' => 'active']);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Staff activated successfully.')]);

        return back();
    }

    

    public function suspendStaff(User $user)
    {
        $user->update(['status' => 'suspended']);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Staff suspended successfully.')]);

        return back();
    }

    public function activityLogs()
    {
        return Inertia::render('admin/management/activity-logs');

    }
}
