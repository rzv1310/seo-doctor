import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { pageMetadata } from '@/data/metadata';
import { getServerSession } from '@/lib/auth';
import DashboardContent from './DashboardContent';
import { Spinner } from '@/components/ui';



export const metadata = pageMetadata.dashboard;
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check authentication server-side
    const session = await getServerSession();
    
    if (!session.isAuthenticated || !session.user) {
        redirect('/login');
    }

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
