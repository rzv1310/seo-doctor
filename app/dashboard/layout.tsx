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
        <Suspense fallback={
            <div className="min-h-screen bg-dark-blue flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        }>
            <DashboardContent>
                {children}
            </DashboardContent>
        </Suspense>
    );
}
