import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Auth } from './pages/Auth/Auth';
import { Onboarding } from './pages/Onboarding/Onboarding';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Landing } from './pages/Landing/Landing';

import { Clients } from './pages/Clients/Clients';
import { Invoices } from './pages/Invoices/Invoices';
import { InvoiceDetails } from './pages/Invoices/InvoiceDetails';
import { Settings } from './pages/Settings/Settings';


function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { error } = await supabase.auth.getUser();
          if (error) {
            await supabase.auth.signOut();
            setSession(null);
          } else {
            setSession(session);
          }
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Fetch and apply branding
    const fetchBranding = async () => {
      try {
        const { data } = await supabase.from('app_settings').select('app_name, primary_color').single();
        if (data) {
          document.title = data.app_name || 'Leady';
          document.documentElement.style.setProperty('--primary', data.primary_color || '#2563eb');
        }
      } catch (err) {
        console.error('Failed to fetch branding:', err);
      }
    };
    fetchBranding();

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading Leady...</p>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="setup-screen glass" style={{ maxWidth: '600px', margin: '100px auto', padding: '40px', borderRadius: '20px' }}>
        <h1>Connect to Supabase</h1>
        <p>It looks like your Supabase connection isn't set up yet. Follow these steps to get started:</p>
        <div className="setup-steps">
          <p>1. Create a project at <code>app.supabase.com</code></p>
          <p>2. Copy your <b>Project URL</b> and <b>Anon Key</b></p>
          <p>3. Add them to your <code>.env</code> file:</p>
          <pre style={{ background: '#f1f5f9', padding: '15px', borderRadius: '10px', marginTop: '10px', fontSize: '14px' }}>
            VITE_SUPABASE_URL=your-project-url<br />
            VITE_SUPABASE_ANON_KEY=your-anon-key
          </pre>
          <p>4. Restart the development server.</p>
        </div>
        <button className="btn btn-primary" style={{ marginTop: '30px' }} onClick={() => window.location.reload()}>
          Check Connection Again
        </button>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/dashboard" />} />
        
        <Route element={session ? <Layout /> : <Navigate to="/auth" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/:id" element={<InvoiceDetails />} />
          <Route path="/settings" element={<Settings />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;





