import { useSystemStore } from '../store/useSystemStore'
import { systemStore } from '../store/useSystemStore'
import { SystemWindow } from '../components/SystemWindow'
import { StatBar } from '../components/StatBar'
import { STAT_TYPES } from '../domain/types'
import { statLabels, balanceConfig } from '../domain/balanceConfig'

export function StatusScreen() {
  const player = useSystemStore(s => s.save.player)

  return (
    <div className="min-h-screen bg-system-bg pb-24 px-4 pt-6 space-y-5">
      <div className="space-y-0.5">
        <p className="font-mono text-[10px] tracking-[0.25em] text-system-glow/60 uppercase">
          ▣ STATUS WINDOW
        </p>
        <h1 className="font-mono font-black text-xl tracking-widest text-white uppercase">
          Player Status
        </h1>
      </div>

      <SystemWindow title="HUNTER INFO">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-0.5">
            <p className="font-mono text-[10px] text-slate-500 tracking-widest uppercase">
              Level
            </p>
            <p className="font-mono text-3xl font-black text-white">{player.level}</p>
          </div>
          <div className="space-y-0.5">
            <p className="font-mono text-[10px] text-slate-500 tracking-widest uppercase">
              Rank
            </p>
            <p className="font-mono text-3xl font-black text-system-glow">
              {player.classRank}
            </p>
          </div>
        </div>
      </SystemWindow>

      {player.freeStatPoints > 0 && (
        <SystemWindow className="border-system-accent/60">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-system-accent tracking-widest uppercase font-semibold">
                ⬡ ALLOCATE STAT POINTS
              </span>
              <span className="font-mono text-sm font-bold text-system-accent bg-system-accent/10 border border-system-accent/40 px-2 py-0.5 rounded">
                {player.freeStatPoints} pts
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              You have unspent stat points. Choose your path.
            </p>
          </div>
        </SystemWindow>
      )}

      <SystemWindow title="STATS">
        <div className="space-y-2">
          {STAT_TYPES.map(type => {
            const stat = player.stats[type]
            return (
              <div key={type} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <StatBar
                    label={statLabels[type]}
                    abbrev={type}
                    subLevel={stat.subLevel}
                    statXP={stat.statXP}
                    xpPerSubLevel={balanceConfig.statXPPerSubLevel}
                  />
                </div>
                {player.freeStatPoints > 0 && (
                  <button
                    onClick={() => systemStore.getState().allocateStatPoint(type)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded border border-system-accent/50 bg-system-accent/10 text-system-accent font-mono font-bold text-lg hover:bg-system-accent/20 transition-all active:scale-95 shrink-0"
                    aria-label={`Allocate point to ${statLabels[type]}`}
                  >
                    +
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </SystemWindow>
    </div>
  )
}
