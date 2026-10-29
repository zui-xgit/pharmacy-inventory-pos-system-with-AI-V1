<?php

namespace App\Services;

use App\Models\Core\Shop;
use App\Models\Sales\Sale;
use Illuminate\Support\Facades\DB;

class PosService
{
    public function generateReceiptNumber(Shop $shop): string
    {
        $date = now()->format('Ymd');
        $prefix = "RCP-{$date}-";

        return DB::transaction(function () use ($shop, $prefix) {
            $lastReceipt = Sale::where('shop_id', $shop->id)
                ->where('receipt_number', 'like', $prefix.'%')
                ->orderByRaw('LENGTH(receipt_number) desc')
                ->orderByDesc('receipt_number')
                ->lockForUpdate()
                ->first();

            $sequence = 1;

            if ($lastReceipt && preg_match('/-(\d+)$/', $lastReceipt->receipt_number, $matches)) {
                $sequence = ((int) $matches[1]) + 1;
            }

            do {
                $receiptNumber = $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
                $exists = Sale::where('receipt_number', $receiptNumber)->exists();
                $sequence++;
            } while ($exists);

            return $receiptNumber;
        });
    }
}
