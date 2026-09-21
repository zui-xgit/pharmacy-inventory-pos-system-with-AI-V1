import type { ReactNode } from 'react';
import React from 'react';

interface DashboardInnerLayoutProps {
    children: ReactNode;
}

const DashboardInnerLayout = ({ children }: DashboardInnerLayoutProps) => {
    return (
        // <main className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto p-4 md:p-6">
        //     {children}
        // </main>

        <main className="flex-1 overflow-auto">
            <div className="mx-auto flex h-full w-full flex-col space-y-6 p-2 md:p-4">
                {children}
            </div>
        </main>
    );
};

export default DashboardInnerLayout;
