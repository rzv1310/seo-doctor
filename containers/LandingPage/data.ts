// Testimonials data
export const testimonials = [
    {
        id: 1,
        content: '"De când am început să lucrez cu echipa MiniDash pentru optimizarea profilului Google Business, numărul de apeluri și solicitări de oferte a crescut cu peste 70%. Sunt extrem de mulțumit de rezultate!"',
        author: 'Mihai Popescu',
        role: 'Proprietar, Studio Foto MP',
        rating: 5
    },
    {
        id: 2,
        content: '"Am investit în pachetul Google Organic și în doar 3 luni am ajuns pe prima pagină pentru majoritatea cuvintelor cheie importante pentru afacerea noastră. Traficul organic a crescut cu 125%!"',
        author: 'Elena Ionescu',
        role: 'Marketing Manager, Mobila Design SRL',
        rating: 5
    },
    {
        id: 3,
        content: '"Folosim pachetul GBP MAX de aproape un an și vizibilitatea locală a restaurantului nostru s-a îmbunătățit considerabil. Rapoartele lunare ne ajută să înțelegem performanța și să luăm decizii mai bune."',
        author: 'Alexandru Marin',
        role: 'Proprietar, Restaurant Gourmet',
        rating: 5
    },
];

// Navigation links
export const navLinks = [
    { id: 1, name: 'Servicii', href: '#features' },
    { id: 2, name: 'Prețuri', href: '#pricing' },
    { id: 3, name: 'Testimoniale', href: '#testimonials' }
];

// Hero section data
export const heroData = {
    title: 'SEO Doctor',
    subtitle: 'Soluții profesionale de optimizare pentru Google, care aduc clienți reali afacerii tale. Atingeți obiectivele de business prin vizibilitate crescută și trafic de calitate.',
    primaryButtonText: 'Începe Acum',
    primaryButtonTextAuth: 'Accesează Profil',
    secondaryButtonText: 'Vezi Serviciile',
    primaryUrl: '/login',
    primaryUrlAuth: '/dashboard'
};

// Footer data
export const footerData = {
    companyName: 'SEO Doctor',
    companyDescription: 'Soluții de optimizare Google pentru afaceri care vor să crească online.',
    sections: [
        {
            title: 'Servicii',
            links: [
                { name: 'GBP MAX', href: '#features' },
                { name: 'Google Organic', href: '#features' },
                { name: 'Pachete și Prețuri', href: '#pricing' },
                { name: 'Testimoniale', href: '#testimonials' }
            ]
        },
        {
            title: 'Resurse',
            links: [
                { name: 'Suport', href: '#' },
                { name: 'Studii de Caz', href: '#' }
            ]
        },
        {
            title: 'Companie',
            links: [
                { name: 'Contact', href: '/contact' },
                { name: 'Legal', href: '/legal' }
            ]
        }
    ],
    socialLinks: [
        { platform: 'LinkedIn', url: 'https://www.linkedin.com/', icon: 'linkedin' }
    ]
};

// Call to action section data
export const ctaData = {
    title: 'Gata să creșteți vizibilitatea online?',
    subtitle: 'Alăturați-vă sutelor de afaceri care au ales serviciile noastre de optimizare pentru Google.',
    buttonText: 'Începe Acum',
    buttonTextAuth: 'Accesează Profil',
    url: '/login',
    urlAuth: '/dashboard'
};
