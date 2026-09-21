<?php

namespace App\Models\Inventory;

use App\Models\Catalog\Batch;
use App\Models\Catalog\Product;
use App\Traits\BelongsToShop;
use Database\Factories\Inventory\AlertFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Guarded('id')]
class Alert extends Model
{
    /** @use HasFactory<AlertFactory> */
    use BelongsToShop, HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => 'string',
            'status' => 'string',
        ];
    }

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

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function isUnread(): bool
    {
        return $this->status === 'unread';
    }

    public function isRead(): bool
    {
        return $this->status === 'read';
    }

    public function isDismissed(): bool
    {
        return $this->status === 'dismissed';
    }

    public function isLowStock(): bool
    {
        return $this->type === 'low_stock';
    }

    public function isExpiry(): bool
    {
        return $this->type === 'expiry';
    }

    public function isReorder(): bool
    {
        return $this->type === 'reorder';
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    public function scopeUnread($query)
    {
        return $query->where('status', 'unread');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
