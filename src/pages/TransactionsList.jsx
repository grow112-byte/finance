import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowDownRight, ArrowUpRight, Search, Filter } from 'lucide-react';
import { formatDateTime } from '../utils/formatDate';
import { formatCurrency } from '../utils/currency';
import './Dashboard.css'; // Reusing transaction CSS 

export default function TransactionsList() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'

  const fetchTransactions = async () => {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, filterType]);

  // Real-time updates
  useEffect(() => {
    const channel = supabase.channel('tx-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, () => {
        fetchTransactions();
      }).subscribe();
      
    return () => supabase.removeChannel(channel);
  }, [user, filterType]);

  return (
    <div className="page-container animate-fade-in">
      <div className="glass-header">
        <h1>Transaction History</h1>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ border: filterType === 'all' ? 'none' : '1px solid var(--border)' }}
            onClick={() => setFilterType('all')}
          >All</button>
          <button 
            className={`btn ${filterType === 'income' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ border: filterType === 'income' ? 'none' : '1px solid var(--border)' }}
            onClick={() => setFilterType('income')}
          >Income</button>
          <button 
            className={`btn ${filterType === 'expense' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ border: filterType === 'expense' ? 'none' : '1px solid var(--border)' }}
            onClick={() => setFilterType('expense')}
          >Expenses</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-tertiary)' }}>Loading...</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-tertiary)' }}>
            No transactions found.
          </div>
        ) : (
          <div className="transaction-list">
            {transactions.map(tx => (
              <div key={tx.id} className="transaction-item">
                <div className="tx-info">
                  <div className={`icon-circle ${tx.type}`}>
                    {tx.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div>
                    <div className="tx-category">{tx.category}</div>
                    <div className="tx-date">{formatDateTime(tx.date, tx.created_at)} {tx.note && `• ${tx.note}`}</div>
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
