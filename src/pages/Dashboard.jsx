import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowDownRight, ArrowUpRight, Wallet, Activity } from 'lucide-react';
import { formatDateTime } from '../utils/formatDate';
import { formatCurrency } from '../utils/currency';
import './Dashboard.css';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .is('deleted_at', null);
      
      if (statsError) throw statsError;

      let income = 0;
      let expense = 0;
      if (statsData) {
        statsData.forEach(tx => {
          if (tx.type === 'income') income += tx.amount;
          else if (tx.type === 'expense') expense += tx.amount;
        });
      }

      setStats({
        income,
        expense,
        balance: income - expense
      });

      // Fetch recent transactions
      const { data: recent, error: recentError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;
      setRecentTx(recent || []);

    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Real-time integration
  useEffect(() => {
    const channel = supabase.channel('dashboard-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
        () => {
          // Refresh on any database change
          fetchDashboardData();
        }
      )
      .subscribe();
      
    return () => supabase.removeChannel(channel);
  }, [user]);

  if (loading) {
    return <div className="page-container" style={{ alignItems: 'center', marginTop: '4rem' }}>Loading data...</div>;
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="glass-header">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user.email?.split('@')[0]}</p>
        </div>
        <button onClick={signOut} className="btn btn-ghost">Sign Out</button>
      </div>

      <div className="stats-grid">
        <div className="stats-card balance">
          <div className="stats-header">
            <span className="stats-label">Total Balance</span>
            <Wallet size={20} opacity={0.7} />
          </div>
          <div className="stats-amount">{formatCurrency(stats.balance)}</div>
        </div>
        
        <div className="stats-card income">
          <div className="stats-header">
            <span className="stats-label">Income</span>
            <div className="icon-badge bg-success-alpha"><ArrowUpRight size={18} color="var(--success)" /></div>
          </div>
          <div className="stats-amount">{formatCurrency(stats.income)}</div>
        </div>
        
        <div className="stats-card expense">
          <div className="stats-header">
            <span className="stats-label">Expenses</span>
            <div className="icon-badge bg-danger-alpha"><ArrowDownRight size={18} color="var(--danger)" /></div>
          </div>
          <div className="stats-amount">{formatCurrency(stats.expense)}</div>
        </div>
      </div>

      <div className="card mt-2">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2>Recent Activity</h2>
          <Activity size={20} color="var(--text-tertiary)" />
        </div>
        
        {recentTx.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem 0' }}>No transactions yet.</p>
        ) : (
          <div className="transaction-list">
            {recentTx.map(tx => (
              <div key={tx.id} className="transaction-item">
                <div className="tx-info">
                  <div className={`icon-circle ${tx.type}`}>
                    {tx.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div>
                    <div className="tx-category">{tx.category}</div>
                    <div className="tx-date">{formatDateTime(tx.date, tx.created_at)}</div>
                  </div>
                </div>
                <div className={`tx-amount ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
