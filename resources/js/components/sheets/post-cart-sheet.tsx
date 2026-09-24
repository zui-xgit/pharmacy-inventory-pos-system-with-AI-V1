import React, { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    ArrowRight,
} from 'lucide-react';
import { CartItem, useCartStore } from '@/hooks/stores/user-cart-store';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { router, usePage } from '@inertiajs/react';
import current_shop from '@/routes/current_shop';
import { Spinner } from '@/components/ui/spinner';

interface PosCartSheetProps {
    trigger: React.ReactNode;
}

export function PosCartSheet({ trigger }: PosCartSheetProps) {
    const { active_shop } = usePage<{ active_shop: { uuid: string } }>().props;
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const cart = useCartStore((state) => state.cart);
    const clearCart = useCartStore((state) => state.clearCart);

    const totalItems = useCartStore((state) => state.getTotalItems());
    const totalPrice = useCartStore((state) => state.getTotalPrice());

    const [loading, setLoading] = useState<boolean>(false);

    const handleCheckout = () => {
        if (!cart || cart.length === 0) {
            return;
        }

        const items = cart.map((cart_item) => {
            return {
                batch_id: cart_item.batch_id,
                quantity: cart_item.quantity,
            };
        });

        router.post(
            current_shop.pos.checkout({ shop: active_shop.uuid }).url,
            {
                items,
            },
            {
                onStart: () => {
                    setLoading(true);
                },
                onSuccess: ({ flash }) => {
                    clearCart();
                    setIsOpen(false);

                    if (flash.message) {
                        toast.success(flash.message as string, {
                            richColors: true,
                            position: 'top-center',
                        });
                    }
                },
                onError: (errors) => {
                    toast.error('Something went wrong ', {
                        richColors: true,
                        position: 'top-center',
                    });
                },
                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent className="flex h-full w-full flex-col sm:max-w-md">
                {/* Header */}
                <SheetHeader className="shrink-0 border-b p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2 text-xl font-bold">
                            <ShoppingBag className="h-5 w-5 text-primary" />
                            Cart Summary
                        </SheetTitle>
                    </div>
                </SheetHeader>

                {/* Cart Item List - Native CSS overflow scroll */}
                {cart.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <ShoppingCart className="h-8 w-8 text-muted-foreground/60" />
                        </div>
                        <h3 className="mb-1 text-lg font-semibold">
                            Your cart is empty
                        </h3>
                        <p className="max-w-xs text-sm text-muted-foreground">
                            Add products from the POS inventory list to begin an
                            order.
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 space-y-4 overflow-y-auto px-5">
                        {cart.map((item, index) => (
                            <CartRow key={index} item={item} />
                        ))}
                    </div>
                )}

                {/* Footer & Checkout */}
                {cart.length > 0 && (
                    <SheetFooter className="shrink-0 flex-col border-t bg-muted/20 sm:flex-col">
                        <div className="w-full flex-col space-y-1 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Total Items</span>
                                <span className="font-medium text-foreground">
                                    {totalItems}
                                </span>
                            </div>
                            <Separator />
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm font-semibold">
                                    Total Amount
                                </span>
                                <span className="text-sm font-bold text-primary">
                                    {formatCurrency(totalPrice)}
                                </span>
                            </div>
                        </div>

                        <div className="tborderf grid grid-cols-12 gap-2">
                            <Button
                                size={'sm'}
                                variant={'outline'}
                                onClick={clearCart}
                                className="col-span-3 cursor-pointer text-sm font-semibold"
                                disabled={loading}
                            >
                                <Trash2 />
                                Clear all
                            </Button>
                            <Button
                                size="sm"
                                className="col-span-9 cursor-pointer text-sm font-semibold"
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Spinner />
                                ) : (
                                    <>
                                        Checkout
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}

interface CartRowProps {
    item: CartItem;
}

function CartRow({ item }: CartRowProps) {
    const [inputVal, setInputVal] = useState(item.quantity.toString());
    const onUpdateQuantity = useCartStore((state) => state.updateQuantity);
    const onSetQuantity = useCartStore((state) => state.setQuantity);
    const onRemoveItem = useCartStore((state) => state.removeItem);
    const getItemQuantity = useCartStore((state) => state.getItemQuantity);

    useEffect(() => {
        setInputVal(item.quantity.toString());
    }, [item.quantity]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawVal = e.target.value;
        setInputVal(rawVal);

        const parsed = parseInt(rawVal, 10);
        if (!isNaN(parsed)) {
            onSetQuantity(item.batch_id, parsed);
        }
    };

    const handleBlur = () => {
        if (inputVal === '' || parseInt(inputVal, 10) <= 0) {
            setInputVal(item.quantity.toString());
        }
    };

    const isAtMax = item.quantity >= item.max_units;

    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-card p-2 text-card-foreground shadow-sm">
            <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-semibold">
                    {item.product_name}
                </h4>
                <div className="mt-1 flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="px-1.5 py-0 text-xs font-bold"
                    >
                        Batch NO: {item.batch_number}
                    </Badge>
                    <span className="text-xs font-bold text-muted-foreground">
                        Max: {item.max_units}
                    </span>
                </div>
                <div className="mt-2 text-xs font-semibold text-muted-foreground">
                    {formatCurrency(item.selling_price)} / unit
                </div>
            </div>

            <div className="flex h-full flex-col items-end justify-between gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove item"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveItem(item.batch_id)}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 rounded-md border bg-background p-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Decrease quantity"
                        className="h-6 w-6 cursor-pointer rounded-xs"
                        onClick={() => onUpdateQuantity(item.batch_id, -1)}
                    >
                        <Minus className="h-3 w-3" />
                    </Button>

                    <Input
                        type="number"
                        min={1}
                        max={item.max_units}
                        value={inputVal}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className="h-6 w-10 [appearance:textfield] border-0 p-0 text-center text-xs focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />

                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Increase quantity"
                        className="h-6 w-6 cursor-pointer rounded-xs"
                        disabled={isAtMax}
                        onClick={() => {
                            onUpdateQuantity(item.batch_id, 1);

                            if (
                                getItemQuantity(item.batch_id) ===
                                item.max_units
                            ) {
                                toast.error('Maximum stock limit reached', {
                                    description: (
                                        <div className="flex flex-col gap-0.5 text-xs">
                                            {item.product_name && (
                                                <div>
                                                    <span className="font-medium">
                                                        Product:
                                                    </span>{' '}
                                                    {item.product_name}{' '}
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium">
                                                    Batch No:
                                                </span>{' '}
                                                #
                                                {item.batch_number ||
                                                    item.batch_id}
                                            </div>
                                            <div>
                                                <span className="font-medium">
                                                    Max Stock:
                                                </span>{' '}
                                                {item.max_units} units
                                            </div>
                                        </div>
                                    ),
                                    duration: 5000,
                                    richColors: true,
                                    position: 'top-center',
                                });
                            }
                        }}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>

                {/* Item Total */}
                <div className="text-sm font-bold">
                    {formatCurrency(item.selling_price * item.quantity)}
                </div>
            </div>
        </div>
    );
}
