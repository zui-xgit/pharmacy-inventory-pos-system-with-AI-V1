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
import admin from '@/routes/admin';
import type { NavItem } from '@/types';
import type { Auth } from '@/types/auth';
// import NavSubMain from './nav-sub-main';
import { Button } from './ui/button';
import staff from '@/routes/staff';
import { edit } from '@/routes/profile';
import shop from '@/routes/shop';

// ADMIN NAVITEMS
const Overview: NavItem[] = [
    {
        title: 'Shops',
        href: admin.shops(),
        icon: Store,
    },
];
const Management: NavItem[] = [
    {
        title: 'Staff Management',
        href: admin.staff(),
        icon: UsersRound,
    },
    {
        title: 'Activity Logs',
        href: admin.activityLogs(),
        icon: Activity,
    },
];
const Account: NavItem[] = [
    {
        title: 'Settings',
        href: edit(),
        icon: Settings,
    },
];

// SHOP NAVITEMS
const ShopOverview = (shop_uuid: string): NavItem[] => [
    {
        title: 'Overview ',
        href: shop.overview({ shop: shop_uuid }),
        icon: LayoutDashboard,
    },
    {
        title: 'Sales / POS',
        href: shop.pos({ shop: shop_uuid }),
        icon: ShoppingCart,
    },
];

const ShopInventoryAndStock = (shop_uuid: string): NavItem[] => [
    {
        title: 'Catalog',
        href: shop.catalogBatches({ shop: shop_uuid }),

        icon: Package,
    },
    {
        title: 'Receive Stock',
        href: shop.receiveStock({ shop: shop_uuid }),
        icon: ShoppingCart,
    },
    {
        title: 'Stock Adjustments',
        href: shop.stockAdjustments({ shop: shop_uuid }),
        icon: History,
    },
];

const ShopReportAndInsights = (shop_uuid: string): NavItem[] => [
    {
        title: 'Sales Reports',
        href: shop.reportSales({ shop: shop_uuid }),
        icon: Package,
    },
    {
        title: 'Inventory Reports',
        href: shop.reportInventory({ shop: shop_uuid }),
        icon: ShoppingCart,
    },
];

const ShopSystem = (shop_uuid: string): NavItem[] => [
    {
        title: 'Staff',
        // href: staff.edit({ shop: shop_uuid }),
        href: shop.staffEdit({ shop: shop_uuid }),
        icon: Users,
    },
    {
        title: 'Settings',
        href: shop.staffProfile({ shop: shop_uuid }),
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

    const shopHref = auth.user.isAdmin
        ? admin.shops()
        : auth.user.isManagerOrCashier
          ? staff.shopsSelect()
          : undefined;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={shopHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            {/* ADMIN */}
            {auth.user.isAdmin && !active_shop && (
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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
