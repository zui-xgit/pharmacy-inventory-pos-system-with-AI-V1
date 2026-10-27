<?php

namespace App\Http\Controllers\Shop\InventoryAndStock;

use App\Enum\StockMovementReason;
use App\Enum\StockMovementType;
use App\Http\Controllers\Controller;
use App\Models\Catalog\Batch;
use App\Models\Catalog\Product;
use App\Models\Core\Shop;
use App\Models\Inventory\StockMovement;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class StockController extends Controller
{
    // STOCK
    public function receiveStock(Request $request, Shop $shop): Response
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
                ->map(function (Product $product): array {
                    return [
                        'uuid' => $product->uuid,
                        'name' => $product->name,
                        'dosage_form' => [
                            'uuid' => $product->dosageForm->uuid,
                            'name' => $product->dosageForm->name,
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

    public function stockAdjustments(Request $request, Shop $shop): Response
    {
        $search = $request->string('search')->trim()->lower()->toString();

        $query = Batch::where('shop_id', $shop->id);

        if ($search === '') {
            // Keep the results empty until the user actually searches.
            $query->whereRaw('1 = 0');
        } else {
            $query->where(function ($q) use ($search) {
                $q->where('batch_number', 'LIKE', "%{$search}%")
                    ->orWhereHas('product', function ($productQuery) use ($search) {
                        $productQuery->where('name', 'LIKE', "%{$search}%");
                    });
            });
        }

        $batches = $query
            ->with([
                'product:id,uuid,name,dosage_form_id',
                'product.dosageForm:id,name',
            ])
            ->orderBy('expiry_date')
            ->paginate(15)
            ->withQueryString()
            ->through(function (Batch $batch) use ($shop): array {
                return [
                    'uuid' => $batch->uuid,
                    'batch_number' => $batch->batch_number,

                    'product' => [
                        'uuid' => $batch->product->uuid,
                        'name' => $batch->product->name,
                        'dosage_form' => $batch->product->dosageForm->name,
                    ],

                    // Receiving quantities
                    'packages_received' => $batch->packages_received,
                    'units_per_package_received' => $batch->units_per_package_received,
                    'total_units_received' => $batch->packages_received * $batch->units_per_package_received,

                    // Current stock
                    'packages_remaining' => $batch->packages_remaining,
                    'units_remaining' => $batch->units_remaining,
                    'is_out_of_stock' => $batch->isOutOfStock(),

                    // Pricing
                    'cost_price' => $batch->cost_price,
                    'selling_price' => $batch->selling_price,

                    // Dates
                    'manufactured_date' => $batch->manufactured_date->format('Y-m-d'),
                    'expiry_date' => $batch->expiry_date->format('Y-m-d'),
                    'is_expired' => $batch->isExpired(),
                    'is_expiring_soon' => $batch->isExpiringSoon($shop->expiry_alert_days),
                    'days_until_expiry' => $batch->daysUntilExpiry(),
                ];
            });

        return Inertia::render('shop/stock/stock-adjustments', [
            'batches' => $batches,
            'filters' => $request->only(['search']),
            'shop_uuid' => $shop->uuid,
        ]);
    }

    /**
     * Apply a manual stock adjustment to a single batch.
     *
     * The batch quantity/dates are corrected and an append-only stock_movements
     * row is written so every adjustment is auditable. Its quantity is the
     * absolute difference between the old and new stock (0 for date-only edits).
     */
    public function adjustStock(Request $request, Shop $shop): RedirectResponse
    {
        $validated = $request->validate([
            'batch_uuid' => [
                'required',
                'uuid',
                Rule::exists('batches', 'uuid')
                    ->where('shop_id', $shop->id)
                    ->whereNull('deleted_at'),
            ],
            'units_remaining' => ['required', 'integer', 'min:0'],
            'manufactured_date' => ['required', 'date', 'before_or_equal:today'],
            'expiry_date' => ['required', 'date', 'after:manufactured_date'],
            'notes' => ['nullable', 'string', 'max:1000', 'min:2'],
        ]);

        try {
            DB::beginTransaction();

            $batch = Batch::where('uuid', $validated['batch_uuid'])
                ->where('shop_id', $shop->id)
                ->lockForUpdate()
                ->firstOrFail();

            $previousStock = $batch->units_remaining;
            $newStock = (int) $validated['units_remaining'];
            $difference = $newStock - $previousStock;

            // Keep the package counter in sync with the corrected unit count.
            $packagesRemaining = $batch->units_per_package_received > 0
                ? intdiv($newStock, $batch->units_per_package_received)
                : $batch->packages_remaining;

            $batch->update([
                'units_remaining' => $newStock,
                'packages_remaining' => $packagesRemaining,
                'manufactured_date' => $validated['manufactured_date'],
                'expiry_date' => $validated['expiry_date'],
            ]);

            StockMovement::create([
                'batch_id' => $batch->id,
                'user_id' => Auth::id(),
                'type' => $difference >= 0 ? StockMovementType::IN : StockMovementType::OUT,
                'reason' => StockMovementReason::ADJUSTMENT,
                'quantity' => abs($difference),
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'notes' => $validated['notes'] ?? null,
            ]);

            DB::commit();

            return back();
        } catch (ModelNotFoundException) {
            DB::rollBack();

            return back()->withErrors([
                'error' => 'The selected batch no longer exists for this shop.',
            ]);
        } catch (Throwable $e) {
            DB::rollBack();
            report($e);

            return back()->withErrors([
                'error' => 'Failed to save the stock adjustment. Please try again.',
            ]);
        }
    }
}
