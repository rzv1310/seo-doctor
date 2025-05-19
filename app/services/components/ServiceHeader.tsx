import Link from 'next/link';
import { useState, useEffect } from 'react';

// Import the navigation links data but not using the component directly
import { navLinks } from '@/containers/LandingPage/data';

interface HeaderProps {
    isAuthenticated?: boolean;
}

export default function ServiceHeader({ isAuthenticated = false }: HeaderProps) {
    // Mobile menu state
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Handle mobile menu toggle
    const toggleMobileMenu = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent event bubbling
        setMobileMenuOpen(prevState => !prevState);
    };

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

    // Modified links to point to the home page sections
    const modifiedNavLinks = navLinks.map(link => {
        // Update the 'features' link to be 'services' instead
        if (link.id === 1 && link.href === '#features') {
            return {
                ...link,
                href: '/#services' // Change #features to #services
            };
        }
        return {
            ...link,
            href: `/${link.href}` // Add slash before href to make it point to homepage
        };
    });

    return (
        <header className="py-4 sm:py-6 border-b border-border-color backdrop-blur-sm bg-dark-blue bg-opacity-90 sticky top-0 z-50 overflow-visible">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-dark-blue via-dark-blue-lighter to-dark-blue opacity-40"></div>
            <div className="absolute top-0 right-0 w-1/3 h-24 bg-primary opacity-5 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-1/4 h-12 bg-accent opacity-10 blur-2xl rounded-full"></div>

            <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center relative z-10">
                <Link href="/" className="font-bold text-lg text-white hover:text-primary transition-colors">
                    SEO Doctor
                </Link>

                {/* Desktop Navigation - Hidden on mobile */}
                <nav className="hidden md:flex items-center gap-8">
                    {modifiedNavLinks.map(link => (
                        <a
                            key={link.id}
                            href={link.href}
                            className="text-text-secondary font-bold hover:text-primary transition-all"
                            onClick={(e) => {
                                e.preventDefault();
                                window.location.href = link.href;
                            }}
                        >
                            {link.name}
                        </a>
                    ))}
                    {isAuthenticated ? (
                        <Link
                            href="/dashboard"
                            className="bg-gradient-to-r font-bold from-primary to-primary-dark text-white rounded-full px-6 py-2.5 transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2"
                            onClick={() => window.scrollTo(0, 0)}
                        >
                            <span>Profil</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-gradient-to-r font-bold from-primary to-primary-dark text-white rounded-full px-6 py-2.5 transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2 border-2 border-primary/30 relative group overflow-hidden animate-pulse hover:animate-none"
                            onClick={() => window.scrollTo(0, 0)}
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
                className={`mobile-menu absolute top-full left-0 w-full max-h-[80vh] overflow-y-auto bg-dark-blue-lighter backdrop-filter backdrop-blur-xl bg-opacity-80 md:hidden z-40 ${mobileMenuOpen ? 'visible' : ''}`}
            >
                <div className="container mx-auto px-6 py-6">
                    <nav className="flex flex-col space-y-4">
                        {modifiedNavLinks.map(link => (
                            <a
                                key={link.id}
                                href={link.href}
                                className="text-text-primary font-bold hover:text-primary transition-all py-3 px-4 hover:bg-glass-bg hover:backdrop-blur-md hover:bg-opacity-60 rounded-md flex items-center justify-between border border-transparent hover:border-glass-border"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setMobileMenuOpen(false);
                                    window.location.href = link.href;
                                }}
                            >
                                <span>{link.name}</span>
                            </a>
                        ))}
                        <div className="pt-3 mt-3 w-full">
                            {isAuthenticated ? (
                                <Link
                                    href="/dashboard"
                                    className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-full w-full py-3.5 px-4 transition-all flex items-center justify-center gap-2 shadow-lg backdrop-blur-md relative overflow-hidden border border-primary/30"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        window.scrollTo(0, 0);
                                    }}
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
                                    className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-full w-full py-3.5 px-4 transition-all flex items-center justify-center gap-2 shadow-lg backdrop-blur-md relative overflow-hidden border border-primary/30"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        window.scrollTo(0, 0);
                                    }}
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
    );
}