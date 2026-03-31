import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInsights } from '../hooks/useInsights';
import { useCategories } from '../contexts/CategoryContext';
import { formatCurrency } from '../utils/currency';
import { Activity, ShieldCheck, Repeat, AlertCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const CHART_COLORS = [
  "#54A0FF", "#00D2D3", "#FF9F43", "#FF6B6B", "#5F27CD", "#FF6B9D", "#2ED573", "#A0A0B0"
];

function DonutChart({ data, size = 160 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  let currentAngle = 0;
  const gradientStops = data.map(segment => {
    const percent = segment.value / total;
    const startAngle = currentAngle;
    const endAngle = currentAngle + (percent * 360);
    currentAngle = endAngle;
    return `${segment.color} ${startAngle}deg ${endAngle}deg`;
  }).join(', ');

  const strokeWidth = size * 0.18;
  const innerSize = size - (strokeWidth * 2);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* The CSS Conic Gradient defining perfectly sliced pie segments native to the browser */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `conic-gradient(${gradientStops})`,
        }}
      />
      
      {/* The inner Donut hole */}
      <div
        style={{
          position: "absolute",
          top: strokeWidth,
          left: strokeWidth,
          width: innerSize,
          height: innerSize,
          borderRadius: "50%",
          backgroundColor: "var(--card-bg)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span style={{ color: "var(--text-tertiary)", fontSize: "0.75rem", fontWeight: 600 }}>Total</span>
        <span style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: "800" }}>
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}

export default function Insights() {
  const { user } = useAuth();
  const userId = user?.id || '';
  const { summary, topCategories, weeklyComparison, lifetimeStats, advancedInsights, loading, loadInsights } = useInsights(userId);
  const { getCategoryByKey, getCategoryByLabel } = useCategories();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleString("default", { month: "long" });

  useEffect(() => {
    if (userId) {
      loadInsights(currentMonth, currentYear);
    }
  }, [userId, currentMonth, currentYear]);

  if (loading && !summary.totalIncome && !summary.totalExpenses) {
    return <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>Loading insights...</div>;
  }

  const savings = summary.totalIncome - summary.totalExpenses;
  const totalFlow = summary.totalIncome + summary.totalExpenses;
  const incomeBarFlex = totalFlow > 0 ? summary.totalIncome / totalFlow : 0.5;
  const expenseBarFlex = totalFlow > 0 ? summary.totalExpenses / totalFlow : 0.5;

  // Prepare donut chart data
  const rawDonutData = topCategories.map((cat, idx) => {
    const catInfo = getCategoryByLabel(cat.category) || getCategoryByKey(cat.category);
    return {
      label: catInfo?.label || cat.category,
      value: cat.total,
      color: catInfo?.color || CHART_COLORS[idx % CHART_COLORS.length],
    };
  });

  // Consolidate legacy duplicates resolving to the exact same label
  const donutMap = {};
  rawDonutData.forEach(item => {
    if (donutMap[item.label]) {
      donutMap[item.label].value += item.value;
    } else {
      donutMap[item.label] = { ...item };
    }
  });
  const donutData = Object.values(donutMap).sort((a, b) => b.value - a.value);

  // Progress bar logic: % of income spent
  const percentageSpent = summary.totalIncome > 0
      ? Math.min((summary.totalExpenses / summary.totalIncome) * 100, 100)
      : summary.totalExpenses > 0 ? 100 : 0;

  let progressColor = "var(--primary)"; // Purple mapped default
  if (percentageSpent > 75) progressColor = "var(--danger)"; // Red
  else if (percentageSpent > 50) progressColor = "var(--warning)"; // Yellow

  // Advanced Metrics Calculations
  const dayOfMonth = now.getDate();
  const avgDailySpend = summary.totalExpenses / (dayOfMonth || 1);
  const totalSavingsRate = summary.totalIncome > 0 ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100 : 0;

  const freqCategoryObj = advancedInsights?.frequentCategory 
    ? (getCategoryByLabel(advancedInsights.frequentCategory.category) || getCategoryByKey(advancedInsights.frequentCategory.category)) 
    : null;

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="glass-header">
        <div>
          <h1>Statistics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{monthName} {currentYear}</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Month Progress: % Income Spent */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.5px' }}>BUDGET USED</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{percentageSpent.toFixed(0)}% of Income</span>
          </div>
          <div style={{ height: 10, backgroundColor: 'var(--border)', borderRadius: 5, marginBottom: '0.5rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', backgroundColor: progressColor, borderRadius: 5, width: `${percentageSpent}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>0%</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>100%</span>
          </div>
        </div>

        {/* Advanced Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <Activity size={18} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatCurrency(avgDailySpend)}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Avg. Daily Spend</div>
          </div>

          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} color={totalSavingsRate > 0 ? "var(--success)" : "var(--danger)"} />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{totalSavingsRate.toFixed(1)}%</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Savings Rate</div>
          </div>

          {advancedInsights?.frequentCategory && (
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <Repeat size={18} color={freqCategoryObj?.color || "var(--text-secondary)"} />
                <span style={{ fontSize: '1rem', fontWeight: 700, color: freqCategoryObj?.color || "white" }}>
                  {advancedInsights.frequentCategory.count}x
                </span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{freqCategoryObj?.label || 'Unknown'}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Most Frequent</div>
            </div>
          )}

          {advancedInsights?.largestTransaction && (
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <AlertCircle size={18} color="var(--danger)" />
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: "var(--danger)" }}>
                {formatCurrency(advancedInsights.largestTransaction.amount)}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Largest ({(() => {
                  if (!advancedInsights.largestTransaction.date) return '';
                  const parts = advancedInsights.largestTransaction.date.split('T')[0].split('-');
                  return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
                })()})
              </div>
            </div>
          )}
        </div>

        {/* Cash Flow */}
        <div className="card">
          <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '1.5rem' }}>CASH FLOW</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', backgroundColor: 'var(--border)' }}>
                <div style={{ backgroundColor: 'var(--primary)', flex: incomeBarFlex }} />
                <div style={{ flex: 1 - incomeBarFlex }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'var(--primary)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatCurrency(summary.totalIncome)} Earned</span>
              </div>

              <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', backgroundColor: 'var(--border)' }}>
                <div style={{ backgroundColor: 'var(--danger)', flex: expenseBarFlex }} />
                <div style={{ flex: 1 - expenseBarFlex }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'var(--danger)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatCurrency(summary.totalExpenses)} Spent</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: savings < 0 ? 'var(--danger)' : 'var(--primary)' }}>
                {formatCurrency(savings)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>Net</span>
            </div>
          </div>
        </div>

        {/* Spending Donut Chart */}
        {topCategories.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.5px' }}>SPENDING</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{monthName} {currentYear}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <DonutChart data={donutData} size={150} />
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {donutData.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
                    <span style={{ fontSize: '0.875rem', flex: 1 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All-Time Portfolio */}
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', padding: '0 0.5rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.5px' }}>LIFETIME PORTFOLIO</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Since account creation</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <ArrowDownCircle size={28} color="var(--primary)" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(lifetimeStats?.totalIncome || 0)}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>Total Income</div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <ArrowUpCircle size={28} color="var(--danger)" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(lifetimeStats?.totalExpenses || 0)}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>Total Expenses</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
