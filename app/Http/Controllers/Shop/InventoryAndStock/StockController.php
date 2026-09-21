<?php

namespace App\Http\Controllers\Shop\InventoryAndStock;

use App\Http\Controllers\Controller;
use App\Models\Catalog\Product;
use App\Models\Core\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{
    // STOCK
    public function receiveStock(Request $request, Shop $shop)
    {
        $search_input = $request->input('search');
        $search = strtolower($search_input);

        $products = [];
        if (! empty($search)) {
            $products = Product::where('shop_id', $shop->id)
                ->where('name', 'LIKE', "%{$search}%")
                ->with(['dosageForm:id,uuid,name'])
                ->limit(20)
                ->get()
                ->map(function ($product) {
                    return [
                        'uuid' => $product->uuid,
                        'name' => $product->name,
                        'sku' => $product->sku,
                        'dosage_form' => [
                            'uuid' => $product->dosageForm?->uuid ?? null,
                            'name' => $product->dosageForm?->name ?? 'N/A',
                        ],

                    ];
                });
        }
        $dosage_forms = $shop->dosageForms()->get(['uuid', 'name']);

        return Inertia::render('shop/stock/receive-stock', [
            'products' => $products,
            'dosage_forms' => $dosage_forms,
            'filters' => $request->only(['search']),
            'shop_uuid' => $shop->uuid,
            'search_input' => $search_input,
        ]);
    }

    public function stockAdjustments() 
    {
           return Inertia::render("shop/stock/stock-history"); 
    }

    public function stockHistory(Shop $shop)
    {
        return Inertia::render('shop/stock/stock-history');
    }
}
