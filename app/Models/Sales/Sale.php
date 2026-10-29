<?php

namespace App\Models\Sales;

use App\Models\Core\Shop;
use App\Models\User;
use App\Traits\BelongsToShop;
use Database\Factories\Sales\SaleFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Collection;
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
 * @property int $user_id
 * @property string $receipt_number
 * @property string $total_amount
 * @property string $discount
 * @property string $amount_paid
 * @property string $change_given
 * @property string $payment_method
 * @property 'completed'|'refunded'|'cancelled' $status
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Shop $shop
 * @property-read Collection<int, SaleItem> $items
 * @property-read Collection<int, SaleItem> $saleItems
 */
#[Guarded('id')]
class Sale extends Model
{
    use BelongsToShop;

    /** @use HasFactory<SaleFactory> */
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
            'total_amount' => 'decimal:2',
            'discount' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'change_given' => 'decimal:2',
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
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Shop, $this>
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * @return HasMany<SaleItem, $this>
     */
    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    /**
     * Alias for saleItems() to support $sale->items
     *
     * @return HasMany<SaleItem, $this>
     */
    public function items(): HasMany
    {
        return $this->saleItems();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Total profit for this sale —
     * sum of (unit_price - cost_price) * quantity across all items.
     */
    public function profit(): float
    {
        $items = $this->relationLoaded('items') ? $this->items : $this->saleItems;

        return $items->sum(function (SaleItem $item): float {
            return ((float) $item->unit_price - (float) $item->cost_price) * $item->quantity;
        });
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isRefunded(): bool
    {
        return $this->status === 'refunded';
    }
}
