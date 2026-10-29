<?php

namespace App\Http\Controllers;

use App\Models\Core\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    //

    public function staff(Shop $shop): Response
    {
       return Inertia::render('shop/system/staff');     
    }
}
