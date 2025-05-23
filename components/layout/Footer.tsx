'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { footerData as defaultFooterData } from '../../data/layout';
import { ActionButton } from '@/components/ui';

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
    <a
      href={href}
      className="hover:text-white hover:underline transition-colors cursor-pointer"
      onClick={handleLinkClick}
    >
      {children}
    </a>
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

          // Clear the stored section
          sessionStorage.removeItem('scrollToSection');
        } else {
          console.log(`Could not find element with ID: ${sectionId}`);
        }
      }, 500); // Half-second delay to ensure the page is loaded
    }
  }, [pathname]);

  return (
    <footer className="bg-dark-blue-lighter border-t border-border-color py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">{companyName}</h3>
            <p className="text-text-secondary text-sm">
              {companyDescription}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Pachete</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              {services.map((service, index) => (
                <li key={index}>
                  {service.href.startsWith('/#') ? (
                    <InteractiveLink href={service.href}>
                      {service.name}
                    </InteractiveLink>
                  ) : (
                    <Link href={service.href} className="hover:text-white hover:underline transition-colors">
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
                <li key={index}>
                  {link.href.startsWith('/#') ? (
                    <InteractiveLink href={link.href}>
                      {link.name}
                    </InteractiveLink>
                  ) : (
                    <Link href={link.href} className="hover:text-white hover:underline transition-colors">
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              {contactInfo.email && (
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{contactInfo.email}</span>
                </li>
              )}
              {contactInfo.phone && (
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{contactInfo.phone}</span>
                </li>
              )}
              <li className="mt-4">
                <ActionButton
                  href="/contact"
                  className="text-sm px-4 py-2 rounded-md"
                  showArrow={false}
                >
                  Contactează-ne
                </ActionButton>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border-color text-center text-sm text-text-secondary">
          <p>&copy; {new Date().getFullYear()} {companyName}. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
}
