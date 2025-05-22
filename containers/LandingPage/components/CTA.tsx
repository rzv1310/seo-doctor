import Link from 'next/link';
import { ctaData } from '../data';

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
                <Link
                    href={isAuthenticated ? ctaData.urlAuth : ctaData.url}
                    className="bg-gradient-to-r from-primary to-primary-dark text-white text-base sm:text-lg font-medium rounded-full px-6 sm:px-10 py-3.5 sm:py-3.5 transition-all inline-block shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 relative group overflow-hidden w-full sm:w-auto max-w-xs mx-auto"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {isAuthenticated ? ctaData.buttonTextAuth : ctaData.buttonText}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-accent/40 to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>
            </div>
        </section>
    );
}
