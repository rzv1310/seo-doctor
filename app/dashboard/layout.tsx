import { pageMetadata } from '@/data/metadata';
import { Suspense } from 'react';
import { getServerSession } from '../../lib/auth';
import { redirect } from 'next/navigation';
import DashboardContent from './DashboardContent';

export const metadata = pageMetadata.dashboard;

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();

    if (!session.isAuthenticated) {
        redirect('/login');
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardContent>
                {children}
            </DashboardContent>
        </Suspense>
    );
}