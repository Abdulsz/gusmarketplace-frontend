import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Box, Button, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

export default function Auth({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
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
        if (error) throw error;
        setMessage('Sign up successful. Check your email to verify your account.');
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
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 6, p: 3, borderRadius: 2, boxShadow: '0 6px 20px rgba(0,0,0,0.08)', bgcolor: '#fff' }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
        {mode === 'signup' ? 'Create your account' : 'Welcome back'}
      </Typography>
      <ToggleButtonGroup
        color="primary"
        value={mode}
        exclusive
        onChange={(_e, v) => v && setMode(v)}
        fullWidth
        sx={{ mb: 2 }}
      >
        <ToggleButton value="signin">Log In</ToggleButton>
        <ToggleButton value="signup">Sign Up</ToggleButton>
      </ToggleButtonGroup>
      <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
        <TextField label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} fullWidth />
        <TextField label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} fullWidth />
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
          {loading ? 'Please wait…' : (mode === 'signup' ? 'Create account' : 'Log in')}
        </Button>
      </Box>
      {message && <Typography variant="body2" sx={{ mt: 2, color: '#444' }}>{message}</Typography>}
    </Box>
  );
}


