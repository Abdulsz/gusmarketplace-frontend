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

  return (
    <>
      {/* Logo on Far Left with White Background */}
      {!isLoginPage && (
        <div className="fixed top-3 left-2 sm:left-8 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg border border-border/50">
            <button
              onClick={() => router.push('/')}
              className="text-xs sm:text-base font-semibold text-[#002F6C] hover:opacity-70 transition-opacity whitespace-nowrap"
            >
              GUS MARKETPLACE
            </button>
          </div>
        </div>
      )}
      
      {/* Navigation Bar - Aligned with Logo */}
      <nav className="fixed top-3 right-2 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-50">
        <div className="bg-[#001a3d]/70 backdrop-blur-xl rounded-xl sm:rounded-[32px] px-3 py-2 sm:px-6 sm:py-3 shadow-2xl border border-white/20 relative">
          <div className="flex items-center gap-1.5 sm:gap-3 relative z-10">
            {isMarketplacePage && setShowMyListingsOnly && showMyListingsOnly && (
              <Button 
                variant="ghost"
                onClick={() => setShowMyListingsOnly(false)}
                className="text-xs sm:text-sm h-7 sm:h-8 rounded-lg sm:rounded-xl px-2 sm:px-4 text-white/70 hover:text-white hover:bg-white/10"
              >
                <span className="hidden sm:inline">← All Listings</span>
                <span className="sm:hidden">← All</span>
              </Button>
            )}
            {isMarketplacePage && setShowMyListingsOnly && (
              <Button 
                variant="ghost"
                onClick={handleMyListingsClick}
                className={`text-xs sm:text-sm h-7 sm:h-8 rounded-lg sm:rounded-xl px-2 sm:px-4 ${
                  showMyListingsOnly 
                    ? 'text-white bg-white/15 hover:bg-white/25' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="hidden sm:inline">My Listings</span>
                <span className="sm:hidden">My</span>
              </Button>
            )}
            {isMarketplacePage && onAddListing && (
              <Button 
                variant="ghost"
                onClick={handleAddListingClick}
                className="text-xs sm:text-sm text-white hover:text-white bg-white/15 hover:bg-white/25 h-7 sm:h-8 rounded-lg sm:rounded-xl px-2 sm:px-4"
              >
                <span className="hidden sm:inline">+ Add Listing</span>
                <span className="sm:hidden">+ Add</span>
              </Button>
            )}
            {!loggedIn && !isLoginPage && (
              <Button 
                onClick={() => router.push('/login')}
                variant="ghost"
                className="text-xs sm:text-sm h-7 sm:h-8 rounded-lg sm:rounded-xl px-2 sm:px-4 text-white/70 hover:text-white hover:bg-white/10"
              >
                Login
              </Button>
            )}
            {loggedIn && (
              <Button 
                variant="ghost"
                onClick={handleLogout}
                className="text-xs sm:text-sm h-7 sm:h-8 rounded-lg sm:rounded-xl px-2 sm:px-4 text-white/70 hover:text-white hover:bg-white/10"
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
