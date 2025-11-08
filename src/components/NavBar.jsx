import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Box, Button, Stack, Typography } from '@mui/material';
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
    <Box sx={{ 
      display: 'flex', 
      justifyContent: isLoginPage ? 'flex-end' : 'space-between', 
      alignItems: 'center',
      padding: { xs: 1.5, sm: 2 }, 
      borderBottom: '1px solid #E0E0E0',
      background: '#FFFFFF',
      flexWrap: { xs: 'wrap', sm: 'nowrap' },
      gap: { xs: 1, sm: 0 },
    }}>
      {/* Logo on the left - hidden on login page */}
      {!isLoginPage && (
        <Typography 
          variant="h5" 
          component="div"
          onClick={() => navigate('/')}
          sx={{ 
            fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
            fontWeight: 700,
            color: '#007BFF',
            fontFamily: '"Poppins", "Inter", sans-serif',
            letterSpacing: '0.02em',
            cursor: 'pointer',
            flex: { xs: '1 1 auto', sm: '0 0 auto' },
            '&:hover': {
              opacity: 0.8,
            }
          }}
        >
          GUS MARKETPLACE
        </Typography>
      )}
      
      {/* Buttons on the right */}
      <Stack 
        direction="row" 
        spacing={{ xs: 1, sm: 2 }} 
        alignItems="center"
        sx={{ 
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          justifyContent: { xs: 'flex-end', sm: 'flex-start' },
          width: { xs: '100%', sm: 'auto' },
          mt: { xs: isLoginPage ? 0 : 1, sm: 0 },
        }}
      >
        {isMarketplacePage && setShowMyListingsOnly && (
          <Button 
            variant={showMyListingsOnly ? "contained" : "outlined"} 
            onClick={handleMyListingsClick}
            sx={{ 
              minWidth: { xs: 'auto', sm: '120px' },
              backgroundColor: showMyListingsOnly ? '#007BFF' : 'transparent',
              border: showMyListingsOnly ? 'none' : '1px solid #E0E0E0',
              color: showMyListingsOnly ? '#ffffff' : '#555',
              fontWeight: 500,
              textTransform: 'none',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontFamily: '"Roboto", "Open Sans", sans-serif',
              px: { xs: 1.5, sm: 2.5 },
              py: { xs: 0.5, sm: 0.75 },
              borderRadius: '6px',
              boxShadow: showMyListingsOnly ? '0 1px 3px rgba(0, 123, 255, 0.3)' : 'none',
              transition: 'all 0.2s ease',
              '&:hover': { 
                backgroundColor: showMyListingsOnly ? '#0056b3' : '#F5F5F5',
                borderColor: showMyListingsOnly ? '#0056b3' : '#D0D0D0',
                boxShadow: showMyListingsOnly ? '0 2px 6px rgba(0, 123, 255, 0.4)' : 'none',
              } 
            }}
          >
            My Listings
          </Button>
        )}
        {isMarketplacePage && onAddListing && (
          <Button 
            variant="contained" 
            onClick={handleAddListingClick}
            sx={{ 
              minWidth: { xs: 'auto', sm: '120px' },
              backgroundColor: '#007BFF',
              color: '#ffffff',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontFamily: '"Roboto", "Open Sans", sans-serif',
              px: { xs: 1.5, sm: 2.5 },
              py: { xs: 0.5, sm: 0.75 },
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(0, 123, 255, 0.3)',
              transition: 'all 0.2s ease',
              '&:hover': { 
                backgroundColor: '#0056b3',
                boxShadow: '0 2px 6px rgba(0, 123, 255, 0.4)',
              } 
            }}
          >
            + Add Listing
          </Button>
        )}
        {!loggedIn && !isLoginPage && (
          <Button 
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{ 
              minWidth: { xs: 'auto', sm: '100px' },
              backgroundColor: '#007BFF',
              color: '#ffffff',
              fontWeight: 500,
              textTransform: 'none',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontFamily: '"Roboto", "Open Sans", sans-serif',
              px: { xs: 1.5, sm: 2.5 },
              py: { xs: 0.5, sm: 0.75 },
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(0, 123, 255, 0.3)',
              transition: 'all 0.2s ease',
              '&:hover': { 
                backgroundColor: '#0056b3',
                boxShadow: '0 2px 6px rgba(0, 123, 255, 0.4)',
              } 
            }}
          >
            Login
          </Button>
        )}
        {loggedIn && (
          <Button 
            variant="outlined"
            onClick={handleLogout}
            sx={{ 
              minWidth: { xs: 'auto', sm: '100px' },
              backgroundColor: 'transparent',
              border: '1px solid #E0E0E0',
              color: '#555',
              fontWeight: 500,
              textTransform: 'none',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontFamily: '"Roboto", "Open Sans", sans-serif',
              px: { xs: 1.5, sm: 2.5 },
              py: { xs: 0.5, sm: 0.75 },
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              '&:hover': { 
                backgroundColor: '#F5F5F5',
                borderColor: '#D0D0D0',
              } 
            }}
          >
            Logout
          </Button>
        )}
      </Stack>
    </Box>
  );
}


