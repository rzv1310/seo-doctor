import { Header, Footer } from '@/components/layout';
import { getServerSession } from '@/lib/auth';
import { pageMetadata } from '@/data/metadata';

export const metadata = pageMetadata.services;

export default async function ServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get auth status server-side
  const session = await getServerSession();

  return (
    <div className="min-h-screen bg-dark-blue flex flex-col">
      <Header isSimplified={true} isAuthenticated={session.isAuthenticated} />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}