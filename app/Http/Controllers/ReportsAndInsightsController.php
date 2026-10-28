<?php

namespace App\Http\Controllers;

use App\Models\Core\Shop;
use Inertia\Inertia;
use Inertia\Response;

class ReportsAndInsightsController extends Controller
{
    

    public function salesReports(Shop $shop): Response
    {
        return Inertia::render('shop/reports/sales');
    }

    public function inventoryReports(Shop $shop): Response
    {
        return Inertia::render('shop/reports/inventory');
    }
}
