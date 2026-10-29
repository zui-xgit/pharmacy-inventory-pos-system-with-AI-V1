import { Link, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    FolderGit2,
    Store,
    UsersRound,
    Package,
    Settings,
    Activity,
    LayoutDashboard,
    ShoppingCart,
    History,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
// import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import catalog from '@/routes/catalog';
import owner from '@/routes/owner';
import stock from '@/routes/stock';
import type { NavItem } from '@/types';
import type { Auth } from '@/types/auth';
// import NavSubMain from './nav-sub-main';
import { Button } from './ui/button';
import current_shop from '@/routes/current_shop';
import reports from '@/routes/reports';
import staff from '@/routes/staff';

// OWNER NAVITEMS
const Overview: NavItem[] = [
    {
        title: 'Shops',
        href: owner.shops(),
        icon: Store,
    },
];
const Management: NavItem[] = [
    {
        title: 'Staff',
        href: owner.staff(),
        icon: UsersRound,
    },
    {
        title: 'Activity Logs',
        href: '#',
        icon: Activity,
    },
];
const Account: NavItem[] = [
    {
        title: 'Profile',
        href: owner.staff(),
        icon: UsersRound,
    },
    {
        title: 'Settings',
        href: '#',
        icon: Settings,
    },
];

// SHOP NAVITEMS
const ShopOverview = (shop_uuid: string): NavItem[] => [
    {
        title: 'Overview ',
        href: current_shop.overview({ shop: shop_uuid }),
        icon: LayoutDashboard,
    },
    {
        title: 'Sales / POS',
        href: current_shop.pos({ shop: shop_uuid }),
        icon: ShoppingCart,
    },
];

const ShopInventoryAndStock = (shop_uuid: string): NavItem[] => [
    {
        title: 'Catalog',
        href: catalog.batches({ shop: shop_uuid }),
        icon: Package,
    },
    {
        title: 'Receive Stock',
        href: stock.receive_stock({ shop: shop_uuid }),
        icon: ShoppingCart,
    },
    {
        title: 'Stock Adjustments',
        href: stock.stock_adjustments({ shop: shop_uuid }),
        icon: History,
    },
];

const ShopReportAndInsights = (shop_uuid: string): NavItem[] => [
    {
        title: 'Sales Reports',
        href: reports.sales({ shop: shop_uuid }),
        icon: Package,
    },
    {
        title: 'Inventory Reports',
        href: reports.inventory({ shop: shop_uuid }),
        icon: ShoppingCart,
    },
];

const ShopSystem = (shop_uuid: string): NavItem[] => [
    {
        title: 'Staff',
        href: '#',
        icon: Users,
    },
    {
        title: 'Settings',
        href: staff.profile({ shop: shop_uuid }),
        icon: Package,
    },
];
// const footerNavItems: NavItem[] = [
//     {
//         title: 'Repository',
//         href: 'https://github.com/laravel/react-starter-kit',
//         icon: FolderGit2,
//     },
//     {
//         title: 'Documentation',
//         href: 'https://laravel.com/docs/starter-kits#react',
//         icon: BookOpen,
//     },
// ];

export function AppSidebar() {
    const { active_shop, auth } = usePage<{
        active_shop: { uuid: string } | undefined;
        auth: Auth;
    }>().props;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={owner.shops()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* OWNER */}
            {auth.user.isOwner && !active_shop && (
                <SidebarContent>
                    <NavMain groupLabel={'Overview'} items={Overview} />
                    <NavMain groupLabel={'Management'} items={Management} />
                    <NavMain groupLabel={'Account'} items={Account} />
                </SidebarContent>
            )}

            {active_shop && (
                <SidebarContent>
                    <NavMain
                        groupLabel={'Main'}
                        items={ShopOverview(active_shop.uuid)}
                    />
                    <NavMain
                        groupLabel={'Inventory & Stock'}
                        items={ShopInventoryAndStock(active_shop.uuid)}
                    />
                    <NavMain
                        groupLabel={'Reports & Insights'}
                        items={ShopReportAndInsights(active_shop.uuid)}
                    />

                    <NavMain
                        groupLabel={'System'}
                        items={ShopSystem(active_shop.uuid)}
                    />
                </SidebarContent>
            )}

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                {/* if the role is owner and there is an active shop then show the admin dashboard button */}
                {auth.user.isOwner && active_shop && (
                    <Button
                        onClick={() => {
                            router.get(owner.shops());
                        }}
                        className="cursor-pointer justify-start px-0 py-0"
                        variant={'link'}
                    >
                        Main Dashboard
                    </Button>
                )}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
