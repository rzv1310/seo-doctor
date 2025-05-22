import Link from 'next/link';
import { prices } from '@/data/services';
import { ActionButton } from '@/components/ui';

interface PricingProps {
    isAuthenticated?: boolean;
}

export default function Pricing({ isAuthenticated = false }: PricingProps) {
    return (
        <section id="pricing" className="py-10 sm:py-16 md:py-20 relative overflow-hidden">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-bl from-accent/5 to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--primary)_0%,_transparent_60%)] opacity-5"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Pachete și Prețuri</h2>
                <p className="text-text-secondary text-sm sm:text-base text-center max-w-2xl mx-auto mb-8 sm:mb-16">
                    Alegeți pachetul potrivit afacerii dumneavoastră, fără taxe ascunse sau surprize.
                </p>

                <div className={`grid grid-cols-1 gap-8 max-w-5xl mx-auto ${
                        prices.length === 1
                            ? 'sm:grid-cols-1 md:w-1/2 md:mx-auto'
                            : prices.length === 2
                                ? 'sm:grid-cols-2 lg:w-3/4 lg:mx-auto'
                                : 'sm:grid-cols-2 lg:grid-cols-3'
                    }`}>
                    {prices.map((price) => (
                        <div
                            key={price.id}
                            className={`dashboard-card p-6 ${price.highlighted
                                    ? 'border-2 border-primary relative transform scale-105'
                                    : 'border border-border-color hover:border-primary transition-all duration-300'
                                }`}
                        >
                            {price.highlighted && (
                                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-md rounded-tr-md z-10 shadow-lg shadow-primary/30">
                                    {price.tag}
                                    <span className="absolute -inset-1 bg-primary opacity-30 blur-md rounded-bl-md rounded-tr-md -z-10 animate-pulse"></span>
                                </div>
                            )}
                            <h3 className="text-xl font-semibold mb-2">{price.name}</h3>
                            <div className="text-3xl font-bold mb-2">{price.price}<span className="text-lg text-text-secondary">{price.period}</span></div>
                            <p className="text-text-secondary mb-6">{price.description}</p>

                            <ul className="space-y-3 mb-8">
                                {price.features.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <ActionButton
                                href={isAuthenticated ? price.url : price.unauthUrl}
                                className={`w-full rounded-md py-2.5 ${
                                    price.highlighted
                                        ? ''
                                        : 'bg-dark-blue-lighter hover:bg-gradient-to-r hover:from-primary hover:to-primary-dark text-text-primary hover:text-white border border-border-color shadow-md hover:shadow-lg hover:shadow-primary/20'
                                }`}
                            >
                                {isAuthenticated ? "Accesează Serviciul" : "Selectează Pachet"}
                            </ActionButton>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
