import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface StatCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    subtitle?: string; // Optional prop
    valueClassName?: string;
}

export default function StatCard({
    title,
    value,
    icon,
    subtitle,
    valueClassName,
}: StatCardProps) {
    return (
        <Card className="py-3">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className={`text-xl font-bold ${valueClassName ?? ''}`}>
                    {value}
                </div>
                {subtitle && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {subtitle}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
