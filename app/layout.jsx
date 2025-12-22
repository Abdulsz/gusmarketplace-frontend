import './globals.css';
import NavBar from '@/components/NavBar';
import { MarketplaceProvider } from '@/contexts/MarketplaceContext';

export const metadata = {
  title: 'GUS Marketplace',
  description: 'Augustana College Marketplace',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MarketplaceProvider>
          <NavBar />
          {children}
        </MarketplaceProvider>
      </body>
    </html>
  );
}

