<?php

namespace App\Http\Controllers;

use App\Models\Core\Shop;
use Inertia\Inertia;
use Inertia\Response;

class MainController extends Controller
{
    public function overview(Shop $shop): Response
    {
        return Inertia::render('shop/main/overview');
    }

    
}
