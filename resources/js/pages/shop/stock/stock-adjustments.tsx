'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Heading from '@/components/heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Search, Save, RotateCcw } from 'lucide-react';
import DatePicker from '@/components/dashboard/date-picker';
import DashboardInnerLayout from '@/layouts/app/dashboard-inner-layout';

interface Batch {
    id: string;
    batchNumber: string;
    productName: string;
    currentQuantity: number;
    manufacturingDate: string;
    expiryDate: string;
}

export default function StockAdjustmentsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

    // Form State
    const [adjustedQuantity, setAdjustedQuantity] = useState<number | ''>('');
    const [mfgDate, setMfgDate] = useState<string>('');
    const [expDate, setExpDate] = useState<string>('');
    const [reason, setReason] = useState('');

    // Sample batch data for search
    const sampleBatches: Batch[] = [
        {
            id: '1',
            batchNumber: 'BAT-2026-001',
            productName: 'Amoxicillin 500mg',
            currentQuantity: 150,
            manufacturingDate: '2025-01-15',
            expiryDate: '2027-01-15',
        },
        {
            id: '2',
            batchNumber: 'BAT-2026-002',
            productName: 'Paracetamol 500mg',
            currentQuantity: 300,
            manufacturingDate: '2025-06-10',
            expiryDate: '2027-06-10',
        },
    ];

    const handleSelectBatch = (batch: Batch) => {
        setSelectedBatch(batch);
        setAdjustedQuantity(batch.currentQuantity);
        setMfgDate(batch.manufacturingDate);
        setExpDate(batch.expiryDate);
    };

    const handleReset = () => {
        if (selectedBatch) {
            setAdjustedQuantity(selectedBatch.currentQuantity);
            setMfgDate(selectedBatch.manufacturingDate);
            setExpDate(selectedBatch.expiryDate);
            setReason('');
        }
    };

    const handleSave = () => {
        if (!selectedBatch) return;

        const payload = {
            batchId: selectedBatch.id,
            newQuantity: Number(adjustedQuantity),
            quantityDifference:
                Number(adjustedQuantity) - selectedBatch.currentQuantity,
            manufacturingDate: mfgDate,
            expiryDate: expDate,
            reason,
        };

        console.log('Submitting Stock Adjustment:', payload);
        // Submit to your backend API / stock_movements ledger
    };

    const filteredBatches = sampleBatches.filter(
        (b) =>
            b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.productName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <DashboardInnerLayout>
            <Heading
                title="Stock Adjustments"
                description=" Modify batch quantities and update manufacturing/expiry dates directly."
            />

            <div className="mt-3 grid grid-cols-12 gap-6">
                {/* Search & Select Batch */}
                <Card className="col-span-12 xl:col-span-4">
                    <CardHeader>
                        <CardTitle>Select Batch</CardTitle>
                        <CardDescription>
                            Search by batch number or product name
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search batches..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="max-h-[350px] divide-y overflow-y-auto rounded-md border">
                            {filteredBatches.map((batch) => (
                                <div
                                    key={batch.id}
                                    onClick={() => handleSelectBatch(batch)}
                                    className={`cursor-pointer p-3 transition-colors hover:bg-accent ${
                                        selectedBatch?.id === batch.id
                                            ? 'bg-accent font-medium'
                                            : ''
                                    }`}
                                >
                                    <div className="text-sm font-semibold">
                                        {batch.productName}
                                    </div>
                                    <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                                        <span>{batch.batchNumber}</span>
                                        <span>
                                            Qty: {batch.currentQuantity}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {filteredBatches.length === 0 && (
                                <p className="p-4 text-center text-sm text-muted-foreground">
                                    No batches found.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Batch Adjustment Form */}
                <Card className="col-span-12 xl:col-span-8">
                    <CardHeader>
                        <CardTitle>Adjustment Details</CardTitle>
                        <CardDescription>
                            {selectedBatch
                                ? `Editing ${selectedBatch.productName} (${selectedBatch.batchNumber})`
                                : 'Select a batch from the left to start adjusting.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedBatch ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Current Quantity</Label>
                                        <Input
                                            value={
                                                selectedBatch.currentQuantity
                                            }
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="adjustedQty">
                                            New Adjusted Quantity
                                        </Label>
                                        <Input
                                            id="adjustedQty"
                                            type="number"
                                            value={adjustedQuantity}
                                            onChange={(e) =>
                                                setAdjustedQuantity(
                                                    e.target.value === ''
                                                        ? ''
                                                        : Number(
                                                              e.target.value,
                                                          ),
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Manufacturing Date - Using custom DatePicker */}
                                    <div className="flex flex-col space-y-2">
                                        <Label>Manufacturing Date</Label>
                                        <DatePicker
                                            value={mfgDate}
                                            onChange={(dateStr) =>
                                                setMfgDate(dateStr)
                                            }
                                            placeholder="Select manufacturing date"
                                        />
                                    </div>

                                    {/* Expiry Date - Using custom DatePicker */}
                                    <div className="flex flex-col space-y-2">
                                        <Label>Expiry Date</Label>
                                        <DatePicker
                                            value={expDate}
                                            onChange={(dateStr) =>
                                                setExpDate(dateStr)
                                            }
                                            placeholder="Select expiry date"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason">
                                        Reason for Adjustment
                                    </Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="e.g. Damaged stock, physical audit mismatch, updated expiry date from supplier..."
                                        value={reason}
                                        onChange={(e) =>
                                            setReason(e.target.value)
                                        }
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleReset}
                                    >
                                        <RotateCcw className="mr-2 h-4 w-4" />{' '}
                                        Reset
                                    </Button>
                                    <Button onClick={handleSave}>
                                        <Save className="mr-2 h-4 w-4" /> Save
                                        Adjustment
                                    </Button>
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
