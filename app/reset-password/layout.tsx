import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Resetare Parolă | SEO Doctor',
    description: 'Resetează-ți parola contului SEO Doctor',
    robots: {
        index: false,
        follow: false
    }
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}