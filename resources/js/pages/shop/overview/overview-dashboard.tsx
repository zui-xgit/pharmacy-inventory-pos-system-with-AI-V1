// import StatCard from '@/components/shop/dashboard/stat-card';
import { usePage } from '@inertiajs/react';
import { ShoppingCart, TrendingUp, Package, Clock } from 'lucide-react';
import RecentSales from '@/components/dashboard/recent-sales';
import StatCard from '@/components/dashboard/stat-card';
// import RecentSales from '@/components/shop/dashboard/recent-sales';
// import TopProducts from '@/components/shop/dashboard/top-products';
import TopProducts from '@/components/dashboard/top-products';
import DashboardInnerLayout from '@/layouts/app/dashboard-inner-layout';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Sale {
    id: string;
    receipt_number: string;
    cashier_name: string;
    items_count: number;
    total_amount: string;
    payment_method: 'cash' | 'card' | 'mobile';
    time: string;
}

interface Product {
    id: string;
    name: string;
    form: string;
    units_sold: number;
    revenue: string;
}

interface Props {
    shop: {
        id: string;
        name: string;
        currency_symbol: string;
    };
    stats: {
        total_sales_today: number;
        total_revenue_today: string;
        low_stock_count: number;
        expiring_soon_count: number;
    };
    recent_sales: Sale[];
    top_products: Product[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const OverviewDashboard = () => {
    const { shop, stats, recent_sales, top_products } = usePage<{
        props: Props;
    }>().props as unknown as Props;

    return (
        <DashboardInnerLayout>
            <div className="space-y-6">
                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Sales Today"
                        value={`${stats.total_sales_today} Sales`}
                        sub="Completed transactions"
                        icon={ShoppingCart}
                    />
                    <StatCard
                        title="Revenue Today"
                        value={`${shop.currency_symbol} ${stats.total_revenue_today}`}
                        sub="All payment methods"
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="Low Stock Alerts"
                        value={`${stats.low_stock_count} Items`}
                        sub="Below reorder point"
                        icon={Package}
                        alert={stats.low_stock_count > 0}
                    />
                    <StatCard
                        title="Expiring Soon"
                        value={`${stats.expiring_soon_count} Batches`}
                        sub="Within alert window"
                        icon={Clock}
                        alert={stats.expiring_soon_count > 0}
                    />
                </div>

                {/* Recent sales + top products */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <RecentSales
                            sales={recent_sales}
                            currencySymbol={shop.currency_symbol}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <TopProducts
                            products={top_products as []}
                            currencySymbol={shop.currency_symbol}
                        />
                    </div>
                </div>
            </div>
        </DashboardInnerLayout>
    );
};

export default OverviewDashboard;

OverviewDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Overview Dashboard',
            href: '#',
        },
    ],
};
