import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Clock,
    DollarSign,
    PackageX,
    Receipt,
    ShoppingBag,
    TrendingUp,
} from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import Heading from '@/components/heading';
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
import current_shop from '@/routes/current_shop';
import reports from '@/routes/reports';

interface Stats {
    totalSalesToday: number;
    transactionsToday: number;
    totalProfitToday: number;
    lowStockCount: number;
    outOfStockCount: number;
    expiringSoonCount: number;
    expiredCount: number;
}

interface RecentSale {
    receipt_number: string;
    total_amount: number;
    created_at: string;
    cashier: string | null;
}

interface TopProduct {
    name: string;
    qty: number;
    revenue: number;
}

interface Props {
    stats: Stats;
    recentSales: RecentSale[];
    topProductsToday: TopProduct[];
    shop: {
        name: string;
        uuid: string;
    };
}

export default function OverviewDashboard({
    stats,
    recentSales,
    topProductsToday,
    shop,
}: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <DashboardInnerLayout>
            <Head title="Overview Dashboard" />
            <div className="flex items-center justify-between">
                <Heading
                    title={`${shop.name} - Overview`}
                    description="Today's performance at a glance"
                />
                <div className="mt-6 flex flex-wrap gap-2">
                    <Button asChild>
                        <Link href={current_shop.pos({ shop: shop.uuid })}>
                            <Receipt className="mr-2 h-4 w-4" />
                            Go to POS
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={reports.inventory({ shop: shop.uuid })}>
                            <PackageX className="mr-2 h-4 w-4" />
                            Inventory Reports
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Sales Today"
                    value={formatCurrency(stats.totalSalesToday)}
                    icon={
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    }
                    subtitle={`${stats.transactionsToday} transaction${stats.transactionsToday !== 1 ? 's' : ''}`}
                />
                <StatCard
                    title="Profit Today"
                    value={formatCurrency(stats.totalProfitToday)}
                    icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
                    valueClassName="text-emerald-600"
                />
                <StatCard
                    title="Low Stock"
                    value={stats.lowStockCount.toString()}
                    icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
                    subtitle={`${stats.outOfStockCount} out of stock`}
                    valueClassName={
                        stats.lowStockCount > 0 ? 'text-amber-600' : ''
                    }
                />
                <StatCard
                    title="Expiring Soon"
                    value={stats.expiringSoonCount.toString()}
                    icon={<Clock className="h-4 w-4 text-orange-600" />}
                    subtitle={`${stats.expiredCount} expired`}
                    valueClassName={
                        stats.expiringSoonCount > 0 ? 'text-orange-600' : ''
                    }
                />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Sales</CardTitle>
                            <CardDescription>
                                Latest completed transactions
                            </CardDescription>
                        </div>
                        <Button asChild size="sm" variant="outline">
                            <Link href={reports.sales({ shop: shop.uuid })}>
                                View All
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Receipt</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Cashier</TableHead>
                                        <TableHead className="text-right">
                                            Amount
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentSales.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center text-muted-foreground"
                                            >
                                                No sales today
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentSales.map((sale, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-mono text-sm">
                                                    {sale.receipt_number}
                                                </TableCell>
                                                <TableCell>
                                                    {sale.created_at}
                                                </TableCell>
                                                <TableCell>
                                                    {sale.cashier || '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(
                                                        sale.total_amount,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5" />
                                Top Products Today
                            </CardTitle>
                            <CardDescription>
                                Best sellers by quantity
                            </CardDescription>
                        </div>
                        <Button asChild size="sm" variant="outline">
                            <Link href={reports.sales({ shop: shop.uuid })}>
                                Reports
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topProductsToday.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground">
                                    No sales today
                                </p>
                            ) : (
                                topProductsToday.map((product, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {product.qty} units sold
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                {formatCurrency(
                                                    product.revenue,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardInnerLayout>
    );
}

OverviewDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Overview Dashboard',
            href: '#',
        },
    ],
};
