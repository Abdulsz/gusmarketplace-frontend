'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState('Completing verification…');

  useEffect(() => {
    async function run() {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) throw error;
        if (data.session) {
          setMessage('Email verified! Redirecting…');
          setTimeout(()=> router.push('/'), 800);
        } else {
          setMessage('Verified. Please log in.');
          setTimeout(()=> router.push('/login'), 1000);
        }
      } catch (e) {
        setMessage('Verification failed. Please log in.');
        setTimeout(()=> router.push('/login'), 1200);
      }
    }
    run();
  }, [router]);

  return <p style={{textAlign:'center', marginTop: 40}}>{message}</p>
}


