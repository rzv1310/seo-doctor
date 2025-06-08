'use client';

import { ReactNode, useState, useEffect } from 'react';
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
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Render a consistent structure during SSR and initial client render
    if (!isClient) {
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

    // Client-side rendering with proper layout handling
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="shrink-0">
                <PageHeader title={title} subtitle={subtitle} />
            </div>
            {fullHeight ? (
                children
            ) : (
                <div className="flex-1 overflow-y-auto pb-6">
                    {children}
                </div>
            )}
        </div>
    );
}
