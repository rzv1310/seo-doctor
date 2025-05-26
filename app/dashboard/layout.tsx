import { Suspense } from 'react';
import { pageMetadata } from '@/data/metadata';
import DashboardContent from './DashboardContent';
import { Spinner } from '@/components/ui';



export const metadata = pageMetadata.dashboard;

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardContent>
            <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <Spinner size="lg" />
                </div>
            }>
                {children}
            </Suspense>
        </DashboardContent>
    );
}
