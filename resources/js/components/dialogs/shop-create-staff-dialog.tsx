import { useForm } from '@inertiajs/react';
import { Store, UserPlus } from 'lucide-react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { StaffMember, StaffShop } from '@/lib/staff';
import ThisShop from '@/routes/shop';
import { Spinner } from '../ui/spinner';

const toggle = (list: string[], value: string) =>
    list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];

interface CreateShopStaffFormData {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    phone: string;
    gender: StaffMember['gender'];
    password: string;
    password_confirmation: string;
    role: string;
    permissions: string[];
}

const Caption = ({ children }: { children: ReactNode }) => (
    <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {children}
    </p>
);

const Section = ({
    title,
    aside,
    children,
}: {
    title: string;
    aside?: ReactNode;
    children: ReactNode;
}) => (
    <section className="space-y-4 rounded-xl border border-border/60 bg-muted/30 p-5">
        <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {title}
            </h4>
            {aside}
        </div>
        {children}
    </section>
);

const Field = ({
    id,
    label,
    error,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    children: ReactNode;
}) => (
    <div className="space-y-1.5">
        <Label htmlFor={id}>{label}</Label>
        {children}
        <InputError message={error} />
    </div>
);

const ShopCreateStaffForm = ({
    shop,
    availableRoles,
    availablePermissions,
    onClose,
}: {
    shop: StaffShop;
    availableRoles: string[];
    availablePermissions: string[];
    onClose: () => void;
}) => {
    const form = useForm<CreateShopStaffFormData>({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        phone: '',
        gender: 'male',
        password: '',
        password_confirmation: '',
        role: availableRoles.includes('cashier')
            ? 'cashier'
            : (availableRoles[0] ?? ''),
        permissions: [],
    });

    const bind = (
        key:
            | 'firstname'
            | 'lastname'
            | 'username'
            | 'email'
            | 'phone'
            | 'password'
            | 'password_confirmation',
    ) => ({
        id: key,
        value: form.data[key],
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
            form.setData(key, event.target.value),
    });

    const togglePermission = (permission: string) =>
        form.setData('permissions', toggle(form.data.permissions, permission));

    const handleCreateStaff = (event: FormEvent) => {
        event.preventDefault();

        form.post(ThisShop.staffCreate({ shop: shop.uuid }).url, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onClose();
            },
            onError: (errors) => {
                if (errors.staff) {
                    toast.error(errors.staff);
                }
            },
        });
    };

    return (
        <DialogContent className="flex max-h-[92vh] w-[96vw] flex-col gap-0 overflow-hidden rounded-2xl border border-border bg-card p-0 sm:max-w-[900px]">
            <form
                onSubmit={handleCreateStaff}
                className="flex min-h-0 flex-1 flex-col"
            >
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
                    <DialogHeader className="gap-4">
                        <div className="flex items-center gap-4">
                            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <UserPlus className="h-6 w-6" />
                            </span>
                            <div className="min-w-0 space-y-1">
                                <DialogTitle className="truncate text-xl font-bold text-foreground">
                                    Create Shop Staff Account
                                </DialogTitle>
                                <DialogDescription className="truncate text-sm text-muted-foreground">
                                    Add a new team member to {shop.name}.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        <Section title="Account Information">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    id="firstname"
                                    label="First Name"
                                    error={form.errors.firstname}
                                >
                                    <Input
                                        {...bind('firstname')}
                                        placeholder="First name"
                                    />
                                </Field>

                                <Field
                                    id="lastname"
                                    label="Last Name"
                                    error={form.errors.lastname}
                                >
                                    <Input
                                        {...bind('lastname')}
                                        placeholder="Last name"
                                    />
                                </Field>

                                <Field
                                    id="gender"
                                    label="Gender"
                                    error={form.errors.gender}
                                >
                                    <Select
                                        value={form.data.gender}
                                        onValueChange={(value) =>
                                            form.setData(
                                                'gender',
                                                value as StaffMember['gender'],
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            id="gender"
                                            className="w-full cursor-pointer bg-background"
                                        >
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">
                                                Male
                                            </SelectItem>
                                            <SelectItem value="female">
                                                Female
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field
                                    id="email"
                                    label="Email Address"
                                    error={form.errors.email}
                                >
                                    <Input
                                        {...bind('email')}
                                        type="email"
                                        placeholder="Email address"
                                    />
                                </Field>

                                <Field
                                    id="phone"
                                    label="Phone Number"
                                    error={form.errors.phone}
                                >
                                    <Input
                                        {...bind('phone')}
                                        type="tel"
                                        placeholder="Phone number"
                                    />
                                </Field>
                            </div>
                        </Section>

                        <Section title="Login Credentials">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <Field
                                        id="username"
                                        label="Username"
                                        error={form.errors.username}
                                    >
                                        <Input
                                            {...bind('username')}
                                            autoComplete="username"
                                            placeholder="Username"
                                        />
                                    </Field>
                                </div>

                                <Field
                                    id="password"
                                    label="Password"
                                    error={form.errors.password}
                                >
                                    <PasswordInput
                                        {...bind('password')}
                                        autoComplete="new-password"
                                        placeholder="Enter a password"
                                    />
                                </Field>

                                <Field
                                    id="password_confirmation"
                                    label="Confirm Password"
                                    error={form.errors.password_confirmation}
                                >
                                    <PasswordInput
                                        {...bind('password_confirmation')}
                                        autoComplete="new-password"
                                        placeholder="Re-enter the password"
                                    />
                                </Field>
                            </div>
                        </Section>

                        <Section title="Roles & Permissions">
                            <div className="space-y-2">
                                <Caption>Role</Caption>

                                {availableRoles.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No roles defined
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {availableRoles.map((role) => (
                                            <label
                                                key={role}
                                                htmlFor={`shop-create-role-${role}`}
                                                className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground capitalize transition-colors hover:bg-muted/60"
                                            >
                                                <Checkbox
                                                    id={`shop-create-role-${role}`}
                                                    checked={
                                                        form.data.role === role
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        checked === true &&
                                                        form.setData(
                                                            'role',
                                                            role,
                                                        )
                                                    }
                                                    className="cursor-pointer"
                                                />
                                                {role}
                                            </label>
                                        ))}
                                    </div>
                                )}

                                <InputError message={form.errors.role} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <Caption>Permissions</Caption>
                                    <span className="text-[11px] text-muted-foreground">
                                        {form.data.permissions.length} of{' '}
                                        {availablePermissions.length} selected
                                    </span>
                                </div>

                                {availablePermissions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No permissions defined
                                    </p>
                                ) : (
                                    <div className="max-h-56 space-y-0.5 overflow-y-auto rounded-lg border border-border bg-background p-1.5">
                                        {availablePermissions.map(
                                            (permission) => (
                                                <label
                                                    key={permission}
                                                    htmlFor={`shop-create-permission-${permission}`}
                                                    className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 text-sm leading-snug text-foreground transition-colors first-letter:uppercase hover:bg-muted/60"
                                                >
                                                    <Checkbox
                                                        id={`shop-create-permission-${permission}`}
                                                        checked={form.data.permissions.includes(
                                                            permission,
                                                        )}
                                                        onCheckedChange={() =>
                                                            togglePermission(
                                                                permission,
                                                            )
                                                        }
                                                        className="mt-0.5 cursor-pointer"
                                                    />
                                                    {permission}
                                                </label>
                                            ),
                                        )}
                                    </div>
                                )}

                                <InputError message={form.errors.permissions} />
                            </div>
                        </Section>
                    </div>
                </div>

                <DialogFooter className="gap-2 border-t border-border bg-card px-6 py-4">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={form.processing}
                            className="cursor-pointer rounded-xl border-border text-xs font-semibold"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="cursor-pointer rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                        {form.processing ? (
                            <Spinner />
                        ) : (
                            <UserPlus className="h-3.5 w-3.5" />
                        )}
                        Create Staff
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
};

const ShopCreateStaffDialog = ({
    trigger,
    shop,
    availableRoles = [],
    availablePermissions = [],
}: {
    trigger: React.ReactNode;
    shop: StaffShop;
    availableRoles?: string[];
    availablePermissions?: string[];
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            {isOpen && (
                <ShopCreateStaffForm
                    key={shop.uuid}
                    shop={shop}
                    availableRoles={availableRoles}
                    availablePermissions={availablePermissions}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </Dialog>
    );
};

export default ShopCreateStaffDialog;
