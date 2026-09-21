import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import type { Product } from '@/types/type';
import { Spinner } from '../ui/spinner';

// 1. Explicitly type the useForm dataset structure
export interface StockFormData {
    // product: Product | null | Record<string, never>;
    expiry_date: string;
    manufactured_date: string;
    batch_number: string;
    cost_price: string | number;
    selling_price: string | number;
    units_per_package_received: string | number;
    packages_received: string | number;
}

interface ProductConfirmationDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null | Record<string, never>;
    data: StockFormData;
    onConfirm: () => void;
    processing: boolean;
}

export function StocktConfirmationDialog({
    isOpen,
    onOpenChange,
    product,
    data,
    onConfirm,
    processing,
}: ProductConfirmationDialogProps) {
    const formatCurrency = (value: string | number) => {
        if (!value) {
return '-';
}

        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            maximumFractionDigits: 0,
        }).format(Number(value));
    };

    const totalLooseUnits =
        Number(data.packages_received || 0) *
        Number(data.units_per_package_received || 0);

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Confirm Product Batch Entry
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Please verify the incoming inventory details below
                        before saving them to the system.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="my-4 overflow-hidden rounded-lg border">
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="py-2 font-medium text-muted-foreground">
                                    Product
                                </TableCell>
                                <TableCell className="py-2 text-right font-semibold">
                                    {/* Optional chaining protects against empty objects */}
                                    {product?.name || '-'}{' '}
                                    {product?.dosage_form.name || ''}{' '}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="py-2 font-medium text-muted-foreground">
                                    Batch Number
                                </TableCell>
                                <TableCell className="py-2 text-right font-mono">
                                    {data.batch_number || '-'}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="py-2 font-medium text-muted-foreground">
                                    Mfg Date
                                </TableCell>
                                <TableCell className="py-2 text-right">
                                    {data.manufactured_date || '-'}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="py-2 font-medium text-destructive text-muted-foreground">
                                    Expiry Date
                                </TableCell>
                                <TableCell className="py-2 text-right font-medium text-destructive">
                                    {data.expiry_date || '-'}
                                </TableCell>
                            </TableRow>
                            <TableRow className="border-t-2">
                                <TableCell className="py-2 font-medium text-muted-foreground">
                                    Cost Price
                                </TableCell>
                                <TableCell className="py-2 text-right font-semibold text-green-600">
                                    {formatCurrency(data.cost_price)}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="py-2 font-medium text-muted-foreground">
                                    Selling Price
                                </TableCell>
                                <TableCell className="py-2 text-right font-semibold text-blue-600">
                                    {formatCurrency(data.selling_price)}
                                </TableCell>
                            </TableRow>
                            <TableRow className="border-t-2">
                                <TableCell className="py-2 font-medium text-muted-foreground">
                                    Packages Received
                                </TableCell>
                                <TableCell className="py-2 text-right font-bold">
                                    {data.packages_received || '0'}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="py-2 font-medium text-muted-foreground">
                                    Units per Package
                                </TableCell>
                                <TableCell className="py-2 text-right">
                                    {data.units_per_package_received || '0'}
                                </TableCell>
                            </TableRow>
                            <TableRow className="font-bold">
                                <TableCell className="py-2">
                                    Total Loose Units
                                </TableCell>
                                <TableCell className="py-2 text-right text-primary">
                                    {totalLooseUnits.toLocaleString()} units
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={processing}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        Confirm & Save
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
