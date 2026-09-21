<?php

namespace App\Http\Controllers;

use App\Models\Core\Shop;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OwnerController extends Controller
{
    public function createShop(Request $request)
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

        } catch (Exception $e) {

            DB::rollBack();
            dd($e->getMessage());

            return back()->withErrors([
                'error' => 'An internal error occurred while creating the shop.',
            ]);
        }
    }

    // return all shops
    public function shops(Request $request)
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
        $shops = $query->get()->map(function ($shop) {
            return [
                'uuid' => $shop->uuid,
                'name' => $shop->name,
                'location' => $shop->location,
                'address' => $shop->address,
                'phone' => $shop->phone,
                'email' => $shop->email,
                'currency' => $shop->currency,
                'currency_symbol' => $shop->currency_symbol,
                'is_active' => (bool) $shop->is_active,
                'created_at' => $shop->created_at->toIso8601String(),
            ];
        });

        // 4. Return the Inertia view with all the payload data
        return Inertia::render('owner/overview/shops', [
            'shops' => $shops,
            'filters' => $request->only(['search']),
        ]);

    }

    public function staff()
    {
        return Inertia::render('owner/management/staff');
    }
}
