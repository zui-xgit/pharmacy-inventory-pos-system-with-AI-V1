<?php

namespace App\Http\Controllers;

use App\Models\Core\Shop;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        // 1. Initialize the query builder
        $query = Shop::query()->orderBy('created_at', 'desc');

        // 2. Handle conditional search for name and location
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(location) LIKE ?', ["%{$search}%"]);
            });
        }

        // 3. Paginate and map the shop data explicitly
        $shops = $query->get()->map(function (Shop $shop): array {
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
            ];
        });

        // 4. Return the Inertia view with all the payload data
        return Inertia::render('owner/overview/shops', [
            'shops' => $shops,
            'filters' => $request->only(['search']),
        ]);

    }

    public function staff(): Response
    {
        return Inertia::render('owner/management/staff');
    }
}
