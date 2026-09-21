<?php

namespace App\Models\Core;

use App\Models\Catalog\Batch;
use App\Models\Catalog\DosageForm;
use App\Models\Catalog\PackageUnit;
use App\Models\Catalog\Product;
use App\Models\Catalog\Supplier;
use App\Models\Inventory\Stock;
use App\Models\Inventory\StockMovement;
use App\Models\User;
use Database\Factories\Core\ShopFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(
    'name',
    'location',
    'address',
    'phone',
    'logo_path',
    'is_active',
)]
#[Hidden(
    'id',
    'deleted_at',
)]
class Shop extends Model
{
    /** @use HasFactory<ShopFactory> */
    use HasFactory;

    use HasUuids;

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'shop_user')->withTimestamps();
    }

    public function packageUnits(): HasMany
    {
        return $this->hasMany(PackageUnit::class);
    }

    public function dosageForms(): HasMany
    {
        return $this->hasMany(DosageForm::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function suppliers(): HasMany
    {
        return $this->hasMany(Supplier::class);
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
}
