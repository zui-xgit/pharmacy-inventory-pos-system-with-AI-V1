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

interface NewDosageFormSheetProps {
    trigger: React.ReactNode;
}

const NewDosageFormSheet = ({ trigger }: NewDosageFormSheetProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // Grab your active shop from Inertia props if needed to formulate URLs
    const { active_shop } = usePage<{ active_shop: { uuid: string } }>().props;

    const { data, setData, processing, errors, post, reset, clearErrors } =
        useForm({
            name: '',
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(catalog.newDosageForm({ shop: active_shop.uuid }).url, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setIsOpen(false);
                toast.success(
                    `New "${data.name}" dosage form added successfully!`,
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
                            Add New Dosage Form
                        </SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground">
                            Define a new dosage form for your products. This
                            will help in categorizing and managing your
                            inventory effectively.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 px-4 py-2">
                        {/* Dosage Name Input */}
                        <div className="flex flex-col space-y-1.5">
                            <Label
                                htmlFor="dosage-name"
                                className="text-xs font-semibold"
                            >
                                Dosage Name
                            </Label>
                            <Input
                                id="dosage-name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="e.g. Tablet, Capsule, Syrup"
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
                            Save Dosage
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
};

export default NewDosageFormSheet;
