import { Header, Footer } from '@/components/layout';
import { getServerSession } from '@/lib/auth';
import { ActionButton } from '@/components/ui';



export default async function NotFound() {
    const session = await getServerSession();

    return (
        <div className="min-h-screen bg-dark-blue flex flex-col">
            <Header isSimplified={true} isAuthenticated={session.isAuthenticated} />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-white mb-6">Pagina nu a fost găsită</h2>
                    <p className="text-text-primary mb-8 max-w-md mx-auto">
                        Ne pare rău, dar pagina pe care o căutați nu există sau a fost mutată.
                    </p>
                    <ActionButton href="/" size="md" fullRounded={false}>
                        Înapoi la pagina principală
                    </ActionButton>
                </div>
            </main>
            <Footer />
        </div>
    );
}