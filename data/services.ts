// Services data for both landing page and dashboard
export type Service = {
    id: number;
    name: string;
    description: string;
    price: string;
    priceValue: number; // Price in cents for calculations
    status?: string;
    renewalDate?: string;
    usage?: number;
    features: string[];
    // Landing page specific fields
    tag?: string;
    tagClass?: string;
    period?: string;
    details?: string;
    buttonText?: string;
    buttonTextUnauth?: string;
    url?: string;
    unauthUrl?: string;
    // Additional fields for dashboard
    offers?: {
        text: string;
        bgClass: string;
        textClass: string;
    }[];
};

export const services: Service[] = [
    {
        id: 1,
        name: 'GBP MAX',
        tag: 'Recomandat',
        tagClass: 'bg-green-900/30 text-green-300',
        price: '$99.99',
        priceValue: 9999, // $99.99 in cents
        period: '/lună',
        description: 'Serviciu complet de optimizare a profilului de afaceri Google pentru maximizarea vizibilității locale',
        status: 'active',
        renewalDate: 'May 20, 2025',
        usage: 73,
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
        priceValue: 14999, // $149.99 in cents
        period: '/lună',
        description: 'Serviciu complet de optimizare SEO pentru căutări organice în motorul de căutare Google',
        status: 'trial',
        renewalDate: 'July 2, 2025',
        usage: 45,
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

// Pricing data for landing page
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
];
