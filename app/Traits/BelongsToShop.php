<?php

namespace App\Traits;

use App\Models\Core\Shop;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToShop
{
    // -------------------------------------------------------------------------
    // Relation — handled here so you never write it manually on each model
    // -------------------------------------------------------------------------

    public function shop(): BelongsTo
    {
        if ($this instanceof Model) {
            return $this->belongsTo(Shop::class);
        }

        throw new \LogicException('This trait can only be used on Eloquent models.');
    }
}
