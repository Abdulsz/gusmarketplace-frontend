'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-[#002F6C] to-[#004080] bg-clip-text text-transparent">
          {mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset Password' : 'Welcome back'}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === 'signup' ? 'Sign up to start selling' : mode === 'reset' ? 'Enter your email to reset password' : 'Sign in to your account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mode !== 'reset' && (
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant={mode === 'signin' ? 'default' : 'outline'}
              className={`flex-1 ${mode === 'signin' ? '' : 'hover:bg-accent'}`}
              onClick={() => {
                setMode('signin');
                setMessage('');
                setPassword('');
              }}
            >
              Log In
            </Button>
            <Button
              type="button"
              variant={mode === 'signup' ? 'default' : 'outline'}
              className={`flex-1 ${mode === 'signup' ? '' : 'hover:bg-accent'}`}
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          {mode !== 'reset' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
          )}
          {mode === 'reset' && (
            <Button
              type="button"
              variant="ghost"
              className="w-full text-primary"
              onClick={() => {
                setMode('signin');
                setMessage('');
                setPassword('');
              }}
            >
              ← Back to Sign In
            </Button>
          )}
          <Button
            disabled={loading}
            type="submit"
            className="w-full bg-[#002F6C] hover:bg-[#004080] text-white"
          >
            {loading ? 'Please wait…' : (
              mode === 'signup' ? 'Create account' : 
              mode === 'reset' ? 'Send Reset Link' : 
              'Log in'
            )}
          </Button>
          {mode === 'signin' && (
            <Button
              type="button"
              variant="link"
              className="w-full text-primary"
              onClick={() => {
                setMode('reset');
                setMessage('');
                setPassword('');
              }}
            >
              Forgot your password?
            </Button>
          )}
        </form>
        {message && (
          <Alert variant={message.includes('successful') || message.includes('sent') ? 'default' : 'destructive'} className="mt-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
