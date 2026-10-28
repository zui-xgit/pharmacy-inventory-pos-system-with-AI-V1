<?php

namespace App\Http\Controllers;

use App\Models\Catalog\Batch;
use App\Models\Catalog\Product;
use App\Models\Core\Shop;
use App\Models\Sales\Sale;
use App\Models\Sales\SaleItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportsAndInsightsController extends Controller
{
    public function salesReports(Request $request, Shop $shop): Response
    {
        $period = $request->input('period', 'today');
        $from = $request->input('from');
        $to = $request->input('to');

        $query = Sale::where('shop_id', $shop->id)->where('status', 'completed');

        switch ($period) {
            case 'today':
                $query->whereDate('created_at', Carbon::today());
                break;
            case 'yesterday':
                $query->whereDate('created_at', Carbon::yesterday());
                break;
            case 'week':
                $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
                break;
            case 'month':
                $query->whereMonth('created_at', Carbon::now()->month)->whereYear('created_at', Carbon::now()->year);
                break;
            case 'custom':
                if ($from && $to) {
                    $query->whereBetween('created_at', [Carbon::parse($from)->startOfDay(), Carbon::parse($to)->endOfDay()]);
                }
                break;
        }

        $sales = (clone $query)->with(['user:id,firstname,lastname', 'items.product:id,name'])
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(function (Sale $sale) {
                return [
                    'uuid' => $sale->uuid,
                    'receipt_number' => $sale->receipt_number,
                    'total_amount' => (float) $sale->total_amount,
                    'discount' => (float) $sale->discount,
                    'payment_method' => $sale->payment_method,
                    'status' => $sale->status,
                    'created_at' => $sale->created_at->format('Y-m-d H:i:s'),
                    'cashier' => $sale->user ? trim(($sale->user->firstname ?? '').' '.($sale->user->lastname ?? '')) : null,
                    'items_count' => $sale->items->count(),
                    'profit' => $sale->profit(),
                ];
            });

        $totalSales = (clone $query)->sum('total_amount');
        $totalTransactions = (clone $query)->count();
        $totalProfit = 0;
        foreach ((clone $query)->with('items')->get() as $sale) {
            $totalProfit += $sale->profit();
        }

        $topProducts = SaleItem::whereHas('sale', function ($q) use ($shop, $query) {
            $q->where('shop_id', $shop->id)->where('status', 'completed');
            if ($query->getQuery()->wheres) {
                // simpler: recompute
            }
        })
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sales.shop_id', $shop->id)
            ->where('sales.status', 'completed')
            ->when($period === 'today', fn($q) => $q->whereDate('sales.created_at', Carbon::today()))
            ->when($period === 'yesterday', fn($q) => $q->whereDate('sales.created_at', Carbon::yesterday()))
            ->when($period === 'week', fn($q) => $q->whereBetween('sales.created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]))
            ->when($period === 'month', fn($q) => $q->whereMonth('sales.created_at', Carbon::now()->month)->whereYear('sales.created_at', Carbon::now()->year))
            ->when($period === 'custom' && $from && $to, fn($q) => $q->whereBetween('sales.created_at', [Carbon::parse($from)->startOfDay(), Carbon::parse($to)->endOfDay()]))
            ->select('sale_items.product_id', DB::raw('SUM(sale_items.quantity) as total_qty'), DB::raw('SUM(sale_items.subtotal) as total_revenue'), DB::raw('SUM((sale_items.unit_price - sale_items.cost_price) * sale_items.quantity) as total_profit'))
            ->groupBy('sale_items.product_id')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->with('product:id,name')
            ->get();

        return Inertia::render('shop/reports/sales', [
            'sales' => $sales,
            'summary' => [
                'totalSales' => (float) $totalSales,
                'totalTransactions' => $totalTransactions,
                'totalProfit' => (float) $totalProfit,
            ],
            'topProducts' => $topProducts,
            'filters' => [
                'period' => $period,
                'from' => $from,
                'to' => $to,
            ],
            'shop_uuid' => $shop->uuid,
        ]);
    }

    public function inventoryReports(Request $request, Shop $shop): Response
    {
        $search = $request->string('search')->trim()->lower()->toString();

        $batchesQuery = Batch::where('shop_id', $shop->id)
            ->with(['product:id,uuid,name,dosage_form_id', 'product.dosageForm:id,name']);

        if ($search !== '') {
            $batchesQuery->where(function ($q) use ($search) {
                $q->where('batch_number', 'LIKE', "%{$search}%")
                    ->orWhereHas('product', function ($pq) use ($search) {
                        $pq->where('name', 'LIKE', "%{$search}%");
                    });
            });
        }

        $batches = $batchesQuery
            ->orderBy('expiry_date')
            ->paginate(20)
            ->withQueryString()
            ->through(function (Batch $batch) use ($shop) {
                return [
                    'uuid' => $batch->uuid,
                    'batch_number' => $batch->batch_number,
                    'product' => [
                        'name' => $batch->product->name,
                        'dosage_form' => $batch->product->dosageForm->name ?? null,
                    ],
                    'units_remaining' => $batch->units_remaining,
                    'packages_remaining' => $batch->packages_remaining,
                    'cost_price' => (float) $batch->cost_price,
                    'selling_price' => (float) $batch->selling_price,
                    'expiry_date' => $batch->expiry_date->format('Y-m-d'),
                    'manufactured_date' => $batch->manufactured_date->format('Y-m-d'),
                    'is_expired' => $batch->isExpired(),
                    'is_expiring_soon' => $batch->isExpiringSoon($shop->expiry_alert_days),
                    'days_until_expiry' => $batch->daysUntilExpiry(),
                    'is_out_of_stock' => $batch->isOutOfStock(),
                    'stock_value' => (float) $batch->units_remaining * (float) $batch->cost_price,
                ];
            });

        $totalProducts = Product::where('shop_id', $shop->id)->count();
        $totalBatches = Batch::where('shop_id', $shop->id)->count();
        $outOfStock = Batch::where('shop_id', $shop->id)->where('units_remaining', '<=', 0)->count();
        $expired = Batch::where('shop_id', $shop->id)->whereDate('expiry_date', '<', Carbon::today())->count();
        $expiringSoon = Batch::where('shop_id', $shop->id)
            ->whereDate('expiry_date', '>=', Carbon::today())
            ->whereDate('expiry_date', '<=', Carbon::now()->addDays($shop->expiry_alert_days))
            ->count();
        $totalStockValue = Batch::where('shop_id', $shop->id)->sum(DB::raw('units_remaining * cost_price'));

        $lowStockProducts = Product::where('shop_id', $shop->id)
            ->with(['batches'])
            ->get()
            ->filter(function ($product) {
                $total = $product->batches->sum('units_remaining');
                $threshold = $product->reorder_point ?? 10;
                return $total > 0 && $total <= $threshold;
            })
            ->take(10)
            ->map(function ($product) {
                $total = $product->batches->sum('units_remaining');
                return [
                    'name' => $product->name,
                    'total_units' => $total,
                    'reorder_point' => $product->reorder_point ?? 10,
                ];
            })
            ->values();

        return Inertia::render('shop/reports/inventory', [
            'batches' => $batches,
            'summary' => [
                'totalProducts' => $totalProducts,
                'totalBatches' => $totalBatches,
                'outOfStock' => $outOfStock,
                'expired' => $expired,
                'expiringSoon' => $expiringSoon,
                'totalStockValue' => (float) $totalStockValue,
            ],
            'lowStockProducts' => $lowStockProducts,
            'filters' => $request->only(['search']),
            'shop_uuid' => $shop->uuid,
        ]);
    }
}
