<?php

namespace App\Models\StockTaking;

use App\Models\Catalog\Product;
use App\Models\Inventory\Batch;
use Database\Factories\StockTaking\StockCountItemFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Guarded('id')]
class StockCountItem extends Model
{
    /** @use HasFactory<StockCountItemFactory> */
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
            'system_quantity' => 'decimal:2',
            'physical_quantity' => 'decimal:2',
            'variance' => 'decimal:2',
        ];
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    // StockCountItem does not use BelongsToShop — no shop_id column.
    // Always accessed through its parent StockCountSession.

    // -------------------------------------------------------------------------
    // Relations
    // -------------------------------------------------------------------------

    public function session(): BelongsTo
    {
        return $this->belongsTo(StockCountSession::class, 'stock_count_session_id');
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
     * True if physical count differs from system count.
     */
    public function hasVariance(): bool
    {
        return $this->variance !== 0.0;
    }

    /**
     * True if more stock was found than expected.
     */
    public function isPositiveVariance(): bool
    {
        return $this->variance > 0;
    }

    /**
     * True if less stock was found than expected (shrinkage).
     */
    public function isNegativeVariance(): bool
    {
        return $this->variance < 0;
    }
}
