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
    <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center sm:justify-start px-3 sm:px-4 py-6 sm:pt-[12vh] sm:pb-12">
      <div className="w-full max-w-sm sm:max-w-md space-y-4 sm:space-y-8">
        <div className="text-center space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#002F6C]">
            GUS Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Augustana College Student Marketplace
          </p>
        </div>
        <Auth onAuth={() => router.push('/')} />
        <div className="text-center space-y-2 sm:space-y-3 pt-2 sm:pt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="w-full text-muted-foreground hover:text-foreground text-sm sm:text-base"
          >
            Continue as Guest
          </Button>
        </div>
      </div>
    </div>
  );
}
