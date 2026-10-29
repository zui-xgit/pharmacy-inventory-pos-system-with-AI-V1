<?php

namespace App\Http\Controllers;

use App\Models\Core\Shop;
use Inertia\Inertia;
use Inertia\Response;

class ShopStaffController extends Controller
{
    //

    public function shopStaffEdit(Shop $shop): Response
    {
        return Inertia::render('shop/system/shop-staff');
    }
}
