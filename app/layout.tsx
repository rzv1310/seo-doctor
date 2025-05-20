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
    title: "SEO Doctor - Gestionați Strategia SEO cu Expertiză",
    description: "Instrument profesional pentru analiza, optimizarea și îmbunătățirea prezenței dvs. online. Creșteți vizibilitatea și traficul organic cu SEO Doctor.",
    keywords: "SEO, optimizare motoare de căutare, analiză SEO, audit website, creștere trafic organic",
    openGraph: {
        title: "SEO Doctor - Gestionați Strategia SEO cu Expertiză",
        description: "Instrument profesional pentru analiza, optimizarea și îmbunătățirea prezenței dvs. online.",
        url: "https://seodoctor.ro",
        siteName: "SEO Doctor"
    },
};

{/* <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-title" content="SEO Doctor" />
<link rel="manifest" href="/site.webmanifest" /> */}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
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
