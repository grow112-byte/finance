import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

export function useInsights(userId) {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [topCategories, setTopCategories] = useState([]);
  const [weeklyComparison, setWeeklyComparison] = useState({ thisWeek: 0, lastWeek: 0, percentChange: 0 });
  const [lifetimeStats, setLifetimeStats] = useState({ totalIncome: 0, totalExpenses: 0 });
  const [advancedInsights, setAdvancedInsights] = useState({ largestTransaction: null, frequentCategory: null });
  const [loading, setLoading] = useState(false);

  const loadInsights = useCallback(async (month, year) => {
    setLoading(true);
    try {
      // Boundaries for current month
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endMonth = month === 12 ? 1 : month + 1;
      const endYear = month === 12 ? year + 1 : year;
      const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

      // 1. Fetch ALL time data (efficient for small/medium users, otherwise pagination/rpc needed)
      // Since this is parity, we pull what's needed for the user
      const { data: allTx, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) throw error;
      const txs = allTx || [];

      // 2. Filter for current month
      const monthTxs = txs.filter(t => t.date >= startDate && t.date < endDate);

      // --- SUMMARY ---
      let income = 0, expenses = 0;
      const catSpend = {};
      let largestTx = null;
      const catCount = {};

      monthTxs.forEach(tx => {
        if (tx.type === 'income') {
          income += tx.amount;
        } else if (tx.type === 'expense') {
          expenses += tx.amount;
          
          // top categories
          catSpend[tx.category] = (catSpend[tx.category] || 0) + tx.amount;
          
          // frequent categories
          catCount[tx.category] = (catCount[tx.category] || 0) + 1;

          // largest transaction
          if (!largestTx || tx.amount > largestTx.amount) {
            largestTx = tx;
          }
        }
      });

      setSummary({ totalIncome: income, totalExpenses: expenses, balance: income - expenses });

      // --- TOP CATEGORIES ---
      const sortedCats = Object.entries(catSpend)
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total);
      setTopCategories(sortedCats);

      // --- ADVANCED INSIGHTS ---
      let freqCat = null;
      let maxCount = 0;
      for (const [cat, count] of Object.entries(catCount)) {
        if (count > maxCount) {
          maxCount = count;
          freqCat = { category: cat, count };
        }
      }
      setAdvancedInsights({ largestTransaction: largestTx, frequentCategory: freqCat });

      // --- LIFETIME STATS ---
      let lifeInc = 0, lifeExp = 0;
      txs.forEach(tx => {
        if (tx.type === 'income') lifeInc += tx.amount;
        if (tx.type === 'expense') lifeExp += tx.amount;
      });
      setLifetimeStats({ totalIncome: lifeInc, totalExpenses: lifeExp });

      // --- WEEKLY COMPARISON ---
      // (Simplified logic for web parity: looking backward 7 days vs previous 7)
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let thisWeekSpend = 0;
      let lastWeekSpend = 0;

      txs.forEach(tx => {
        if (tx.type === 'expense') {
          if (tx.date >= oneWeekAgo) thisWeekSpend += tx.amount;
          else if (tx.date >= twoWeeksAgo && tx.date < oneWeekAgo) lastWeekSpend += tx.amount;
        }
      });

      let percentChange = 0;
      if (lastWeekSpend > 0) {
        percentChange = ((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100;
      }
      setWeeklyComparison({ thisWeek: thisWeekSpend, lastWeek: lastWeekSpend, percentChange });

    } catch (err) {
      console.error('Insights load error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { summary, topCategories, weeklyComparison, lifetimeStats, advancedInsights, loading, loadInsights };
}
