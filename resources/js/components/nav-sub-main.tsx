import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react'; // Added for the collapse arrow indicator
// 1. Import the collapsible layout primitives
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

// Assuming you're passing a parent Title/Icon along with the items
const NavSubMain = ({
    title,
    Icon,
    items = [],
}: {
    title: string;
    Icon: LucideIcon;
    items: NavItem[];
}) => {
    const { isCurrentUrl } = useCurrentUrl();

    const isChildActive = items.some((subItem) => isCurrentUrl(subItem.href));

    return (
        // 3. Wrap everything inside Collapsible
        <Collapsible
            asChild
            defaultOpen={isChildActive}
            className="group/collapsible"
        >
            <SidebarMenu>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={isChildActive}>
                            <Icon />
                            <span>{title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {items.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={isCurrentUrl(subItem.href)}
                                    >
                                        <Link href={subItem.href} prefetch>
                                            {subItem.icon && <subItem.icon />}
                                            <span className="text-sm">
                                                {subItem.title}
                                            </span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </SidebarMenu>
        </Collapsible>
    );
};

export default NavSubMain;
