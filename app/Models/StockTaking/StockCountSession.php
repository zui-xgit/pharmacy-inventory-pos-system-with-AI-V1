<?php

namespace App\Models\StockTaking;

use App\Models\User;
use App\Traits\BelongsToShop;
use Database\Factories\StockTaking\StockCountSessionFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Guarded('id')]
class StockCountSession extends Model
{
    use BelongsToShop;

    /** @use HasFactory<StockCountSessionFactory> */
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
            'finalized_at' => 'datetime',
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

    public function items(): HasMany
    {
        return $this->hasMany(StockCountItem::class);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function isOpen(): bool
    {
        return $this->status === 'open';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isFinalized(): bool
    {
        return $this->status === 'finalized';
    }

    /**
     * Total number of items with a variance in this session.
     */
    public function totalVariances(): int
    {
        return $this->items()->where('variance', '!=', 0)->count();
    }
}
