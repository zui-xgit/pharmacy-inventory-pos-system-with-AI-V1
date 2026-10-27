import { Head, Link, useForm } from '@inertiajs/react';
import { RotateCcw, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import DatePicker from '@/components/dashboard/date-picker';
import { ConfirmAlertDialog } from '@/components/dialogs/confirm-alert-dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import SearchInput from '@/components/search-input';
import { Badge } from '@/components/ui/badge';
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
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import DashboardInnerLayout from '@/layouts/app/dashboard-inner-layout';
import { formatDate } from '@/lib/utils';
import stock from '@/routes/stock';

interface BatchItem {
    uuid: string;
    batch_number: string;

    product: {
        uuid: string;
        name: string;
        dosage_form: string;
    };

    packages_received: number;
    units_per_package_received: number;
    total_units_received: number;
    packages_remaining: number;
    units_remaining: number;
    is_out_of_stock: boolean;

    cost_price: number;
    selling_price: number;

    manufactured_date: string;
    expiry_date: string;
    is_expired: boolean;
    is_expiring_soon: boolean;
    days_until_expiry: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    batches: {
        data: BatchItem[];
        links: PaginationLink[];
    };
    filters: {
        search?: string;
    };
    shop_uuid: string;
}

interface AdjustmentForm {
    batch_uuid: string;
    units_remaining: string | number;
    manufactured_date: string;
    expiry_date: string;
    notes: string | null;
}

const emptyForm: AdjustmentForm = {
    batch_uuid: '',
    units_remaining: '',
    manufactured_date: '',
    expiry_date: '',
    notes: '',
};

export default function StockAdjustmentsPage({
    batches,
    filters,
    shop_uuid,
}: Props) {
    const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const { data, setData, post, processing, errors, clearErrors } =
        useForm<AdjustmentForm>(emptyForm);

    const generalError = (errors as Record<string, string | undefined>).error;
    const hasSearch = Boolean(filters.search?.trim());

    const handleSelectBatch = (batch: BatchItem) => {
        setSelectedBatch(batch);
        setData({
            batch_uuid: batch.uuid,
            units_remaining: batch.units_remaining,
            manufactured_date: batch.manufactured_date,
            expiry_date: batch.expiry_date,
            notes: '',
        });
        clearErrors();
    };

    const handleReset = () => {
        if (!selectedBatch) {
            return;
        }

        setData({
            batch_uuid: selectedBatch.uuid,
            units_remaining: selectedBatch.units_remaining,
            manufactured_date: selectedBatch.manufactured_date,
            expiry_date: selectedBatch.expiry_date,
            notes: '',
        });
        clearErrors();
    };

    const handleSaveAdjustment = () => {
        if (!selectedBatch) {
            return;
        }

        clearErrors();
        setConfirmOpen(true);
    };

    const performAdjustment = () => {
        if (!selectedBatch) {
            return;
        }

        setConfirmOpen(false);

        post(stock.adjust_stock({ shop: shop_uuid }).url, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setSelectedBatch(null);
                setData(emptyForm);

                toast.success('Stock adjustment saved successfully.', {
                    position: 'top-right',
                    richColors: true,
                });
            },
            onError: (formErrors) => {
                if (formErrors.error) {
                    toast.error(formErrors.error, {
                        position: 'top-right',
                        richColors: true,
                    });
                }
            },
        });
    };

    const newQuantity = Number(data.units_remaining || 0);
    const quantityDifference = selectedBatch
        ? newQuantity - selectedBatch.units_remaining
        : 0;

    return (
        <DashboardInnerLayout>
            <Head title="Stock Adjustments" />

            <Heading
                title="Stock Adjustments"
                description="Correct batch quantities and update manufacturing or expiry dates directly in the live inventory ledger."
            />

            <div className="mt-3 grid grid-cols-12 gap-6">
                {/* Search & Select Batch Card */}
                <Card className="col-span-12 xl:col-span-4">
                    <CardHeader>
                        <CardTitle>Select Batch</CardTitle>
                        <CardDescription>
                            Search by batch number or product name
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SearchInput
                            href={
                                stock.stock_adjustments({ shop: shop_uuid }).url
                            }
                            filters={filters}
                            placeholder="Search batch number or product..."
                        />

                        <div className="max-h-[420px] divide-y overflow-y-auto rounded-md border">
                            {!hasSearch ? (
                                <p className="p-4 text-center text-sm text-muted-foreground">
                                    Start typing a batch number or product name
                                    to find a batch.
                                </p>
                            ) : batches.data.length > 0 ? (
                                batches.data.map((batch) => (
                                    <button
                                        type="button"
                                        key={batch.uuid}
                                        onClick={() => handleSelectBatch(batch)}
                                        className={`block w-full p-3 text-left transition-colors hover:bg-accent ${
                                            selectedBatch?.uuid === batch.uuid
                                                ? 'bg-accent'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-semibold">
                                                    {batch.product.name}
                                                </div>
                                                <div className="mt-0.5 text-xs text-muted-foreground">
                                                    {batch.product.dosage_form}
                                                </div>
                                            </div>
                                            <Badge
                                                variant={
                                                    batch.is_out_of_stock
                                                        ? 'destructive'
                                                        : 'outline'
                                                }
                                                className="shrink-0"
                                            >
                                                {batch.units_remaining} units
                                            </Badge>
                                        </div>

                                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="font-mono">
                                                #{batch.batch_number}
                                            </span>
                                            <span
                                                className={
                                                    batch.is_expired
                                                        ? 'text-destructive'
                                                        : batch.is_expiring_soon
                                                          ? 'text-amber-600 dark:text-amber-400'
                                                          : ''
                                                }
                                            >
                                                Exp:{' '}
                                                {formatDate(batch.expiry_date)}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="p-4 text-center text-sm text-muted-foreground">
                                    No batches found for "{filters.search}".
                                </p>
                            )}
                        </div>

                        {hasSearch && batches.links.length > 3 && (
                            <div className="flex flex-wrap items-center justify-center gap-1">
                                {batches.links.map((link, index) => {
                                    if (!link.url) {
                                        return null;
                                    }

                                    return (
                                        <Button
                                            key={index}
                                            asChild
                                            size="sm"
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            <Link
                                                href={link.url}
                                                preserveState
                                                preserveScroll
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        </Button>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Batch Adjustment Form Card */}
                <Card className="col-span-12 xl:col-span-8">
                    <CardHeader>
                        <CardTitle>Adjustment Details</CardTitle>
                        <CardDescription>
                            {selectedBatch
                                ? `Editing ${selectedBatch.product.name} (batch ${selectedBatch.batch_number})`
                                : 'Select a batch from the left to start adjusting.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedBatch ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Current Quantity (units)</Label>
                                        <Input
                                            value={
                                                selectedBatch.units_remaining
                                            }
                                            disabled
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {selectedBatch.packages_remaining}{' '}
                                            packages remaining &middot;{' '}
                                            {
                                                selectedBatch.units_per_package_received
                                            }{' '}
                                            units per package
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="units_remaining">
                                            New Adjusted Quantity (units)
                                        </Label>
                                        <Input
                                            id="units_remaining"
                                            type="number"
                                            min={0}
                                            value={data.units_remaining}
                                            onChange={(e) =>
                                                setData(
                                                    'units_remaining',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.units_remaining}
                                        />
                                        <p
                                            className={`text-xs ${
                                                quantityDifference === 0
                                                    ? 'text-muted-foreground'
                                                    : quantityDifference > 0
                                                      ? 'text-emerald-600 dark:text-emerald-400'
                                                      : 'text-destructive'
                                            }`}
                                        >
                                            {quantityDifference === 0
                                                ? 'No quantity change'
                                                : `${quantityDifference > 0 ? '+' : ''}${quantityDifference} units`}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="flex flex-col space-y-2">
                                        <Label>Manufacturing Date</Label>
                                        <DatePicker
                                            value={data.manufactured_date}
                                            onChange={(dateStr) =>
                                                setData(
                                                    'manufactured_date',
                                                    dateStr,
                                                )
                                            }
                                            placeholder="Select manufacturing date"
                                        />
                                        <InputError
                                            message={errors.manufactured_date}
                                        />
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        <Label>Expiry Date</Label>
                                        <DatePicker
                                            value={data.expiry_date}
                                            onChange={(dateStr) =>
                                                setData('expiry_date', dateStr)
                                            }
                                            placeholder="Select expiry date"
                                        />
                                        <InputError
                                            message={errors.expiry_date}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">
                                        Notes
                                        <span className="ml-2 text-red-500">
                                            (optional)
                                        </span>
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="e.g. Damaged stock, physical audit mismatch, corrected expiry date from supplier..."
                                        value={data.notes ?? ''}
                                        onChange={(e) =>
                                            setData(
                                                'notes',
                                                e.target.value || null,
                                            )
                                        }
                                        rows={3}
                                    />
                                    <InputError message={errors.notes} />
                                </div>

                                {generalError && (
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        {generalError}
                                    </p>
                                )}

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleReset}
                                        disabled={processing}
                                    >
                                        <RotateCcw className="mr-2 h-4 w-4" />{' '}
                                        Reset
                                    </Button>
                                    <ConfirmAlertDialog
                                        trigger={
                                            <Button
                                                type="button"
                                                disabled={processing}
                                                onClick={handleSaveAdjustment}
                                                className="cursor-pointer"
                                            >
                                                {processing ? (
                                                    <Spinner className="mr-2 h-4 w-4" />
                                                ) : (
                                                    <Save className="mr-2 h-4 w-4" />
                                                )}
                                                Save Adjustment
                                            </Button>
                                        }
                                        title="Confirm stock adjustment"
                                        description={
                                            <span>
                                                Save an adjustment for{' '}
                                                <span className="font-medium text-foreground">
                                                    {selectedBatch.product.name}
                                                </span>{' '}
                                                (batch{' '}
                                                <span className="font-mono">
                                                    {selectedBatch.batch_number}
                                                </span>
                                                )?{' '}
                                                {quantityDifference === 0
                                                    ? `The stock will stay at ${selectedBatch.units_remaining} units.`
                                                    : `The quantity will change from ${selectedBatch.units_remaining} to ${newQuantity} units.`}
                                            </span>
                                        }
                                        actionText="Yes, save adjustment"
                                        cancelText="Cancel"
                                        onConfirm={performAdjustment}
                                        open={confirmOpen}
                                        onOpenChange={setConfirmOpen}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-muted-foreground">
                                No batch selected.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardInnerLayout>
    );
}

StockAdjustmentsPage.layout = {
    breadcrumbs: [
        {
            title: 'Stock Adjustments',
            href: '#',
        },
    ],
};
