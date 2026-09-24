import { useState, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import {
    Package,
    Calendar,
    Tag,
    Layers,
    SearchX,
    AlertTriangle,
    ShoppingCart,
} from 'lucide-react';

import DashboardInnerLayout from '@/layouts/app/dashboard-inner-layout';
import SearchInput from '@/components/search-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, isExpired } from '@/lib/utils';
import { useCartStore } from '@/hooks/stores/user-cart-store';
import { PosCartSheet } from '@/components/sheets/post-cart-sheet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface BatchItem {
    id: number;
    uuid: string;
    batch_number: string;
    units_remaining: number;
    packages_remaining: number;
    expiry_date: string;
    selling_price: number | string;
}

export interface PosProduct {
    uuid: string;
    name: string;
    dosage_form: {
        uuid?: string;
        name: string;
    };
    total_stock: number;
    selling_price: number | string;
    batches: BatchItem[];
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface PosPageProps {
    products: PaginatedResponse<PosProduct> | [];
    filters: {
        search?: string;
    };
    [key: string]: unknown;
}

export default function PosPage() {
    const [mounted, setMounted] = useState(false);
    const { products, filters } = usePage<PosPageProps>().props;

    useEffect(() => {
        setMounted(true);
    }, []);

    const searchTerm = filters.search || '';
    const currentPath =
        typeof window !== 'undefined' ? window.location.pathname : '';

    // Handle both Paginated payload and empty collection initial state
    const productList = Array.isArray(products)
        ? products
        : products?.data || [];
    const paginationLinks =
        !Array.isArray(products) && products?.links ? products.links : [];

    const rawTotalItems = useCartStore((state) => state.getTotalItems());
    // Safe guard during SSR to prevent client hydration mismatch from localStorage
    const totalItems = mounted ? rawTotalItems : 0;

    return (
        <DashboardInnerLayout>
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Search Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-full max-w-lg">
                        <SearchInput
                            href={currentPath}
                            filters={filters}
                            placeholder="Type product name or dosage form..."
                        />
                    </div>
                </div>

                {/* 1. Idle State: Search Prompt */}
                {!searchTerm && (
                    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold">
                            Search Products
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Start typing in the search bar above to look up
                            products for sale.
                        </p>
                    </div>
                )}

                {/* 2. Empty Results State */}
                {searchTerm && productList.length === 0 && (
                    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <SearchX className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold">
                            No products found
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            No active products or in-stock FEFO batches match "
                            {searchTerm}".
                        </p>
                    </div>
                )}

                {/* 3. FEFO Product Grid */}
                {searchTerm && productList.length > 0 && (
                    <>
                        <div className="grid gap-4 lg:grid-cols-2">
                            {productList.map((product) => (
                                <ListPosProductsCard
                                    product={product}
                                    key={product.uuid}
                                />
                            ))}
                        </div>

                        {/* Pagination Links */}
                        {paginationLinks.length > 3 && (
                            <div className="mt-6 flex items-center justify-center gap-1">
                                {paginationLinks.map((link, idx) =>
                                    link.url ? (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-foreground hover:bg-muted/80'
                                            }`}
                                        />
                                    ) : (
                                        <span
                                            key={idx}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                            className="px-3 py-1.5 text-xs text-muted-foreground opacity-50"
                                        />
                                    ),
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <PosCartSheet
                trigger={
                    <div className="fixed right-6 bottom-6 z-50">
                        <Button
                            size="icon"
                            className="relative h-14 w-14 cursor-pointer rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
                            aria-label="Open Cart"
                        >
                            <ShoppingCart className="h-6 w-6" />
                            {totalItems > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-1.5 -right-1.5 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-background px-1.5 text-xs font-bold shadow-sm"
                                >
                                    {totalItems > 99 ? '99+' : totalItems}
                                </Badge>
                            )}
                        </Button>
                    </div>
                }
            />
        </DashboardInnerLayout>
    );
}

const ListPosProductsCard = ({ product }: { product: PosProduct }) => {
    const addItem = useCartStore((state) => state.addItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);

    const handleBatchClick = (batch: BatchItem) => {
        addItem(product, batch);

        toast.success(`Product added to cart`, {
            description: (
                <div className="mt-1 flex flex-col gap-0.5 text-xs">
                    <div>
                        <span className="font-medium">Product Name:</span>{' '}
                        {product.name}
                    </div>
                    <div>
                        <span className="font-medium">Batch No:</span>{' '}
                        {batch.batch_number}
                    </div>
                    <div>
                        <span className="font-medium">Expiry date:</span>{' '}
                        {formatDate(batch.expiry_date)}
                    </div>
                </div>
            ),
            richColors: true,
            duration: 3000,
            position: 'top-center',
            action: {
                label: 'Undo',
                onClick: () => updateQuantity(batch.id, -1),
            },
        });
    };
    return (
        <Card className="flex flex-col justify-between gap-0">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardTitle className="text-base font-bold">
                            {product.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{product.dosage_form?.name ?? 'N/A'}</span>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className="shrink-0 text-xs font-semibold"
                    >
                        Stock: {product.total_stock}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <div className="mt-2 space-y-2 border-t pt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium">
                            <Layers className="h-3.5 w-3.5 text-primary" />{' '}
                            Batches ({product.batches.length})
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase dark:text-emerald-400">
                            FEFO Order
                        </span>
                    </div>

                    <div className="max-h-36 space-y-1.5 overflow-y-auto pr-1">
                        {product.batches.map((batch, index) => {
                            const expired = isExpired(batch.expiry_date);
                            return (
                                <div
                                    key={index}
                                    onClick={() => handleBatchClick(batch)}
                                    className="flex cursor-pointer items-center justify-between rounded-md border border-emerald-500/30 bg-emerald-50/50 p-2 transition-transform duration-200 hover:scale-[1.01] dark:bg-emerald-950/20"
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-foreground">
                                                #{batch.batch_number}
                                            </span>
                                        </div>
                                        <span
                                            className={`flex items-center gap-1 text-[11px] ${
                                                expired
                                                    ? 'font-medium text-destructive'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            <Calendar className="h-3 w-3" />{' '}
                                            Expiry date:{' '}
                                            {formatDate(batch.expiry_date)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-foreground">
                                            {batch.units_remaining} units left
                                        </div>
                                        <div className="flex items-center justify-end text-[11px] font-medium text-muted-foreground">
                                            <Tag className="mr-0.5 h-3 w-3" />{' '}
                                            {batch.selling_price}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
