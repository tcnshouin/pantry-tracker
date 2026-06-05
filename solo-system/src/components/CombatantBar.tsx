interface CombatantBarProps {
  name: string
  hp: number
  maxHP: number
  mp: number
  maxMP: number
  isPlayer: boolean
}

export function CombatantBar({ name, hp, maxHP, mp, maxMP, isPlayer }: CombatantBarProps) {
  const hpPct = Math.min(100, Math.max(0, maxHP > 0 ? (hp / maxHP) * 100 : 0))
  const mpPct = Math.min(100, Math.max(0, maxMP > 0 ? (mp / maxMP) * 100 : 0))

  return (
    <div className="w-full bg-system-panel border border-system-glow/20 rounded px-3 py-2 space-y-1.5">
      <div className="font-mono text-sm tracking-widest text-system-glow uppercase">{name}</div>

      <div className="space-y-0.5">
        <div className="flex justify-between items-center font-mono text-xs text-system-glow/70">
          <span>HP</span>
          <span>{hp} / {maxHP}</span>
        </div>
        <div className="h-2 bg-system-bg rounded overflow-hidden border border-system-glow/10">
          <div
            className={`h-full rounded transition-all duration-300 ${isPlayer ? 'bg-system-glow' : 'bg-system-danger'}`}
            style={{ width: `${hpPct}%` }}
          />
        </div>
      </div>

      {isPlayer && maxMP > 0 && (
        <div className="space-y-0.5">
          <div className="flex justify-between items-center font-mono text-xs text-system-accent/70">
            <span>MP {mp}/{maxMP}</span>
          </div>
          <div className="h-1.5 bg-system-bg rounded overflow-hidden border border-system-accent/10">
            <div
              className="h-full rounded bg-system-accent transition-all duration-300"
              style={{ width: `${mpPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
