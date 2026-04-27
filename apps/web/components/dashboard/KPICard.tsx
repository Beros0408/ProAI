import type { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string
  delta: string
  icon: LucideIcon
}

export function KPICard({ title, value, delta, icon: Icon }: Props) {
  const positive = delta.startsWith('+')
  return (
    <div className="bg-surface border border-[#1E1E2E] rounded-xl p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-primary" />
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}
        >
          {delta}
        </span>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted mt-1">{title}</div>
    </div>
  )
}
