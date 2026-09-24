import DashboardInnerLayout from '@/layouts/app/dashboard-inner-layout';

const OverviewDashboard = () => {
    return (
        <DashboardInnerLayout>
            <div>Overview page</div>
        </DashboardInnerLayout>
    );
};

export default OverviewDashboard;

OverviewDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Overview Dashboard',
            href: '#',
        },
    ],
};
