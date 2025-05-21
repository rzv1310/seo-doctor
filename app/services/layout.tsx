import { Header, Footer } from '@/components/layout';
import { getServerAuthStatus } from '@/utils/getServerAuthStatus';

export default async function ServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get auth status server-side
  const { isAuthenticated } = await getServerAuthStatus();

  return (
    <div className="min-h-screen bg-dark-blue flex flex-col">
      <Header isSimplified={true} isAuthenticated={isAuthenticated} />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}