import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Eye,
    Globe,
    Key,
    KeyRound,
    MoreHorizontal,
    Plus,
    ShieldCheck,
    Store,
    UserCheck,
    UserX,
    Users,
    UsersRound,
} from 'lucide-react';
import { useState } from 'react';

import StatCard from '@/components/dashboard/stat-card';
import StaffDetailsDialog from '@/components/dialogs/staff-details-dialog';
import Heading from '@/components/heading';
import RefreshButton from '@/components/refresh-button';
import SearchInput from '@/components/search-input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useInitials } from '@/hooks/use-initials';
import DashboardInnerLayout from '@/layouts/app/dashboard-inner-layout';
import { staffRoleStyles, staffStatusStyles } from '@/lib/staff';
import type { StaffMember, StaffShop } from '@/lib/staff';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';
import StaffCredentialsDialog from '@/components/dialogs/staff-credentials-dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import { Auth } from '@/types';
import { toast } from 'sonner';
import ShopFilter from '@/components/user-filter-by-shop';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedStaff {
    data: StaffMember[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
}

interface StaffStats {
    total: number;
    active: number;
    suspended: number;
    inactive: number;
}

interface StaffManagementProps {
    staff: PaginatedStaff;
    stats: StaffStats;
    available_roles: string[];
    available_permissions: string[];
    available_shops: StaffShop[];
    filters: {
        search?: string;
        role?: string;
        status?: string;
        shop?: string;
    };
}

const StaffPagination = ({ staff }: { staff: PaginatedStaff }) => {
    if (staff.last_page <= 1) {
        return null;
    }

    const previous = staff.links[0];
    const next = staff.links[staff.links.length - 1];
    const pages = staff.links.slice(1, -1);

    return (
        <CardFooter className="flex flex-col gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground">
                    {staff.from ?? 0}
                </span>{' '}
                to{' '}
                <span className="font-medium text-foreground">
                    {staff.to ?? 0}
                </span>{' '}
                of{' '}
                <span className="font-medium text-foreground">
                    {staff.total}
                </span>{' '}
                staff
            </p>

            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    asChild={Boolean(previous.url)}
                    disabled={!previous.url}
                    className="rounded-lg"
                >
                    {previous.url ? (
                        <Link href={previous.url} preserveScroll>
                            Previous
                        </Link>
                    ) : (
                        <span>Previous</span>
                    )}
                </Button>

                {pages.map((link, index) =>
                    link.url ? (
                        <Button
                            key={link.label}
                            variant={link.active ? 'default' : 'outline'}
                            size="icon-sm"
                            asChild
                            className="rounded-lg"
                        >
                            <Link href={link.url} preserveScroll>
                                {link.label}
                            </Link>
                        </Button>
                    ) : (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-1 text-xs text-muted-foreground"
                        >
                            …
                        </span>
                    ),
                )}

                <Button
                    variant="outline"
                    size="sm"
                    asChild={Boolean(next.url)}
                    disabled={!next.url}
                    className="rounded-lg"
                >
                    {next.url ? (
                        <Link href={next.url} preserveScroll>
                            Next
                        </Link>
                    ) : (
                        <span>Next</span>
                    )}
                </Button>
            </div>
        </CardFooter>
    );
};

export default function StaffManagement({
    staff,
    stats,
    available_roles,
    available_permissions,
    available_shops,
    filters,
}: StaffManagementProps) {
    const getInitials = useInitials();
    const { auth } = usePage<{ auth: Auth }>().props;

    const [selectedMember, setSelectedMember] = useState<StaffMember | null>(
        null,
    );
    const [passwordMember, setPasswordMember] = useState<StaffMember | null>(
        null,
    );
    const isFiltered = Boolean(
        filters.search || filters.role || filters.status || filters.shop,
    );

    const applyFilter = (key: 'role' | 'status' | 'shop', value: string) => {
        router.get(
            admin.staff(),
            { ...filters, [key]: value },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <Head title="Staff Management" />
            <DashboardInnerLayout>
                <div className="flex flex-col gap-4 border-b border-border/40 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Staff Management"
                        description="Manage staff accounts, roles and access across your pharmacies."
                    />
                    {/* Create staff flow is not wired up yet. */}
                    <Button className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
                        <Plus className="h-4 w-4" />
                        <span>Create Staff </span>
                    </Button>
                </div>

                {/* STAT CARDS */}
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Staff"
                        value={stats.total.toString()}
                        icon={
                            <Users className="h-4 w-4 text-muted-foreground" />
                        }
                        subtitle="Accounts across all shops"
                    />
                    <StatCard
                        title="Active"
                        value={stats.active.toString()}
                        icon={
                            <UserCheck className="h-4 w-4 text-emerald-600" />
                        }
                        subtitle="Can sign in and use the system"
                        valueClassName="text-emerald-600"
                    />
                    <StatCard
                        title="Suspended"
                        value={stats.suspended.toString()}
                        icon={<UserX className="h-4 w-4 text-destructive" />}
                        subtitle="Access temporarily blocked"
                        valueClassName={
                            stats.suspended > 0 ? 'text-destructive' : ''
                        }
                    />
                    <StatCard
                        title="Roles"
                        value={available_roles.length.toString()}
                        icon={
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        }
                        subtitle={
                            available_roles.length > 0
                                ? available_roles.join(' · ')
                                : 'No roles defined'
                        }
                    />
                </div>

                <div className="mt-6 flex flex-col gap-3 border-b border-border/40 pb-3">
                    <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                        Staff Members
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {staff.total}
                        </span>
                    </h2>

                    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4">
                        <div className="sm:col-span-2 lg:col-span-4">
                            <SearchInput
                                href={admin.staff()}
                                filters={filters}
                                placeholder="Search name, username or email..."
                            />
                        </div>

                        {/* filter users by shop name */}
                        <div className="sm:col-span-1 lg:col-span-4">
                            {/* <Select
                                value={filters.shop || 'all'}
                                onValueChange={(value) =>
                                    applyFilter(
                                        'shop',
                                        value === 'all' ? '' : value,
                                    )
                                }
                            >
                                <SelectTrigger
                                    size="sm"
                                    className="w-full cursor-pointer bg-background"
                                >
                                    <SelectValue placeholder="All shops" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All shops
                                    </SelectItem>
                                    {available_shops.map((shop) => (
                                        <SelectItem
                                            key={shop.uuid}
                                            value={shop.uuid}
                                        >
                                            {shop.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select> */}
                            <ShopFilter
                                shops={available_shops}
                                value={filters.shop ?? ''}
                                onChange={(uuid) => applyFilter('shop', uuid)}
                            />
                        </div>
                        {/* end filter users by shop name */}

                        <div className="sm:col-span-1 lg:col-span-2">
                            <Select
                                value={filters.role || 'all'}
                                onValueChange={(value) =>
                                    applyFilter(
                                        'role',
                                        value === 'all' ? '' : value,
                                    )
                                }
                            >
                                <SelectTrigger
                                    size="sm"
                                    className="w-full cursor-pointer bg-background sm:w-[140px]"
                                >
                                    <SelectValue placeholder="All roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All roles
                                    </SelectItem>
                                    {available_roles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-2">
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={(value) =>
                                    applyFilter(
                                        'status',
                                        value === 'all' ? '' : value,
                                    )
                                }
                            >
                                <SelectTrigger
                                    size="sm"
                                    className="w-full cursor-pointer bg-background sm:w-[150px]"
                                >
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All statuses
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Inactive
                                    </SelectItem>
                                    <SelectItem value="suspended">
                                        Suspended
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <RefreshButton href={admin.staff()} />
                        </div>
                    </div>
                </div>

                {staff.data.length === 0 ? (
                    <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <UsersRound className="h-6 w-6" />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-foreground">
                            {isFiltered
                                ? 'No staff match your filters'
                                : 'No staff found'}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {isFiltered
                                ? 'Try a different search term, role or status.'
                                : 'Create a staff account to get started.'}
                        </p>
                    </div>
                ) : (
                    // STAFF MEMBERS TABLE
                    <Card className="mt-4 gap-0 overflow-hidden py-0">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableHead className="pl-4">
                                            Staff Member
                                        </TableHead>
                                        <TableHead>Shops</TableHead>
                                        <TableHead>Roles</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="pr-4 text-right">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staff.data.map((member, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="py-3 pl-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                                            {getInitials(
                                                                member.firstname +
                                                                    ' ' +
                                                                    member.lastname,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-foreground">
                                                            {member.firstname +
                                                                ' ' +
                                                                member.lastname}
                                                            {'    '}
                                                            {auth.user.roles.includes(
                                                                'admin',
                                                            ) &&
                                                                member.roles.includes(
                                                                    'admin',
                                                                ) && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="shrink-0 rounded-full bg-primary/10 px-2 py-0 text-[10px] font-semibold tracking-wide text-primary uppercase"
                                                                    >
                                                                        You
                                                                    </Badge>
                                                                )}
                                                        </p>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {member.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                {member.roles.includes(
                                                    'admin',
                                                ) ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                            <Globe className="h-3.5 w-3.5" />
                                                        </span>
                                                        <div className="leading-tight">
                                                            <p className="text-xs font-medium text-foreground">
                                                                All shops
                                                            </p>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                Full access
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : member.shops.length ===
                                                  0 ? (
                                                    <span className="text-xs text-muted-foreground italic">
                                                        Not assigned
                                                    </span>
                                                ) : (
                                                    <div className="space-y-1.5">
                                                        <ul className="space-y-1.5">
                                                            {member.shops
                                                                .slice(0, 3)
                                                                .map(
                                                                    (
                                                                        shop,
                                                                        index,
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="flex items-center gap-2"
                                                                        >
                                                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                                                <Store className="h-3.5 w-3.5" />
                                                                            </span>
                                                                            <span className="text-xs font-medium text-foreground">
                                                                                {
                                                                                    shop.name
                                                                                }
                                                                            </span>
                                                                        </li>
                                                                    ),
                                                                )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {member.roles.length ===
                                                    0 ? (
                                                        <span className="text-xs text-muted-foreground">
                                                            No role
                                                        </span>
                                                    ) : (
                                                        member.roles.map(
                                                            (role) => (
                                                                <Badge
                                                                    key={role}
                                                                    variant="outline"
                                                                    className={cn(
                                                                        'capitalize',
                                                                        staffRoleStyles[
                                                                            role
                                                                        ],
                                                                    )}
                                                                >
                                                                    {role}
                                                                </Badge>
                                                            ),
                                                        )
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] font-medium capitalize',
                                                        staffStatusStyles[
                                                            member.status
                                                        ],
                                                    )}
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                    {member.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="pr-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            aria-label={`Actions for ${member.firstname + ' ' + member.lastname}`}
                                                            className="cursor-pointer rounded-lg text-muted-foreground hover:text-foreground"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-44"
                                                    >
                                                        <DropdownMenuLabel>
                                                            Options
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            // onSelect={() =>
                                                            //     setSelectedMember(
                                                            //         member,
                                                            //     )
                                                            // }
                                                            onSelect={() => {
                                                                if (
                                                                    member.roles.includes(
                                                                        'admin',
                                                                    ) &&
                                                                    auth.user.roles.includes(
                                                                        'admin',
                                                                    )
                                                                ) {
                                                                    toast.info(
                                                                        'This is your own account',
                                                                        {
                                                                            description:
                                                                                'You can view and edit your details in Settings → Profile.',
                                                                            action: {
                                                                                label: 'Open profile',
                                                                                onClick:
                                                                                    () =>
                                                                                        router.visit(
                                                                                            '/settings/profile',
                                                                                        ),
                                                                            },
                                                                        },
                                                                    );
                                                                    return;
                                                                }

                                                                setSelectedMember(
                                                                    member,
                                                                );
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            View details
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onSelect={() => {
                                                                if (
                                                                    member.roles.includes(
                                                                        'admin',
                                                                    ) &&
                                                                    auth.user.roles.includes(
                                                                        'admin',
                                                                    )
                                                                ) {
                                                                    toast.info(
                                                                        'This is your own account',
                                                                        {
                                                                            description:
                                                                                'You can view and edit your credentials in Settings → Security.',
                                                                            action: {
                                                                                label: 'Open credentials',
                                                                                onClick:
                                                                                    () =>
                                                                                        router.visit(
                                                                                            '/settings/security',
                                                                                        ),
                                                                            },
                                                                        },
                                                                    );
                                                                    return;
                                                                }
                                                                setPasswordMember(
                                                                    member,
                                                                );
                                                            }}
                                                        >
                                                            <Key className="h-4 w-4" />
                                                            Change Credentials
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>

                        <StaffPagination staff={staff} />
                    </Card>
                )}

                <StaffDetailsDialog
                    member={selectedMember}
                    availableRoles={available_roles}
                    availablePermissions={available_permissions}
                    availableShops={available_shops}
                    onOpenChange={(open) => {
                        if (!open) {
                            setSelectedMember(null);
                        }
                    }}
                />
                <StaffCredentialsDialog
                    member={passwordMember}
                    onOpenChange={(open) => {
                        if (!open) setPasswordMember(null);
                    }}
                />
            </DashboardInnerLayout>
        </>
    );
}

StaffManagement.layout = {
    breadcrumbs: [
        {
            title: 'Staff Management',
            href: admin.staff(),
        },
    ],
};
