import { Space_Grotesk, Fira_Code } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { getServerSession } from "@/lib/auth";
import { layoutMetadata } from "@/data/metadata";
import "./globals.css";



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

export const metadata = layoutMetadata;

export const dynamic = 'force-dynamic';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Fetch authentication status and user data from the server
    const session = await getServerSession();

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
                    <AuthProvider initialUser={session.user} initialAuth={session.isAuthenticated}>
                        <CartProvider>
                            {children}
                        </CartProvider>
                    </AuthProvider>
                </div>
            </body>
        </html>
    );
}
