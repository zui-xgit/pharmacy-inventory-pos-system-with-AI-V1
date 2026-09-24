<?php

namespace App\Http\Controllers\Shop\Main;

use App\Http\Controllers\Controller;
use App\Models\Catalog\Batch;
use App\Models\Catalog\Product;
use App\Models\Core\Shop;
use App\Models\Inventory\Stock;
use App\Models\Inventory\StockMovement;
use App\Models\Sales\Sale;
use App\Models\Sales\SaleItem;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
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

   

    // make a sell
    public function checkOut(Request $request, Shop $shop)
    { 
            $validated = $request->validate([
                'items' => ['required', 'array', 'min:1'],
                'items.*.batch_id' => [
                    'required',
                    Rule::exists('batches', 'id')->where('shop_id', $shop->id),
                ],
                'items.*.quantity' => ['required', 'integer', 'min:1'],
            ]);  


            

            
            try{
                DB::beginTransaction(); 

                // ── Step 1: Lock & Verify batch stock directly ────────────────────
                // Collect batch IDs and lock rows to prevent race conditions at POS
                $batchIds = collect($validated['items'])->pluck('batch_id');
                
                $batches = Batch::whereIn('id', $batchIds)
                    ->where('shop_id', $shop->id)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                foreach ($validated['items'] as $item) {
                    $batch = $batches->get($item['batch_id']);

                    if (! $batch || $batch->units_remaining < $item['quantity']) {
                        DB::rollBack();

                        return back()->withErrors([
                            'stock' => "Insufficient stock for batch {$batch?->batch_number}. "
                                . "Available: {$batch?->units_remaining}, Requested: {$item['quantity']}.",
                        ]);
                    }
                }

                // ── Step 2: Generate receipt number ───────────────────────────────
                $receiptNumber = $this->generateReceiptNumber($shop->id);


                // ── Step 3: Calculate total using database batch prices ───────────
                $totalAmount = collect($validated['items'])->sum(function ($item) use ($batches) {
                    $batch = $batches->get($item['batch_id']);
                    return $batch->selling_price * $item['quantity'];
                });


                // ── Step 4: Create the sale record ───────────────────────────────
                $sale = Sale::create([
                    'shop_id'        => $shop->id,
                    'user_id'        => Auth::id(), // who made the sale
                    'receipt_number' => $receiptNumber,
                    'total_amount'   => $totalAmount,
                    'discount'       => 0,
                    'amount_paid'    => $totalAmount,
                    'change_given'   => 0,
                    'payment_method' => 'cash',
                    'status'         => 'completed',
                ]);


                // ── Step 5: Process each item directly against batch inventory ────
                foreach ($validated['items'] as $item) {
                    $batch = $batches->get($item['batch_id']);

                    $quantityBefore = $batch->units_remaining;
                    $quantityAfter  = $quantityBefore - $item['quantity'];

                    // Calculate updated package count based on remaining units
                    $packagesRemaining = $batch->units_per_package_received > 0
                        ? (int) floor($quantityAfter / $batch->units_per_package_received)
                        : $batch->packages_remaining;

                    // 5a. Create sale item
                    SaleItem::create([
                        'sale_id'    => $sale->id,
                        'product_id' => $batch->product_id,
                        'batch_id'   => $batch->id,
                        'quantity'   => $item['quantity'],
                        'unit_price' => $batch->selling_price,
                        'cost_price' => $batch->cost_price,
                        'discount'   => 0,
                        'subtotal'   => $batch->selling_price * $item['quantity'],
                    ]);

                    // 5b. Update live inventory directly on the batch table
                    $batch->update([
                        'units_remaining'    => $quantityAfter,
                        'packages_remaining' => $packagesRemaining,
                    ]);

                    // 5c. Log movement in stock_movements ledger for auditing
                    StockMovement::create([
                        'shop_id'         => $shop->id,
                        'batch_id'        => $batch->id,
                        'user_id'         => Auth::id(),
                        'type'            => 'sale',
                        'quantity'        => -$item['quantity'], // negative = outgoing
                        'quantity_before' => $quantityBefore,
                        'quantity_after'  => $quantityAfter,
                        'reference_type'  => Sale::class,
                        'reference_id'    => $sale->id,
                        'notes'           => "Sale — receipt {$receiptNumber}",
                    ]);
                }

                DB::commit();
                Inertia::flash('message' , 'Sale made successfully'); 



                // return back()->with('success', "Sale completed. Receipt: {$receiptNumber}");
  
            }catch(Exception $e){
                DB::rollBack();
                return back()->withErrors([
                    'error' => 'Failed to complete the sale. Please try again.',
                ]);
            }
    }


    // -------------------------------------------------------------------------
    // Receipt number generator
    // Format: RCP-YYYYMMDD-XXXX (sequence resets per day per shop)
    // -------------------------------------------------------------------------
 
    private function generateReceiptNumber(int $shopId): string
    {
        $date  = now()->format('Ymd');
        $prefix = "RCP-{$date}-";
 
        // Count today's sales for this shop to get the next sequence number
        $todayCount = Sale::where('shop_id', $shopId)
            ->whereDate('created_at', today())
            ->count();
 
        $sequence = str_pad($todayCount + 1, 4, '0', STR_PAD_LEFT);
 
        return $prefix . $sequence;
    }




    // TODO: THIS FUNCTION IS NOT YET USED IN THE SYSTEM. FUTURE IMPLEMENTATION.  


    /**
     * Revert / Void a completed sale due to cashier error
     */
    public function voidSale(Request $request, Shop $shop, Sale $sale)
    {
        if ($sale->status === 'voided') {
            return back()->withErrors(['error' => 'This sale has already been voided.']);
        }

        try {
            DB::beginTransaction();

            $sale->load('items.batch');

            foreach ($sale->items as $item) {
                $batch = $item->batch;

                if ($batch) {
                    $batch->lockForUpdate();
                    $quantityBefore = $batch->units_remaining;
                    $quantityAfter  = $quantityBefore + $item->quantity;

                    $packagesRemaining = $batch->units_per_package_received > 0
                        ? (int) floor($quantityAfter / $batch->units_per_package_received)
                        : $batch->packages_remaining;

                    $batch->update([
                        'units_remaining'    => $quantityAfter,
                        'packages_remaining' => $packagesRemaining,
                    ]);

                    StockMovement::create([
                        'shop_id'         => $shop->id,
                        'batch_id'        => $batch->id,
                        'user_id'         => Auth::id(),
                        'type'            => 'return',
                        'quantity'        => $item->quantity, // positive = incoming back to stock
                        'quantity_before' => $quantityBefore,
                        'quantity_after'  => $quantityAfter,
                        'reference_type'  => Sale::class,
                        'reference_id'    => $sale->id,
                        'notes'           => "Voided Sale — receipt {$sale->receipt_number}",
                    ]);
                }
            }

            $sale->update(['status' => 'voided']);

            DB::commit();

            return back()->with('success', "Sale {$sale->receipt_number} successfully voided and stock restored.");

        } catch (Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to void the sale.']);
        }
    }


}
