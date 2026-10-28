<?php

namespace App\Http\Controllers;

use App\Models\Catalog\Batch;
use App\Models\Core\Shop;
use App\Models\Sales\Sale;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OverviewController extends Controller
{
    public function overview(Shop $shop): Response
    {
        $today = Carbon::today();
        $lowStockThreshold = $shop->low_stock_threshold ?? 10;
        $expiryDays = $shop->expiry_alert_days ?? 30;

        $totalSalesToday = (float) Sale::where('shop_id', $shop->id)
            ->where('status', 'completed')
            ->whereDate('created_at', $today)
            ->sum('total_amount');

        $transactionsToday = Sale::where('shop_id', $shop->id)
            ->where('status', 'completed')
            ->whereDate('created_at', $today)
            ->count();

        $totalProfitToday = 0;
        Sale::where('shop_id', $shop->id)
            ->where('status', 'completed')
            ->whereDate('created_at', $today)
            ->with('items')
            ->get()
            ->each(function ($sale) use (&$totalProfitToday) {
                $totalProfitToday += $sale->profit();
            });

        $lowStockCount = Batch::where('shop_id', $shop->id)
            ->where('units_remaining', '>', 0)
            ->where('units_remaining', '<=', $lowStockThreshold)
            ->count();

        $outOfStockCount = Batch::where('shop_id', $shop->id)
            ->where('units_remaining', '<=', 0)
            ->count();

        $expiringSoonCount = Batch::where('shop_id', $shop->id)
            ->whereDate('expiry_date', '>=', $today)
            ->whereDate('expiry_date', '<=', Carbon::now()->addDays($expiryDays))
            ->where('units_remaining', '>', 0)
            ->count();

        $expiredCount = Batch::where('shop_id', $shop->id)
            ->whereDate('expiry_date', '<', $today)
            ->where('units_remaining', '>', 0)
            ->count();

        $recentSales = Sale::where('shop_id', $shop->id)
            ->where('status', 'completed')
            ->with(['user:id,firstname,lastname'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function (Sale $sale) {
                return [
                    'receipt_number' => $sale->receipt_number,
                    'total_amount' => (float) $sale->total_amount,
                    'created_at' => $sale->created_at->format('Y-m-d H:i'),
                    'cashier' => $sale->user ? trim(($sale->user->firstname ?? '').' '.($sale->user->lastname ?? '')) : null,
                ];
            });

        $topProductsToday = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->where('sales.shop_id', $shop->id)
            ->where('sales.status', 'completed')
            ->whereDate('sales.created_at', $today)
            ->select('products.name', DB::raw('SUM(sale_items.quantity) as qty'), DB::raw('SUM(sale_items.subtotal) as revenue'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('qty')
            ->limit(5)
            ->get();

        return Inertia::render('shop/main/overview', [
            'stats' => [
                'totalSalesToday' => $totalSalesToday,
                'transactionsToday' => $transactionsToday,
                'totalProfitToday' => (float) $totalProfitToday,
                'lowStockCount' => $lowStockCount,
                'outOfStockCount' => $outOfStockCount,
                'expiringSoonCount' => $expiringSoonCount,
                'expiredCount' => $expiredCount,
            ],
            'recentSales' => $recentSales,
            'topProductsToday' => $topProductsToday,
            'shop' => [
                'name' => $shop->name,
                'uuid' => $shop->uuid,
            ],
        ]);
    }
}
