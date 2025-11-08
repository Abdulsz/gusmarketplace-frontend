import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Box, Button, TextField, Typography } from '@mui/material';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we have the necessary tokens in the URL
    const accessToken = searchParams.get('access_token');
    if (!accessToken) {
      setMessage('Invalid or expired reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) throw error;
      
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setMessage(err.message ?? 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 6, p: 3, borderRadius: 2, boxShadow: '0 6px 20px rgba(0,0,0,0.08)', bgcolor: '#fff' }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
        Reset Your Password
      </Typography>
      <Box component="form" onSubmit={handleResetPassword} sx={{ display: 'grid', gap: 2 }}>
        <TextField 
          label="New Password" 
          type="password" 
          value={password} 
          onChange={(e)=>setPassword(e.target.value)} 
          required
          fullWidth 
        />
        <TextField 
          label="Confirm New Password" 
          type="password" 
          value={confirmPassword} 
          onChange={(e)=>setConfirmPassword(e.target.value)} 
          required
          fullWidth 
        />
        <Button
          disabled={loading}
          type="submit"
          variant="contained"
          sx={{
            py: 1.2,
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: '#1976d2',
            '&:hover': { bgcolor: '#1565c0', transform: 'translateY(-1px)' },
            transition: 'all .15s ease',
          }}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
        <Button
          variant="text"
          onClick={() => navigate('/login')}
          sx={{ textTransform: 'none', color: '#1976d2' }}
        >
          Back to Login
        </Button>
      </Box>
      {message && (
        <Typography 
          variant="body2" 
          sx={{ 
            mt: 2, 
            color: message.includes('successful') ? '#2e7d32' : '#d32f2f',
            textAlign: 'center'
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}

