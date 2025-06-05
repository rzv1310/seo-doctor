// Services data for both landing page and dashboard
import type { Service } from '@/types/service';



export const services: Service[] = [
    {
        id: 1,
        name: 'GMB MAX',
        tag: 'Premium',
        tagClass: 'bg-green-900/30 text-green-300',
        price: '1.000 €', // Display price in EUR
        priceValue: 100000, // 1000 EUR in cents for display
        period: '/lună',
        description: 'GARANTAT TOP 3 ÎN GOOGLE MAPS - SAU NU PLĂTEȘTI NIMIC!',
        status: 'available',
        renewalDate: 'May 20, 2025',
        usage: 73,
        features: [
            'Creare profil Google My Business nou',
            'Optimizare completă cu datele clinicii tale',
            'Recenzii reale de la persoane din orașul tău',
            'Backlink-uri dofollow locale',
            'Exclusivitate geografică',
            'Reducere până la 75% in primele 3 luni!',
        ],
        details: 'GMB MAX este arma ta secretă pentru a domina Pachetul de hărți Google și pentru a aduce mai mulți pacienți către clinica ta! Cu SEO Doctor vei apărea în primele 3 locuri din hartă în căutările locale',
        buttonText: 'Citește mai multe',
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
        tagClass: 'bg-green-900/30 text-green-300',
        price: '1.000 €', // Display price in EUR
        priceValue: 100000, // 1000 EUR in cents for display
        period: '/lună',
        description: 'GARANTAT TOP 3 ÎN REZULTATELE GOOGLE - SAU NU PLĂTEȘTI NIMIC!',
        status: 'available',
        renewalDate: 'July 2, 2025',
        usage: 45,
        features: [
            'Website nou, dedicat cabinetului tău',
            'Strategie SEO unică',
            'Off-page cu backlink-uri de calitate',
            'Optimizare dispozitive mobile',
            'Monitorizare și raportare transparentă',
            'Reducere până la 75% in primele 3 luni!',
        ],
        details: 'GOOGLE ORGANIC este soluția ta completă pentru a domina rezultatele organice locale. Prin strategia noastră unică SEO, vei urca rapid in Google pentru serviciul medical pe care îl dorești.',
        buttonText: 'Citește mai multe',
        buttonTextUnauth: 'Începe Acum',
        url: '/services/google-organic',
        unauthUrl: '/login',
        offers: [
            {
                text: 'Reducere până la 75% în primele 3 luni',
                bgClass: 'bg-green-900/30',
                textClass: 'text-green-300'
            },
        ]
    },
];

// Pricing data for landing page
export const prices = [
    {
        id: 1,
        name: 'GMB MAX',
        price: '1.000 €', // Display price in EUR
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
        price: '1.000 €', // Display price in EUR
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
