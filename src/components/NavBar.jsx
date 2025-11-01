import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function NavBar() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setLoggedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!loggedIn) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 12, borderBottom: '1px solid #eee' }}>
      <button
        onClick={handleLogout}
        style={{
          padding: '8px 14px',
          borderRadius: 8,
          border: '1px solid #ddd',
          background: '#fff',
          cursor: 'pointer',
          transition: 'all .15s ease',
        }}
        onMouseOver={(e)=>{ e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'; }}
        onMouseOut={(e)=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
      >
        Log out
      </button>
    </div>
  );
}


