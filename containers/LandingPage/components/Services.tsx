import { services } from '@/data/services';
import { ActionButton } from '@/components/ui';

interface ServicesProps {
    isAuthenticated?: boolean;
}

export default function Services({ isAuthenticated = false }: ServicesProps) {
    return (
        <section id="services" className="py-10 sm:py-16 md:py-20 bg-dark-blue-lighter relative overflow-hidden">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-dark-blue/40 to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--primary-dark)_0%,_transparent_70%)] opacity-5"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

                                <ActionButton
                                    href={service.url || "#"}
                                    className="mt-auto w-full rounded-md py-3 px-6"
                                >
                                    {isAuthenticated ? service.buttonText : service.buttonTextUnauth}
                                </ActionButton>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
