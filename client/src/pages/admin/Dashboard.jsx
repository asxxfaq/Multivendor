import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../../utils/axiosInstance'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => { api.get('/admin/analytics').then(r => setStats(r.data)) }, [])

  if (!stats) return <div className="spinner-wrap"><div className="spinner" /></div>

  const chartData = stats.monthlySales?.map(d => ({
    month: new Date(2024, d._id.month - 1).toLocaleString('default', { month: 'short' }),
    revenue: Math.round(d.revenue), orders: d.orders
  })) || []

  return (
    <>
      <div className="dash-content-header">
        <div>
          <div className="dash-content-title">Platform Overview</div>
          <div className="dash-content-subtitle">Real-time marketplace statistics</div>
        </div>
      </div>

      <div className="admin-stats-grid">
        {[
          { label: 'Total Users',    value: stats.totalUsers,    color: 'blue' },
          { label: 'Active Vendors', value: stats.totalVendors,  color: 'green' },
          { label: 'Products',       value: stats.totalProducts, color: 'purple' },
          { label: 'Platform Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, color: 'orange' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-header"><h3>Monthly Revenue</h3></div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header"><h3>Top 5 Products</h3></div>
          <div style={{ padding: '8px 0' }}>
            {stats.topProducts?.map((p, i) => (
              <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--gray-300)', width: 24, textAlign: 'center' }}>{i + 1}</span>
                <img src={p.product?.images?.[0] || 'https://placehold.co/36x36/f1f5f9/94a3b8?text=+'} alt="" style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.product?.name}</span>
                <span className="badge badge-info">{p.totalSold} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}