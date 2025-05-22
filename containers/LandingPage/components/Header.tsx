'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { navLinks } from '../data';
import { LinkButton, ActionButton } from '@/components/ui';

interface HeaderProps {
    isAuthenticated?: boolean;
}

export default function Header({ isAuthenticated = false }: HeaderProps) {
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

    // Add smooth scrolling with offset handling
    useEffect(() => {
        // Get all anchor links in the header and mobile menu
        const anchorLinks = document.querySelectorAll('nav a[href^="#"], .mobile-menu a[href^="#"]');

        // Add click event handler to each anchor link
        anchorLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();

                const href = anchor.getAttribute('href');
                if (!href) return;

                const targetId = href.slice(1);
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
        <header className="py-4 sm:py-6 border-b border-border-color backdrop-blur-sm bg-dark-blue bg-opacity-90 sticky top-0 z-50 overflow-visible">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-dark-blue via-dark-blue-lighter to-dark-blue opacity-40"></div>
            <div className="absolute top-0 right-0 w-1/3 h-24 bg-primary opacity-5 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-1/4 h-12 bg-accent opacity-10 blur-2xl rounded-full"></div>

            <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center relative z-10">
                <div />

                {/* Desktop Navigation - Hidden on mobile */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <LinkButton
                            key={link.id}
                            href={link.href}
                        >
                            {link.name}
                        </LinkButton>
                    ))}
                    {isAuthenticated ? (
                        <ActionButton
                            href="/dashboard"
                        >
                            Profil
                        </ActionButton>
                    ) : (
                        <ActionButton
                            href="/login"
                            animate
                        >
                            Autentificare
                        </ActionButton>
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
                        {navLinks.map(link => (
                            <LinkButton
                                key={link.id}
                                href={link.href}
                                className="text-text-primary py-3 px-4 hover:bg-glass-bg hover:backdrop-blur-md hover:bg-opacity-60 rounded-md flex items-center justify-between border border-transparent hover:border-glass-border"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span>{link.name}</span>
                            </LinkButton>
                        ))}
                        <div className="pt-3 mt-3 w-full">
                            {isAuthenticated ? (
                                <ActionButton
                                    href="/dashboard"
                                    className="w-full py-3.5 px-4 justify-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Accesează Profil
                                </ActionButton>
                            ) : (
                                <ActionButton
                                    href="/login"
                                    className="w-full py-3.5 px-4 justify-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Autentificare
                                </ActionButton>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}