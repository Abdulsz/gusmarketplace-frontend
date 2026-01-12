import './globals.css';
import { Roboto } from 'next/font/google';
import NavBar from '@/components/NavBar';
import { MarketplaceProvider } from '@/contexts/MarketplaceContext';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/next';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'GUS Marketplace',
  description: 'Augustana College Marketplace',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={roboto.className}>
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

