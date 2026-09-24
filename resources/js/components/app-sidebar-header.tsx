import { usePage } from '@inertiajs/react';
import { Store } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    // FIXED: Corrected the closed generic brackets `usePage<{...}>()`
    const { active_shop } = usePage<{
        active_shop: { uuid: string; name: string } | undefined;
    }>().props;

    return (
        <header className="flex h-16 shrink-0 items-center border-b border-sidebar-border bg-background px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex w-full items-center justify-between gap-4">
                {/* Left side: Navigation controls and context tracking */}
                <div className="flex min-w-0 items-center gap-2">
                    <SidebarTrigger className="-ml-1 h-8 w-8 text-muted-foreground hover:text-foreground" />
                    <div className="mx-1 hidden h-4 w-[1px] bg-sidebar-border sm:block" />
                    <div className="truncate">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>

                {/* Right side: Clean, professional active branch context badge */}
                {active_shop && (
                    <div className="flex shrink-0 items-center">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar/50 px-2.5 py-1 text-xs font-medium text-sidebar-foreground shadow-sm sm:text-sm">
                            {/* Subtle live indicator dot */}
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75"></span>
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
                            </span>
                            <Store className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="max-w-[140px] truncate sm:max-w-[200px]">
                                {active_shop.name}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
