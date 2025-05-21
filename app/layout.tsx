import type { Metadata } from "next";
import { Space_Grotesk, Fira_Code } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

const spaceGrotesk = Space_Grotesk({
    variable: "--font-space-grotesk",
    subsets: ["latin"],
    display: "swap",
});

const firaCode = Fira_Code({
    variable: "--font-fira-code",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "SEO Doctor - Gestionați Strategia SEO cu Expertiză",
        template: "%s | SEO Doctor"
    },
    description: "Instrument profesional pentru analiza, optimizarea și îmbunătățirea prezenței dvs. online. Creșteți vizibilitatea și traficul organic cu SEO Doctor.",
    keywords: "SEO, optimizare motoare de căutare, analiză SEO, audit website, creștere trafic organic",
    authors: [{ name: "SEO Doctor Team" }],
    metadataBase: new URL("https://seodoctor.ro"),
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
            { url: "/favicon.svg", type: "image/svg+xml" }
        ],
        apple: { url: "/apple-touch-icon.png", sizes: "180x180" }
    },
    manifest: "/site.webmanifest",
    openGraph: {
        type: "website",
        locale: "ro_RO",
        title: "SEO Doctor - Gestionați Strategia SEO cu Expertiză",
        description: "Instrument profesional pentru analiza, optimizarea și îmbunătățirea prezenței dvs. online.",
        url: "https://seodoctor.ro",
        siteName: "SEO Doctor",
        images: [
            {
                url: "/open-graph.png",
                width: 1200,
                height: 630,
                alt: "SEO Doctor - Soluții profesionale de optimizare SEO"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "SEO Doctor - Gestionați Strategia SEO cu Expertiză",
        description: "Instrument profesional pentru analiza, optimizarea și îmbunătățirea prezenței dvs. online.",
        images: ["/open-graph.png"]
    },
    alternates: {
        canonical: "https://seodoctor.ro"
    }
};


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="ro"
            className="dark"
        >
            <body
                className={`${spaceGrotesk.variable} ${firaCode.variable} antialiased`}
            >
                <div
                    className="font-sans"
                >
                    <AuthProvider>
                        <CartProvider>
                            {children}
                        </CartProvider>
                    </AuthProvider>
                </div>
            </body>
        </html>
    );
}
