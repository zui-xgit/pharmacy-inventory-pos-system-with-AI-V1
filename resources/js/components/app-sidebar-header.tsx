// import { Breadcrumbs } from '@/components/breadcrumbs';
// import { SidebarTrigger } from '@/components/ui/sidebar';
// import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
// import { usePage } from '@inertiajs/react';

// export function AppSidebarHeader({
//     breadcrumbs = [],
// }: {
//     breadcrumbs?: BreadcrumbItemType[];
// }) {
//     const { activeShop } = usePage<{
//         activeShop: { uuid: string; name: string } | undefined;
//     }>().props;

//     return (
//         <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
//             <div className="flex w-full items-center gap-2">
//                 <SidebarTrigger className="-ml-1" />
//                 <Breadcrumbs breadcrumbs={breadcrumbs} />
//                 {activeShop && (
//                     <div className="flex flex-1 items-center justify-end">
//                         <h2 className="text-md font-bold">
//                             {activeShop?.name}
//                         </h2>
//                     </div>
//                 )}
//             </div>
//         </header>
//     );
// }

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
    const { activeShop } = usePage<{
        activeShop: { uuid: string; name: string } | undefined;
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
                {activeShop && (
                    <div className="flex shrink-0 items-center">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar/50 px-2.5 py-1 text-xs font-medium text-sidebar-foreground shadow-sm sm:text-sm">
                            {/* Subtle live indicator dot */}
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75"></span>
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
                            </span>
                            <Store className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="max-w-[140px] truncate sm:max-w-[200px]">
                                {activeShop.name}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
