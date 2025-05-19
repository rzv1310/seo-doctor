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
