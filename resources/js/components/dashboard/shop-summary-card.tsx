import { router } from '@inertiajs/react';
import { ArrowRight, MailIcon, MapPin, Phone } from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { shopOverview } from '@/routes';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface Shop {
    uuid: string;
    name: string;
    location: string;
    address: string | null;
    phone: string | null;
    is_active: boolean;
    created_at: string;
}

const ShopSummaryCard = ({ shop }: { shop: Shop }) => {
    return (
        <Card className="group flex flex-col justify-between transition-all duration-300 hover:border-primary/60 hover:shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-bold text-foreground transition-colors group-hover:text-primary">
                            {shop.name}
                        </CardTitle>
                        <Badge
                            variant="secondary"
                            className="px-2 py-0 font-mono text-[10px] tracking-wide uppercase"
                        >
                            shop prefix
                        </Badge>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 rounded border border-emerald-500/10 bg-emerald-500/5 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        {shop.is_active === true ? 'active' : 'not_active'}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 pb-3">
                <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{shop.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MailIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span>{shop.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span>{shop.phone}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-2">
                <Button
                    onClick={() => {
                        router.get(shopOverview({ shop: shop.uuid }));
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
