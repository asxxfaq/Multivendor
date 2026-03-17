
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../../utils/axiosInstance'

export default function VendorDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/vendor/dashboard')
      .then(r => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>

  const chartData = stats?.salesData?.map(d => ({
    month: new Date(2024, d._id.month - 1).toLocaleString('default', { month: 'short' }),
    revenue: Math.round(d.revenue)
  })) || []

  return (
    <>
      <div className="dash-content-header">
        <div>
          <div className="dash-content-title">Dashboard</div>
          <div className="dash-content-subtitle">Welcome back! Here's your store overview.</div>
        </div>
        <Link to="/vendor/add" className="btn btn-primary">+ Add Product</Link>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Revenue',  value: `₹${(stats?.totalEarnings || 0).toLocaleString()}`, color: 'orange' },
          { label: 'Total Orders',   value: stats?.totalOrders || 0,      color: 'blue' },
          { label: 'Products',       value: stats?.totalProducts || 0,    color: 'green' },
          { label: 'Pending Orders', value: stats?.pendingOrders || 0,    color: 'purple' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="chart-card">
        <div className="chart-card-header">
          <h3>Monthly Revenue</h3>
        </div>
        <div className="chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}