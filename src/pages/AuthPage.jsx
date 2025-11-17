import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Auth from '../components/Auth';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/', { replace: true });
      }
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/', { replace: true });
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);

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
        <Auth onAuth={() => navigate('/')} />
        <div className="text-center space-y-2">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
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
