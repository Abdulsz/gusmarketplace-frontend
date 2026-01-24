'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { useToast } from '@/components/ui/use-toast';

export default function NavBar() {
  const { showMyListingsOnly, setShowMyListingsOnly, onAddListing } = useMarketplace() || {};
  const [loggedIn, setLoggedIn] = useState(false);
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const isMarketplacePage = pathname === '/';
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setLoggedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleMyListingsClick = () => {
    if (!loggedIn) {
      toast({
        title: "Authentication required",
        description: "Please log in to view your listings.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }
    if (setShowMyListingsOnly) {
      setShowMyListingsOnly(!showMyListingsOnly);
    }
  };

  const handleAddListingClick = () => {
    if (!loggedIn) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a listing.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }
    if (onAddListing) {
      onAddListing();
    }
  };

  // Button content for mobile with full text
  const NavButtons = () => (
    <>
      {isMarketplacePage && setShowMyListingsOnly && showMyListingsOnly && (
        <Button
          variant="ghost"
          onClick={() => setShowMyListingsOnly(false)}
          className="text-xs h-7 rounded-lg px-2.5 text-white/70 hover:text-white hover:bg-white/10 whitespace-nowrap"
        >
          ← All Listings
        </Button>
      )}
      {isMarketplacePage && setShowMyListingsOnly && (
        <Button
          variant="ghost"
          onClick={handleMyListingsClick}
          className={`text-xs h-7 rounded-lg px-2.5 whitespace-nowrap ${showMyListingsOnly
              ? 'text-white bg-white/15 hover:bg-white/25'
              : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
        >
          My Listings
        </Button>
      )}
      {isMarketplacePage && onAddListing && (
        <Button
          variant="ghost"
          onClick={handleAddListingClick}
          className="text-xs text-white hover:text-white bg-white/15 hover:bg-white/25 h-7 rounded-lg px-2.5 whitespace-nowrap"
        >
          + Add Listing
        </Button>
      )}
      {!loggedIn && !isLoginPage && (
        <Button
          onClick={() => router.push('/login')}
          variant="ghost"
          className="text-xs h-7 rounded-lg px-2.5 text-white/70 hover:text-white hover:bg-white/10 whitespace-nowrap"
        >
          Login
        </Button>
      )}
      {loggedIn && (
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-xs h-7 rounded-lg px-2.5 text-white/70 hover:text-white hover:bg-white/10 whitespace-nowrap"
        >
          Logout
        </Button>
      )}
    </>
  );

  // Desktop button content with larger text
  const DesktopNavButtons = () => (
    <>
      {isMarketplacePage && setShowMyListingsOnly && showMyListingsOnly && (
        <Button
          variant="ghost"
          onClick={() => setShowMyListingsOnly(false)}
          className="text-sm h-8 rounded-xl px-4 text-white/70 hover:text-white hover:bg-white/10"
        >
          ← All Listings
        </Button>
      )}
      {isMarketplacePage && setShowMyListingsOnly && (
        <Button
          variant="ghost"
          onClick={handleMyListingsClick}
          className={`text-sm h-8 rounded-xl px-4 ${showMyListingsOnly
              ? 'text-white bg-white/15 hover:bg-white/25'
              : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
        >
          My Listings
        </Button>
      )}
      {isMarketplacePage && onAddListing && (
        <Button
          variant="ghost"
          onClick={handleAddListingClick}
          className="text-sm text-white hover:text-white bg-white/15 hover:bg-white/25 h-8 rounded-xl px-4"
        >
          + Add Listing
        </Button>
      )}
      {!loggedIn && !isLoginPage && (
        <Button
          onClick={() => router.push('/login')}
          variant="ghost"
          className="text-sm h-8 rounded-xl px-4 text-white/70 hover:text-white hover:bg-white/10"
        >
          Login
        </Button>
      )}
      {loggedIn && (
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-sm h-8 rounded-xl px-4 text-white/70 hover:text-white hover:bg-white/10"
        >
          Logout
        </Button>
      )}
    </>
  );

  return (
    <>
      {!isLoginPage && (
        <>
          {/* Mobile/Tablet: Centered Stacked Layout */}
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 md:hidden flex flex-col items-center gap-2">
            {/* Logo */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-border/50">
              <button
                onClick={() => router.push('/')}
                className="text-xs font-semibold text-[#002F6C] hover:opacity-70 transition-opacity whitespace-nowrap"
              >
                GUS MARKETPLACE
              </button>
            </div>
            {/* Navigation Bar */}
            <div className="bg-[#001a3d]/70 backdrop-blur-xl rounded-xl px-3 py-2 shadow-2xl border border-white/20 relative">
              <div className="flex items-center gap-1.5 sm:gap-2 relative z-10">
                <NavButtons />
              </div>
            </div>
          </div>

          {/* Desktop: Separate Layout */}
          <div className="hidden md:block fixed top-3 left-8 z-50">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-border/50">
              <button
                onClick={() => router.push('/')}
                className="text-base font-semibold text-[#002F6C] hover:opacity-70 transition-opacity whitespace-nowrap"
              >
                GUS MARKETPLACE
              </button>
            </div>
          </div>

          <nav className="hidden md:block fixed top-3 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-[#001a3d]/70 backdrop-blur-xl rounded-[32px] px-6 py-3 shadow-2xl border border-white/20 relative">
              <div className="flex items-center gap-3 relative z-10">
                <DesktopNavButtons />
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
