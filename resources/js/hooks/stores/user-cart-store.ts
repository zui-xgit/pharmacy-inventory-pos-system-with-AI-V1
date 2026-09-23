import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    batch_id: number;
    batch_number: string;
    product_name: string;
    selling_price: number;
    quantity: number;
    max_units: number;
}

export interface PosProduct {
    uuid: string;
    name: string;
    dosage_form?: {
        uuid?: string;
        name: string;
    };
    total_stock: number;
    selling_price: number | string;
    batches: BatchItem[];
}

export interface BatchItem {
    id: number;
    uuid: string;
    batch_number: string;
    units_remaining: number;
    packages_remaining: number;
    expiry_date: string;
    selling_price: number | string;
}

interface CartState {
    cart: CartItem[];

    // Actions
    addItem: (product: PosProduct, batch: BatchItem, quantity?: number) => void;
    updateQuantity: (batchId: number, delta: number) => void;
    setQuantity: (batchId: number, quantity: number) => void;
    removeItem: (batchId: number) => void;
    clearCart: () => void;

    // Computed Helpers
    getTotalItems: () => number;
    getTotalPrice: () => number;
    getItemQuantity: (batchId: number) => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: [],

            // Add item to cart (or increment if batch already present)
            addItem: (product, batch, quantity = 1) => {
                const numericPrice =
                    typeof batch.selling_price === 'string'
                        ? parseFloat(batch.selling_price)
                        : batch.selling_price;

                set((state) => {
                    const existingIndex = state.cart.findIndex(
                        (item) => item.batch_id === batch.id,
                    );

                    if (existingIndex > -1) {
                        const updatedCart = [...state.cart];
                        const currentItem = updatedCart[existingIndex];
                        const newQuantity = Math.min(
                            currentItem.quantity + quantity,
                            batch.units_remaining,
                        );

                        updatedCart[existingIndex] = {
                            ...currentItem,
                            quantity: newQuantity,
                        };

                        return { cart: updatedCart };
                    }

                    // New item entry
                    const newItem: CartItem = {
                        batch_id: batch.id,
                        batch_number: batch.batch_number,
                        product_name: product.name,
                        selling_price: numericPrice,
                        quantity: Math.min(quantity, batch.units_remaining),
                        max_units: batch.units_remaining,
                    };

                    return { cart: [...state.cart, newItem] };
                });
            },

            // Increment or decrement relative quantity
            updateQuantity: (batchId, delta) => {
                set((state) => ({
                    cart: state.cart
                        .map((item) => {
                            if (item.batch_id === batchId) {
                                const targetQty = item.quantity + delta;

                                if (targetQty <= 0) return null; // Remove if 0 or negative

                                return {
                                    ...item,
                                    quantity: Math.min(
                                        targetQty,
                                        item.max_units,
                                    ),
                                };
                            }
                            return item;
                        })
                        .filter((item): item is CartItem => item !== null),
                }));
            },

            // Set specific absolute quantity
            setQuantity: (batchId, quantity) => {
                set((state) => ({
                    cart: state.cart
                        .map((item) => {
                            if (item.batch_id === batchId) {
                                if (quantity <= 0) return null;

                                return {
                                    ...item,
                                    quantity: Math.min(
                                        quantity,
                                        item.max_units,
                                    ),
                                };
                            }
                            return item;
                        })
                        .filter((item): item is CartItem => item !== null),
                }));
            },

            // Remove single item by batch_id
            removeItem: (batchId) => {
                set((state) => ({
                    cart: state.cart.filter(
                        (item) => item.batch_id !== batchId,
                    ),
                }));
            },

            // Clear all items from cart
            clearCart: () => set({ cart: [] }),

            // Computed selector methods
            getTotalItems: () => {
                return get().cart.reduce((sum, item) => sum + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().cart.reduce(
                    (sum, item) => sum + item.selling_price * item.quantity,
                    0,
                );
            },

            getItemQuantity: (batchId) => {
                const item = get().cart.find((i) => i.batch_id === batchId);
                return item ? item.quantity : 0;
            },
        }),
        {
            name: '@inventory-post-system:pos-cart-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
