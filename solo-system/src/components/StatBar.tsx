interface Props {
  label: string
  abbrev: string
  subLevel: number
  statXP: number
  xpPerSubLevel: number
}

export function StatBar({ label, abbrev, subLevel, statXP, xpPerSubLevel }: Props) {
  const pct = Math.min(100, Math.max(0, (statXP / xpPerSubLevel) * 100))

  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-10 text-right">
        <span className="font-mono text-system-glow text-sm font-bold tracking-wider">{abbrev}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs text-system-accent/70 uppercase tracking-wide">{label}</span>
          <span className="font-mono text-white text-base font-bold leading-none">{subLevel}</span>
        </div>
        <div className="h-1.5 bg-system-panel rounded-full overflow-hidden border border-system-glow/20">
          <div
            className="h-full bg-system-glow rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, boxShadow: '0 0 6px #38bdf8' }}
          />
        </div>
      </div>
    </div>
  )
}
