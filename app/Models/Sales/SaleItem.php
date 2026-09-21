<?php

namespace App\Models\Sales;

use App\Models\Catalog\Product;
use App\Models\Inventory\Batch;
use App\Traits\BelongsToShop;
use Database\Factories\Sales\SaleItemFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Guarded('id')]
class SaleItem extends Model
{
    /** @use HasFactory<SaleItemFactory> */
    use HasFactory;

    use HasUuids;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'discount' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    // SaleItem does not use BelongsToShop because it has no shop_id column.
    // It is always accessed through its parent Sale which is already
    // scoped to the current shop.

    // -------------------------------------------------------------------------
    // Relations
    // -------------------------------------------------------------------------

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Profit on this single line item.
     */
    public function profit(): float
    {
        return ($this->unit_price - $this->cost_price) * $this->quantity;
    }
}
