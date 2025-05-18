import { footerData } from '../data';

export default function Footer() {
    return (
        <footer className="border-t border-border-color py-8 sm:py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
                    <div className="mb-6 sm:mb-0">
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{footerData.companyName}</h3>
                        <p className="text-text-secondary text-sm sm:text-base">
                            {footerData.companyDescription}
                        </p>
                    </div>

                    {footerData.sections.map((section, index) => (
                        <div key={index} className="mb-6 sm:mb-0">
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{section.title}</h3>
                            <ul className="space-y-2">
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <a href={link.href} className="text-text-secondary hover:text-primary transition-colors text-sm sm:text-base">
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-6 sm:pt-8 border-t border-border-color flex flex-col md:flex-row justify-between items-center">
                    <div className="text-text-secondary text-sm mb-4 md:mb-0">
                        © {new Date().getFullYear()} {footerData.companyName}. Toate drepturile rezervate.
                    </div>
                    <div className="flex gap-4 sm:gap-6">
                        {footerData.socialLinks.map((link, index) => (
                            <a key={index} href={link.url} target="_blank" className="text-text-secondary hover:text-primary transition-colors">
                                {link.icon === 'linkedin' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                )}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
