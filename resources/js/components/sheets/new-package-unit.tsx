import { useForm, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
    SheetTrigger,
} from '@/components/ui/sheet';
import catalog from '@/routes/catalog';
import InputError from '../input-error';

interface NewPackageUnitSheetProps {
    trigger: React.ReactNode;
}

const NewPackageUnitSheet = ({ trigger }: NewPackageUnitSheetProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // Grab your active shop from Inertia props if needed to formulate URLs
    const { activeShop } = usePage<{ activeShop: { uuid: string } }>().props;

    const { data, setData, processing, errors, post, reset, clearErrors } =
        useForm({
            name: '',
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(catalog.newPackageUnit({ shop: activeShop.uuid }).url, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setIsOpen(false);
                toast.success(
                    `New "${data.name}" package unit added successfully!`,
                    {
                        position: 'top-right',
                    },
                );
            },
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent
                onCloseAutoFocus={() => {
                    reset();
                    clearErrors();
                }}
            >
                <form
                    onSubmit={handleSubmit}
                    className="flex h-full flex-col justify-between"
                >
                    <SheetHeader className="text-left">
                        <SheetTitle className="text-base font-bold">
                            Add New Package Unit
                        </SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground">
                            Define a new measurement unit for packaging items in
                            this shop.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 px-4 py-2">
                        {/* Unit Name Input */}
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="unit-name"
                                className="text-xs font-semibold"
                            >
                                Unit Name{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="unit-name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="e.g. Strip, Bottle, Box"
                            />

                            <InputError message={errors.name} />
                        </div>
                    </div>

                    <SheetFooter className="flex-row items-center justify-end gap-2 border-t pt-4">
                        <SheetClose asChild>
                            <Button
                                onClick={() => {
                                    reset();
                                    clearErrors();
                                }}
                                type="button"
                                variant="outline"
                                className="rounded-xl text-xs font-semibold"
                            >
                                Cancel
                            </Button>
                        </SheetClose>
                        <Button
                            type="submit"
                            className="gap-1.5 rounded-xl text-xs font-semibold"
                        >
                            {processing && (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            )}
                            Save Unit
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
};

export default NewPackageUnitSheet;
