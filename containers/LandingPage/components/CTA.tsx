import { ctaData } from '../data';
import { ActionButton } from '@/components/ui';

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
                <ActionButton
                    href={isAuthenticated ? ctaData.urlAuth : ctaData.url}
                    className="text-base sm:text-lg font-medium px-6 sm:px-10 py-3.5 sm:py-3.5 w-full sm:w-auto max-w-xs mx-auto"
                >
                    {isAuthenticated ? ctaData.buttonTextAuth : ctaData.buttonText}
                </ActionButton>
            </div>
        </section>
    );
}
