import { Link, usePage } from '@inertiajs/react';
import { Layers, Package, Pill } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import catalog from '@/routes/catalog';
import type { NavItem } from '@/types';

const sidebarNavItems = (shop_uuid: string): NavItem[] => [
    {
        title: 'Products',
        href: catalog.products({ shop: shop_uuid }),
        icon: Package,
    },
    {
        title: 'Dosage Forms',
        href: catalog.dosageForms({ shop: shop_uuid }),
        icon: Pill,
    },
    {
        title: 'Batches',
        href: catalog.batches({ shop: shop_uuid }),
        icon: Layers,
    },
    // {
    //     title: 'Package Units',
    //     href: catalog.packageUnits({ shop: shop_uuid }),
    //     icon: Package2,
    // },
];

export default function ShopCatalogLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    const { activeShop } = usePage<{
        activeShop: { uuid: string } | undefined;
    }>().props;

    const items =
        activeShop !== undefined ? sidebarNavItems(activeShop.uuid) : [];

    // Find the current active item based on the current active URL
    const activeItem = items.find((item) => isCurrentOrParentUrl(item.href));

    return (
        <div className="flex flex-col space-y-4 px-4 py-4">
            <header>
                <h2 className="text-xl font-semibold tracking-tight">
                    Catalog
                </h2>
                <p className="text-sm text-muted-foreground">
                    Manage your catalog items
                </p>
            </header>

            <div className="flex flex-col space-y-6">
                <div className="mb-10 sm:mb-5">
                    {activeShop !== undefined && (
                        /* FIXED: Changed defaultValue to a dynamic 'value' mapping directly to the active item title */
                        <Tabs value={activeItem?.title}>
                            <TabsList
                                variant={'line'}
                                className="grid w-full grid-cols-2 sm:grid-cols-4"
                            >
                                {items.map((item, index) => (
                                    <TabsTrigger
                                        key={`${toUrl(item.href)}-${index}`}
                                        value={item.title}
                                        asChild
                                    >
                                        <Link href={item.href}>
                                            {item.icon && (
                                                <item.icon className="h-4 w-4 shrink-0" />
                                            )}
                                            <span>{item.title}</span>
                                        </Link>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    )}
                </div>

                <div className="flex-1">
                    <section className="space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
