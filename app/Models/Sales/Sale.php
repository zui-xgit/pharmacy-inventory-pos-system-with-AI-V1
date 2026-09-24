<?php

namespace App\Models\Sales;

use App\Models\User;
use App\Traits\BelongsToShop;
use Database\Factories\Sales\SaleFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    // -------------------------------------------------------------------------
    // Relations
    // -------------------------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
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
        return $this->items->sum(function ($item) {
            return ($item->unit_price - $item->cost_price) * $item->quantity;
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
