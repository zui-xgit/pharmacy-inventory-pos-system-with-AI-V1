import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { EditDeleteRowActions } from '@/components/dopdown/edit-delete-row-actions';
import Heading from '@/components/heading';
import SearchInput from '@/components/search-input';
import NewDosageFormSheet from '@/components/sheets/new-dosage-form';
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

interface DosageFormItem {
    uuid: string;
    name: string;
    products_count: number;
}

interface Props {
    dosageForms: {
        data: DosageFormItem[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search?: string;
    };
}

const DosageForms = ({ dosageForms, filters }: Props) => {
    const handleEdit = () => {};
    const handleDelete = () => {};

    return (
        <>
            <Head title="Dosage Forms Catalog" />

            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        variant="small"
                        title="Dosage Forms"
                        description="Manage drug physical formats like Tablets, Syrups, and Capsules."
                    />

                    <NewDosageFormSheet
                        trigger={
                            <Button size="sm" className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Add Dosage
                                Form
                            </Button>
                        }
                    />
                </div>

                {/* Integrated Reusable Search Component */}
                <div className="max-w-sm">
                    <SearchInput
                        href={window.location.pathname}
                        filters={filters}
                        placeholder="Search dosage forms..."
                    />
                </div>

                {/* Data Grid */}
                <div className="rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Form Name</TableHead>
                                <TableHead>Linked Products</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dosageForms.data.length > 0 ? (
                                dosageForms.data.map((form) => (
                                    <TableRow key={form.uuid}>
                                        <TableCell className="font-medium text-foreground">
                                            {form.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {form.products_count}{' '}
                                                {form.products_count === 1
                                                    ? 'product'
                                                    : 'products'}
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
                                        colSpan={3}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No dosage configurations match your
                                        parameters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Matrix Links */}
                {dosageForms.links.length > 3 && (
                    <div className="flex items-center justify-end space-x-2">
                        {dosageForms.links.map((link, index) => {
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

export default DosageForms;

DosageForms.layout = {
    breadcrumbs: [
        {
            title: 'Dosage Forms',
            href: '#',
        },
    ],
};
