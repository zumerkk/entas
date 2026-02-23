import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'ENTAŞ — B2B Endüstriyel Ürünler',
    description: 'ENTAŞ B2B e-ticaret platformu. Endüstriyel ürünlerde güvenilir tedarik ortağınız.',
    keywords: 'B2B, endüstriyel ürünler, toptan satış, tedarik',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="tr">
            <body>{children}</body>
        </html>
    );
}
