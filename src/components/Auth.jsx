import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Box, Button, TextField, ToggleButton, ToggleButtonGroup, Typography, Link } from '@mui/material';

export default function Auth({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'http://localhost:5173/auth/callback',
          },
        });
        
        if (error) {
          // Check for duplicate email error - Supabase returns various error messages for existing users
          if (error.message.includes('already registered') || 
              error.message.includes('User already registered') ||
              error.message.includes('already exists') ||
              error.message.includes('already been registered') ||
              error.message.includes('email address is already')) {
            setMessage('This email is already registered. Please sign in instead or use password reset if you forgot your password.');
          } else {
            throw error;
          }
          return;
        }
        setMessage('Sign up successful. Check your email to verify your account.');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'http://localhost:5173/auth/reset-password',
        });
        if (error) throw error;
        setMessage('Password reset email sent! Please check your inbox and follow the instructions to reset your password.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth?.(data.session ?? null);
      }
    } catch (err) {
      setMessage(err.message ?? 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 420, 
      mx: 'auto', 
      mt: { xs: 2, sm: 4, md: 6 }, 
      p: { xs: 2, sm: 3 }, 
      borderRadius: 2, 
      boxShadow: '0 6px 20px rgba(0,0,0,0.08)', 
      bgcolor: '#fff',
      width: { xs: '100%', sm: 'auto' }
    }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: { xs: 1.5, sm: 2 }, 
          textAlign: 'center', 
          fontWeight: 600,
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}
      >
        {mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset Password' : 'Welcome back'}
      </Typography>
      {mode !== 'reset' && (
        <ToggleButtonGroup
          color="primary"
          value={mode}
          exclusive
          onChange={(_e, v) => {
            if (v) {
              setMode(v);
              setMessage('');
              setPassword('');
            }
          }}
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton value="signin">Log In</ToggleButton>
          <ToggleButton value="signup">Sign Up</ToggleButton>
        </ToggleButtonGroup>
      )}
      <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
        <TextField 
          label="Email" 
          type="email" 
          value={email} 
          onChange={(e)=>setEmail(e.target.value)} 
          required
          fullWidth 
        />
        {mode !== 'reset' && (
          <TextField 
            label="Password" 
            type="password" 
            value={password} 
            onChange={(e)=>setPassword(e.target.value)} 
            required
            fullWidth 
          />
        )}
        {mode === 'reset' && (
          <Button
            variant="text"
            onClick={() => {
              setMode('signin');
              setMessage('');
              setPassword('');
            }}
            sx={{ textTransform: 'none', alignSelf: 'flex-start', color: '#1976d2' }}
          >
            ← Back to Sign In
          </Button>
        )}
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
          {loading ? 'Please wait…' : (
            mode === 'signup' ? 'Create account' : 
            mode === 'reset' ? 'Send Reset Link' : 
            'Log in'
          )}
        </Button>
        {mode === 'signin' && (
          <Link
            component="button"
            type="button"
            onClick={() => {
              setMode('reset');
              setMessage('');
              setPassword('');
            }}
            sx={{
              textAlign: 'center',
              textDecoration: 'none',
              color: '#1976d2',
              fontSize: '0.875rem',
              '&:hover': { textDecoration: 'underline' },
              cursor: 'pointer',
            }}
          >
            Forgot your password?
          </Link>
        )}
      </Box>
      {message && (
        <Typography 
          variant="body2" 
          sx={{ 
            mt: 2, 
            color: message.includes('successful') || message.includes('sent') ? '#2e7d32' : '#d32f2f',
            textAlign: 'center'
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}


