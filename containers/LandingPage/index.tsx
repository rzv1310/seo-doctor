import {
    Services,
    Pricing,
    Testimonials,
    CTA
} from './components';
import { Header, Footer } from '../../components/layout';
import { navLinks, footerData } from '../../data/layout';

import {
    Hero,
} from '@/components/Hero';

interface LandingPageProps {
    isAuthenticated?: boolean;
}

export default function LandingPage({ isAuthenticated = false }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-dark-blue flex flex-col">
            <Header isAuthenticated={isAuthenticated} navLinks={navLinks} />
            <Hero />
            <Services isAuthenticated={isAuthenticated} />
            <Pricing isAuthenticated={isAuthenticated} />
            <Testimonials />
            <CTA isAuthenticated={isAuthenticated} />
            <Footer />
        </div>
    );
}
