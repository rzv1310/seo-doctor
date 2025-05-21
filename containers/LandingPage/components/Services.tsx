import Link from 'next/link';
import { services } from '@/data/services';

interface ServicesProps {
    isAuthenticated?: boolean;
}

export default function Services({ isAuthenticated = false }: ServicesProps) {
    return (
        <section id="services" className="py-10 sm:py-16 md:py-20 bg-dark-blue-lighter relative overflow-hidden">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-dark-blue/40 to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--primary-dark)_0%,_transparent_70%)] opacity-5"></div>
            <div className="container mx-auto px-4 relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-8">Serviciile Noastre</h2>
                <p className="text-text-secondary text-sm sm:text-base text-center max-w-3xl mx-auto mb-8 sm:mb-16">
                    Soluții complete de optimizare pentru vizibilitatea afacerii tale în mediul online
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 max-w-5xl mx-auto">
                    {services.map((service) => (
                        <div key={service.id} className="dashboard-card overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-border-color">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-2xl font-semibold">{service.name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-sm ${service.tagClass} relative`}>
                                        {service.tag}
                                        <span className="absolute -inset-1 bg-green-500 opacity-20 blur-md rounded-full -z-10 animate-pulse"></span>
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <p className="text-lg mb-6">
                                    {service.description}
                                </p>

                                <ul className="space-y-3 mb-6">
                                    {service.features.map((feature, index) => (
                                        <li key={index} className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <p className="text-text-secondary mb-6">
                                    {service.details}
                                </p>

                                <Link
                                    href={service.url || "#"}
                                    className="mt-auto block text-center bg-gradient-to-r from-primary to-primary-dark text-white font-medium py-3 px-6 rounded-md transition-all w-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 relative group overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2 mx-auto w-fit">
                                        {isAuthenticated ? service.buttonText : service.buttonTextUnauth}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                    <span className="absolute inset-0 bg-gradient-to-r from-accent/40 to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
