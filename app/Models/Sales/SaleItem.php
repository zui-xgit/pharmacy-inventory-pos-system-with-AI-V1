<?php

namespace App\Models\Sales;

use App\Models\Catalog\Batch;
use App\Models\Catalog\Product;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


#[Guarded('id')]
class SaleItem extends Model
{
    /** @use HasFactory<\Database\Factories\Sales\SaleItemFactory> */
    use HasFactory;
    use HasUuids; 

    // uuid 
    public function uniqueIds(): array
    {
        return ['uuid'];
    }


    // Belongs to the header sale
    public function sale(): BelongsTo
    {
       return $this->belongsTo(Sale::class); 
    }


    // Belongs to the specific product line item
    public function product(): BelongsTo
    {
       return $this->belongsTo(Product::class);    
    }


    // Belongs to the specific batch inventory row
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class); 
    }
}
