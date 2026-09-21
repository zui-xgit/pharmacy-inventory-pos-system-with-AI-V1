<?php

namespace App\Http\Controllers\Shop\Main;

use App\Http\Controllers\Controller;
use App\Models\Core\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PosController extends Controller
{
    //

    public function posIndex(Shop $shop)
    {

    

        
        return Inertia::render('shop/main/pos'); 
    }
}
