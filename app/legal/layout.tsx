import { pageMetadata } from '@/data/metadata';

export const metadata = pageMetadata.legal;

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}