import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Box,
    Clock,
    Package,
    PackageX,
    TrendingDown,
} from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import Heading from '@/components/heading';
import SearchInput from '@/components/search-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import DashboardInnerLayout from '@/layouts/app/dashboard-inner-layout';
import { formatDate } from '@/lib/utils';
import reports from '@/routes/reports';

interface BatchItem {
    uuid: string;
    batch_number: string;
    product: { name: string; dosage_form: string | null };
    units_remaining: number;
    packages_remaining: number;
    cost_price: number;
    selling_price: number;
    expiry_date: string;
    manufactured_date: string;
    is_expired: boolean;
    is_expiring_soon: boolean;
    days_until_expiry: number;
    is_out_of_stock: boolean;
    stock_value: number;
}

interface LowStockProduct {
    name: string;
    total_units: number;
    reorder_point: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    batches: { data: BatchItem[]; links: PaginationLink[] };
    summary: {
        totalProducts: number;
        totalBatches: number;
        outOfStock: number;
        expired: number;
        expiringSoon: number;
        totalStockValue: number;
    };
    lowStockProducts: LowStockProduct[];
    filters: { search?: string };
    shop_uuid: string;
}

export default function InventoryReports({
    batches,
    summary,
    lowStockProducts,
    filters,
    shop_uuid,
}: Props) {
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0,
        }).format(amount);
    const hasSearch = Boolean(filters.search?.trim());

    return (
        <DashboardInnerLayout>
            <Head title="Inventory Reports" />
            <Heading
                title="Inventory Reports "
                description="Monitor stock levels, expiry dates, and inventory value"
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <StatCard
                    title="Total Products"
                    value={summary.totalProducts.toString()}
                    icon={<Package className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard
                    title="Total Batches"
                    value={summary.totalBatches.toString()}
                    icon={<Box className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard
                    title="Stock Value"
                    value={formatCurrency(summary.totalStockValue)}
                    icon={
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    }
                />
                <StatCard
                    title="Out of Stock"
                    value={summary.outOfStock.toString()}
                    icon={
                        <PackageX className="h-4 w-4 text-muted-foreground" />
                    }
                    valueClassName={
                        summary.outOfStock > 0 ? 'text-destructive' : ''
                    }
                />
                <StatCard
                    title="Expired"
                    value={summary.expired.toString()}
                    icon={
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    }
                    valueClassName={
                        summary.expired > 0 ? 'text-destructive' : ''
                    }
                />
                <StatCard
                    title="Expiring Soon"
                    value={summary.expiringSoon.toString()}
                    icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                    valueClassName={
                        summary.expiringSoon > 0 ? 'text-amber-600' : ''
                    }
                />
            </div>

            <div className="mt-6 flex flex-col gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5" />
                            Low Stock Alert
                        </CardTitle>
                        <CardDescription>
                            Products below reorder point
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {lowStockProducts.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground">
                                    No low stock items
                                </p>
                            ) : (
                                lowStockProducts.map((product, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Reorder at{' '}
                                                {product.reorder_point} units
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="text-amber-600"
                                        >
                                            {product.total_units} units left
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Batch Inventory</CardTitle>
                        <CardDescription>
                            All batches with current stock levels and expiry
                            status
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="w-full lg:w-1/2">
                            <SearchInput
                                href={
                                    reports.inventory({ shop: shop_uuid }).url
                                }
                                filters={filters}
                                placeholder="Search batch number or product..."
                            />
                        </div>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Batch #</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Cost/Sell</TableHead>
                                        <TableHead>Expiry</TableHead>
                                        <TableHead className="text-right">
                                            Stock Value
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batches.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center text-muted-foreground"
                                            >
                                                {hasSearch
                                                    ? 'No batches found for "' +
                                                      filters.search +
                                                      '".'
                                                    : 'No batches found'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        batches.data.map((batch) => (
                                            <TableRow key={batch.uuid}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">
                                                            {batch.product.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                batch.product
                                                                    .dosage_form
                                                            }
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {batch.batch_number}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            {
                                                                batch.units_remaining
                                                            }{' '}
                                                            units
                                                        </span>
                                                        {batch.is_out_of_stock && (
                                                            <Badge variant="destructive">
                                                                Out
                                                            </Badge>
                                                        )}
                                                        {!batch.is_out_of_stock &&
                                                            batch.is_expired && (
                                                                <Badge variant="destructive">
                                                                    Expired
                                                                </Badge>
                                                            )}
                                                        {!batch.is_out_of_stock &&
                                                            !batch.is_expired &&
                                                            batch.is_expiring_soon && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-amber-600"
                                                                >
                                                                    Expiring
                                                                </Badge>
                                                            )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <p>
                                                            {formatCurrency(
                                                                batch.cost_price,
                                                            )}
                                                        </p>
                                                        <p className="text-muted-foreground">
                                                            {formatCurrency(
                                                                batch.selling_price,
                                                            )}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p
                                                            className={
                                                                batch.is_expired
                                                                    ? 'text-destructive'
                                                                    : batch.is_expiring_soon
                                                                      ? 'text-amber-600'
                                                                      : ''
                                                            }
                                                        >
                                                            {formatDate(
                                                                batch.expiry_date,
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {batch.is_expired
                                                                ? 'Expired'
                                                                : batch.days_until_expiry +
                                                                  ' days left'}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(
                                                        batch.stock_value,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {batches.links.length > 3 && (
                            <div className="flex flex-wrap items-center justify-center gap-1">
                                {batches.links.map((link, index) => {
                                    if (!link.url) return null;
                                    return (
                                        <Button
                                            key={index}
                                            asChild
                                            size="sm"
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            <Link
                                                href={link.url}
                                                preserveState
                                                preserveScroll
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        </Button>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardInnerLayout>
    );
}

InventoryReports.layout = {
    breadcrumbs: [{ title: 'Inventory Reports', href: '#' }],
};
