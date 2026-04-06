export default function KPICard({ title, value, subtitle, color = 'default', icon }) {
  const formatted = typeof value === 'number'
    ? `₹${value.toLocaleString('en-IN')}`
    : value;

  return (
    <div className={`kpi-card kpi-${color}`}>
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {icon && <span className="kpi-icon">{icon}</span>}
      </div>
      <div className="kpi-value">{formatted}</div>
      {subtitle && <div className="kpi-sub">{subtitle}</div>}
    </div>
  );
}