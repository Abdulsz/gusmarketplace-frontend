import './globals.css';
import { Manrope } from 'next/font/google';
import NavBar from '@/components/NavBar';
import { MarketplaceProvider } from '@/contexts/MarketplaceContext';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/next';

const manrope = Manrope({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'GUS Marketplace',
  description: 'Augustana College Marketplace',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <MarketplaceProvider>
          {children}
          <NavBar />
          <Toaster />
        </MarketplaceProvider>
        <Analytics />
      </body>
    </html>
  );
}

