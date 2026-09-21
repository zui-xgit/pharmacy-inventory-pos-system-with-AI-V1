import { Head } from '@inertiajs/react';
import { Store } from 'lucide-react';

import BusinessStatsBar from '@/components/dashboard/business-stats-bar';
import ShopSummaryCard from '@/components/dashboard/shop-summary-card';
import RegisterBranch from '@/components/dialogs/register-branch';
import Heading from '@/components/heading';
import RefreshButton from '@/components/refresh-button';
import SearchInput from '@/components/search-input';

import DashboardInnerLayout from '@/layouts/app/dashboard-inner-layout';
import owner from '@/routes/owner';

interface Shop {
    uuid: string;
    name: string;
    location: string;
    address: string | null;
    phone: string | null;
    is_active: boolean;
    created_at: string;
}

interface ShopsProps {
    shops: Shop[];
    filters: {
        search?: string;
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Dummy data — replace with real Inertia props later
// ─────────────────────────────────────────────────────────────────────────────

const DUMMY_SHOPS = [
    {
        id: 'shop-uuid-1',
        name: 'Apex Pharmacy — Njiro',
        address: 'Njiro Road, Block H, Arusha',
        currency_symbol: 'TSh',
        is_active: true,
        stats: {
            total_sales_today: 1_240_000,
            low_stock_count: 3,
            expiring_soon_count: 2,
            active_staff_count: 4,
        },
    },
    {
        id: 'shop-uuid-2',
        name: 'Apex Pharmacy — Kijenge',
        address: 'Kijenge Area, Arusha',
        currency_symbol: 'TSh',
        is_active: true,
        stats: {
            total_sales_today: 890_000,
            low_stock_count: 0,
            expiring_soon_count: 5,
            active_staff_count: 3,
        },
    },
    {
        id: 'shop-uuid-3',
        name: 'Apex Pharmacy — Sakina',
        address: 'Sakina, Arusha',
        currency_symbol: 'TSh',
        is_active: false,
        stats: {
            total_sales_today: 0,
            low_stock_count: 0,
            expiring_soon_count: 0,
            active_staff_count: 0,
        },
    },
];

const DUMMY_BUSINESS_STATS = {
    totalShops: DUMMY_SHOPS.length,
    totalSalesToday: DUMMY_SHOPS.reduce(
        (sum, s) => sum + s.stats.total_sales_today,
        0,
    ),
    totalStaff: DUMMY_SHOPS.reduce(
        (sum, s) => sum + s.stats.active_staff_count,
        0,
    ),
    totalAlerts: DUMMY_SHOPS.reduce(
        (sum, s) => sum + s.stats.low_stock_count + s.stats.expiring_soon_count,
        0,
    ),
    currencySymbol: 'TSh',
};

export default function Shops({ shops, filters }: ShopsProps) {
    return (
        <>
            <Head title="Pharmacy Branches" />
            <DashboardInnerLayout>
                {/* Dashboard Header section inside AppLayout */}
                <div className="flex flex-col gap-4 border-b border-border/40 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Pharmacy Branches"
                        description="Manage and select pharmacy locations under your organization."
                    />
                    <RegisterBranch />
                </div>

                {/* Business wide stats */}
                <BusinessStatsBar {...DUMMY_BUSINESS_STATS} />

                <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
                    <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                        Your Shops
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
                    <>
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <Store className="h-6 w-6" />
                            </div>
                            <h3 className="font-s emibold mt-4 text-sm text-foreground">
                                No shops found
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                There is no shop branch yet.
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {shops.map((shop, index) => (
                                <ShopSummaryCard shop={shop} key={index} />
                            ))}
                        </div>
                    </>
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
