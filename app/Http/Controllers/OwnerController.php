<?php

namespace App\Http\Controllers;

use App\Models\Catalog\Batch;
use App\Models\Core\Shop;
use App\Models\Sales\Sale;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OwnerController extends Controller
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
        return Inertia::render('owner/overview/shops', [
            'shops' => $shops,
            'stats' => $businessStats,
            'filters' => $request->only(['search']),
        ]);
    }

    public function staff(): Response
    {
        return Inertia::render('owner/management/staff');
    }
}
