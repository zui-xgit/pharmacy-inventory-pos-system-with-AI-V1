<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopSelectionController extends Controller
{
    //

    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $shops = $request->user()
            ->shops()
            ->when($search !== '', function ($query) use ($search) {
                $term = '%' . mb_strtolower($search, 'UTF-8') . '%';

                $query->where(function ($q) use ($term) {
                    $q->whereRaw('LOWER(shops.name) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(shops.location) LIKE ?', [$term]);
                });
            })
            ->orderBy('shops.name')
            ->get([
                'shops.uuid',
                'shops.name',
                'shops.location',
                'shops.address',
                'shops.phone',
            ]);

        return Inertia::render('shop/shop-selection/select-shop', [
            'shops'   => $shops,
            'filters' => [
                'search' => $search ?: null,
            ],
        ]);
    }
}
