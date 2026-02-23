import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'ENTAŞ Admin — B2B Yönetim Paneli',
    description: 'ENTAŞ B2B e-ticaret yönetim paneli',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr">
            <body>{children}</body>
        </html>
    );
}
