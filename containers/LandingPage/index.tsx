import {
    Hero,
    Services,
    Testimonials,
    CTA
} from './components';
import { Header, Footer } from '@/components/layout';
import { navLinks } from '@/data/layout';



interface LandingPageProps {
    isAuthenticated?: boolean;
}

export default function LandingPage({ isAuthenticated = false }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-dark-blue flex flex-col">
            <Header isAuthenticated={isAuthenticated} navLinks={navLinks} />
            <Hero isAuthenticated={isAuthenticated} />
            <Services isAuthenticated={isAuthenticated} />
            <Testimonials />
            <CTA isAuthenticated={isAuthenticated} />
            <Footer />
        </div>
    );
}
