import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, Loader2, User, CheckCircle2 } from 'lucide-react';
import './Auth.css';
import { useBranding } from '../../lib/BrandingContext';

export const Auth = () => {
  const { app_name, logo_url } = useBranding();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName
            }
          }
        });
        if (error) throw error;
        setSignupSuccess(true);
      }

    } catch (err: any) {
      console.error('Signup/Login error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="auth-page-split">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="logo logo-header">
            {logo_url ? (
              <img src={logo_url} alt="Logo" className="logo-img" />
            ) : (
              <div className="logo-icon">{app_name[0]}</div>
            )}
            <span className="logo-text">{app_name}</span>
          </div>
          
          {signupSuccess ? (
            <div className="success-screen" style={{ textAlign: 'center', padding: '20px 0', marginTop: 'auto', marginBottom: 'auto' }}>
              <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 20px auto' }} />
              <h2 style={{ marginBottom: '10px' }}>Check your email</h2>
              <p style={{ color: '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>
                We've sent a verification link to <strong style={{color: '#1e293b'}}>{email || 'your email address'}</strong>.<br/> 
                Please check your inbox to activate your account.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={() => {
                    setSignupSuccess(false);
                    setIsLogin(true);
                  }}
                >
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-form-container">
              <div className="auth-header">
                {isLogin ? (
                  <h1>Welcome back,<br/>please log in</h1>
                ) : (
                  <h1>Create an account,<br/>start today</h1>
                )}
                <p>{isLogin ? 'Sign in to manage your invoices' : 'Start your free trial today'}</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {!isLogin && (
                  <div className="name-grid">
                    <div className="input-group">
                      <label>First Name</label>
                      <div className="input-wrapper">
                        <User size={18} className="input-icon" />
                        <input 
                          type="text" 
                          placeholder="Victor" 
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Last Name</label>
                      <div className="input-wrapper">
                        <User size={18} className="input-icon" />
                        <input 
                          type="text" 
                          placeholder="Akpan" 
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="input-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input 
                      type="email" 
                      placeholder="victor@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div className="label-wrapper">
                    <label>Password</label>
                  </div>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                      <span>{isLogin ? 'Log in' : 'Sign Up'}</span>
                    )}
                  </button>
                  
                  {isLogin && (
                    <button type="button" className="forgot-password-link" onClick={(e) => e.preventDefault()}>
                      Forgot your password?
                    </button>
                  )}
                </div>
              </form>

              <div className="auth-footer">
                <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="btn-link">
                  {isLogin ? 'Create one now' : 'Sign in instead'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-right-content">
          <h2 className="brand-statement">Redefining invoicing<br/>for proper records.</h2>
          
          <div className="brand-graphic">
            <div className="graphic-block secondary-block"></div>
            <div className="graphic-block main-block"></div>
          </div>

          <div className="logo logo-footer">
            {logo_url ? (
              <img src={logo_url} alt="Logo" style={{ height: '32px' }} />
            ) : (
              <div className="logo-icon inverted">{app_name[0]}</div>
            )}
            <span className="logo-text inverted">{app_name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
