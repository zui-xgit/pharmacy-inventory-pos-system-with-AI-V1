<?php

namespace App\Http\Controllers\Shop\Main;

use App\Http\Controllers\Controller;
use App\Models\Catalog\Product;
use App\Models\Core\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PosController extends Controller
{
    //

   public function posIndex(Request $request, Shop $shop)
    {
        $search_input = $request->input('search');
        $search = strtolower($search_input);

        $products = collect(); 

        if (!empty($search)) {
            $products = Product::where('shop_id', $shop->id)
                ->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhereHas('dosageForm', function ($dosageQuery) use ($search) {
                          $dosageQuery->where('name', 'LIKE', "%{$search}%");
                      });
                })
                ->whereHas('batches', function ($query) {
                    $query->where('units_remaining', '>', 0)
                          ->where('expiry_date', '>', now());
                })
                ->with([
                    'dosageForm' => function ($query) {
                        $query->select('id', 'uuid', 'name');
                    },
                    'batches' => function ($query) {
                        $query->where('units_remaining', '>', 0)
                              ->where('expiry_date', '>', now())
                              ->orderBy('expiry_date', 'asc'); // FEFO Order
                    },
                ])
                ->paginate(15)
                ->withQueryString() // Preserves the search parameter in pagination links
                ->through(function ($product) {
                    $firstBatch = $product->batches->first();

                    return [
                        'uuid' => $product->uuid,
                        'name' => $product->name,
                        'dosage_form' => [
                            'uuid' => $product->dosageForm?->uuid,
                            'name' => $product->dosageForm?->name ?? 'N/A',
                        ],
                        'total_stock' => $product->batches->sum('units_remaining'),
                        'selling_price' => $firstBatch?->selling_price ?? 0,
                        'batches' => $product->batches->map(function ($batch) {
                            return [
                                'id' => $batch->id,
                                'uuid' => $batch->uuid,
                                'batch_number' => $batch->batch_number,
                                'units_remaining' => $batch->units_remaining,
                                'packages_remaining' => $batch->packages_remaining,
                                'expiry_date' => $batch->expiry_date,
                                'selling_price' => $batch->selling_price,
                            ];
                        })->values(),
                    ];
                });
        }

        return Inertia::render('shop/main/pos', [
            'products' => $products, 
            'filters' => $request->only(['search']),
        ]); 
    }
}
