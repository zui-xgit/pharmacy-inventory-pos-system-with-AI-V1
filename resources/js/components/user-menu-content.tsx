import { Link, router, usePage } from '@inertiajs/react';
import { Link2, LogOut, Settings, Store } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import profile from '@/routes/profile';
import type { Auth, User } from '@/types';
import staff from '@/routes/staff';
import admin from '@/routes/admin';
import { Badge } from './ui/badge';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {auth.user.isAdmin && (
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={admin.shops()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Store className="mr-2" />
                        All shops
                    </Link>
                </DropdownMenuItem>
            )}
            {auth.user.isManagerOrCashier && (
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={staff.shopsSelect()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Link2 className="mr-2" />
                        <span className="flex gap-2">
                            Linked shops
                            <Badge variant="destructive">
                                {auth.user.user_shops_count}
                            </Badge>
                        </span>
                    </Link>
                </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
