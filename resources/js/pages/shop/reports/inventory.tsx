import DashboardInnerLayout from '@/layouts/app/dashboard-inner-layout';
import Heading from '@/components/heading';
import { Head } from '@inertiajs/react';

export default function InventoryReports() {
    return (
        <DashboardInnerLayout>
            <Head title="Inventory Reports" />
            <Heading
                title="Inventory Reports"
                description="View inventory analytics and reports"
            />
        </DashboardInnerLayout>
    );
}

InventoryReports.layout = {
    breadcrumbs: [{ title: 'Inventory Reports', href: '#' }],
};
