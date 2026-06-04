interface Props {
  level: number
  classRank: string
  currentEXP: number
  expToNext: number
}

export function ExpBar({ level, classRank, currentEXP, expToNext }: Props) {
  const pct = Math.min(100, Math.max(0, (currentEXP / expToNext) * 100))

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-mono text-system-accent/60 uppercase tracking-widest">LVL</span>
          <span className="font-mono text-white text-3xl font-black leading-none">{level}</span>
        </div>
        <span className="font-mono text-xs px-2 py-0.5 rounded border border-system-glow/40 text-system-glow bg-system-glow/10 tracking-widest uppercase">
          {classRank}-RANK
        </span>
      </div>
      <div>
        <div className="h-2 bg-system-panel rounded-full overflow-hidden border border-system-glow/20">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #38bdf8, #60a5fa)',
              boxShadow: '0 0 8px #38bdf8',
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-mono text-xs text-system-accent/50">{currentEXP.toLocaleString()} XP</span>
          <span className="font-mono text-xs text-system-accent/50">{expToNext.toLocaleString()} XP</span>
        </div>
      </div>
    </div>
  )
}
