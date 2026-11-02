import { useForm, usePage } from '@inertiajs/react';
import {
    Banknote,
    CalendarClock,
    Hash,
    Info,
    PackagePlus,
    Pill,
    Plus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { toast } from 'sonner';

import DatePicker from '@/components/dashboard/date-picker';
import { StocktConfirmationDialog } from '@/components/dialogs/confirm-create-stock';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import ProductCombobox from '@/components/product-combobox';
import NewDosageFormSheet from '@/components/sheets/new-dosage-form';
import NewProductSheet from '@/components/sheets/new-product';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import DashboardInnerLayout from '@/layouts/app/dashboard-inner-layout';
import stock from '@/routes/stock';
import type { DosageForm, Product } from '@/types/type';

interface ReceiveStockProps {
    products: Product[];
    filters: {
        search?: string;
    };
    shop_uuid: string;
    search_input: string | null;
    dosage_forms: DosageForm[];
}

type UseFormType = {
    expiry_date: string;
    manufactured_date: string;
    batch_number: string;
    cost_price: string | number;
    selling_price: string | number;
    units_per_package_received: string | number;
    packages_received: string | number;
};

const useFormDefaultValues: UseFormType = {
    expiry_date: '',
    manufactured_date: '',
    batch_number: '',
    cost_price: '',
    selling_price: '',
    units_per_package_received: '',
    packages_received: '',
};

type InputKey =
    | 'batch_number'
    | 'cost_price'
    | 'selling_price'
    | 'units_per_package_received'
    | 'packages_received';

const CardHeading = ({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) => (
    <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
        </span>
        <div className="space-y-0.5">
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
        </div>
    </div>
);

const SectionLabel = ({
    icon: Icon,
    children,
}: {
    icon: LucideIcon;
    children: ReactNode;
}) => (
    <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        <Icon className="h-3.5 w-3.5" />
        {children}
    </div>
);

const Field = ({
    id,
    label,
    required,
    hint,
    error,
    className,
    children,
}: {
    id?: string;
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    className?: string;
    children: ReactNode;
}) => (
    <div className={className ?? 'space-y-1.5'}>
        <Label htmlFor={id} className="text-xs font-semibold">
            {label}
            {required && <span className="text-destructive"> *</span>}
        </Label>
        {children}
        {hint && !error && (
            <p className="text-[11px] text-muted-foreground">{hint}</p>
        )}
        <InputError message={error} />
    </div>
);

const MoneyInput = (props: ComponentProps<typeof Input>) => (
    <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            Tsh
        </span>
        <Input type="number" min={0} className="pl-10" {...props} />
    </div>
);

const ReceiveStock = ({
    products,
    filters,
    shop_uuid,
    dosage_forms,
}: ReceiveStockProps) => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const { data, setData, processing, errors, post, transform } =
        useForm<UseFormType>(useFormDefaultValues);

    const { active_shop } = usePage<{ active_shop: { uuid: string } }>().props;
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    const bind = (key: InputKey) => ({
        id: key,
        value: data[key],
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            setData(key, event.target.value),
    });

    const totalQuantity =
        Number(data.units_per_package_received || 0) *
        Number(data.packages_received || 0);

    const handleRecordStock = (isConfirmed = false) => {
        transform((data) => ({
            ...data,
            product: selectedProduct ?? undefined,
            confirmed: isConfirmed,
        }));
        handleDataPostRequest();
    };

    const handleDataPostRequest = () => {
        post(stock.new_batch({ shop: active_shop.uuid }).url, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.flash.prompt_confirmation) {
                    setShowConfirm(true);
                } else {
                    setShowConfirm(false);
                    toast.success(`Product Batch added successfully !`, {
                        position: 'top-right',
                        richColors: true,
                    });

                    // reset the inputs after submission
                    setData(useFormDefaultValues);
                    setSelectedProduct(null);
                }
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

    const handleConfirmSubmit = () => {
        handleRecordStock(true);
    };

    return (
        <DashboardInnerLayout>
            <StocktConfirmationDialog
                isOpen={showConfirm}
                onOpenChange={setShowConfirm}
                product={selectedProduct}
                data={data}
                onConfirm={handleConfirmSubmit}
                processing={processing}
            />

            <div className="space-y-6">
                <Heading
                    title="Receive Stock"
                    description="Record a new stock delivery from a supplier."
                />

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
                    {/* LEFT: product */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardHeading
                                icon={Pill}
                                title="Product"
                                description="Search for the product you are receiving."
                            />
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <Field
                                label="Product Name"
                                required
                                error={
                                    (errors as Record<string, string>).product
                                }
                            >
                                <ProductCombobox
                                    products={products}
                                    selected={selectedProduct}
                                    onSelect={setSelectedProduct}
                                    searchUrl={stock.receive_stock({
                                        shop: shop_uuid,
                                    })}
                                    filters={filters}
                                />
                            </Field>

                            <div className="space-y-2 rounded-xl border border-dashed bg-muted/30 p-3">
                                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <Info className="h-3.5 w-3.5" />
                                    Can&apos;t find what you need?
                                </p>

                                <NewDosageFormSheet
                                    trigger={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full cursor-pointer justify-start gap-2 bg-background text-xs font-medium"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            New dosage form
                                        </Button>
                                    }
                                />

                                <NewProductSheet
                                    trigger={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full cursor-pointer justify-start gap-2 bg-background text-xs font-medium"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            New product
                                        </Button>
                                    }
                                    dosage_forms={dosage_forms}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* RIGHT: batch details */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardHeading
                                icon={PackagePlus}
                                title="Batch Details"
                                description="Enter the details from the delivery invoice."
                            />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <SectionLabel icon={Hash}>
                                    Batch & Quantity
                                </SectionLabel>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                        id="batch_number"
                                        label="Batch Number"
                                        required
                                        error={errors.batch_number}
                                        className="space-y-1.5 sm:col-span-2"
                                    >
                                        <Input
                                            {...bind('batch_number')}
                                            type="text"
                                            placeholder="e.g. PCM-2024-001"
                                        />
                                    </Field>

                                    <Field
                                        id="units_per_package_received"
                                        label="Units Per Package"
                                        error={
                                            errors.units_per_package_received
                                        }
                                    >
                                        <Input
                                            {...bind(
                                                'units_per_package_received',
                                            )}
                                            type="number"
                                            min={0}
                                            placeholder="e.g. 15"
                                        />
                                    </Field>

                                    <Field
                                        id="packages_received"
                                        label="Packages Received"
                                        error={errors.packages_received}
                                    >
                                        <Input
                                            {...bind('packages_received')}
                                            type="number"
                                            min={0}
                                            placeholder="e.g. 100"
                                        />
                                    </Field>

                                    <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-3 sm:col-span-2">
                                        <div>
                                            <p className="text-xs font-semibold">
                                                Quantity Received
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Units per package × packages
                                                received
                                            </p>
                                        </div>
                                        <p className="text-xl font-bold tabular-nums">
                                            {totalQuantity > 0
                                                ? totalQuantity.toLocaleString()
                                                : '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <SectionLabel icon={CalendarClock}>
                                    Dates
                                </SectionLabel>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                        label="Manufactured Date"
                                        error={errors.manufactured_date}
                                        className="flex items-center gap-3"
                                    >
                                        <DatePicker
                                            value={data.manufactured_date}
                                            onChange={(date) =>
                                                setData(
                                                    'manufactured_date',
                                                    date,
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field
                                        label="Expiry Date"
                                        error={errors.expiry_date}
                                        className="flex items-center gap-3"
                                    >
                                        <DatePicker
                                            value={data.expiry_date}
                                            onChange={(date) =>
                                                setData('expiry_date', date)
                                            }
                                        />
                                    </Field>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <SectionLabel icon={Banknote}>
                                    Pricing
                                </SectionLabel>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                        id="cost_price"
                                        label="Cost Price (Tsh)"
                                        error={errors.cost_price}
                                    >
                                        <MoneyInput
                                            {...bind('cost_price')}
                                            placeholder="8,000"
                                        />
                                    </Field>

                                    <Field
                                        id="selling_price"
                                        label="Selling Price (Tsh)"
                                        error={errors.selling_price}
                                    >
                                        <MoneyInput
                                            {...bind('selling_price')}
                                            placeholder="12,000"
                                        />
                                    </Field>
                                </div>
                            </div>

                            <Button
                                onClick={() => handleRecordStock()}
                                className="w-full cursor-pointer gap-2 rounded-xl font-semibold"
                                disabled={processing}
                            >
                                {processing ? (
                                    <Spinner />
                                ) : (
                                    <PackagePlus className="h-4 w-4" />
                                )}
                                Record Stock Receipt
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardInnerLayout>
    );
};

export default ReceiveStock;

ReceiveStock.layout = {
    breadcrumbs: [{ title: 'Receive Stock', href: '#' }],
};
