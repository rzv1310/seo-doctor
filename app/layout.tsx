import type { Metadata } from "next";
import { Space_Grotesk, Fira_Code } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

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
                        {children}
                    </AuthProvider>
                </div>
            </body>
        </html>
    );
}
