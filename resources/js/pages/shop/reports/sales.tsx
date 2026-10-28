import { Head, Link, router } from '@inertiajs/react';
import {
    BarChart3,
    Calendar,
    DollarSign,
    Receipt,
    ShoppingBag,
    TrendingUp,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import DatePicker from '@/components/dashboard/date-picker';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import DashboardInnerLayout from '@/layouts/app/dashboard-inner-layout';
import reports from '@/routes/reports';

interface SaleItem {
    uuid: string;
    receipt_number: string;
    total_amount: number;
    discount: number;
    payment_method: string;
    status: string;
    created_at: string;
    cashier: string | null;
    items_count: number;
    profit: number;
}

interface TopProduct {
    product_id: number;
    total_qty: number;
    total_revenue: number;
    total_profit: number;
    product: {
        id: number;
        name: string;
    } | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    sales: {
        data: SaleItem[];
        links: PaginationLink[];
    };
    summary: {
        totalSales: number;
        totalTransactions: number;
        totalProfit: number;
    };
    topProducts: TopProduct[];
    filters: {
        period: string;
        from?: string;
        to?: string;
    };
    shop_uuid: string;
}

interface StatCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    valueClassName?: string;
}

function StatCard({ title, value, icon, valueClassName }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className={`text-xl font-bold ${valueClassName ?? ''}`}>
                    {value}
                </div>
            </CardContent>
        </Card>
    );
}

export default function SalesReports({
    sales,
    summary,
    topProducts,
    filters,
    shop_uuid,
}: Props) {
    const [period, setPeriod] = useState(filters.period || 'today');
    const [from, setFrom] = useState(filters.from || '');
    const [to, setTo] = useState(filters.to || '');

    const applyFilters = (
        newPeriod: string,
        fromDate?: string,
        toDate?: string,
    ) => {
        router.get(
            reports.sales({ shop: shop_uuid }).url,
            {
                period: newPeriod,
                from: fromDate || from,
                to: toDate || to,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handlePeriodChange = (value: string) => {
        setPeriod(value);
        if (value !== 'custom') {
            applyFilters(value);
        }
    };

    const handleCustomApply = () => {
        if (from && to) {
            applyFilters('custom', from, to);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <DashboardInnerLayout>
            <Head title="Sales Reports" />
            <Heading
                title="Sales Reports"
                description="Track sales performance, revenue, and profitability"
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <Select value={period} onValueChange={handlePeriodChange}>
                    <SelectTrigger className="w-[180px]">
                        <Calendar className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                </Select>

                {period === 'custom' && (
                    <div className="flex flex-wrap items-center gap-2">
                        <DatePicker
                            value={from}
                            onChange={setFrom}
                            placeholder="From date"
                        />
                        <DatePicker
                            value={to}
                            onChange={setTo}
                            placeholder="To date"
                        />
                        <Button onClick={handleCustomApply} size="sm">
                            Apply
                        </Button>
                    </div>
                )}
            </div>

            {/* stat cards */}
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Sales"
                    value={formatCurrency(summary.totalSales)}
                    icon={
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    }
                />
                <StatCard
                    title="Transactions"
                    value={summary.totalTransactions.toString()}
                    icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard
                    title="Total Profit"
                    value={formatCurrency(summary.totalProfit)}
                    icon={
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    }
                    valueClassName="text-emerald-600"
                />
                <StatCard
                    title="Avg. Transaction"
                    value={formatCurrency(
                        summary.totalTransactions > 0
                            ? summary.totalSales / summary.totalTransactions
                            : 0,
                    )}
                    icon={
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    }
                />
            </div>

            <div className="mt-6 flex flex-col gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                        <CardDescription>
                            Sales transactions for the selected period
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Receipt</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Cashier</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead className="text-right">
                                            Total
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Profit
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sales.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="text-center text-muted-foreground"
                                            >
                                                No sales found for this period
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sales.data.map((sale) => (
                                            <TableRow key={sale.uuid}>
                                                <TableCell className="font-mono text-sm">
                                                    {sale.receipt_number}
                                                </TableCell>
                                                <TableCell>
                                                    {sale.created_at}
                                                </TableCell>
                                                <TableCell>
                                                    {sale.cashier || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {sale.items_count}
                                                </TableCell>
                                                <TableCell className="capitalize">
                                                    {sale.payment_method}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(
                                                        sale.total_amount,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right text-emerald-600">
                                                    {formatCurrency(
                                                        sale.profit,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {sales.links.length > 3 && (
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
                                {sales.links.map((link, index) => {
                                    if (!link.url) {
                                        return null;
                                    }
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

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5" />
                            Top Products
                        </CardTitle>
                        <CardDescription>
                            Best selling products by quantity
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topProducts.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground">
                                    No data available
                                </p>
                            ) : (
                                topProducts.map((item, index) => (
                                    <div
                                        key={item.product_id}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {item.product?.name ||
                                                        'Unknown'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.total_qty} units sold
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                {formatCurrency(
                                                    item.total_revenue,
                                                )}
                                            </p>
                                            <p className="text-xs text-emerald-600">
                                                +
                                                {formatCurrency(
                                                    item.total_profit,
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

SalesReports.layout = {
    breadcrumbs: [{ title: 'Sales Reports', href: '#' }],
};
