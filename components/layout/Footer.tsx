'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { footerData as defaultFooterData } from '@/data/layout';
import { Link, PhoneLink } from '@/components/ui';



interface FooterProps {
    companyName?: string;
    companyDescription?: string;
    services?: Array<{ name: string; href: string }>;
    legalLinks?: Array<{ name: string; href: string }>;
    contactInfo?: {
        email?: string;
        phone?: string;
    };
}

// Interactive link that handles special links requiring redirection
function InteractiveLink({ href, children }: { href: string; children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLinkClick = (e: React.MouseEvent) => {
        // Check if this is a link to a home page section (starts with '/#')
        if (href.startsWith('/#') && pathname !== '/') {
            e.preventDefault();

            // Navigate to home page
            router.push('/');

            // Store the anchor in sessionStorage to use after navigation
            const anchor = href.substring(2); // Remove the '/#' part
            sessionStorage.setItem('scrollToSection', anchor);
        }
    };

    return (
        <Link
            href={href}
            variant="muted"
            onClick={handleLinkClick}
        >
            {children}
        </Link>
    );
}

export default function Footer({
    companyName = defaultFooterData.companyName,
    companyDescription = defaultFooterData.companyDescription,
    services = defaultFooterData.services,
    legalLinks = defaultFooterData.infoLinks,
    contactInfo = defaultFooterData.contactInfo
}: FooterProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Handle scroll to section on page load
    useEffect(() => {
        if (pathname === '/' && sessionStorage.getItem('scrollToSection')) {
            const sectionId = sessionStorage.getItem('scrollToSection');

            setTimeout(() => {
                const element = document.getElementById(sectionId || '');
                if (element) {
                    // Calculate position with offset (header height + extra padding)
                    const offset = 90; // Adjust based on header height
                    const targetPosition = element.getBoundingClientRect().top + window.scrollY - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    sessionStorage.removeItem('scrollToSection');
                }
            }, 500);
        }
    }, [pathname]);

    return (
        <footer className="bg-dark-blue-lighter border-t border-border-color py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
                    <div className="text-center flex flex-col md:block items-center md:text-left">
                        <Link href="/" variant="default">
                            <h3 className="text-lg font-semibold mb-4">
                                {companyName}
                            </h3>
                        </Link>
                        <p className="text-text-secondary text-sm">
                            {companyDescription}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Pachete</h3>
                        <ul className="space-y-2 text-sm text-text-secondary">
                            {services.map((service, index) => (
                                <li key={index} className="mx-2 md:mx-0">
                                    {service.href.startsWith('/#') ? (
                                        <InteractiveLink href={service.href}>
                                            {service.name}
                                        </InteractiveLink>
                                    ) : (
                                        <Link href={service.href} variant="muted">
                                            {service.name}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Utile</h3>
                        <ul className="space-y-2 text-sm text-text-secondary">
                            {legalLinks.map((link, index) => (
                                <li key={index} className="mx-2 md:mx-0">
                                    {link.href.startsWith('/#') ? (
                                        <InteractiveLink href={link.href}>
                                            {link.name}
                                        </InteractiveLink>
                                    ) : (
                                        <Link href={link.href} variant="muted">
                                            {link.name}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2 text-sm text-text-secondary -ml-6 sm:ml-0">
                            {/* {contactInfo.email && (
                                <li className="flex items-start gap-2 pl-6 sm:pl-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <Link href={`mailto:${contactInfo.email}`} variant="muted">
                                        {contactInfo.email}
                                    </Link>
                                </li>
                            )} */}
                            {contactInfo.phone && (
                                <li className="flex items-start gap-2 pl-6 sm:pl-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <PhoneLink variant="muted" />
                                </li>
                            )}
                            {/* <li className="mt-4 pl-6 sm:pl-0">
                                <ActionButton
                                    href="/contact"
                                    size="sm"
                                    showArrow={false}
                                    fullRounded={false}
                                >
                                    Contactează-ne
                                </ActionButton>
                            </li> */}
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-6 mb-8 border-t border-border-color text-center text-sm text-text-secondary">
                    <p>&copy; {new Date().getFullYear()} {companyName}. Toate drepturile rezervate.</p>
                </div>
            </div>
        </footer>
    );
}
