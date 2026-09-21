import { useForm, usePage } from '@inertiajs/react';
import { PackagePlus, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import DatePicker from '@/components/dashboard/date-picker';
import { StocktConfirmationDialog } from '@/components/dialogs/confirm-create-stock';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import SearchInput from '@/components/search-input';
import NewDosageFormSheet from '@/components/sheets/new-dosage-form';
// import NewPackageUnitSheet from '@/components/sheets/new-package-unit';
import NewProductSheet from '@/components/sheets/new-product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
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

const ReceiveStock = ({
    products,
    filters,
    shop_uuid,
    search_input,
    dosage_forms,
}: ReceiveStockProps) => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const { data, setData, processing, errors, post, transform } =
        useForm<UseFormType>(useFormDefaultValues);

    const { activeShop } = usePage<{ activeShop: { uuid: string } }>().props;
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    const handleRecordStock = (isConfirmed = false) => {
        transform((data) => ({
            ...data,
            product: selectedProduct ?? undefined,
            confirmed: isConfirmed,
        }));
        handleDataPostRequest();
    };

    const handleDataPostRequest = () => {
        post(stock.newBatch({ shop: activeShop.uuid }).url, {
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
                {/* Page header */}
                <Heading
                    title="Receive Stock"
                    description="Record a new stock delivery from a supplier.."
                />

                {/* Main form */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* LEFT — Product + Supplier */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">
                                Product & Supplier
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Search for an existing product or add a new one.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Product Search Input with Datalist */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Product Name:
                                    <span className="text-destructive">*</span>
                                </Label>
                                <SearchInput
                                    href={stock.receiveStock({
                                        shop: shop_uuid,
                                    })}
                                    filters={filters}
                                />

                                <InputError
                                    message={
                                        (errors as Record<string, string>)
                                            .product
                                    }
                                />

                                {selectedProduct && (
                                    <div className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-1 text-sm shadow-sm">
                                        <div className="flex items-center gap-2 truncate overflow-hidden">
                                            <span className="truncate font-medium text-foreground">
                                                {selectedProduct.name}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="h-4 shrink-0 py-0 text-[10px]"
                                            >
                                                {
                                                    selectedProduct.dosage_form
                                                        .name
                                                }
                                            </Badge>
                                        </div>

                                        {/* Clear button to let them search again */}
                                        <button
                                            onClick={() =>
                                                setSelectedProduct(null)
                                            }
                                            type="button"
                                            className="pl-2 text-xs font-semibold text-destructive transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                                {products && products.length > 0 ? (
                                    <div className="p-1">
                                        <p className="px-2 py-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                            Available Products (
                                            {products.length})
                                        </p>
                                        <div className="space-y-0.5">
                                            {products.map((product, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className="flex h-8 w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() =>
                                                        setSelectedProduct(
                                                            product,
                                                        )
                                                    }
                                                >
                                                    <span className="font-medium text-foreground">
                                                        {product.name}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-background py-0 text-[10px]"
                                                        >
                                                            {
                                                                product
                                                                    .dosage_form
                                                                    .name
                                                            }
                                                        </Badge>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {search_input !== null && (
                                            <div className="p-1">
                                                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                                                    No matching products found.
                                                </div>
                                                <div className="my-1 border-t" />
                                            </div>
                                        )}
                                    </>
                                )}
                                <NewDosageFormSheet
                                    trigger={
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="w-full cursor-pointer justify-start gap-2 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 hover:text-primary"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add New Dosage Form - If not
                                            available
                                        </Button>
                                    }
                                />
                                {/* <NewPackageUnitSheet
                                    trigger={
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="w-full cursor-pointer justify-start gap-2 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 hover:text-primary"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add New Package Unit - If not
                                            available
                                        </Button>
                                    }
                                /> */}
                                <NewProductSheet
                                    trigger={
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="w-full cursor-pointer justify-start gap-2 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 hover:text-primary"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add New Product - If not available
                                        </Button>
                                    }
                                    dosage_forms={dosage_forms}
                                />
                            </div>

                            {/* Supplier Input  */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Supplier{' '}
                                    <span className="ml-1 font-normal text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>
                                <Input
                                    type="text"
                                    list="suppliers-datalist"

                                    placeholder="Type to select supplier..."
                                    className="rounded-xl text-xs"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* RIGHT — Batch details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">
                                Batch Details
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Enter the details from the delivery invoice.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Batch Number{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        value={data.batch_number}
                                        onChange={(e) =>
                                            setData(
                                                'batch_number',
                                                e.target.value,
                                            )
                                        }
                                        type="text"
                                        placeholder="e.g. PCM-2024-001"
                                    />
                                    <InputError message={errors.batch_number} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Units Per Package Received
                                    </Label>
                                    <Input
                                        value={data.units_per_package_received}
                                        onChange={(e) =>
                                            setData(
                                                'units_per_package_received',
                                                e.target.value,
                                            )
                                        }
                                        type="number"
                                        placeholder="e.g. 15"
                                    />
                                    <InputError
                                        message={
                                            errors.units_per_package_received
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Packages Received
                                    </Label>
                                    <Input
                                        value={data.packages_received}
                                        onChange={(e) =>
                                            setData(
                                                'packages_received',
                                                e.target.value,
                                            )
                                        }
                                        type="number"
                                        placeholder="e.g. 100"
                                    />
                                    <InputError
                                        message={errors.packages_received}
                                    />
                                </div>

                                {/* AUTOMATIC FILLED QUANTITY RECEIVED */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Quantity Received{' '}
                                        <span className="text-destructive">
                                            (Automatic)
                                        </span>
                                    </Label>
                                    <Input
                                        value={
                                            Number(
                                                data.units_per_package_received ||
                                                    0,
                                            ) *
                                                Number(
                                                    data.packages_received || 0,
                                                ) || ''
                                        }
                                        type="number"
                                        placeholder="e.g. 100"
                                        readOnly
                                        className="pointer-events-none bg-muted"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1">
                                    <Label className="text-xs font-semibold">
                                        Expiry Date
                                    </Label>
                                    <DatePicker
                                        value={data.expiry_date}
                                        onChange={(date) =>
                                            setData('expiry_date', date)
                                        }
                                    />
                                    <InputError message={errors.expiry_date} />
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <Label className="text-xs font-semibold">
                                        Manufactured Date
                                    </Label>
                                    <DatePicker
                                        value={data.manufactured_date}
                                        onChange={(date) =>
                                            setData('manufactured_date', date)
                                        }
                                    />
                                    <InputError
                                        message={errors.manufactured_date}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Cost Pric (Tsh)
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted-foreground">
                                            Tsh
                                        </span>
                                        <Input
                                            value={data.cost_price}
                                            onChange={(e) =>
                                                setData(
                                                    'cost_price',
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-xl pl-10 text-sm"
                                            type="number"
                                            placeholder="8,000"
                                        />
                                    </div>
                                    <InputError message={errors.cost_price} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Selling Price (Tsh)
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted-foreground">
                                            Tsh
                                        </span>
                                        <Input
                                            value={data.selling_price}
                                            onChange={(e) =>
                                                setData(
                                                    'selling_price',
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-xl pl-10 text-sm"
                                            type="number"
                                            placeholder="12,000"
                                        />
                                    </div>
                                    <InputError
                                        message={errors.selling_price}
                                    />
                                </div>
                            </div>

                            {/* Submit */}
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
