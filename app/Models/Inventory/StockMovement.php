<?php

namespace App\Models\Inventory;

use App\Models\Catalog\Batch;
use App\Models\Catalog\Product;
use App\Models\User;
use App\Traits\BelongsToShop;
use Database\Factories\Inventory\StockMovementFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Guarded('id')]
class StockMovement extends Model
{
    use BelongsToShop;

    /** @use HasFactory<StockMovementFactory> */
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
            'quantity_before' => 'decimal:2',
            'quantity_after' => 'decimal:2',
        ];
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    // Stock movements are append-only — never updated or deleted.
    // Every change to stock quantity must write a new row here.

    // -------------------------------------------------------------------------
    // Relations
    // -------------------------------------------------------------------------

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Polymorphic relation back to whatever caused this movement.
     * Could be a Sale, a Batch receipt, a StockCountSession, etc.
     */
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * True if this movement added stock (purchase, return).
     */
    public function isIncoming(): bool
    {
        return $this->quantity > 0;
    }

    /**
     * True if this movement removed stock (sale, expiry, adjustment down).
     */
    public function isOutgoing(): bool
    {
        return $this->quantity < 0;
    }
}
