import {
    Header,
    Hero,
    Services,
    Pricing,
    Testimonials,
    CTA,
    Footer
} from './components';

interface LandingPageProps {
    isAuthenticated?: boolean;
}

export default function LandingPage({ isAuthenticated = false }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-dark-blue flex flex-col">
            <Header isAuthenticated={isAuthenticated} />
            <Hero isAuthenticated={isAuthenticated} />
            <Services isAuthenticated={isAuthenticated} />
            <Pricing isAuthenticated={isAuthenticated} />
            <Testimonials />
            <CTA isAuthenticated={isAuthenticated} />
            <Footer />
        </div>
    );
}
