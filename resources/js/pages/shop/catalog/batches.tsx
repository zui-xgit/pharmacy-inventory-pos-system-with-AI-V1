// import Heading from '@/components/heading';
// import SearchInput from '@/components/search-input';
// import { Head, Link, router, usePage } from '@inertiajs/react';
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Plus } from 'lucide-react';
// import stock from '@/routes/stock';

// interface BatchItem {
//     uuid: string;
//     batch_number: string;
//     product_name: string;
//     units_per_package_received: number; // Added field mapping from controller
//     packages_received: number; // Added field mapping from controller
//     quantity_received: number;
//     current_quantity: number;
//     cost_price: number;
//     selling_price: number;
//     expiry_date: string;
//     is_expired: boolean;
// }

// interface Props {
//     batches: {
//         data: BatchItem[];
//         links: { url: string | null; label: string; active: boolean }[];
//     };
//     filters: {
//         search?: string;
//     };
// }

// const Batches = ({ batches, filters }: Props) => {
//     const { activeShop } = usePage<{
//         activeShop: { uuid: string } | undefined;
//     }>().props;

//     return (
//         <>
//             <Head title="Inventory Batches" />

//             <div className="space-y-6">
//                 {/* Header Actions */}
//                 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//                     <Heading
//                         variant="small"
//                         title="Inventory Batches"
//                         description="Track physical stock shipments, costs, operational pricing, and expiration risks."
//                     />
//                     <Button
//                         onClick={() => {
//                             if (activeShop) {
//                                 router.get(
//                                     stock.receiveStock(activeShop.uuid).url,
//                                 );
//                             }
//                         }}
//                         size="sm"
//                         className="w-full sm:w-auto"
//                     >
//                         <Plus className="mr-2 h-4 w-4" /> Record New Batch
//                     </Button>
//                 </div>

//                 {/* Filter Controls */}
//                 <div className="max-w-sm">
//                     <SearchInput
//                         href={window.location.pathname}
//                         filters={filters}
//                         placeholder="Search by batch number or product..."
//                     />
//                 </div>

//                 {/* Data Representation Grid */}
//                 <div className="rounded-md border bg-card">
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Batch Info</TableHead>
//                                 <TableHead>Product</TableHead>
//                                 <TableHead>Recieved</TableHead>
//                                 <TableHead>Remaining</TableHead>
//                                 <TableHead>Financials (Cost / Sell)</TableHead>
//                                 <TableHead>Expiry</TableHead>
//                                 <TableHead>Action </TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {batches.data.length > 0 ? (
//                                 batches.data.map((batch) => (
//                                     <TableRow key={batch.uuid}>
//                                         <TableCell className="font-medium text-foreground">
//                                             <span className="block font-mono text-xs text-muted-foreground">
//                                                 # {batch.batch_number}
//                                             </span>
//                                         </TableCell>
//                                         <TableCell className="text-foreground">
//                                             {batch.product_name}
//                                         </TableCell>
//                                         {/* New Table Cell detailing configuration breakdown per batch packaging parameters */}
//                                         <TableCell className="text-sm">
//                                             <div className="flex flex-col gap-0.5">
//                                                 <span className="font-medium">
//                                                     {batch.packages_received}{' '}
//                                                     pkgs
//                                                 </span>
//                                                 <span className="text-xs text-muted-foreground">
//                                                     (
//                                                     {
//                                                         batch.units_per_package_received
//                                                     }{' '}
//                                                     units/pkg)
//                                                 </span>
//                                             </div>
//                                         </TableCell>
//                                         <TableCell>
//                                             <div className="flex flex-col gap-1">
//                                                 <span className="text-sm font-medium">
//                                                     {batch.current_quantity}{' '}
//                                                     left
//                                                 </span>
//                                                 <span className="text-xs text-muted-foreground">
//                                                     of {batch.quantity_received}{' '}
//                                                     received
//                                                 </span>
//                                             </div>
//                                         </TableCell>
//                                         <TableCell className="text-sm">
//                                             <div className="space-x-1">
//                                                 <span className="font-mono text-muted-foreground">
//                                                     TSh{' '}
//                                                     {Number(
//                                                         batch.cost_price,
//                                                     ).toLocaleString()}
//                                                 </span>
//                                                 <span className="text-muted-foreground">
//                                                     /
//                                                 </span>
//                                                 <span className="font-mono font-semibold text-foreground">
//                                                     TSh{' '}
//                                                     {Number(
//                                                         batch.selling_price,
//                                                     ).toLocaleString()}
//                                                 </span>
//                                             </div>
//                                         </TableCell>
//                                         <TableCell>
//                                             <div className="flex flex-col items-start gap-1">
//                                                 <span className="font-mono text-sm">
//                                                     {batch.expiry_date}
//                                                 </span>
//                                                 <Badge
//                                                     variant={
//                                                         batch.is_expired
//                                                             ? 'destructive'
//                                                             : 'outline'
//                                                     }
//                                                 >
//                                                     {batch.is_expired
//                                                         ? 'Expired'
//                                                         : 'Valid'}
//                                                 </Badge>
//                                             </div>
//                                         </TableCell>
//                                     </TableRow>
//                                 ))
//                             ) : (
//                                 <TableRow>
//                                     <TableCell
//                                         colSpan={6} // Increased colSpan to 6 to safely accommodate the added column
//                                         className="h-24 text-center text-muted-foreground"
//                                     >
//                                         No active inventory batches match your
//                                         filters.
//                                     </TableCell>
//                                 </TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </div>

//                 {/* Contextual Nav Links */}
//                 {batches.links.length > 3 && (
//                     <div className="flex items-center justify-end space-x-2">
//                         {batches.links.map((link, index) => {
//                             if (!link.url) return null;
//                             return (
//                                 <Button
//                                     key={index}
//                                     variant={
//                                         link.active ? 'default' : 'outline'
//                                     }
//                                     size="sm"
//                                     asChild
//                                 >
//                                     <Link
//                                         href={link.url}
//                                         preserveState
//                                         preserveScroll
//                                         dangerouslySetInnerHTML={{
//                                             __html: link.label,
//                                         }}
//                                     />
//                                 </Button>
//                             );
//                         })}
//                     </div>
//                 )}
//             </div>
//         </>
//     );
// };

// export default Batches;

// Batches.layout = {
//     breadcrumbs: [
//         {
//             title: 'Batches',
//             href: '#',
//         },
//     ],
// };

import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { EditDeleteRowActions } from '@/components/dopdown/edit-delete-row-actions';
import Heading from '@/components/heading';
import SearchInput from '@/components/search-input';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import stock from '@/routes/stock';

interface BatchItem {
    uuid: string;
    batch_number: string;
    product_name: string;
    product_uuid?: string;
    supplier_name: string;
    units_per_package_received: number;
    packages_received: number;
    total_units_received: number;
    packages_remaining: number;
    units_remaining: number;
    is_out_of_stock: boolean;
    cost_price: number;
    selling_price: number;
    manufactured_date: string | null;
    expiry_date: string;
    is_expired: boolean;
}

interface Props {
    batches: {
        data: BatchItem[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search?: string;
    };
}

const Batches = ({ batches, filters }: Props) => {
    const { activeShop } = usePage<{
        activeShop: { uuid: string } | undefined;
    }>().props;

    const handleEdit = (batchUuid: string) => {
        if (activeShop) {
            // Router endpoint ready:
            // router.get(stock.editBatch(activeShop.uuid, batchUuid).url);
            console.log('Edit batch:', batchUuid);
        }
    };

    const handleDelete = (batchUuid: string) => {
        if (confirm('Are you sure you want to delete this batch?')) {
            // Router endpoint ready:
            // router.delete(stock.deleteBatch(activeShop.uuid, batchUuid).url);
            console.log('Delete batch:', batchUuid);
        }
    };

    return (
        <>
            <Head title="Inventory Batches" />

            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        variant="small"
                        title="Inventory Batches"
                        description="Track physical stock shipments, costs, operational pricing, and expiration risks."
                    />
                    <Button
                        onClick={() => {
                            if (activeShop) {
                                router.get(
                                    stock.receiveStock(activeShop.uuid).url,
                                );
                            }
                        }}
                        size="sm"
                        className="w-full sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Record New Batch
                    </Button>
                </div>

                {/* Filter Controls */}
                <div className="max-w-sm">
                    <SearchInput
                        href={window.location.pathname}
                        filters={filters}
                        placeholder="Search by batch number or product..."
                    />
                </div>

                {/* Data Representation Grid */}
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Batch Info</TableHead>
                                <TableHead>Product & Supplier</TableHead>
                                <TableHead>Received</TableHead>
                                <TableHead>Remaining</TableHead>
                                <TableHead>Financials (Cost / Sell)</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead className="text-center">
                                    Status
                                </TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {batches.data.length > 0 ? (
                                batches.data.map((batch) => (
                                    <TableRow key={batch.uuid}>
                                        <TableCell className="font-medium text-foreground">
                                            <span className="block font-mono text-xs text-muted-foreground">
                                                #{batch.batch_number}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-foreground">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {batch.product_name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    Supplier:{' '}
                                                    {batch.supplier_name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-medium">
                                                    {batch.packages_received}{' '}
                                                    pkgs (
                                                    {batch.total_units_received}{' '}
                                                    units)
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    (
                                                    {
                                                        batch.units_per_package_received
                                                    }{' '}
                                                    units/pkg)
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-medium">
                                                    {batch.units_remaining}{' '}
                                                    units left
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {batch.packages_remaining}{' '}
                                                    pkgs left
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div className="space-x-1">
                                                <span className="font-mono text-muted-foreground">
                                                    TSh{' '}
                                                    {Number(
                                                        batch.cost_price,
                                                    ).toLocaleString()}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    /
                                                </span>
                                                <span className="font-mono font-semibold text-foreground">
                                                    TSh{' '}
                                                    {Number(
                                                        batch.selling_price,
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-sm">
                                                {batch.expiry_date}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-1.5">
                                                {batch.is_out_of_stock ? (
                                                    <Badge variant="destructive">
                                                        Out of Stock
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-emerald-600 dark:text-emerald-400"
                                                    >
                                                        In Stock
                                                    </Badge>
                                                )}

                                                <Badge
                                                    variant={
                                                        batch.is_expired
                                                            ? 'destructive'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {batch.is_expired
                                                        ? 'Expired'
                                                        : 'Valid'}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <EditDeleteRowActions
                                                onEdit={() =>
                                                    handleEdit(batch.uuid)
                                                }
                                                onDelete={() =>
                                                    handleDelete(batch.uuid)
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No active inventory batches match your
                                        filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Contextual Nav Links */}
                {batches.links.length > 3 && (
                    <div className="flex items-center justify-end space-x-2">
                        {batches.links.map((link, index) => {
                            if (!link.url) {
return null;
}

                            return (
                                <Button
                                    key={index}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    asChild
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
            </div>
        </>
    );
};

export default Batches;

Batches.layout = {
    breadcrumbs: [
        {
            title: 'Batches',
            href: '#',
        },
    ],
};
