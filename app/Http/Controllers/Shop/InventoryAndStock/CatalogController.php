<?php

namespace App\Http\Controllers\Shop\InventoryAndStock;

use App\Http\Controllers\Controller;
use App\Models\Catalog\Batch;
use App\Models\Catalog\DosageForm;
use App\Models\Catalog\Product;
use App\Models\Core\Shop;
use Exception;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CatalogController extends Controller
{
    //

    // CATALOG
    public function productsCatalog(Request $request, Shop $shop)
    {

        $search_input = $request->input('search');
        $search = strtolower($search_input);

        $products = Product::where('shop_id', $shop->id)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('sku', 'LIKE', "%{$search}%");
                });
            })
            ->with([
                'dosageForm:id,uuid,name',
            ])
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(function ($product) {
                return [
                    'uuid' => $product->uuid,
                    'name' => $product->name,
                    'dosage_form' => [
                        'uuid' => $product->dosageForm?->uuid,
                        'name' => $product->dosageForm?->name ?? 'N/A',
                    ],

                ];
            });

        $dosage_forms = $shop->dosageForms()->get(['uuid', 'name']);

        return Inertia::render('shop/catalog/products', [
            'products' => $products,
            'filters' => $request->only(['search']),
            'dosage_forms' => $dosage_forms,
        ]);

    }

    public function batchesCatalog(Request $request, Shop $shop)
    {
        $search_input = $request->input('search');
        $search = strtolower($search_input);

        $batches = Batch::where('shop_id', $shop->id)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('batch_number', 'LIKE', "%{$search}%")
                        ->orWhereHas('product', function ($productQuery) use ($search) {
                            $productQuery->where('name', 'LIKE', "%{$search}%");
                        });
                });
            })
            ->with([
                'product:id,uuid,name',
                'supplier:id,name',
            ])
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(function ($batch) {
                $totalUnitsReceived = $batch->packages_received * $batch->units_per_package_received;

                return [
                    'uuid' => $batch->uuid,
                    'batch_number' => $batch->batch_number,
                    'product_name' => $batch->product?->name ?? 'Unknown Product',
                    'product_uuid' => $batch->product?->uuid,
                    'supplier_name' => $batch->supplier?->name ?? 'N/A',

                    // Receiving Quantities
                    'packages_received' => $batch->packages_received,
                    'units_per_package_received' => $batch->units_per_package_received,
                    'total_units_received' => $totalUnitsReceived,

                    // Current Stock Quantities
                    'packages_remaining' => $batch->packages_remaining,
                    'units_remaining' => $batch->units_remaining,
                    'is_out_of_stock' => $batch->units_remaining <= 0,

                    // Pricing
                    'cost_price' => $batch->cost_price,
                    'selling_price' => $batch->selling_price,

                    // Dates
                    'manufactured_date' => $batch->manufactured_date ? $batch->manufactured_date->format('Y-m-d') : null,
                    'expiry_date' => $batch->expiry_date ? $batch->expiry_date->format('Y-m-d') : 'N/A',
                    'is_expired' => $batch->expiry_date ? $batch->expiry_date->isPast() : false,
                ];
            });

        return Inertia::render('shop/catalog/batches', [
            'batches' => $batches,
            'filters' => $request->only(['search']),
        ]);
    }

    public function dosageFormsCatalog(Request $request, Shop $shop)
    {
        $search_input = $request->input('search');
        $search = strtolower($search_input);

        $dosageForms = DosageForm::where('shop_id', $shop->id)
            ->when($search, function ($query, $search) {
                $query->where('name', 'LIKE', "%{$search}%");
            })
            ->withCount(['products']) // Useful to show how many products use this form
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(function ($form) {
                return [
                    'uuid' => $form->uuid,
                    'name' => $form->name,
                    'products_count' => $form->products_count,
                ];
            });

        return Inertia::render('shop/catalog/dosage-forms', [
            'dosageForms' => $dosageForms,
            'filters' => $request->only(['search']),
        ]);
    }

    public function createDosageForm(Request $request, Shop $shop)
    {

        $request->merge([
            'name' => strtolower($request->input('name')),
        ]);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                // Checks the 'dosage_forms' table, ensuring 'name' is unique where 'shop_id' matches the current shop
                Rule::unique('dosage_forms')->where(function ($query) use ($shop) {
                    return $query->where('shop_id', $shop->id);
                }),
            ],
        ]);

        try {
            DB::beginTransaction();
            $shop->dosageForms()->create([
                'name' => $validated['name'],
            ]);
            DB::commit();
        } catch (Exception $e) {
            DB::rollback();

            return back()->withErrors(['error' => 'Failed to create dosage form: ']);
        }
    }

    public function createProduct(Request $request, Shop $shop)
    {

        $request->merge([
            'name' => strtolower($request->input('name')),
            // 'sku' => strtolower($request->input('sku')),
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'dosage_form_uuid' => [
                'required',
                'exists:dosage_forms,uuid', // Ensure the form exists in the dosage_forms table
            ],
            // 'sku' => [
            //     'required',
            //     'string',
            //     'max:255',
            //     Rule::unique('products')->where(function ($query) use ($shop) {
            //         return $query->where('shop_id', $shop->id);
            //     }),
            // ],
        ]);

        try {
            DB::beginTransaction();

            // Fetch the unit by UUID
            $dosage_form = $shop->dosageForms()->where('uuid', $validated['dosage_form_uuid'])->firstOrFail();

            $shop->products()->create([
                'name' => $validated['name'],
                'dosage_form_id' => $dosage_form->id,
                // 'sku' => $validated['sku'],
            ]);

            DB::commit();
        } catch (UniqueConstraintViolationException $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'A product with this identical name and dosage form, already exists.']);
        } catch (Exception $e) {
            DB::rollback();

            return back()->withErrors(['error' => 'Failed to create product: ']);
        }

    }

    public function createBatch(Request $request, Shop $shop)
    {
        $request->merge([
            'batch_number' => strtolower($request->input('batch_number')),
        ]);

        $validated = $request->validate([
            'confirmed' => ['boolean'],
            'product' => ['required', 'array'],
            'product.uuid' => ['required', 'uuid', Rule::exists('products', 'uuid')->where('shop_id', $shop->id)],
            // 'batch_number'               => ['required', 'string', 'max:100'],
            'batch_number' => ['required', 'string', 'max:100',
                Rule::unique('batches', 'batch_number')
                    ->where('shop_id', $shop->id)
                    ->where('product_id', Product::where('uuid', $request->input('product.uuid'))->value('id')),
            ],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0', 'gte:cost_price'],
            'manufactured_date' => ['required', 'date', 'before_or_equal:today'],
            'expiry_date' => ['required', 'date', 'after:today'],
            'units_per_package_received' => ['required', 'integer', 'min:1'],
            'packages_received' => ['required', 'integer', 'min:1'],
        ]);

        // Calculate total calculated stock quantities
        $totalQuantityReceived = $validated['units_per_package_received'] * $validated['packages_received'];

        //  1: Validation passed, but user hasn't seen the confirmation dialog yet - so show the dialog first to confirm
        if ($validated['confirmed'] === false) {
            Inertia::flash('prompt_confirmation', [
                'message' => "You are about to receive {$totalQuantityReceived} total units into inventory.",
            ]);

            return back();
        }

        try {
            DB::beginTransaction();

            $product = Product::where('uuid', $validated['product']['uuid'])
                ->where('shop_id', $shop->id)
                ->firstOrFail();

            // 2. Create batch
            Batch::create([
                'shop_id' => $shop->id,
                'product_id' => $product->id,
                'batch_number' => $validated['batch_number'],
                'expiry_date' => $validated['expiry_date'],
                'manufactured_date' => $validated['manufactured_date'],
                'units_per_package_received' => $validated['units_per_package_received'],
                'packages_received' => $validated['packages_received'],
                'cost_price' => $validated['cost_price'],
                'selling_price' => $validated['selling_price'],

                'packages_remaining' => $validated['packages_received'],
                'units_remaining' => $totalQuantityReceived,
            ]);

            DB::commit();

        } catch (UniqueConstraintViolationException $e) {
            DB::rollBack();

            return back()->withErrors(['error' => "A batch with this batch-number: {$validated['batch_number']}  already exists. No duplicates allowed."]);
        } catch (Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Failed to create the batch record. Please try again. ']);
        }
    }
}
