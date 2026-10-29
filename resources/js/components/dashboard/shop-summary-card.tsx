import { router } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Clock,
    MapPin,
    PackageX,
    Phone,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useCartStore } from '@/hooks/stores/user-cart-store';
import { cn } from '@/lib/utils';
import current_shop from '@/routes/current_shop';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

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

const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-TZ', { maximumFractionDigits: 0 }).format(amount);

const StatTile = ({
    icon: Icon,
    label,
    value,
    hint,
    tone = 'default',
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    hint: string;
    tone?: 'default' | 'warning' | 'danger';
}) => (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            <Icon className="h-3 w-3 shrink-0" />
            <span className="truncate">{label}</span>
        </div>
        <p
            className={cn(
                'mt-1 truncate text-sm font-bold',
                tone === 'warning' && 'text-amber-600 dark:text-amber-400',
                tone === 'danger' && 'text-destructive',
                tone === 'default' && 'text-foreground',
            )}
            title={value}
        >
            {value}
        </p>
        <p className="truncate text-[10px] text-muted-foreground">{hint}</p>
    </div>
);

const ShopSummaryCard = ({ shop }: { shop: Shop }) => {
    const { stats } = shop;
    const salesValue = `${shop.currency_symbol} ${formatAmount(stats.total_sales_today)}`;

    const clearCart = useCartStore((state) => state.clearCart);

    return (
        <Card className="group flex flex-col justify-between transition-all duration-300 hover:border-primary/60 hover:shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                        <CardTitle className="truncate text-base font-bold text-foreground transition-colors group-hover:text-primary">
                            {shop.name}
                        </CardTitle>
                        <Badge
                            variant="secondary"
                            className="px-2 py-0 font-mono text-[10px] tracking-wide uppercase"
                        >
                            {shop.currency}
                        </Badge>
                    </div>
                    <span
                        className={cn(
                            'flex shrink-0 items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] font-medium',
                            shop.is_active
                                ? 'border-emerald-500/10 bg-emerald-500/5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : 'border-border bg-muted text-muted-foreground',
                        )}
                    >
                        <span
                            className={cn(
                                'h-1.5 w-1.5 rounded-full',
                                shop.is_active
                                    ? 'animate-pulse bg-emerald-500'
                                    : 'bg-muted-foreground/60',
                            )}
                        />
                        {shop.is_active ? 'active' : 'inactive'}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 pb-3">
                <div className="grid grid-cols-2 gap-2">
                    <StatTile
                        icon={TrendingUp}
                        label="Sales today"
                        value={salesValue}
                        hint={`${stats.transactions_today} transaction${stats.transactions_today === 1 ? '' : 's'}`}
                    />
                    <StatTile
                        icon={Users}
                        label="Staff"
                        value={String(stats.staff_count)}
                        hint="Team members in this shop"
                    />
                    <StatTile
                        icon={PackageX}
                        label="Low stock"
                        value={String(stats.low_stock_count)}
                        hint={`${stats.out_of_stock_count} out of stock`}
                        tone={stats.low_stock_count > 0 ? 'warning' : 'default'}
                    />
                    <StatTile
                        icon={Clock}
                        label="Expiring"
                        value={String(stats.expiring_soon_count)}
                        hint="Within alert window"
                        tone={
                            stats.expiring_soon_count > 0
                                ? 'warning'
                                : 'default'
                        }
                    />
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{shop.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">
                            {shop.address ?? 'No address on file'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">
                            {shop.phone ?? 'No phone on file'}
                        </span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-2">
                <Button
                    onClick={() => {
                        clearCart();
                        router.get(current_shop.overview({ shop: shop.uuid }));
                    }}
                    className="w-full cursor-pointer items-center justify-between rounded-xl bg-primary font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                    <span>Manage Outlet</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ShopSummaryCard;
