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
        name: 'GMB MAX',
        tag: 'Recomandat',
        tagClass: 'bg-green-900/30 text-green-300',
        price: '1000 €',
        priceValue: 100000, // 1000 EUR in cents
        period: '/lună',
        description: 'GARANTAT TOP 3 ÎN GOOGLE MAPS - SAU NU PLĂTEȘTI NIMIC!',
        status: 'available',
        renewalDate: 'May 20, 2025',
        usage: 73,
        features: [
            'Creare profil Google My Business nou',
            'Optimizare completă cu datele afacerii',
            'Recenzii de la subiecți reali',
            'Backlink-uri dofollow locale',
            'Indexare forțată',
            'Exclusivitate geografică'
        ],
        details: 'GMB MAX este arma ta secretă pentru a domina Pachetul de hărți Google și pentru a aduce mai mulți pacienți către clinica ta! Prin strategia noastră te ajutăm ca afacerea ta să apară mai sus în căutările locale.',
        buttonText: 'Descoperă mai multe',
        buttonTextUnauth: 'Începe Acum',
        url: '/services/gmb-max',
        unauthUrl: '/login',
        offers: [
            {
                text: 'Reducere până la 75% în primele 3 luni',
                bgClass: 'bg-green-900/30',
                textClass: 'text-green-300'
            }
        ]
    },
    {
        id: 2,
        name: 'GOOGLE ORGANIC',
        tag: 'Premium',
        tagClass: 'bg-blue-900/30 text-blue-300',
        price: '1000 €',
        priceValue: 100000, // 1000 EUR in cents
        period: '/lună',
        description: 'GARANTAT TOP 3 ÎN REZULTATELE GOOGLE - SAU NU PLĂTEȘTI NIMIC!',
        status: 'available',
        renewalDate: 'July 2, 2025',
        usage: 45,
        features: [
            'Website nou, optimizat',
            'Strategie SEO avansată',
            'Off-page cu backlink-uri de calitate',
            'Optimizare pentru dispozitive mobile',
            'Monitorizare și raportare transparentă',
            'Plătești doar după ce ajungi în Top 3'
        ],
        details: 'GOOGLE ORGANIC este soluția ta completă pentru a domina rezultatele organice. Prin strategia noastră avansată SEO, creăm un website nou special pentru tine, optimizat pentru a urca rapid în Google pentru serviciul medical pe care îl dorești.',
        buttonText: 'Descoperă mai multe',
        buttonTextUnauth: 'Începe Acum',
        url: '/services/google-organic',
        unauthUrl: '/login',
        offers: [
            {
                text: 'Reducere până la 75% în primele 3 luni',
                bgClass: 'bg-green-900/30',
                textClass: 'text-green-300'
            },
            {
                text: 'Plătești doar după ce ajungi în Top 3!',
                bgClass: 'bg-blue-900/30',
                textClass: 'text-blue-300'
            }
        ]
    },
];

// Pricing data for landing page
export const prices = [
    {
        id: 1,
        name: 'GMB MAX',
        price: '1000 €',
        period: '/lună',
        description: 'Pentru afaceri medicale care vor să domine căutările locale în Google Maps',
        features: [
            'Garantat Top 3 în Google Maps',
            'Profil GMB nou, optimizat',
            'Recenzii de la utilizatori reali',
            'Backlink-uri locale de calitate',
            'Exclusivitate geografică'
        ],
        url: '/dashboard/services/gmb-max',
        unauthUrl: '/login',
        highlighted: true,
        tag: 'RECOMANDAT'
    },
    {
        id: 2,
        name: 'GOOGLE ORGANIC',
        price: '1000 €',
        period: '/lună',
        description: 'Pentru clinici medicale care vor să domine rezultatele organice Google',
        features: [
            'Garantat Top 3 în Google Organic',
            'Website nou, optimizat',
            'Plătești doar după ce ajungi în Top 3',
            'Strategie SEO completă',
            'Rapoarte detaliate lunare'
        ],
        url: '/dashboard/services/google-organic',
        unauthUrl: '/login',
        highlighted: false,
        tag: 'PREMIUM'
    },
];
