import { contactInfo } from '@/data/contact';

export const testimonials = [
    {
        id: 1,
        content: "„Suntem pe primul loc în harta Google și pe primul loc organic, iar luna trecută (aprilie 2025) am avut cu 252 de apeluri mai mult pentru unul dintre serviciile importante ale clinicii!”",
        author: 'Anca Banc',
        role: 'Manager, MedLife Cluj',
        rating: 5
    },
    {
        id: 2,
        content: "„Colaborăm de aproape doi ani cu SEO Doctor. Suntem în top 3 pentru majoritatea cuvintelor-cheie importante. Numărul de pacienți a crescut, atât prin CAS, cât și cu plată!”",
        author: 'Oana Balint',
        role: 'Manager, Biomed Scan București',
        rating: 5
    },
    {
        id: 3,
        content: "„Folosim pachetele GMB MAX și Google Organic de aproape un an, iar vizibilitatea locală a cabinetului nostru s-a îmbunătățit considerabil. Recomand cu drag – comunicare excepțională!”",
        author: 'dr. Mihaela Popovici',
        role: 'Proprietar, Biomedica Piatra Neamț',
        rating: 5
    },
];

export const navLinks = [
    { id: 1, name: 'Servicii', href: '#features' },
    { id: 2, name: 'Prețuri', href: '#pricing' },
    { id: 3, name: 'Testimoniale', href: '#testimonials' }
];

export const heroData = {
    title: 'SEO Doctor',
    subtitle: 'Solutii garantate de optimizare SEO, mai multi pacienti în clinica ta.',
    primaryButtonText: 'Start aici',
    primaryButtonTextAuth: 'Accesează Profil',
    secondaryButtonText: 'Vezi Serviciile',
    primaryUrl: '/login',
    primaryUrlAuth: '/dashboard'
};

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
                { name: 'Contact', href: `tel:${contactInfo.phone}` },
                { name: 'Legal', href: '/legal' }
            ]
        }
    ],
    socialLinks: [
        { platform: 'LinkedIn', url: 'https://www.linkedin.com/', icon: 'linkedin' }
    ]
};

export const ctaData = {
    title: 'Ești gata să îți crești vizibilitatea online?',
    subtitle1: '88% dintre utilizatori folosesc Google Maps pentru a găsi afaceri locale.',
    subtitle2: '78% dintre persoanele care fac căutări locale ajung sã facă o achiziție în decurs de o zi.',
    buttonText: 'Începe Acum',
    buttonTextAuth: 'Accesează Profil',
    url: '/login',
    urlAuth: '/dashboard'
};
