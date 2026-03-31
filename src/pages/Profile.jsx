import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogOut, Info } from 'lucide-react';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setMessage({ type: 'error', text: 'Please fill out all fields.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordLoading(true);
    setMessage({ type: '', text: '' });

    // Verify current by re-auth
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (authError) {
      setMessage({ type: 'error', text: 'Current password is incorrect.' });
      setPasswordLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    setPasswordLoading(false);

    if (updateError) {
      setMessage({ type: 'error', text: updateError.message });
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div className="glass-header">
        <div>
          <h1>Profile</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your account</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* User Info Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'var(--primary-alpha)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={28} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{user?.email}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Joined {joinDate}</div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Lock size={18} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Change Password</h3>
          </div>
          
          {message.text && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1rem', 
              backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(54, 211, 153, 0.1)',
              color: message.type === 'error' ? 'var(--danger)' : 'var(--success)'
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <input 
                type="password" 
                className="form-input" 
                placeholder="Current password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input 
                type="password" 
                className="form-input" 
                placeholder="New password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input 
                type="password" 
                className="form-input" 
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn" style={{ backgroundColor: 'var(--primary-alpha)', color: 'var(--text-primary)' }} disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* App Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Info size={18} color="var(--text-tertiary)" />
            <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>App Info</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Version</span>
            <span style={{ fontWeight: 500 }}>2.0.0 (Web)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Environment</span>
            <span style={{ fontWeight: 500 }}>React + Vite Online</span>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={signOut}
          className="btn" 
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            color: 'var(--danger)', 
            border: '1px solid rgba(239, 68, 68, 0.3)',
            marginTop: '1rem' 
          }}
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </div>
  );
}
