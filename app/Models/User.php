<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Models\Core\Shop;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['username', 'first_name', 'last_name', 'gender', 'mobile',  'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    use HasRoles;
    use HasUuids;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function belongsToShop(int|string $shopId): bool
    {
        return $this->shops()->where('shop_id', $shopId)->exists();
    }

    public function shops(): BelongsToMany
    {
        return $this->belongsToMany(Shop::class, 'shop_user')->withTimestamps();
    }

    public function activeShop(): BelongsTo
    {
        return $this->belongsTo(Shop::class, 'active_shop_id');
    }

    // -------------------------------------------------------------------------
    // Role helpers
    // -------------------------------------------------------------------------

    public function isOwner(): bool
    {
        return $this->hasRole('owner');

    }

    public function isManager(): bool
    {
        return $this->hasRole('manager');
    }

    public function isCashier(): bool
    {
        return $this->hasRole('cashier');
    }

    public function isManagerOrOwner(): bool
    {
        return $this->isOwner() || $this->isManager();
    }

    public function isManagerOrCashier(): bool
    {
        return $this->isManager() || $this->isCashier();
    }

    public function currentRole(): string
    {
        if ($this->isOwner()) {
            return 'owner';
        }
        if ($this->isManager()) {
            return 'manager';
        }
        if ($this->isCashier()) {
            return 'cashier';
        }

        return 'none';
    }

    // -------------------------------------------------------------------------
    // Status helpers
    // -------------------------------------------------------------------------

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function isInactive(): bool
    {
        return $this->status === 'inactive';
    }
}
