import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../../utils/axiosInstance'

export default function VendorEarnings() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/vendor/earnings').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>

  const chartData = data?.monthly?.map(d => ({
    month: new Date(2024, d._id.month - 1).toLocaleString('default', { month: 'short' }),
    gross: Math.round(d.gross),
    net:   Math.round(d.gross - d.commission),
  })) || []

  return (
    <>
      <div className="dash-content-header">
        <div>
          <div className="dash-content-title">Earnings</div>
          <div className="dash-content-subtitle">Your revenue and payout summary</div>
        </div>
      </div>

      <div className="earnings-summary">
        {[
          { label: 'Total Earnings',   value: data?.totalEarnings, icon: '💰', color: 'var(--success)' },
          { label: 'Pending Payout',   value: data?.pendingPayout,  icon: '⏳', color: 'var(--warning)' },
          { label: 'Total Paid Out',   value: data?.totalPaidOut,   icon: '✅', color: 'var(--info)' },
        ].map(s => (
          <div key={s.label} className="earnings-card">
            <div className="earnings-icon" style={{ background: s.color + '20' }}>{s.icon}</div>
            <div className="earnings-value">₹{(s.value || 0).toLocaleString()}</div>
            <div className="earnings-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-card">
        <div className="chart-card-header">
          <h3>Monthly Gross vs Net Revenue</h3>
        </div>
        <div className="chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v, n) => [`₹${v.toLocaleString()}`, n === 'gross' ? 'Gross' : 'Net (after commission)']} />
              <Bar dataKey="gross" fill="var(--gray-200)" radius={[4,4,0,0]} />
              <Bar dataKey="net"   fill="#f97316"        radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}