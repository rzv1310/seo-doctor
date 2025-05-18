import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
    // Mobile menu state
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Handle mobile menu toggle
    const toggleMobileMenu = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent event bubbling
        setMobileMenuOpen(prevState => !prevState);
        console.log("Menu toggle clicked, new state:", !mobileMenuOpen); // Debug
    };

    // We're using the backdrop for handling outside clicks now
    // The backdrop has its own click handler to close the menu

    // Handle body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    // Add smooth scrolling with offset handling
    useEffect(() => {
        // Get all anchor links in the header and mobile menu
        const anchorLinks = document.querySelectorAll('nav a[href^="#"], .mobile-menu a[href^="#"]');

        // Add click event handler to each anchor link
        anchorLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();

                const targetId = this.getAttribute('href')?.substring(1);
                if (!targetId) return;

                const targetElement = document.getElementById(targetId);
                if (!targetElement) return;

                // Calculate position with offset (header height + extra padding)
                const offset = 90; // Adjust based on header height
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            });
        });
    }, []);

    return (
        <div className="min-h-screen bg-dark-blue flex flex-col">
            {/* Header */}
            <header className="py-4 sm:py-6 border-b border-border-color relative backdrop-blur-sm bg-dark-blue bg-opacity-90 sticky top-0 z-50 overflow-visible">
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-r from-dark-blue via-dark-blue-lighter to-dark-blue opacity-40"></div>
                <div className="absolute top-0 right-0 w-1/3 h-24 bg-primary opacity-5 blur-3xl rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-1/4 h-12 bg-accent opacity-10 blur-2xl rounded-full"></div>

                <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center relative z-10">
                    <div className="flex items-center">
                        <h1 className="text-xl sm:text-2xl font-bold relative">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                                SEO Doctor
                            </span>
                            <span className="absolute -inset-1 bg-primary opacity-20 blur-xl rounded-full -z-10"></span>
                        </h1>
                    </div>

                    {/* Desktop Navigation - Hidden on mobile */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-text-secondary hover:text-primary transition-all">Servicii</a>
                        <a href="#pricing" className="text-text-secondary hover:text-primary transition-all">Prețuri</a>
                        <a href="#testimonials" className="text-text-secondary hover:text-primary transition-all">Testimoniale</a>
                        {isAuthenticated ? (
                            <Link
                                href="/dashboard"
                                className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-full px-6 py-2.5 transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2"
                            >
                                <span>Profil</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-full px-6 py-2.5 transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2 border-2 border-primary/30 relative group overflow-hidden animate-pulse hover:animate-none"
                            >
                                <span>Autentificare</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        )}
                    </nav>

                    {/* Mobile Menu Button - Visible only on mobile */}
                    <div className="md:hidden flex items-center">
                        <button
                            className="flex items-center justify-center w-12 h-12 text-text-primary hover:text-primary transition-colors mobile-menu-button z-50 p-2"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                            type="button"
                        >
                            {mobileMenuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu backdrop overlay */}
                <div
                    className={`absolute inset-0 bg-black/50 md:hidden z-30 h-screen transition-opacity duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    onClick={toggleMobileMenu}
                    aria-hidden="true"
                />

                {/* Mobile Menu - Absolute overlay */}
                <div
                    className={`mobile-menu absolute top-full left-0 w-full max-h-[80vh] overflow-y-auto bg-dark-blue-lighter border-b border-border-color backdrop-filter backdrop-blur-xl bg-opacity-80 md:hidden z-40 ${mobileMenuOpen ? 'visible' : ''}`}
                >
                    <div className="container mx-auto px-6 py-6">
                        <nav className="flex flex-col space-y-4">
                            <a
                                href="#features"
                                className="text-text-primary hover:text-primary transition-all py-3 px-4 hover:bg-glass-bg hover:backdrop-blur-md hover:bg-opacity-60 rounded-md flex items-center justify-between border border-transparent hover:border-glass-border"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span>Servicii</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                            <a
                                href="#pricing"
                                className="text-text-primary hover:text-primary transition-all py-3 px-4 hover:bg-glass-bg hover:backdrop-blur-md hover:bg-opacity-60 rounded-md flex items-center justify-between border border-transparent hover:border-glass-border"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span>Prețuri</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                            <a
                                href="#testimonials"
                                className="text-text-primary hover:text-primary transition-all py-3 px-4 hover:bg-glass-bg hover:backdrop-blur-md hover:bg-opacity-60 rounded-md flex items-center justify-between border border-transparent hover:border-glass-border"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span>Testimoniale</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                            <div className="pt-3 mt-3 border-border-color w-full">
                                {isAuthenticated ? (
                                    <Link
                                        href="/dashboard"
                                        className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-md w-full py-3.5 px-4 transition-all flex items-center justify-center gap-2 shadow-lg backdrop-blur-md relative overflow-hidden border border-primary/30"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span className="font-medium relative z-10">
                                            Accesează Profil
                                            <span className="absolute inset-0 bg-primary opacity-20 blur-md rounded-full -z-10"></span>
                                        </span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-md w-full py-3.5 px-4 transition-all flex items-center justify-center gap-2 shadow-lg backdrop-blur-md relative overflow-hidden border border-primary/30"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span className="font-medium relative z-10">
                                            Autentificare
                                            <span className="absolute inset-0 bg-primary opacity-20 blur-md rounded-full -z-10"></span>
                                        </span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero section */}
            <section className="py-16 sm:py-24 md:py-32 min-h-[80vh] flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
                {/* Wave/Flow Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-dark-blue via-dark-blue-lighter to-dark-blue opacity-80"></div>

                {/* Animated wave/flow effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--primary-dark)_0%,_transparent_60%)] opacity-20 animate-pulse"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--accent)_0%,_transparent_70%)] opacity-15 animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>

                {/* Wave patterns overlays */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3ClinearGradient id=\'a\' gradientUnits=\'userSpaceOnUse\' x1=\'0\' x2=\'0\' y1=\'0\' y2=\'100%25\' gradientTransform=\'rotate(240)\'%3E%3Cstop offset=\'0\' stop-color=\'%23003F7C\'/%3E%3Cstop offset=\'1\' stop-color=\'%23007F9E\'/%3E%3C/linearGradient%3E%3Cpattern patternUnits=\'userSpaceOnUse\' id=\'b\' width=\'540\' height=\'450\' x=\'0\' y=\'0\' viewBox=\'0 0 1080 900\'%3E%3Cg fill-opacity=\'0.1\'%3E%3Cpolygon fill=\'%23444\' points=\'90 150 0 300 180 300\'/%3E%3Cpolygon points=\'90 150 180 0 0 0\'/%3E%3Cpolygon fill=\'%23AAA\' points=\'270 150 360 0 180 0\'/%3E%3Cpolygon fill=\'%23DDD\' points=\'450 150 360 300 540 300\'/%3E%3Cpolygon fill=\'%23999\' points=\'450 150 540 0 360 0\'/%3E%3Cpolygon points=\'630 150 540 300 720 300\'/%3E%3Cpolygon fill=\'%23DDD\' points=\'630 150 720 0 540 0\'/%3E%3Cpolygon fill=\'%23444\' points=\'810 150 720 300 900 300\'/%3E%3Cpolygon fill=\'%23FFF\' points=\'810 150 900 0 720 0\'/%3E%3Cpolygon fill=\'%23DDD\' points=\'990 150 900 300 1080 300\'/%3E%3Cpolygon fill=\'%23444\' points=\'990 150 1080 0 900 0\'/%3E%3Cpolygon fill=\'%23DDD\' points=\'90 450 0 600 180 600\'/%3E%3Cpolygon points=\'90 450 180 300 0 300\'/%3E%3Cpolygon fill=\'%23666\' points=\'270 450 180 600 360 600\'/%3E%3Cpolygon fill=\'%23AAA\' points=\'270 450 360 300 180 300\'/%3E%3Cpolygon fill=\'%23DDD\' points=\'450 450 360 600 540 600\'/%3E%3Cpolygon fill=\'%23999\' points=\'450 450 540 300 360 300\'/%3E%3Cpolygon fill=\'%23999\' points=\'630 450 540 600 720 600\'/%3E%3Cpolygon fill=\'%23FFF\' points=\'630 450 720 300 540 300\'/%3E%3Cpolygon points=\'810 450 720 600 900 600\'/%3E%3Cpolygon fill=\'%23DDD\' points=\'810 450 900 300 720 300\'/%3E%3Cpolygon fill=\'%23AAA\' points=\'990 450 900 600 1080 600\'/%3E%3Cpolygon fill=\'%23444\' points=\'990 450 1080 300 900 300\'/%3E%3Cpolygon fill=\'%23222\' points=\'90 750 0 900 180 900\'/%3E%3Cpolygon points=\'270 750 180 900 360 900\'/%3E%3Cpolygon fill=\'%23DDD\' points=\'270 750 360 600 180 600\'/%3E%3Cpolygon points=\'450 750 540 600 360 600\'/%3E%3Cpolygon points=\'630 750 540 900 720 900\'/%3E%3Cpolygon fill=\'%23444\' points=\'630 750 720 600 540 600\'/%3E%3Cpolygon fill=\'%23AAA\' points=\'810 750 720 900 900 900\'/%3E%3Cpolygon fill=\'%23666\' points=\'810 750 900 600 720 600\'/%3E%3Cpolygon fill=\'%23999\' points=\'990 750 900 900 1080 900\'/%3E%3Cpolygon fill=\'%23999\' points=\'180 0 90 150 270 150\'/%3E%3Cpolygon fill=\'%23444\' points=\'360 0 270 150 450 150\'/%3E%3Cpolygon fill=\'%23FFF\' points=\'540 0 450 150 630 150\'/%3E%3Cpolygon points=\'900 0 810 150 990 150\'/%3E%3Cpolygon fill=\'%23222\' points=\'0 300 -90 450 90 450\'/%3E%3Cpolygon fill=\'%23FFF\' points=\'0 300 90 150 -90 150\'/%3E%3Cpolygon fill=\'%23FFF\' points=\'180 300 90 450 270 450\'/%3E%3Cpolygon fill=\'%23666\' points=\'180 300 270 150 90 150\'/%3E%3Cpolygon fill=\'%23222\' points=\'360 300 270 450 450 450\'/%3E%3Cpolygon fill=\'%23FFF\' points=\'360 300 450 150 270 150\'/%3E%3Cpolygon fill=\'%23444\' points=\'540 300 450 450 630 450\'/%3E%3Cpolygon fill=\'%23222\' points=\'540 300 630 150 450 150\'/%3E%3Cpolygon fill=\'%23AAA\' points=\'720 300 630 450 810 450\'/%3E%3Cpolygon fill=\'%23666\' points=\'720 300 810 150 630 150\'/%3E%3Cpolygon fill=\'%23FFF\' points=\'900 300 810 450 990 450\'/%3E%3Cpolygon fill=\'%23999\' points=\'900 300 990 150 810 150\'/%3E%3Cpolygon points=\'0 600 -90 750 90 750\'/%3E%3Cpolygon fill=\'%23666\' points=\'0 600 90 450 -90 450\'/%3E%3Cpolygon fill=\'%23AAA\' points=\'180 600 90 750 270 750\'/%3E%3Cpolygon fill=\'%23444\' points=\'180 600 270 450 90 450\'/%3E%3Cpolygon fill=\'%23444\' points=\'360 600 270 750 450 750\'/%3E%3Cpolygon fill=\'%23999\' points=\'360 600 450 450 270 450\'/%3E%3Cpolygon fill=\'%23666\' points=\'540 600 630 450 450 450\'/%3E%3Cpolygon fill=\'%23222\' points=\'720 600 630 750 810 750\'/%3E%3Cpolygon fill=\'%23FFF\' points=\'900 600 810 750 990 750\'/%3E%3Cpolygon fill=\'%23222\' points=\'900 600 990 450 810 450\'/%3E%3Cpolygon fill=\'%23DDD\' points=\'0 900 90 750 -90 750\'/%3E%3Cpolygon fill=\'%23444\' points=\'180 900 270 750 90 750\'/%3E%3Cpolygon fill=\'%23FFF\' points=\'360 900 450 750 270 750\'/%3E%3Cpolygon fill=\'%23AAA\' points=\'540 900 630 750 450 750\'/%3E%3Cpolygon fill=\'%23FFF\' points=\'720 900 810 750 630 750\'/%3E%3Cpolygon fill=\'%23222\' points=\'900 900 990 750 810 750\'/%3E%3Cpolygon fill=\'%23222\' points=\'1080 300 990 450 1170 450\'/%3E%3Cpolygon fill=\'%23FFF\' points=\'1080 300 1170 150 990 150\'/%3E%3Cpolygon points=\'1080 600 990 750 1170 750\'/%3E%3Cpolygon fill=\'%23666\' points=\'1080 600 1170 450 990 450\'/%3E%3Cpolygon fill=\'%23DDD\' points=\'1080 900 1170 750 990 750\'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect x=\'0\' y=\'0\' fill=\'url(%23a)\' width=\'100%25\' height=\'100%25\'/%3E%3Crect x=\'0\' y=\'0\' fill=\'url(%23b)\' width=\'100%25\' height=\'100%25\'/%3E%3C/svg%3E")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: 'translateZ(0)',
                }}></div>


                {/* Content with increased z-index */}
                <div className="relative z-10">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6 relative text-white">
                        <span className="text-primary drop-shadow-lg">SEO Doctor</span>
                        <span className="absolute -inset-1 bg-primary/20 blur-2xl rounded-full -z-10"></span>
                    </h1>
                    <p className="text-text-secondary text-base sm:text-lg md:text-xl max-w-2xl mb-8 sm:mb-12 drop-shadow">
                        Soluții profesionale de optimizare pentru Google, care aduc clienți reali afacerii tale.
                        Atingeți obiectivele de business prin vizibilitate crescută și trafic de calitate.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto">
                        <Link
                            href={isAuthenticated ? "/dashboard" : "/login"}
                            className="bg-gradient-to-r from-primary to-primary-dark text-white text-lg font-medium rounded-full px-10 py-3.5 transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 relative group overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isAuthenticated ? "Accesează Profil" : "Începe Acum"}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                            <span className="absolute inset-0 bg-gradient-to-r from-accent/40 to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity"></span>
                        </Link>
                        <a
                            href="#features"
                            className="border border-border-color text-white hover:bg-dark-blue-lighter text-lg font-medium rounded-full px-8 py-3 transition-all shadow-lg shadow-dark-blue-lighter/20 hover:shadow-xl hover:shadow-dark-blue-lighter/30 js-scroll-trigger"
                            onClick={(e) => {
                                e.preventDefault();
                                const targetElement = document.getElementById('features');
                                if (targetElement) {
                                    const offset = 90; // Same offset as in the header links
                                    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - offset;
                                    window.scrollTo({
                                        top: targetPosition,
                                        behavior: 'smooth'
                                    });
                                }
                            }}
                        >
                            Vezi Serviciile
                        </a>
                    </div>
                </div>
            </section>

            {/* Services section */}
            <section id="features" className="py-10 sm:py-16 md:py-20 bg-dark-blue-lighter relative overflow-hidden">

                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-dark-blue/40 to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--primary-dark)_0%,_transparent_70%)] opacity-5"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-8">Serviciile Noastre</h2>
                    <p className="text-text-secondary text-sm sm:text-base text-center max-w-3xl mx-auto mb-8 sm:mb-16">
                        Soluții complete de optimizare pentru vizibilitatea afacerii tale în mediul online
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 max-w-5xl mx-auto">
                        {/* GBP MAX Service */}
                        <div className="dashboard-card overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-border-color">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-2xl font-semibold">GBP MAX</h3>
                                    <span className="px-3 py-1 rounded-full text-sm bg-green-900/30 text-green-300 relative">
                                        Recomandat
                                        <span className="absolute -inset-1 bg-green-500 opacity-20 blur-md rounded-full -z-10 animate-pulse"></span>
                                    </span>
                                </div>
                                <div className="mt-4 mb-2 text-3xl font-bold text-primary">$99.99<span className="text-sm text-text-secondary">/lună</span></div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <p className="text-lg mb-6">
                                    Serviciu complet de optimizare a profilului de afaceri Google pentru maximizarea vizibilității locale
                                </p>

                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Optimizare Google Business Profile</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Gestionarea și răspunsuri la recenzii</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Actualizări informații de afaceri</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Optimizare fotografii și postări</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Rapoarte lunare de performanță</span>
                                    </li>
                                </ul>

                                <p className="text-text-secondary mb-6">
                                    Profilul Google Business este esențial pentru afacerile locale. Cu GBP MAX, transformăm profilul tău într-un magnet pentru clienți locali, crescând vizibilitatea, încrederea și numărul de apeluri/vizite la locație.
                                </p>

                                <Link
                                    href={isAuthenticated ? "/dashboard/services/1" : "/login"}
                                    className="mt-auto block text-center bg-gradient-to-r from-primary to-primary-dark text-white font-medium py-3 px-6 rounded-md transition-all w-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 relative group overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2 mx-auto w-fit">
                                        {isAuthenticated ? "Accesează Serviciul" : "Începe Acum"}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                    <span className="absolute inset-0 bg-gradient-to-r from-accent/40 to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                </Link>
                            </div>
                        </div>

                        {/* Google Organic Service */}
                        <div className="dashboard-card overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-border-color">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-2xl font-semibold">Google Organic</h3>
                                    <span className="px-3 py-1 rounded-full text-sm bg-blue-900/30 text-blue-300 relative">
                                        Premium
                                        <span className="absolute -inset-1 bg-blue-500 opacity-20 blur-md rounded-full -z-10 animate-pulse"></span>
                                    </span>
                                </div>
                                <div className="mt-4 mb-2 text-3xl font-bold text-primary">$149.99<span className="text-sm text-text-secondary">/lună</span></div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <p className="text-lg mb-6">
                                    Serviciu complet de optimizare SEO pentru căutări organice în motorul de căutare Google
                                </p>

                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Cercetare cuvinte cheie relevante</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Optimizare on-page și conținut</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Analiză și strategie de link building</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>SEO tehnic și optimizare site</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Rapoarte detaliate lunare</span>
                                    </li>
                                </ul>

                                <p className="text-text-secondary mb-6">
                                    Optimizarea pentru căutările organice aduce trafic de calitate pe termen lung. Serviciul nostru se concentrează pe creșterea vizibilității în Google, îmbunătățind clasamentele pentru cuvintele cheie relevante și generând conversii.
                                </p>

                                <Link
                                    href={isAuthenticated ? "/dashboard/services/2" : "/login"}
                                    className="mt-auto block text-center bg-gradient-to-r from-primary to-primary-dark text-white font-medium py-3 px-6 rounded-md transition-all w-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 relative group overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2 mx-auto w-fit">
                                        {isAuthenticated ? "Accesează Serviciul" : "Începe Acum"}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                    <span className="absolute inset-0 bg-gradient-to-r from-accent/40 to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing section */}
            <section id="pricing" className="py-10 sm:py-16 md:py-20 relative overflow-hidden">

                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-bl from-accent/5 to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--primary)_0%,_transparent_60%)] opacity-5"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Pachete și Prețuri</h2>
                    <p className="text-text-secondary text-sm sm:text-base text-center max-w-2xl mx-auto mb-8 sm:mb-16">
                        Alegeți pachetul potrivit afacerii dumneavoastră, fără taxe ascunse sau surprize.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="dashboard-card p-6 border border-border-color hover:border-primary transition-all duration-300">
                            <h3 className="text-xl font-semibold mb-2">GBP Basic</h3>
                            <div className="text-3xl font-bold mb-2">$49.99<span className="text-lg text-text-secondary">/lună</span></div>
                            <p className="text-text-secondary mb-6">Pentru afaceri mici cu prezență locală</p>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Optimizare profil Google Business
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Gestionare recenzii de bază
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Rapoarte lunare simple
                                </li>
                            </ul>

                            <Link
                                href={isAuthenticated ? "/dashboard/services/1" : "/login"}
                                className="block text-center bg-dark-blue-lighter hover:bg-gradient-to-r hover:from-primary hover:to-primary-dark text-text-primary hover:text-white border border-border-color rounded-md py-2.5 transition-all w-full shadow-md hover:shadow-lg hover:shadow-primary/20 relative group overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-1.5 mx-auto w-fit">
                                    {isAuthenticated ? "Accesează Serviciul" : "Selectează Pachet"}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </Link>
                        </div>

                        <div className="dashboard-card p-6 border-2 border-primary relative transform scale-105">
                            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-md rounded-tr-md relative z-10 shadow-lg shadow-primary/30">
                                RECOMANDAT
                                <span className="absolute -inset-1 bg-primary opacity-30 blur-md rounded-bl-md rounded-tr-md -z-10 animate-pulse"></span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">GBP MAX</h3>
                            <div className="text-3xl font-bold mb-2">$99.99<span className="text-lg text-text-secondary">/lună</span></div>
                            <p className="text-text-secondary mb-6">Pentru afaceri care vor să domine căutările locale</p>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Optimizare completă profil
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Gestionare și răspunsuri la recenzii
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Postări săptămânale
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Rapoarte detaliate lunare
                                </li>
                            </ul>

                            <Link
                                href={isAuthenticated ? "/dashboard/services/1" : "/login"}
                                className="block text-center bg-gradient-to-r from-primary to-primary-dark text-white rounded-md py-2.5 transition-all w-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 relative group overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-1.5 mx-auto w-fit">
                                    {isAuthenticated ? "Accesează Serviciul" : "Selectează Pachet"}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                                <span className="absolute inset-0 bg-gradient-to-r from-accent/40 to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            </Link>
                        </div>

                        <div className="dashboard-card p-6 border border-border-color hover:border-primary transition-all duration-300">
                            <h3 className="text-xl font-semibold mb-2">Google Organic</h3>
                            <div className="text-3xl font-bold mb-2">$149.99<span className="text-lg text-text-secondary">/lună</span></div>
                            <p className="text-text-secondary mb-6">Optimizare SEO completă pentru rezultate organice</p>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Cercetare cuvinte cheie
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Optimizare on-page și conținut
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Analiză link building
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Rapoarte analitice avansate
                                </li>
                            </ul>

                            <Link
                                href={isAuthenticated ? "/dashboard/services/2" : "/login"}
                                className="block text-center bg-dark-blue-lighter hover:bg-gradient-to-r hover:from-primary hover:to-primary-dark text-text-primary hover:text-white border border-border-color rounded-md py-2.5 transition-all w-full shadow-md hover:shadow-lg hover:shadow-primary/20 relative group overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-1.5 mx-auto w-fit">
                                    {isAuthenticated ? "Accesează Serviciul" : "Selectează Pachet"}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials section */}
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
                        <div className="dashboard-card p-6">
                            <div className="flex items-center mb-4">
                                <div className="flex text-primary relative">
                                    <span className="absolute -inset-1 bg-primary opacity-20 blur-md -z-10"></span>
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                            <blockquote className="mb-4 italic text-text-secondary">
                                "De când am început să lucrez cu echipa MiniDash pentru optimizarea profilului Google Business, numărul de apeluri și solicitări de oferte a crescut cu peste 70%. Sunt extrem de mulțumit de rezultate!"
                            </blockquote>
                            <div className="font-semibold">Mihai Popescu</div>
                            <div className="text-sm text-text-secondary">Proprietar, Studio Foto MP</div>
                        </div>

                        <div className="dashboard-card p-6">
                            <div className="flex items-center mb-4">
                                <div className="flex text-primary relative">
                                    <span className="absolute -inset-1 bg-primary opacity-20 blur-md -z-10"></span>
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                            <blockquote className="mb-4 italic text-text-secondary">
                                "Am investit în pachetul Google Organic și în doar 3 luni am ajuns pe prima pagină pentru majoritatea cuvintelor cheie importante pentru afacerea noastră. Traficul organic a crescut cu 125%!"
                            </blockquote>
                            <div className="font-semibold">Elena Ionescu</div>
                            <div className="text-sm text-text-secondary">Marketing Manager, Mobila Design SRL</div>
                        </div>

                        <div className="dashboard-card p-6">
                            <div className="flex items-center mb-4">
                                <div className="flex text-primary relative">
                                    <span className="absolute -inset-1 bg-primary opacity-20 blur-md -z-10"></span>
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                            <blockquote className="mb-4 italic text-text-secondary">
                                "Folosim pachetul GBP MAX de aproape un an și vizibilitatea locală a restaurantului nostru s-a îmbunătățit considerabil. Rapoartele lunare ne ajută să înțelegem performanța și să luăm decizii mai bune."
                            </blockquote>
                            <div className="font-semibold">Alexandru Marin</div>
                            <div className="text-sm text-text-secondary">Proprietar, Restaurant Gourmet</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to action */}
            <section className="py-10 sm:py-16 md:py-20 relative overflow-hidden">
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-dark-blue via-dark-blue-lighter to-dark-blue opacity-50"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_50%)] opacity-10"></div>
                <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-6">Gata să creșteți vizibilitatea online?</h2>
                    <p className="text-text-secondary mb-5 sm:mb-8 text-base sm:text-lg md:text-xl">
                        Alăturați-vă sutelor de afaceri care au ales serviciile noastre de optimizare pentru Google.
                    </p>
                    <Link
                        href={isAuthenticated ? "/dashboard" : "/login"}
                        className="bg-gradient-to-r from-primary to-primary-dark text-white text-base sm:text-lg font-medium rounded-full px-6 sm:px-10 py-3.5 sm:py-3.5 transition-all inline-block shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 relative group overflow-hidden w-full sm:w-auto max-w-xs mx-auto"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {isAuthenticated ? "Accesează Profil" : "Începe Acum"}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-accent/40 to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border-color py-8 sm:py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
                        <div className="mb-6 sm:mb-0">
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">SEO Doctor</h3>
                            <p className="text-text-secondary text-sm sm:text-base">
                                Soluții de optimizare Google pentru afaceri care vor să crească online.
                            </p>
                        </div>

                        <div className="mb-6 sm:mb-0">
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Servicii</h3>
                            <ul className="space-y-2">
                                <li><a href="#features" className="text-text-secondary hover:text-primary transition-colors text-sm sm:text-base">GBP MAX</a></li>
                                <li><a href="#features" className="text-text-secondary hover:text-primary transition-colors text-sm sm:text-base">Google Organic</a></li>
                                <li><a href="#pricing" className="text-text-secondary hover:text-primary transition-colors text-sm sm:text-base">Pachete și Prețuri</a></li>
                                <li><a href="#testimonials" className="text-text-secondary hover:text-primary transition-colors text-sm sm:text-base">Testimoniale</a></li>
                            </ul>
                        </div>

                        <div className="mb-6 sm:mb-0">
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Resurse</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-text-secondary hover:text-primary transition-colors text-sm sm:text-base">Suport</a></li>
                                <li><a href="#" className="text-text-secondary hover:text-primary transition-colors text-sm sm:text-base">Studii de Caz</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Companie</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-text-secondary hover:text-primary transition-colors text-sm sm:text-base">Despre Noi</a></li>
                                <li><a href="#" className="text-text-secondary hover:text-primary transition-colors text-sm sm:text-base">Contact</a></li>
                                <li><a href="#" className="text-text-secondary hover:text-primary transition-colors text-sm sm:text-base">Legal</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6 sm:pt-8 border-t border-border-color flex flex-col md:flex-row justify-between items-center">
                        <div className="text-text-secondary text-sm mb-4 md:mb-0">
                            © {new Date().getFullYear()} SEO Doctor. Toate drepturile rezervate.
                        </div>
                        <div className="flex gap-4 sm:gap-6">
                            <a href="https://www.linkedin.com/" target="_blank" className="text-text-secondary hover:text-primary transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}