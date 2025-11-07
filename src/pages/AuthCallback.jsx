import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Completing verification…');

  useEffect(() => {
    async function run() {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) throw error;
        if (data.session) {
          setMessage('Email verified! Redirecting…');
          setTimeout(()=> navigate('/'), 800);
        } else {
          setMessage('Verified. Please log in.');
          setTimeout(()=> navigate('/login'), 1000);
        }
      } catch (e) {
        setMessage('Verification failed. Please log in.');
        setTimeout(()=> navigate('/login'), 1200);
      }
    }
    run();
  }, [navigate]);

  return <p style={{textAlign:'center', marginTop: 40}}>{message}</p>
}


