import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contactează-ne",
  description: "Întrebări despre serviciile noastre de optimizare SEO? Contactează echipa SEO Doctor și vom reveni cu răspunsuri personalizate pentru afacerea ta.",
  keywords: "contact SEO Doctor, întrebări SEO, consultanță SEO, optimizare Google, servicii SEO",
  openGraph: {
    title: "Contactează Echipa SEO Doctor",
    description: "Ai întrebări despre cum putem ajuta afacerea ta să crească online? Contactează-ne și îți vom răspunde în cel mai scurt timp posibil.",
    url: "https://seodoctor.ro/contact",
    images: [
      {
        url: "/open-graph.png",
        width: 1200,
        height: 630,
        alt: "Contactează SEO Doctor - Experți în optimizare Google"
      }
    ]
  },
  twitter: {
    title: "Contactează Echipa SEO Doctor",
    description: "Ai întrebări despre cum putem ajuta afacerea ta să crească online? Contactează-ne și îți vom răspunde în cel mai scurt timp posibil.",
  },
  alternates: {
    canonical: "https://seodoctor.ro/contact"
  }
};