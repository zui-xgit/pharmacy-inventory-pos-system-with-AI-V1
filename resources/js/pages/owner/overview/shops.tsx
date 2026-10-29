import { Head } from '@inertiajs/react';
import { AlertTriangle, Store, TrendingUp, Users } from 'lucide-react';

import ShopSummaryCard from '@/components/dashboard/shop-summary-card';
import StatCard from '@/components/dashboard/stat-card';
import RegisterBranch from '@/components/dialogs/register-branch';
import Heading from '@/components/heading';
import RefreshButton from '@/components/refresh-button';
import SearchInput from '@/components/search-input';

import DashboardInnerLayout from '@/layouts/app/dashboard-inner-layout';
import owner from '@/routes/owner';

interface ShopStats {
    total_sales_today: number;
    transactions_today: number;
    staff_count: number;
    low_stock_count: number;
    out_of_stock_count: number;
    expiring_soon_count: number;
}

interface Shop {
    uuid: string;
    name: string;
    location: string;
    address: string | null;
    phone: string | null;
    currency: string;
    currency_symbol: string;
    is_active: boolean;
    created_at: string;
    stats: ShopStats;
}

interface BusinessStats {
    totalShops: number;
    activeShops: number;
    totalSalesToday: number;
    totalTransactionsToday: number;
    totalStaff: number;
    totalAlerts: number;
    lowStockAlerts: number;
    expiringSoonAlerts: number;
    currencySymbol: string;
}

interface ShopsProps {
    shops: Shop[];
    stats: BusinessStats;
    filters: {
        search?: string;
    };
}

export default function Shops({ shops, stats, filters }: ShopsProps) {
    const isSearching = Boolean(filters.search);

    return (
        <>
            <Head title="Pharmacy Branches" />
            <DashboardInnerLayout>
                {/* Dashboard Header section inside AppLayout */}
                <div className="flex flex-col gap-4 border-b border-border/40 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Pharmacy Branches"
                        description="Manage and select pharmacy locations under your organization."
                    />
                    <RegisterBranch />
                </div>

                {/* Business wide stats */}
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Shops"
                        value={stats.totalShops.toString()}
                        icon={
                            <Store className="h-4 w-4 text-muted-foreground" />
                        }
                        subtitle={
                            stats.totalShops - stats.activeShops > 0
                                ? `${stats.activeShops} active · ${stats.totalShops - stats.activeShops} inactive`
                                : `${stats.activeShops} active`
                        }
                    />
                    <StatCard
                        title="Revenue Today"
                        value={`${stats.currencySymbol} ${stats.totalSalesToday.toLocaleString()}`}
                        icon={
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                        }
                        subtitle={`Across all shops · ${stats.totalTransactionsToday} transaction${stats.totalTransactionsToday === 1 ? '' : 's'} today`}
                        valueClassName="text-emerald-600"
                    />
                    <StatCard
                        title="Total Staff"
                        value={stats.totalStaff.toString()}
                        icon={
                            <Users className="h-4 w-4 text-muted-foreground" />
                        }
                        subtitle="Active staff across all shops"
                    />
                    <StatCard
                        title="Total Alerts"
                        value={stats.totalAlerts.toString()}
                        icon={
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                        }
                        subtitle={`${stats.lowStockAlerts} low stock · ${stats.expiringSoonAlerts} expiring soon`}
                        valueClassName={
                            stats.totalAlerts > 0 ? 'text-amber-600' : ''
                        }
                    />
                </div>

                <div className="mt-6 grid grid-cols-1 items-center gap-4 md:grid-cols-2">
                    <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                        Your Shops
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {shops.length}
                        </span>
                    </h2>
                    <div className="flex w-full items-center space-x-2">
                        <SearchInput
                            href={owner.shops()}
                            filters={filters}
                            placeholder={
                                'Search by name or location...  (Live search)'
                            }
                        />
                        <RefreshButton href={owner.shops()} />
                    </div>
                </div>

                {shops.length < 1 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <Store className="h-6 w-6" />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-foreground">
                            {isSearching
                                ? 'No shops match your search'
                                : 'No shops found'}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {isSearching
                                ? 'Try a different shop name or location.'
                                : 'There is no shop branch yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="s mt-4 grid gap-6 lg:grid-cols-2">
                        {shops.map((shop) => (
                            <ShopSummaryCard shop={shop} key={shop.uuid} />
                        ))}
                    </div>
                )}
            </DashboardInnerLayout>
        </>
    );
}

Shops.layout = {
    breadcrumbs: [
        {
            title: 'Shops',
            href: '/owner/shop-select-or-create',
        },
    ],
};
