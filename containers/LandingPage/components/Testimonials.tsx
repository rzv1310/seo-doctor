import { testimonials } from '../data';

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-10 sm:py-16 md:py-20 bg-dark-blue-lighter relative overflow-hidden">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--accent)_0%,_transparent_70%)] opacity-5"></div>
            <div className="container mx-auto px-4 text-center relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ce Spun Clienții Noștri</h2>
                <p className="text-text-secondary text-sm sm:text-base text-center max-w-2xl mx-auto mb-8 sm:mb-16">
                    Rezultate reale de la afaceri care au ales serviciile noastre de optimizare
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="dashboard-card p-6">
                            <div className="flex items-center mb-4">
                                <div className="flex text-primary relative">
                                    <span className="absolute -inset-1 bg-primary opacity-20 blur-md -z-10"></span>
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                            <blockquote className="mb-4 italic text-text-secondary">
                                {testimonial.content}
                            </blockquote>
                            <div className="font-semibold">{testimonial.author}</div>
                            <div className="text-sm text-text-secondary">{testimonial.role}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
