<?php

namespace App\Models\Core;

use App\Models\Catalog\Batch;
use App\Models\Catalog\DosageForm;
use App\Models\Catalog\PackageUnit;
use App\Models\Catalog\Product;
use App\Models\Inventory\StockMovement;
use App\Models\Sales\Sale;
use App\Models\User;
use Database\Factories\Core\ShopFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $uuid
 * @property string $name
 * @property string $location
 * @property string $address
 * @property string $phone
 * @property string $currency
 * @property string $currency_symbol
 * @property string $timezone
 * @property string|null $logo_path
 * @property int $low_stock_threshold
 * @property int $expiry_alert_days
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
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

    /**
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'shop_user')->withTimestamps();
    }

    /**
     * @return HasMany<DosageForm, $this>
     */
    public function dosageForms(): HasMany
    {
        return $this->hasMany(DosageForm::class);
    }

    /**
     * @return HasMany<Product, $this>
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * @return HasMany<Batch, $this>
     */
    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }

    /**
     * @return HasMany<StockMovement, $this>
     */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * @return HasMany<Sale, $this>
     */
    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }
}
