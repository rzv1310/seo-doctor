import { ctaData } from '../data';
import { Button } from '@/components/ui/Button';

interface CTAProps {
    isAuthenticated?: boolean;
}

export default function CTA({ isAuthenticated = false }: CTAProps) {
    return (
        <section className="py-10 sm:py-16 md:py-20 relative overflow-hidden">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark-blue via-dark-blue-lighter to-dark-blue opacity-50"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_50%)] opacity-10"></div>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-6">{ctaData.title}</h2>
                <p className="text-text-secondary mb-5 sm:mb-8 text-base sm:text-lg md:text-xl">
                    {ctaData.subtitle}
                </p>
                <Button
                    href={isAuthenticated ? ctaData.urlAuth : ctaData.url}
                    size="lg"
                    className="w-full sm:w-auto max-w-xs mx-auto"
                >
                    {isAuthenticated ? ctaData.buttonTextAuth : ctaData.buttonText}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Button>
            </div>
        </section>
    );
}
