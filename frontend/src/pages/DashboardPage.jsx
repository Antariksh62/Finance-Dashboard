import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
         ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Sidebar from '../components/layout/Sidebar';
import KPICard from '../components/ui/KPICard';
import api from '../services/api';

const COLORS = ['#01696f','#437a22','#006494','#d19900','#da7101','#a12c7b','#7a39bb'];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/dashboard/trends?groupBy=month'),
    ]).then(([s, t]) => {
      setSummary(s.data.data);
      setTrends(t.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content"><div className="loading-state">Loading dashboard...</div></main>
    </div>
  );

  const pieData = summary?.byCategory?.map(c => ({
    name: c._id,
    value: c.income + c.expense,
  })) || [];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p className="page-sub">Financial overview</p>
        </div>

        <div className="kpi-grid">
          <KPICard title="Total Income" value={summary?.totalIncome} color="income" icon="↑"/>
          <KPICard title="Total Expenses" value={summary?.totalExpenses} color="expense" icon="↓"/>
          <KPICard title="Net Balance" value={summary?.netBalance}
            color={summary?.netBalance >= 0 ? 'positive' : 'negative'} icon="≈"/>
          <KPICard title="Total Records" value={summary?.recordCount} color="default" icon="#"/>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>Monthly Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trends}>
                <XAxis dataKey="period" tick={{ fontSize: 11 }}/>
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}/>
                <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`}/>
                <Bar dataKey="income" fill="#01696f" radius={[4,4,0,0]}/>
                <Bar dataKey="expenses" fill="#a12c7b" radius={[4,4,0,0]}/>
                <Legend/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Net Balance Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trends}>
                <XAxis dataKey="period" tick={{ fontSize: 11 }}/>
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}/>
                <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`}/>
                <Line type="monotone" dataKey="net" stroke="#437a22" strokeWidth={2} dot={{ r: 4 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Spend by Category</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={90} label={({ name }) => name}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`}/>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card recent-card">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {summary?.recentActivity?.map(r => (
                <div key={r._id} className="activity-item">
                  <span className={`type-dot ${r.type}`}></span>
                  <div className="activity-info">
                    <span className="activity-cat">{r.category}</span>
                    <span className="activity-notes">{r.notes || '—'}</span>
                  </div>
                  <span className={`activity-amount ${r.type}`}>
                    {r.type === 'income' ? '+' : '-'}₹{r.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}