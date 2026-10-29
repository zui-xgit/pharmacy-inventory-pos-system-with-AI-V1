<?php

namespace App\Models\Catalog;

use App\Models\Core\Shop;
use App\Models\Inventory\StockMovement;
use App\Models\Sales\SaleItem;
use App\Traits\BelongsToShop;
use Database\Factories\Catalog\BatchFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $uuid
 * @property int $shop_id
 * @property int $product_id
 * @property string $batch_number
 * @property Carbon $expiry_date
 * @property Carbon $manufactured_date
 * @property int $packages_received
 * @property int $units_per_package_received
 * @property int $packages_remaining
 * @property int $units_remaining
 * @property int $cost_price
 * @property int $selling_price
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read Product $product
 * @property-read Shop $shop
 */
#[Guarded('id')]
class Batch extends Model
{
    use BelongsToShop;

    /** @use HasFactory<BatchFactory> */
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
            'expiry_date' => 'date',
            'manufactured_date' => 'date',
            'quantity_received' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
        ];
    }

    /**
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    // -------------------------------------------------------------------------
    // Relations
    // -------------------------------------------------------------------------

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<Shop, $this>
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * @return HasMany<StockMovement, $this>
     */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * @return HasMany<SaleItem, $this>
     */
    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * True if this batch has no remaining stock.
     */
    public function isOutOfStock(): bool
    {
        return $this->units_remaining <= 0;
    }

    /**
     * True if this batch has already expired.
     */
    public function isExpired(): bool
    {
        return $this->expiry_date->isPast();
    }

    /**
     * True if this batch expires within the shop's alert window.
     * Falls back to 30 days if shop threshold is not set.
     */
    public function isExpiringSoon(int $expiryAlertDays): bool
    {
        return $this->expiry_date->isBefore(now()->addDays($expiryAlertDays));
    }

    /**
     * Number of days until this batch expires.
     */
    public function daysUntilExpiry(): int
    {
        return (int) Carbon::now()->diffInDays($this->expiry_date, false);
    }
}
