import { useForm, usePage } from '@inertiajs/react';
import { SelectGroup } from '@radix-ui/react-select';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import type { DosageForm } from '@/types/type';
import InputError from '../input-error';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label'; // Corrected to point to standard Shadcn Label component
import { Spinner } from '../ui/spinner';

interface NewProductDialogProps {
    trigger: React.ReactNode;
    dosage_forms: DosageForm[]; // Assuming dosage forms have the same structure as package units
}

const NewProductSheet = ({ trigger, dosage_forms }: NewProductDialogProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { data, setData, processing, errors, post, reset, clearErrors } =
        useForm({
            name: '',
            dosage_form_uuid: '',
            // sku: '',
        });

    // Grab your active shop from Inertia props if needed to formulate URLs
    const { active_shop } = usePage<{ active_shop: { uuid: string } }>().props;

    const handleAddProduct = () => {
        post(catalog.newProduct({ shop: active_shop.uuid }).url, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setIsOpen(false);
                toast.success(
                    `New "${data.name}" product added successfully!`,
                    {
                        position: 'top-right',
                        richColors: true,
                    },
                );
            },
            onError: (errors) => {
                if (errors.error) {
                    toast.error(errors.error, {
                        position: 'top-right',
                        richColors: true,
                    });
                }
            },
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            {/* asChild merges the drawer trigger action onto your prop element neatly */}
            <SheetTrigger asChild>{trigger}</SheetTrigger>

            {/* side="right" creates a beautiful slide-out drawer canvas */}
            <SheetContent
                onCloseAutoFocus={() => {
                    reset();
                    clearErrors();
                }}
            >
                <SheetHeader className="text-left">
                    <SheetTitle className="text-base font-bold">
                        Add New Product
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground">
                        Fill in its details to add new product (medicine).
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4 py-2">
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="prod-name"
                            className="text-xs font-semibold"
                        >
                            Product Name{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="prod-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Paracetamol 500mg"
                            className="rounded-xl text-sm"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label className="text-xs font-semibold">
                            Dosage Form
                        </Label>

                        <Select
                            value={data.dosage_form_uuid}
                            onValueChange={(value) =>
                                setData('dosage_form_uuid', value)
                            }
                        >
                            <SelectTrigger className="w-full rounded-xl text-xs">
                                <SelectValue placeholder="Select dosage form" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectGroup>
                                    {dosage_forms && dosage_forms.length > 0 ? (
                                        <>
                                            {dosage_forms.map((dosage_form) => (
                                                <SelectItem
                                                    key={dosage_form.uuid}
                                                    value={dosage_form.uuid}
                                                    className="text-sm"
                                                >
                                                    {dosage_form.name}
                                                </SelectItem>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            NO dosage forms , please create
                                            dosage forms first
                                        </>
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <InputError message={errors.dosage_form_uuid} />
                    </div>

                    {/* <div className="space-y-1.5">
                        <Label
                            htmlFor="prod-sku"
                            className="text-xs font-semibold"
                        >
                            SKU / Barcode
                        </Label>
                        <Input
                            id="prod-sku"
                            value={data.sku}
                            onChange={(e) => setData('sku', e.target.value)}
                            placeholder="e.g. PCM500 "
                            className="rounded-xl text-sm"
                        />
                        <InputError message={errors.sku} />
                    </div> */}
                </div>

                <SheetFooter className="flex-row items-center justify-end gap-2 border-t pt-4">
                    <SheetClose asChild disabled={processing}>
                        <Button
                            variant="outline"
                            className="rounded-xl text-xs font-semibold"
                        >
                            Cancel
                        </Button>
                    </SheetClose>
                    <Button
                        onClick={handleAddProduct}
                        className="rounded-xl text-xs font-semibold"
                        disabled={processing}
                    >
                        {processing && <Spinner className="mr-2 h-4 w-4" />}
                        Add Product
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default NewProductSheet;
