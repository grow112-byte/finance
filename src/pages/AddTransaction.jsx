import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../contexts/CategoryContext';
import { useNavigate } from 'react-router-dom';

export default function AddTransaction() {
  const { user } = useAuth();
  const { expenseCategories, incomeCategories } = useCategories();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: expenseCategories[0]?.label || 'Food & Dining',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const generateUUID = () => {
    return crypto.randomUUID(); // Web standard native UUID generator
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('transactions').insert([{
        id: generateUUID(),
        user_id: user.id,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        note: formData.note || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

      if (error) throw error;
      
      // Auto-navigate to dashboard upon successful add
      navigate('/');
    } catch (err) {
      console.error('Error adding transaction:', err);
      alert('Error occurred adding transaction. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="glass-header">
        <h1>Add Transaction</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input 
              type="number" 
              step="0.01" 
              className="form-input" 
              required
              placeholder="Amount"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <button 
              type="button" 
              onClick={() => setFormData({ ...formData, type: 'expense', category: expenseCategories[0]?.label })}
              className={`btn ${formData.type === 'expense' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ backgroundColor: formData.type === 'expense' ? 'var(--danger)' : 'transparent', border: formData.type === 'expense' ? 'none' : '1px solid var(--border)' }}
            >Expense</button>
            <button 
              type="button" 
              onClick={() => setFormData({ ...formData, type: 'income', category: incomeCategories[0]?.label })}
              className={`btn ${formData.type === 'income' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ backgroundColor: formData.type === 'income' ? 'var(--success)' : 'transparent', border: formData.type === 'income' ? 'none' : '1px solid var(--border)' }}
            >Income</button>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              className="form-input" 
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              {(formData.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                <option key={cat.key} value={cat.label}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <input 
              type="date" 
              className="form-input" 
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Note (Optional)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="What was this for?"
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}
