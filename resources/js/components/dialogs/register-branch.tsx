import { useForm } from '@inertiajs/react';
import { Plus, Loader2 } from 'lucide-react';
import type { FormEvent} from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import owner from '@/routes/owner';
import InputError from '../input-error';

const RegisterBranch = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            location: '',
            address: '',
            phone: '',
        });

    const handleCreateShop = (e: FormEvent) => {
        e.preventDefault();

        post(owner.createShop().url, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setIsOpen(false);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4" />
                    <span>Register Branch</span>
                </Button>
            </DialogTrigger>
            <DialogContent
                className="max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 sm:max-w-[750px]"
                onCloseAutoFocus={() => {
                    reset();
                    clearErrors();
                }}
            >
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-foreground">
                        Register New Outlet
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Enter the branch details below. A new stock list and
                        operational parameters will be provisioned.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateShop} className="space-y-5 py-4">
                    {/* SECTION 1: Core Identity */}
                    <div className="space-y-4 rounded-xl border border-border/60 bg-muted/30 p-4">
                        <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Core Info
                        </h4>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="name"
                                className="text-xs font-semibold text-foreground"
                            >
                                Pharmacy Name{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g. Apex Pharmacy"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                className="rounded-xl border border-border text-sm"
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="location"
                                className="text-xs font-semibold text-foreground"
                            >
                                Pharmacy Location{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="location"
                                placeholder="e.g. Njiro"
                                value={data.location}
                                onChange={(e) =>
                                    setData('location', e.target.value)
                                }
                                className="rounded-xl border border-border text-sm"
                            />
                            <InputError message={errors.location} />
                        </div>
                    </div>

                    {/* SECTION 2: Communications & Location */}
                    <div className="space-y-4 rounded-xl border border-border/60 bg-muted/30 p-4">
                        <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Contact & Location
                        </h4>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="address"
                                className="text-xs font-semibold text-foreground"
                            >
                                Physical Address (Optional)
                            </Label>
                            <Input
                                id="address"
                                placeholder="e.g. Njiro Road, Block H, Arusha"
                                value={data.address}
                                onChange={(e) =>
                                    setData('address', e.target.value)
                                }
                                className="rounded-xl border border-border text-sm"
                            />
                            <InputError message={errors.address} />
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="phone"
                                className="text-xs font-semibold text-foreground"
                            >
                                Phone Number (Optional)
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="e.g. +255 700 000 000"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                className="rounded-xl border border-border text-sm"
                            />
                            <InputError message={errors.phone} />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl border-border text-xs font-semibold"
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            className="rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Saving Branch...
                                </>
                            ) : (
                                'Register Branch'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RegisterBranch;
