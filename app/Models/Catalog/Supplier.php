<?php

namespace App\Models\Catalog;

use App\Traits\BelongsToShop;
use Database\Factories\Catalog\SupplierFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Guarded('id')]
class Supplier extends Model
{
    use BelongsToShop;

    /** @use HasFactory<SupplierFactory> */
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    // -------------------------------------------------------------------------
    // Relations
    // -------------------------------------------------------------------------

    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }
}
