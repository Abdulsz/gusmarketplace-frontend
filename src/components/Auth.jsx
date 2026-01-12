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
    <Card className="w-full max-w-md mx-auto shadow-lg border-border/50">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-semibold text-center text-[#002F6C]">
          {mode === 'signup' ? 'Create Account' : mode === 'reset' ? 'Reset Password' : 'Welcome Back'}
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          {mode === 'signup' ? 'Sign up with your @augustana.edu email to start buying and selling' : mode === 'reset' ? 'Enter your email to reset your password' : 'Sign in to your account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mode !== 'reset' && (
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={mode === 'signin' ? 'default' : 'outline'}
              className={`flex-1 ${mode === 'signin' ? 'bg-[#002F6C] hover:bg-[#004080]' : ''}`}
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
              variant={mode === 'signup' ? 'default' : 'outline'}
              className={`flex-1 ${mode === 'signup' ? 'bg-[#002F6C] hover:bg-[#004080]' : ''}`}
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
            <Label htmlFor="email">Email{mode === 'signup' && ' (@augustana.edu)'}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={mode === 'signup' ? 'your.name@augustana.edu' : 'Enter your email'}
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
          <Button
            disabled={loading}
            type="submit"
            className="w-full bg-[#002F6C] hover:bg-[#004080] text-white"
          >
            {loading ? 'Please wait...' : (
              mode === 'signup' ? 'Create Account' : 
              mode === 'reset' ? 'Send Reset Link' : 
              'Sign In'
            )}
          </Button>
          {mode === 'signin' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground mt-2"
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
              className="w-full text-muted-foreground hover:text-foreground mt-2"
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
          <Alert variant={message.includes('successful') || message.includes('sent') ? 'default' : 'destructive'} className="mt-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
