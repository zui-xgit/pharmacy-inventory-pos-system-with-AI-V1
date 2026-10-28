<?php

namespace App\Http\Controllers;

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

        $sales = (clone $query)->with(['user:id,first_name,last_name', 'items.product:id,name'])
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
                    'cashier' => $sale->user ? trim($sale->user->first_name.' '.$sale->user->last_name) : null,
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

    public function inventoryReports(Shop $shop): Response
    {
        return Inertia::render('shop/reports/inventory');
    }
}
