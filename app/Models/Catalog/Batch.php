<?php

namespace App\Models\Catalog;

use App\Models\Inventory\Stock;
use App\Models\Inventory\StockMovement;
use App\Traits\BelongsToShop;
use Database\Factories\Catalog\BatchFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

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

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    // -------------------------------------------------------------------------
    // Relations
    // -------------------------------------------------------------------------

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function stock(): HasOne
    {
        return $this->hasOne(Stock::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * True if this batch has already expired.
     */
    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    /**
     * True if this batch expires within the shop's alert window.
     * Falls back to 30 days if shop threshold is not set.
     */
    public function isExpiringSoon(): bool
    {
        if (! $this->expiry_date) {
            return false;
        }

        $days = $this->shop->expiry_alert_days ?? 30;

        return $this->expiry_date->isBefore(
            Carbon::now()->addDays($days)
        );
    }

    /**
     * Number of days until this batch expires.
     * Returns null if no expiry date is set.
     */
    public function daysUntilExpiry(): ?int
    {
        return $this->expiry_date
            ? (int) Carbon::now()->diffInDays($this->expiry_date, false)
            : null;
    }
}
