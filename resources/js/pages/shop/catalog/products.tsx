import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { EditDeleteRowActions } from '@/components/dopdown/edit-delete-row-actions';
import Heading from '@/components/heading';
import SearchInput from '@/components/search-input'; // Adjust this import path to match your structure
import NewProductSheet from '@/components/sheets/new-product';
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
import type { DosageForm } from '@/types/type';

interface ProductItem {
    uuid: string;
    name: string;
    dosage_form: { uuid: string; name: string };
}

interface Props {
    products: {
        data: ProductItem[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search?: string;
    };
    dosage_forms: DosageForm[];
}

const Products = ({ products, filters, dosage_forms }: Props) => {
    const handleEdit = () => {};
    const handleDelete = () => {};

    return (
        <>
            <Head title="Products Catalog" />

            <div className="space-y-6">
                {/* Header Action Row */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        variant="small"
                        title="Products Catalog"
                        description="Manage your pharmacy's master drug list and product blueprints."
                    />
                    <NewProductSheet
                        trigger={
                            <Button size="sm" className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Add Product
                            </Button>
                        }
                        dosage_forms={dosage_forms}
                    />
                </div>

                {/* Integrated Reusable Search Component */}
                <div className="max-w-sm">
                    <SearchInput
                        href={window.location.pathname}
                        filters={filters}
                        placeholder="Search products by name or SKU..."
                    />
                </div>

                {/* Data Matrix */}
                <div className="rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                {/* <TableHead>SKU / Barcode</TableHead> */}
                                <TableHead>Dosage Form</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.length > 0 ? (
                                products.data.map((product) => (
                                    <TableRow key={product.uuid}>
                                        <TableCell className="font-medium text-foreground">
                                            {product.name}
                                        </TableCell>
                                        {/* <TableCell className="font-mono text-xs text-muted-foreground">
                                            {product.sku}
                                        </TableCell> */}
                                        <TableCell>
                                            <Badge variant="outline">
                                                {product.dosage_form.name}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <EditDeleteRowActions
                                                onEdit={() => handleEdit()}
                                                onDelete={() => handleDelete()}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No catalog records matches your entry
                                        parameters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Contextual Pagination Controls */}
                {products.links.length > 3 && (
                    <div className="flex items-center justify-end space-x-2">
                        {products.links.map((link, index) => {
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

export default Products;

Products.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: '#',
        },
    ],
};
