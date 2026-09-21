<?php

namespace App\Models\Catalog;

use App\Traits\BelongsToShop;
use Database\Factories\Catalog\PackageUnitFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Guarded('id')]
class PackageUnit extends Model
{
    use BelongsToShop;

    /** @use HasFactory<PackageUnitFactory> */
    use HasFactory;
    use HasUuids;

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
