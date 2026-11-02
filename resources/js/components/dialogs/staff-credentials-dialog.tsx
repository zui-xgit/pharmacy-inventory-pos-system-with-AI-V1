import { useForm } from '@inertiajs/react';
import { KeyRound, ShieldAlert } from 'lucide-react';
import type { FormEvent } from 'react';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import type { StaffMember } from '@/lib/staff';
import admin from '@/routes/admin';
import { toast } from 'sonner';

const StaffCredentialsForm = ({
    member,
    onClose,
}: {
    member: StaffMember;
    onClose: () => void;
}) => {
    const getInitials = useInitials();

    const credentialsForm = useForm({
        username: member.username,
        password: '',
        password_confirmation: '',
    });

    const updateCredentials = (event: FormEvent) => {
        event.preventDefault();

        credentialsForm.patch(
            admin.staffUpdateCredentials({ user: member.uuid }).url,
            {
                preserveScroll: true,
                onError: (errors) => {
                    if (errors.credentials) {
                        toast.error(errors.credentials);
                    }
                },
                onSuccess: () => onClose(),
                onFinish: () =>
                    credentialsForm.reset('password', 'password_confirmation'),
            },
        );
    };

    return (
        <DialogContent className="w-[96vw] rounded-2xl border border-border bg-card p-6 sm:max-w-[520px]">
            <DialogHeader className="gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                            {getInitials(
                                member.firstname + ' ' + member.lastname,
                            )}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 space-y-1">
                        <DialogTitle className="flex items-center gap-2 truncate text-xl font-bold text-foreground">
                            <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                            Update Credentials
                        </DialogTitle>
                        <DialogDescription className="truncate text-sm text-muted-foreground">
                            {member.firstname + ' ' + member.lastname} ·{' '}
                            {member.username}
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <div className="space-y-5 py-2">
                <section className="space-y-4 rounded-xl border border-border/60 bg-muted/30 p-5">
                    <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        New Credentials
                    </h4>

                    <div className="space-y-1.5">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            value={credentialsForm.data.username}
                            autoComplete="username"
                            onChange={(event) =>
                                credentialsForm.setData(
                                    'username',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={credentialsForm.errors.username} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password">New Password</Label>
                        <PasswordInput
                            id="password"
                            autoComplete="new-password"
                            placeholder="Enter a new password"
                            value={credentialsForm.data.password}
                            onChange={(event) =>
                                credentialsForm.setData(
                                    'password',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={credentialsForm.errors.password} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password-confirmation">
                            Confirm New Password
                        </Label>
                        <PasswordInput
                            id="password-confirmation"
                            autoComplete="new-password"
                            placeholder="Re-enter the new password"
                            value={credentialsForm.data.password_confirmation}
                            onChange={(event) =>
                                credentialsForm.setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError
                            message={
                                credentialsForm.errors.password_confirmation
                            }
                        />
                    </div>
                </section>

                <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
                    <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <p>
                        If the password is changed, the staff member will be
                        signed out of active sessions and must use the new
                        password on their next sign-in.
                    </p>
                </div>
            </div>

            <DialogFooter className="gap-2 pt-1">
                <DialogClose asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer rounded-xl border-border text-xs font-semibold"
                    >
                        Cancel
                    </Button>
                </DialogClose>
                <Button
                    disabled={credentialsForm.processing}
                    onClick={updateCredentials}
                    className="cursor-pointer rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                    <KeyRound className="h-3.5 w-3.5" />
                    {credentialsForm.processing
                        ? 'Saving...'
                        : 'Update Credentials'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

const StaffCredentialsDialog = ({
    member,
    onOpenChange,
}: {
    member: StaffMember | null;
    onOpenChange: (open: boolean) => void;
}) => {
    return (
        <Dialog open={member !== null} onOpenChange={onOpenChange}>
            {member && (
                <StaffCredentialsForm
                    member={member}
                    onClose={() => onOpenChange(false)}
                />
            )}
        </Dialog>
    );
};

export default StaffCredentialsDialog;
