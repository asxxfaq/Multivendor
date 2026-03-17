export default function OrderStatusBadge({ status }) {
    const map = {
      pending:   { cls: 'badge-warning', label: 'Pending' },
      confirmed: { cls: 'badge-info',    label: 'Confirmed' },
      shipped:   { cls: 'badge-accent',  label: 'Shipped' },
      delivered: { cls: 'badge-success', label: 'Delivered' },
      cancelled: { cls: 'badge-danger',  label: 'Cancelled' },
      refunded:  { cls: 'badge-gray',    label: 'Refunded' },
      paid:      { cls: 'badge-success', label: 'Paid' },
      failed:    { cls: 'badge-danger',  label: 'Failed' },
    }
    const { cls, label } = map[status] || { cls: 'badge-gray', label: status }
    return <span className={`badge ${cls}`}>{label}</span>
  }