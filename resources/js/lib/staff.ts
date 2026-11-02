export interface StaffShop {
    uuid: string;
    name: string;
}

export interface StaffMember {
    uuid: string;
    firstname: string;
    lastname: string;
    username: string;
    gender: 'male' | 'female';
    email: string;
    phone: string;
    status: 'active' | 'inactive' | 'suspended';
    roles: string[];
    permissions: string[];
    shops: StaffShop[];
    created_at: string | null;
}

export const staffStatusStyles: Record<StaffMember['status'], string> = {
    active: 'border-emerald-500/10 bg-emerald-500/5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    suspended:
        'border-destructive/10 bg-destructive/5 text-destructive dark:bg-destructive/10',
    inactive: 'border-border bg-muted text-muted-foreground',
};

export const staffRoleStyles: Record<string, string> = {
    admin: 'border-primary/20 bg-primary/10 text-primary',
    manager: 'border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400',
    cashier:
        'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
};
