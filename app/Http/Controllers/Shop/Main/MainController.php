<?php

namespace App\Http\Controllers\Shop\Main;

use App\Http\Controllers\Controller;
use App\Models\Core\Shop;
use App\Models\Inventory\Alert;
use App\Models\Sales\Sale;
use App\Models\Sales\SaleItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MainController extends Controller
{
    //

    public function overview(Shop $shop)
    {

        $today = today();

        $totalSalesToday = Sale::where('shop_id', $shop->id)
            ->whereDate('created_at', $today)
            ->where('status', 'completed')
            ->count();

        $totalRevenueToday = Sale::where('shop_id', $shop->id)
            ->whereDate('created_at', $today)
            ->where('status', 'completed')
            ->sum('total_amount');

        // ── Alert stats ───────────────────────────────────────────────────────

        $lowStockCount = Alert::where('shop_id', $shop->id)
            ->where('type', 'low_stock')
            ->where('status', 'unread')
            ->count();

        $expiringSoonCount = Alert::where('shop_id', $shop->id)
            ->where('type', 'expiry')
            ->where('status', 'unread')
            ->count();

        // ── Recent sales ──────────────────────────────────────────────────────

        $recentSales = Sale::where('shop_id', $shop->id)
            ->whereDate('created_at', $today)
            ->where('status', 'completed')
            ->with(['user:id,name', 'items:id,sale_id'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($sale) => [
                'id' => $sale->id,
                'receipt_number' => $sale->receipt_number,
                'cashier_name' => $sale->user->name,
                'items_count' => $sale->items->count(),
                'total_amount' => number_format($sale->total_amount, 2),
                'payment_method' => $sale->payment_method,
                'time' => $sale->created_at->format('h:i A'),
            ]);

        // ── Top selling products ──────────────────────────────────────────────

        $topProducts = SaleItem::query()
            ->whereHas('sale', function ($query) use ($shop, $today) {
                $query->where('shop_id', $shop->id)
                    ->whereDate('created_at', $today)
                    ->where('status', 'completed');
            })
            ->with(['product.dosageForm'])
            ->get() // Fetch records safely using framework drivers
            ->groupBy('product_id')
            ->map(function ($items) {
                $firstItem = $items->first();

                return [
                    'id' => $firstItem->product_id,
                    'name' => $firstItem->product?->name,
                    'form' => $firstItem->product?->dosageForm?->name ?? 'N/A',
                    'units_sold' => (int) $items->sum('quantity'),   // Pure collection math
                    'revenue' => (float) $items->sum('subtotal'), // Pure collection math
                ];
            })
            ->sortByDesc('units_sold')
            ->take(5)
            ->values()
            ->map(fn ($product) => [
                'id' => $product['id'],
                'name' => $product['name'],
                'form' => $product['form'],
                'units_sold' => $product['units_sold'],
                'revenue' => number_format($product['revenue'], 2),
            ]);

        // ── Render ────────────────────────────────────────────────────────────

        return Inertia::render('shop/main/overview', [
            'shop' => [
                'id' => $shop->uuid,
                'name' => $shop->name,
                'currency_symbol' => $shop->currency_symbol,
            ],
            'stats' => [
                'total_sales_today' => $totalSalesToday,
                'total_revenue_today' => number_format($totalRevenueToday, 2),
                'low_stock_count' => $lowStockCount,
                'expiring_soon_count' => $expiringSoonCount,
            ],
            'recent_sales' => $recentSales,
            'top_products' => $topProducts,
        ]);
    }
}
