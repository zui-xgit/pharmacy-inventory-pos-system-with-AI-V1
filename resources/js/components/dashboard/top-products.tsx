import { TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Product {
    id: string;
    name: string;
    form: string;
    units_sold: number;
    revenue: string;
    trend: 'up' | 'down';
}

interface TopProductsProps {
    products: Product[];
    currencySymbol: string;
}

const TopProducts = ({ products, currencySymbol }: TopProductsProps) => {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                    Top Selling Products
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {products.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        No products sold today.
                    </p>
                ) : (
                    products.map((product, index) => (
                        <div
                            key={product.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
                        >
                            {/* Rank + name */}
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                                    {index + 1}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold text-foreground">
                                        {product.name}
                                    </p>
                                    <Badge
                                        variant="secondary"
                                        className="mt-0.5 text-[10px] capitalize"
                                    >
                                        {product.form}
                                    </Badge>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex shrink-0 flex-col items-end gap-0.5">
                                <p className="text-xs font-bold text-foreground">
                                    {currencySymbol} {product.revenue}
                                </p>
                                <div className="flex items-center gap-1">
                                    {product.trend === 'up' ? (
                                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 text-destructive" />
                                    )}
                                    <span className="text-[10px] text-muted-foreground">
                                        {product.units_sold} units sold
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};

export default TopProducts;
