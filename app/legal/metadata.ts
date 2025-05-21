import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Informații Legale",
  description: "Politica de confidențialitate, termeni și condiții, GDPR și alte informații legale despre serviciile SEO Doctor.",
  keywords: "politica de confidențialitate, termeni și condiții, GDPR, politica de rambursare, SEO Doctor legal",
  openGraph: {
    title: "Informații Legale | SEO Doctor",
    description: "Politica de confidențialitate, termeni și condiții, GDPR și alte informații legale despre serviciile SEO Doctor.",
    url: "https://seodoctor.ro/legal",
    images: [
      {
        url: "/open-graph.png",
        width: 1200,
        height: 630,
        alt: "Informații Legale SEO Doctor"
      }
    ]
  },
  twitter: {
    title: "Informații Legale | SEO Doctor",
    description: "Politica de confidențialitate, termeni și condiții, GDPR și alte informații legale despre serviciile SEO Doctor.",
  },
  alternates: {
    canonical: "https://seodoctor.ro/legal"
  }
};