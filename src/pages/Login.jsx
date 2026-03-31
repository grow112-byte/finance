import { useState } from 'react';
import { supabase } from '../services/supabase';
import { BarChart, Wallet, PieChart } from 'lucide-react';
import './Login.css'; // Let's reuse index.css global tokens but add a few specific layouts

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let authError = null;
    
    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      authError = signUpError;
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      authError = signInError;
    }

    if (authError) {
      setError(authError.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-visual-section">
        <div className="brand-hero animate-fade-in">
          <div className="brand-logo-container">
            <img src="/logo.png" alt="Finance Logo" className="login-hero-logo" />
          </div>
          <h1>Finance Tracker</h1>
          <p>Online. Fast. Professional.</p>
        </div>
      </div>

      <div className="login-form-section">
        <div className="card login-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2>{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
          
          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleAuth}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input 
                id="email"
                type="email" 
                className="form-input" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input 
                id="password"
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full" 
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button 
              className="btn btn-ghost"
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              style={{ padding: '0 0.5rem', textDecoration: 'underline' }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
