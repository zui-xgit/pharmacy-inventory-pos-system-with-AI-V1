import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
    title: string;
    value: string;
    sub?: string;
    icon: LucideIcon;
    alert?: boolean;
}

const StatCard = ({
    title,
    value,
    sub,
    icon: Icon,
    alert = false,
}: StatCardProps) => {
    return (
        <Card className="transition-all duration-300 hover:border-primary/60 hover:shadow-lg">
            <CardContent>
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                            {title}
                        </p>
                        <p
                            className={`text-2xl font-bold ${alert ? 'text-destructive' : 'text-foreground'}`}
                        >
                            {value}
                        </p>
                        {sub && (
                            <p className="text-xs text-muted-foreground">
                                {sub}
                            </p>
                        )}
                    </div>
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${alert ? 'bg-destructive/10' : 'bg-primary/10'}`}
                    >
                        <Icon
                            className={`h-5 w-5 ${alert ? 'text-destructive' : 'text-primary'}`}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default StatCard;
