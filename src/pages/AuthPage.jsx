'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Auth from '../components/Auth';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/');
      }
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#002F6C] to-[#004080] bg-clip-text text-transparent">
            Welcome to Gus Marketplace
          </h1>
          <p className="text-muted-foreground">
            Augustana College Marketplace
          </p>
        </div>
        <Auth onAuth={() => router.push('/')} />
        <div className="text-center space-y-2">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="w-full"
          >
            Browse as Guest
          </Button>
          <p className="text-sm text-muted-foreground">
            Continue without logging in to view listings
          </p>
        </div>
      </div>
    </div>
  );
}
