'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        // Validate email domain for signup
        if (!email.toLowerCase().endsWith('@augustana.edu')) {
          setMessage('Only @augustana.edu email addresses are allowed to create accounts.');
          setLoading(false);
          return;
        }
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
          },
        });
        
        if (error) {
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
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`,
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
    <div className="w-full max-w-md mx-auto bg-[#001a3d]/70 backdrop-blur-xl rounded-2xl px-8 py-8 shadow-2xl border border-white/20">
      <div className="space-y-1 pb-6">
        <h2 className="text-2xl font-semibold text-center text-white">
          {mode === 'signup' ? 'Create Account' : mode === 'reset' ? 'Reset Password' : 'Welcome Back'}
        </h2>
        <p className="text-center text-white/70 text-sm">
          {mode === 'signup' ? 'Sign up with your @augustana.edu email to start buying and selling' : mode === 'reset' ? 'Enter your email to reset your password' : 'Sign in to your account'}
        </p>
      </div>
      <div>
        {mode !== 'reset' && (
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={mode === 'signin' ? 'default' : 'ghost'}
              className={`flex-1 ${
                mode === 'signin' 
                  ? 'bg-white/15 hover:bg-white/25 text-white border-white/20' 
                  : 'text-white/70 hover:text-white hover:bg-white/10 border-white/10'
              }`}
              onClick={() => {
                setMode('signin');
                setMessage('');
                setPassword('');
              }}
            >
              Sign In
            </Button>
            <Button
              type="button"
              variant={mode === 'signup' ? 'default' : 'ghost'}
              className={`flex-1 ${
                mode === 'signup' 
                  ? 'bg-white/15 hover:bg-white/25 text-white border-white/20' 
                  : 'text-white/70 hover:text-white hover:bg-white/10 border-white/10'
              }`}
              onClick={() => {
                setMode('signup');
                setMessage('');
                setPassword('');
              }}
            >
              Sign Up
            </Button>
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/90">Email{mode === 'signup' && ' (@augustana.edu)'}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={mode === 'signup' ? 'your.name@augustana.edu' : 'Enter your email'}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
            />
          </div>
          {mode !== 'reset' && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
              />
            </div>
          )}
          {(mode === 'signup' || mode === 'signin') && (
            <p className="text-xs text-white/70 text-center px-2">
              By continuing, you agree to bear full responsibility for the exchange of sold items.
            </p>
          )}
          <Button
            disabled={loading}
            type="submit"
            className="w-full bg-white/15 hover:bg-white/25 text-white border-white/20"
          >
            {loading ? 'Please wait...' : (
              mode === 'signup' ? 'Sign up' : 
              mode === 'reset' ? 'Send Reset Link' : 
              'Sign In'
            )}
          </Button>
          {mode === 'signin' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-white/70 hover:text-white hover:bg-white/10 mt-2"
              onClick={() => {
                setMode('reset');
                setMessage('');
                setPassword('');
              }}
            >
              Forgot your password?
            </Button>
          )}
          {mode === 'reset' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-white/70 hover:text-white hover:bg-white/10 mt-2"
              onClick={() => {
                setMode('signin');
                setMessage('');
                setPassword('');
              }}
            >
              Back to Sign In
            </Button>
          )}
        </form>
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('successful') || message.includes('sent') 
              ? 'bg-white/10 border border-white/20' 
              : 'bg-red-500/20 border border-red-500/40'
          }`}>
            <p className={`text-sm ${
              message.includes('successful') || message.includes('sent') 
                ? 'text-white' 
                : 'text-red-200'
            }`}>
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
