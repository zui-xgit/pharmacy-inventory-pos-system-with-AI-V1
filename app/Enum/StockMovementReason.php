<?php

namespace App\Enum;

enum StockMovementReason: string
{
    case PURCHASE = 'purchase';
    case SALE = 'sale';
    case ADJUSTMENT = 'adjustment';
    case EXPIRY = 'expiry';
    case RETURN = 'return';
    case TRANSFER = 'transfer';

    // helper function
    public function label(): string
    {
        return match ($this) {
            self::PURCHASE => 'Purchase / Received',
            self::SALE => 'Customer Sale',
            self::ADJUSTMENT => 'Stock Adjustment',
            self::EXPIRY => 'Expired Stock Write-off',
            self::RETURN => 'Customer Return',
            self::TRANSFER => 'Store Transfer',
        };
    }
}
