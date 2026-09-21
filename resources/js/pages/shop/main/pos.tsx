import {
    Search,
    Plus,
    Minus,
    Trash2,
    ShoppingCart,
    Receipt,
    X,
    AlertCircle,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import DashboardInnerLayout from '@/layouts/app/dashboard-inner-layout';
import SearchInput from '@/components/search-input';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Batch {
    id: string;
    batch_number: string;
    expiry_date: string;
    selling_price: number;
    quantity_available: number;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    form: string;
    unit: string;
    batches: Batch[];
}

export interface CartItem {
    product_id: string;
    batch_id: string;
    name: string;
    form: string;
    unit: string;
    batch_number: string;
    expiry_date: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    max_quantity: number;
    available_batches: Batch[];
}

export type PaymentMethod = 'cash' | 'card' | 'mobile';

interface NewSalePOSProps {
    products?: Product[];
    currencySymbol?: string;
    onCheckout?: (saleData: {
        cart: CartItem[];
        subtotal: number;
        discount: number;
        total: number;
        amountPaid: number;
        change: number;
        paymentMethod: PaymentMethod;
    }) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// FEFO Helper Engine
// Sorts available batches by expiry date (earliest first), ignoring depleted stock
// ─────────────────────────────────────────────────────────────────────────────

const getFEFOBatch = (batches: Batch[]): Batch | null => {
    const validBatches = batches
        .filter((b) => b.quantity_available > 0)
        .sort(
            (a, b) =>
                new Date(a.expiry_date).getTime() -
                new Date(b.expiry_date).getTime(),
        );

    return validBatches.length > 0 ? validBatches[0] : null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const ProductRow = ({
    product,
    currencySymbol,
    onAdd,
}: {
    product: Product;
    currencySymbol: string;
    onAdd: (product: Product, batch: Batch) => void;
}) => {
    const fefoBatch = getFEFOBatch(product.batches);
    const totalStock = product.batches.reduce(
        (sum, b) => sum + b.quantity_available,
        0,
    );

    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/60">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                        {product.name}
                    </p>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {product.form}
                    </Badge>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>SKU: {product.sku}</span>
                    {fefoBatch ? (
                        <>
                            <span className="font-medium text-amber-600 dark:text-amber-400">
                                FEFO Exp: {fefoBatch.expiry_date}
                            </span>
                            <span>
                                Total Stock: {totalStock} {product.unit}s
                            </span>
                        </>
                    ) : (
                        <span className="font-medium text-destructive">
                            Out of Stock
                        </span>
                    )}
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
                {fefoBatch && (
                    <p className="text-sm font-bold text-foreground">
                        {currencySymbol}{' '}
                        {fefoBatch.selling_price.toLocaleString()}
                    </p>
                )}
                <Button
                    size="sm"
                    onClick={() => fefoBatch && onAdd(product, fefoBatch)}
                    className="h-8 w-8 rounded-lg p-0"
                    disabled={!fefoBatch}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

const CartRow = ({
    item,
    currencySymbol,
    onIncrease,
    onDecrease,
    onRemove,
    onBatchChange,
}: {
    item: CartItem;
    currencySymbol: string;
    onIncrease: (batchId: string) => void;
    onDecrease: (batchId: string) => void;
    onRemove: (batchId: string) => void;
    onBatchChange: (currentBatchId: string, newBatchId: string) => void;
}) => (
    <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/20 p-3">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                    {item.name}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">
                        {item.form}
                    </Badge>
                    <span>
                        {currencySymbol} {item.unit_price.toLocaleString()} /{' '}
                        {item.unit}
                    </span>
                </div>
            </div>
            <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemove(item.batch_id)}
                className="h-7 w-7 shrink-0 rounded-lg p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
        </div>

        {/* Dynamic FEFO / Batch Switcher */}
        <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2">
            <div className="flex-1">
                <Select
                    value={item.batch_id}
                    onValueChange={(newBatchId) =>
                        onBatchChange(item.batch_id, newBatchId)
                    }
                >
                    <SelectTrigger className="h-7 rounded-md bg-background text-[11px]">
                        <SelectValue placeholder="Select Batch" />
                    </SelectTrigger>
                    <SelectContent>
                        {item.available_batches.map((b) => (
                            <SelectItem
                                key={b.id}
                                value={b.id}
                                disabled={b.quantity_available === 0}
                                className="text-xs"
                            >
                                {b.batch_number} (Exp: {b.expiry_date} | Avail:{' '}
                                {b.quantity_available})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Quantity adjustment */}
            <div className="flex shrink-0 items-center gap-1">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDecrease(item.batch_id)}
                    className="h-7 w-7 rounded-lg p-0"
                >
                    <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-xs font-bold">
                    {item.quantity}
                </span>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onIncrease(item.batch_id)}
                    disabled={item.quantity >= item.max_quantity}
                    className="h-7 w-7 rounded-lg p-0"
                >
                    <Plus className="h-3 w-3" />
                </Button>
            </div>
        </div>

        <div className="flex justify-end pt-1 text-xs font-bold text-foreground">
            Subtotal: {currencySymbol} {item.subtotal.toLocaleString()}
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic POS Component
// ─────────────────────────────────────────────────────────────────────────────

export default function NewSalePOS({
    products = [],
    currencySymbol = 'TSh',
    onCheckout,
}: NewSalePOSProps) {
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [discount, setDiscount] = useState<number>(0);
    const [amountPaid, setAmountPaid] = useState<number>(0);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // ── Realtime Dynamic Filtering ───────────────────────────────────────────

    const filteredProducts = useMemo(() => {
        if (!search.trim()) {
            return products;
        }

        const q = search.toLowerCase();

        return products.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q) ||
                p.batches.some((b) => b.batch_number.toLowerCase().includes(q)),
        );
    }, [products, search]);

    // ── Cart State Mutators ──────────────────────────────────────────────────

    const addToCart = (product: Product, selectedBatch: Batch) => {
        const existing = cart.find(
            (item) => item.batch_id === selectedBatch.id,
        );

        if (existing) {
            if (existing.quantity >= selectedBatch.quantity_available) {
                return;
            }

            setCart((prev) =>
                prev.map((item) =>
                    item.batch_id === selectedBatch.id
                        ? {
                              ...item,
                              quantity: item.quantity + 1,
                              subtotal: (item.quantity + 1) * item.unit_price,
                          }
                        : item,
                ),
            );
        } else {
            setCart((prev) => [
                ...prev,
                {
                    product_id: product.id,
                    batch_id: selectedBatch.id,
                    name: product.name,
                    form: product.form,
                    unit: product.unit,
                    batch_number: selectedBatch.batch_number,
                    expiry_date: selectedBatch.expiry_date,
                    quantity: 1,
                    unit_price: selectedBatch.selling_price,
                    subtotal: selectedBatch.selling_price,
                    max_quantity: selectedBatch.quantity_available,
                    available_batches: product.batches,
                },
            ]);
        }
    };

    const handleBatchChange = (currentBatchId: string, newBatchId: string) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.batch_id === currentBatchId) {
                    const newBatch = item.available_batches.find(
                        (b) => b.id === newBatchId,
                    );

                    if (!newBatch) {
                        return item;
                    }

                    const validQty = Math.min(
                        item.quantity,
                        newBatch.quantity_available,
                    );

                    return {
                        ...item,
                        batch_id: newBatch.id,
                        batch_number: newBatch.batch_number,
                        expiry_date: newBatch.expiry_date,
                        unit_price: newBatch.selling_price,
                        max_quantity: newBatch.quantity_available,
                        quantity: validQty,
                        subtotal: validQty * newBatch.selling_price,
                    };
                }

                return item;
            }),
        );
    };

    const increaseQty = (batchId: string) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.batch_id === batchId) {
                    if (item.quantity >= item.max_quantity) {
                        return item;
                    }

                    const newQty = item.quantity + 1;

                    return {
                        ...item,
                        quantity: newQty,
                        subtotal: newQty * item.unit_price,
                    };
                }

                return item;
            }),
        );
    };

    const decreaseQty = (batchId: string) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.batch_id === batchId
                        ? {
                              ...item,
                              quantity: item.quantity - 1,
                              subtotal: (item.quantity - 1) * item.unit_price,
                          }
                        : item,
                )
                .filter((item) => item.quantity > 0),
        );
    };

    const removeItem = (batchId: string) => {
        setCart((prev) => prev.filter((item) => item.batch_id !== batchId));
    };

    const clearCart = () => {
        setCart([]);
        setDiscount(0);
        setAmountPaid(0);
        setPaymentMethod('cash');
    };

    // ── Summary Calculations ─────────────────────────────────────────────────

    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const total = Math.max(subtotal - discount, 0);
    const change = Math.max(amountPaid - total, 0);
    const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = () => {
        if (onCheckout) {
            onCheckout({
                cart,
                subtotal,
                discount,
                total,
                amountPaid,
                change,
                paymentMethod,
            });
        }

        clearCart();
        setIsSheetOpen(false);
    };

    return (
        <DashboardInnerLayout>
            <div className="relative flex h-full flex-col gap-4">
                <Card className="flex flex-1 flex-col shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
                        <div className="tborder relative max-w-md flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search live products, SKU, or batch..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="rounded-xl pl-9"
                                autoFocus
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        {/* <SearchInput
                            href={window.location.pathname}
                            filters={}
                            placeholder="Search live  , SKU, or batch..."
                        /> */}
                    </CardHeader>

                    <CardContent className="flex-1 space-y-2 overflow-y-auto">
                        {filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground/40" />
                                <p className="text-sm text-muted-foreground">
                                    {products.length === 0
                                        ? 'No products available in inventory.'
                                        : `No products found matching "${search}"`}
                                </p>
                            </div>
                        ) : (
                            filteredProducts.map((product) => (
                                <ProductRow
                                    key={product.id}
                                    product={product}
                                    currencySymbol={currencySymbol}
                                    onAdd={addToCart}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Floating Drawer Trigger */}
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button
                            size="lg"
                            className="fixed right-6 bottom-6 z-40 h-14 w-14 rounded-full p-0 shadow-lg transition-transform hover:scale-105 active:scale-95"
                        >
                            <div className="relative">
                                <ShoppingCart className="h-6 w-6" />
                                {totalItemsCount > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-3 -right-3 flex h-5 min-w-5 justify-center rounded-full px-1 text-[10px] font-bold shadow-sm"
                                    >
                                        {totalItemsCount}
                                    </Badge>
                                )}
                            </div>
                        </Button>
                    </SheetTrigger>

                    <SheetContent className="flex w-full flex-col border-l border-border p-0 sm:max-w-md">
                        <SheetHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 border-b border-border p-4 pr-12">
                            <SheetTitle className="flex items-center gap-2 text-base font-semibold">
                                <ShoppingCart className="h-4 w-4" />
                                Current Sale ({totalItemsCount})
                            </SheetTitle>
                            {cart.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearCart}
                                    className="h-8 rounded-lg text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                    Clear
                                </Button>
                            )}
                        </SheetHeader>

                        <div className="flex-1 space-y-6 overflow-y-auto p-4">
                            {cart.length === 0 ? (
                                <div className="flex h-64 flex-col items-center justify-center text-center">
                                    <ShoppingCart className="mb-2 h-8 w-8 text-muted-foreground/30" />
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Cart is empty
                                    </p>
                                    <p className="text-xs text-muted-foreground/70">
                                        Select products to begin checkout
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        {cart.map((item) => (
                                            <CartRow
                                                key={item.batch_id}
                                                item={item}
                                                currencySymbol={currencySymbol}
                                                onIncrease={increaseQty}
                                                onDecrease={decreaseQty}
                                                onRemove={removeItem}
                                                onBatchChange={
                                                    handleBatchChange
                                                }
                                            />
                                        ))}
                                    </div>

                                    <Separator />

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Subtotal</span>
                                            <span className="font-medium text-foreground">
                                                {currencySymbol}{' '}
                                                {subtotal.toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-muted-foreground">
                                                Discount
                                            </span>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={subtotal}
                                                value={discount || ''}
                                                onChange={(e) =>
                                                    setDiscount(
                                                        Math.min(
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                            subtotal,
                                                        ),
                                                    )
                                                }
                                                placeholder="0"
                                                className="h-8 w-28 rounded-lg text-right text-xs"
                                            />
                                        </div>

                                        <Separator className="my-1" />

                                        <div className="flex justify-between text-base font-bold text-foreground">
                                            <span>Total</span>
                                            <span>
                                                {currencySymbol}{' '}
                                                {total.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-muted-foreground">
                                                Payment Method
                                            </label>
                                            <Select
                                                value={paymentMethod}
                                                onValueChange={(val) =>
                                                    setPaymentMethod(
                                                        val as PaymentMethod,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="rounded-xl text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">
                                                        Cash
                                                    </SelectItem>
                                                    <SelectItem value="card">
                                                        Card
                                                    </SelectItem>
                                                    <SelectItem value="mobile">
                                                        Mobile Money
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {paymentMethod === 'cash' && (
                                            <div className="space-y-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-muted-foreground">
                                                        Amount Paid
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        min={total}
                                                        value={amountPaid || ''}
                                                        onChange={(e) =>
                                                            setAmountPaid(
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        placeholder={`Min ${currencySymbol} ${total.toLocaleString()}`}
                                                        className="rounded-xl text-xs"
                                                    />
                                                </div>
                                                {amountPaid >= total &&
                                                    amountPaid > 0 && (
                                                        <div className="flex justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                            <span>Change</span>
                                                            <span>
                                                                {currencySymbol}{' '}
                                                                {change.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                            </div>
                                        )}

                                        <Button
                                            className="w-full rounded-xl"
                                            size="lg"
                                            onClick={handleCheckout}
                                            disabled={
                                                paymentMethod === 'cash' &&
                                                amountPaid < total
                                            }
                                        >
                                            <Receipt className="mr-2 h-4 w-4" />
                                            Complete Sale
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </DashboardInnerLayout>
    );
}
