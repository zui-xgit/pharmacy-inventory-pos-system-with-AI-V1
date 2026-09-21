<?php

namespace App\Models\Catalog;

use App\Models\Inventory\Stock;
use App\Models\Inventory\StockMovement;
use App\Traits\BelongsToShop;
use Database\Factories\Catalog\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Guarded('id')]
class Product extends Model
{
    use BelongsToShop;

    /** @use HasFactory<ProductFactory> */
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'reorder_point' => 'integer',
        ];
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    // -------------------------------------------------------------------------
    // Relations
    // -------------------------------------------------------------------------

    public function packageUnit(): BelongsTo
    {
        return $this->belongsTo(PackageUnit::class);
    }

    public function dosageForm(): BelongsTo
    {
        return $this->belongsTo(DosageForm::class);
    }

    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }

    public function stock(): HasMany
    {
        return $this->hasMany(Stock::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Total current quantity across all batches of this product.
     */
    public function totalStock(): float
    {
        return $this->stock()->sum('quantity');
    }

    /**
     * True if total stock is at or below the reorder point.
     * Falls back to shop's low_stock_threshold if reorder_point is not set.
     */
    public function isLowStock(): bool
    {
        $threshold = $this->reorder_point
            ?? $this->shop->low_stock_threshold;

        return $this->totalStock() <= $threshold;
    }
}
