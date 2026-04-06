export function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-brand-100 bg-surface p-4 shadow-sm">
      <div className="text-sm text-surface-text">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-accent">{value}</div>
    </div>
  )
}

