import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { useMarketplace } from '../contexts/MarketplaceContext';

export default function NavBar() {
  const { showMyListingsOnly, setShowMyListingsOnly, onAddListing } = useMarketplace() || {};
  const [loggedIn, setLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMarketplacePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';

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
      alert('Please log in to view your listings.');
      navigate('/login');
      return;
    }
    if (setShowMyListingsOnly) {
      setShowMyListingsOnly(!showMyListingsOnly);
    }
  };

  const handleAddListingClick = () => {
    if (!loggedIn) {
      alert('Please log in to create a listing.');
      navigate('/login');
      return;
    }
    if (onAddListing) {
      onAddListing();
    }
  };

  return (
    <nav className="flex justify-between items-center px-4 sm:px-8 py-4 border-b border-border/50 bg-white">
      {/* Logo on the left - hidden on login page */}
      {!isLoginPage && (
        <h1 
          onClick={() => navigate('/')}
          className="text-lg sm:text-xl font-semibold text-[#002F6C] cursor-pointer hover:opacity-70 transition-opacity"
        >
          GUS MARKETPLACE
        </h1>
      )}
      
      {/* Buttons on the right */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
        {isMarketplacePage && setShowMyListingsOnly && (
          <Button 
            variant="ghost"
            onClick={handleMyListingsClick}
            className={`text-sm ${showMyListingsOnly ? 'text-[#002F6C] font-medium' : 'text-muted-foreground'}`}
          >
            My Listings
          </Button>
        )}
        {isMarketplacePage && onAddListing && (
          <Button 
            onClick={handleAddListingClick}
            className="bg-[#002F6C] hover:bg-[#004080] text-white text-sm h-9"
          >
            + Add Listing
          </Button>
        )}
        {!loggedIn && !isLoginPage && (
          <Button 
            onClick={() => navigate('/login')}
            variant="ghost"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Login
          </Button>
        )}
        {loggedIn && (
          <Button 
            variant="ghost"
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Logout
          </Button>
        )}
      </div>
    </nav>
  );
}
