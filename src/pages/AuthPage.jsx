import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Auth from '../components/Auth';
import { supabase } from '../lib/supabaseClient';

export default function AuthPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/app');
    })
  }, [navigate]);

  return (
    <div>
      <h1 style={{textAlign:'center'}}>Welcome to Gus Marketplace</h1>
      <Auth onAuth={() => navigate('/app')} />
    </div>
  );
}


