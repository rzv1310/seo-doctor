'use client';

import { ReactNode } from 'react';
import { PageHeader } from '@/components/ui';



interface DashboardPageLayoutProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    fullHeight?: boolean; // For pages like Chat that need special handling
}

export default function DashboardPageLayout({
    title,
    subtitle,
    children,
    fullHeight = false
}: DashboardPageLayoutProps) {
    if (fullHeight) {
        // For pages that need full height control (like Chat)
        return (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="shrink-0">
                    <PageHeader title={title} subtitle={subtitle} />
                </div>
                {children}
            </div>
        );
    }

    // Standard scrollable layout
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="shrink-0">
                <PageHeader title={title} subtitle={subtitle} />
            </div>
            <div className="flex-1 overflow-y-auto pb-6">
                {children}
            </div>
        </div>
    );
}
