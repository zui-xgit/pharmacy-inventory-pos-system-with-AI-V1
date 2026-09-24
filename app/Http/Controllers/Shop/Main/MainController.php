<?php

namespace App\Http\Controllers\Shop\Main;

use App\Http\Controllers\Controller;
use App\Models\Core\Shop;
use App\Models\Inventory\Alert;
use App\Models\Sales\Sale;
use App\Models\Sales\SaleItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MainController extends Controller
{
    //

    public function overview(Shop $shop)
    {
        return Inertia::render('shop/main/overview');
            
    }
}
