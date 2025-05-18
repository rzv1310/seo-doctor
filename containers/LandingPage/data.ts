// Services data
export const services = [
    {
        id: 1,
        name: 'GBP MAX',
        tag: 'Recomandat',
        tagClass: 'bg-green-900/30 text-green-300',
        price: '$99.99',
        period: '/lună',
        description: 'Serviciu complet de optimizare a profilului de afaceri Google pentru maximizarea vizibilității locale',
        features: [
            'Optimizare Google Business Profile',
            'Gestionarea și răspunsuri la recenzii',
            'Actualizări informații de afaceri',
            'Optimizare fotografii și postări',
            'Rapoarte lunare de performanță'
        ],
        details: 'Profilul Google Business este esențial pentru afacerile locale. Cu GBP MAX, transformăm profilul tău într-un magnet pentru clienți locali, crescând vizibilitatea, încrederea și numărul de apeluri/vizite la locație.',
        buttonText: 'Accesează Serviciul',
        buttonTextUnauth: 'Începe Acum',
        url: '/dashboard/services/1',
        unauthUrl: '/login'
    },
    {
        id: 2,
        name: 'Google Organic',
        tag: 'Premium',
        tagClass: 'bg-blue-900/30 text-blue-300',
        price: '$149.99',
        period: '/lună',
        description: 'Serviciu complet de optimizare SEO pentru căutări organice în motorul de căutare Google',
        features: [
            'Cercetare cuvinte cheie relevante',
            'Optimizare on-page și conținut',
            'Analiză și strategie de link building',
            'SEO tehnic și optimizare site',
            'Rapoarte detaliate lunare'
        ],
        details: 'Optimizarea pentru căutările organice aduce trafic de calitate pe termen lung. Serviciul nostru se concentrează pe creșterea vizibilității în Google, îmbunătățind clasamentele pentru cuvintele cheie relevante și generând conversii.',
        buttonText: 'Accesează Serviciul',
        buttonTextUnauth: 'Începe Acum',
        url: '/dashboard/services/2',
        unauthUrl: '/login'
    },
];

// Pricing data
export const prices = [
    {
        id: 1,
        name: 'GBP Basic',
        price: '$49.99',
        period: '/lună',
        description: 'Pentru afaceri mici cu prezență locală',
        features: [
            'Optimizare profil Google Business',
            'Gestionare recenzii de bază',
            'Rapoarte lunare simple'
        ],
        url: '/dashboard/services/1',
        unauthUrl: '/login',
        highlighted: false
    },
    {
        id: 2,
        name: 'GBP MAX',
        price: '$99.99',
        period: '/lună',
        description: 'Pentru afaceri care vor să domine căutările locale',
        features: [
            'Optimizare completă profil',
            'Gestionare și răspunsuri la recenzii',
            'Postări săptămânale',
            'Rapoarte detaliate lunare'
        ],
        url: '/dashboard/services/1',
        unauthUrl: '/login',
        highlighted: true,
        tag: 'RECOMANDAT'
    },
    {
        id: 3,
        name: 'Google Organic',
        price: '$149.99',
        period: '/lună',
        description: 'Optimizare SEO completă pentru rezultate organice',
        features: [
            'Cercetare cuvinte cheie',
            'Optimizare on-page și conținut',
            'Analiză link building',
            'Rapoarte analitice avansate'
        ],
        url: '/dashboard/services/2',
        unauthUrl: '/login',
        highlighted: false
    },
];

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
                { name: 'Despre Noi', href: '#' },
                { name: 'Contact', href: '#' },
                { name: 'Legal', href: '#' }
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
