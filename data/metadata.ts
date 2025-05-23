import { Metadata } from 'next';

const baseUrl = 'https://seo-doctor.ro';
const siteName = 'SEO Doctor';
const defaultImage = {
  url: '/open-graph.png',
  width: 1200,
  height: 630,
  alt: 'SEO Doctor - Soluții profesionale de optimizare pentru Google'
};

export const siteMetadata = {
  title: siteName,
  url: baseUrl,
  locale: 'ro_RO',
  type: 'website',
  twitterCard: 'summary_large_image' as const,
  authors: [{ name: 'SEO Doctor Team' }],
  metadataBase: new URL(baseUrl),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' }
  },
  manifest: '/site.webmanifest'
};

export const pageMetadata: Record<string, Metadata> = {
  home: {
    title: 'SEO Doctor - Soluții profesionale de optimizare pentru Google',
    description: 'Creșteți vizibilitatea online și obțineți clienți reali cu soluțiile noastre de optimizare Google. Rezultate măsurabile garantate.',
    keywords: 'SEO, optimizare Google, Google Business Profile, vizibilitate online, trafic organic, clienți reali',
    openGraph: {
      type: 'website',
      locale: siteMetadata.locale,
      url: baseUrl,
      siteName,
      title: 'SEO Doctor - Experți în optimizare Google',
      description: 'Servicii premium care transformă prezența dvs. online în clienți reali.',
      images: [defaultImage]
    },
    twitter: {
      card: siteMetadata.twitterCard,
      title: 'SEO Doctor - Experți în optimizare Google',
      description: 'Servicii premium care transformă prezența dvs. online în clienți reali.',
      images: [defaultImage.url]
    },
    alternates: {
      canonical: baseUrl
    },
    authors: siteMetadata.authors,
    metadataBase: siteMetadata.metadataBase,
    icons: siteMetadata.icons,
    manifest: siteMetadata.manifest
  },

  contact: {
    title: 'Contactează-ne | SEO Doctor',
    description: 'Întrebări despre optimizare SEO? Echipa noastră îți oferă consultanță personalizată pentru succesul afacerii tale online.',
    keywords: 'contact SEO Doctor, întrebări SEO, consultanță SEO, optimizare Google, servicii SEO',
    openGraph: {
      type: 'website',
      locale: siteMetadata.locale,
      url: `${baseUrl}/contact`,
      siteName,
      title: 'Contactează Echipa SEO Doctor',
      description: 'Discută cu experții noștri despre cum să crești afacerea ta online.',
      images: [{ ...defaultImage, alt: 'Contactează SEO Doctor - Experți în optimizare Google' }]
    },
    twitter: {
      card: siteMetadata.twitterCard,
      title: 'Contactează Echipa SEO Doctor',
      description: 'Discută cu experții noștri despre cum să crești afacerea ta online.',
      images: [defaultImage.url]
    },
    alternates: {
      canonical: `${baseUrl}/contact`
    }
  },

  legal: {
    title: 'Informații Legale | SEO Doctor',
    description: 'Politica de confidențialitate, termeni și condiții, GDPR și transparență completă despre serviciile SEO Doctor.',
    keywords: 'politica de confidențialitate, termeni și condiții, GDPR, politica de rambursare, SEO Doctor legal',
    openGraph: {
      type: 'website',
      locale: siteMetadata.locale,
      url: `${baseUrl}/legal`,
      siteName,
      title: 'Termeni Legali și Confidențialitate',
      description: 'Transparență totală - politici clare pentru colaborarea noastră.',
      images: [{ ...defaultImage, alt: 'Informații Legale SEO Doctor' }]
    },
    twitter: {
      card: siteMetadata.twitterCard,
      title: 'Termeni Legali și Confidențialitate',
      description: 'Transparență totală - politici clare pentru colaborarea noastră.',
      images: [defaultImage.url]
    },
    alternates: {
      canonical: `${baseUrl}/legal`
    }
  },

  services: {
    title: 'Serviciile Noastre | SEO Doctor',
    description: 'Pachete complete de optimizare Google adaptate nevoilor afacerii tale. De la SEO local la strategii naționale.',
    keywords: 'servicii SEO, optimizare Google, servicii optimizare, pachete SEO, Google Business Profile, SEO organic',
    openGraph: {
      type: 'website',
      locale: siteMetadata.locale,
      url: `${baseUrl}/services`,
      siteName,
      title: 'Servicii Premium de Optimizare',
      description: 'Soluții complete pentru dominarea rezultatelor Google în nișa ta.',
      images: [{ ...defaultImage, alt: 'Servicii Premium de Optimizare Google' }]
    },
    twitter: {
      card: siteMetadata.twitterCard,
      title: 'Servicii Premium de Optimizare',
      description: 'Soluții complete pentru dominarea rezultatelor Google în nișa ta.',
      images: [defaultImage.url]
    },
    alternates: {
      canonical: `${baseUrl}/services`
    }
  },

  'services/gmb-max': {
    title: 'Google Business Pro (GBP MAX) | SEO Doctor',
    description: 'Maximizați impactul local cu optimizare avansată Google Business Profile. Dominați hărțile și rezultatele locale.',
    keywords: 'Google Business Profile, Google My Business, GBP, optimizare GMB, SEO local, afișare hărți Google, recenzii Google',
    openGraph: {
      type: 'website',
      locale: siteMetadata.locale,
      url: `${baseUrl}/services/gmb-max`,
      siteName,
      title: 'GBP MAX - Dominați Piața Locală',
      description: 'Atrageți clienți din zona dvs. cu poziționare optimă pe Google Maps.',
      images: [{ ...defaultImage, alt: 'Optimizare Google Business Profile (GBP MAX)' }]
    },
    twitter: {
      card: siteMetadata.twitterCard,
      title: 'GBP MAX - Dominați Piața Locală',
      description: 'Atrageți clienți din zona dvs. cu poziționare optimă pe Google Maps.',
      images: [defaultImage.url]
    },
    alternates: {
      canonical: `${baseUrl}/services/gmb-max`
    }
  },

  'services/google-organic': {
    title: 'SEO Google Organic | SEO Doctor',
    description: 'Creșteți autoritatea site-ului și dominați prima pagină Google. Strategie completă pentru trafic organic sustenabil.',
    keywords: 'SEO organic, optimizare Google, rezultate căutare, creștere trafic, optimizare site, cuvinte cheie',
    openGraph: {
      type: 'website',
      locale: siteMetadata.locale,
      url: `${baseUrl}/services/google-organic`,
      siteName,
      title: 'SEO Organic - Prima Pagină Google',
      description: 'Strategie completă pentru poziții de top în rezultatele organice.',
      images: [{ ...defaultImage, alt: 'Optimizare SEO Google Organic' }]
    },
    twitter: {
      card: siteMetadata.twitterCard,
      title: 'SEO Organic - Prima Pagină Google',
      description: 'Strategie completă pentru poziții de top în rezultatele organice.',
      images: [defaultImage.url]
    },
    alternates: {
      canonical: `${baseUrl}/services/google-organic`
    }
  },

  dashboard: {
    title: 'Dashboard | SEO Doctor',
    description: 'Monitorizați performanța SEO în timp real. Rapoarte detaliate și insight-uri acționabile pentru succesul dvs. online.',
    keywords: 'dashboard SEO, panou de control, monitorizare SEO, rapoarte optimizare, analiză performanță',
    openGraph: {
      type: 'website',
      locale: siteMetadata.locale,
      url: `${baseUrl}/dashboard`,
      siteName,
      title: 'Panoul de Control SEO Doctor',
      description: 'Toate datele importante despre performanța SEO într-un singur loc.',
      images: [{ ...defaultImage, alt: 'Dashboard SEO Doctor' }]
    },
    twitter: {
      card: siteMetadata.twitterCard,
      title: 'Panoul de Control SEO Doctor',
      description: 'Toate datele importante despre performanța SEO într-un singur loc.',
      images: [defaultImage.url]
    },
    alternates: {
      canonical: `${baseUrl}/dashboard`
    },
    robots: {
      index: false,
      follow: false
    }
  },

  login: {
    title: 'Autentificare | SEO Doctor',
    description: 'Accesați contul dvs. pentru a gestiona campaniile SEO și a vizualiza progresul optimizării.',
    keywords: 'login SEO Doctor, autentificare, cont SEO, acces panou control',
    openGraph: {
      type: 'website',
      locale: siteMetadata.locale,
      url: `${baseUrl}/login`,
      siteName,
      title: 'Autentificare SEO Doctor',
      description: 'Accesați panoul de control pentru gestionarea serviciilor.',
      images: [{ ...defaultImage, alt: 'Autentificare SEO Doctor' }]
    },
    twitter: {
      card: siteMetadata.twitterCard,
      title: 'Autentificare SEO Doctor',
      description: 'Accesați panoul de control pentru gestionarea serviciilor.',
      images: [defaultImage.url]
    },
    alternates: {
      canonical: `${baseUrl}/login`
    },
    robots: {
      index: false,
      follow: false
    }
  }
};

export const layoutMetadata: Metadata = {
  title: {
    default: 'SEO Doctor - Experți în Strategii SEO de Succes',
    template: '%s'
  },
  description: 'Transformăm prezența online în rezultate măsurabile. Analiză avansată, strategie personalizată și execuție expertă.',
  keywords: 'SEO, optimizare motoare de căutare, analiză SEO, audit website, creștere trafic organic',
  authors: siteMetadata.authors,
  metadataBase: siteMetadata.metadataBase,
  icons: siteMetadata.icons,
  manifest: siteMetadata.manifest,
  openGraph: {
    type: 'website',
    locale: siteMetadata.locale,
    title: 'SEO Doctor - Experți în Strategii SEO de Succes',
    description: 'Transformăm prezența online în rezultate măsurabile.',
    url: baseUrl,
    siteName,
    images: [defaultImage]
  },
  twitter: {
    card: siteMetadata.twitterCard,
    title: 'SEO Doctor - Experți în Strategii SEO de Succes',
    description: 'Transformăm prezența online în rezultate măsurabile.',
    images: [defaultImage.url]
  },
  alternates: {
    canonical: baseUrl
  }
};
