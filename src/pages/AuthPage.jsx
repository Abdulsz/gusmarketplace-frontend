import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Auth from '../components/Auth';
import { supabase } from '../lib/supabaseClient';
import { Box, Button, Typography } from '@mui/material';

export default function AuthPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/', { replace: true });
      }
    });
    
    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/', { replace: true });
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <Box sx={{ px: { xs: 2, sm: 0 }, py: { xs: 2, sm: 4 } }}>
      <Typography 
        variant="h3" 
        sx={{ 
          textAlign: 'center', 
          mb: { xs: 3, sm: 4 }, 
          fontWeight: 700, 
          color: '#1976d2',
          fontSize: { xs: '1.75rem', sm: '2.125rem', md: '3rem' },
          px: { xs: 2, sm: 0 }
        }}
      >
        Welcome to Gus Marketplace
      </Typography>
      <Auth onAuth={() => navigate('/')} />
      <Box sx={{ maxWidth: 420, mx: 'auto', mt: { xs: 2, sm: 3 }, textAlign: 'center', px: { xs: 2, sm: 0 } }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/')}
          sx={{
            minWidth: { xs: '100%', sm: '200px' },
            py: { xs: 1, sm: 1.2 },
            textTransform: 'none',
            fontWeight: 600,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            borderColor: '#1976d2',
            color: '#1976d2',
            '&:hover': { 
              borderColor: '#1565c0',
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              transform: 'translateY(-1px)'
            },
            transition: 'all .15s ease',
          }}
        >
          Browse as Guest
        </Button>
        <Typography 
          variant="body2" 
          sx={{ 
            mt: 2, 
            color: '#666',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          Continue without logging in to view listings
        </Typography>
      </Box>
    </Box>
  );
}


