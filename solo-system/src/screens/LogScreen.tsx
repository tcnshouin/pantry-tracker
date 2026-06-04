import { useSystemStore } from '../store/useSystemStore'
import { SystemWindow } from '../components/SystemWindow'
import { streakMultiplier } from '../domain/streaks'

export function LogScreen() {
  const streaks = useSystemStore(s => s.save.streaks)
  const history = useSystemStore(s => s.save.history)

  const streakEntries = Object.values(streaks).filter(s => s.count > 0)

  return (
    <div className="min-h-screen bg-system-bg pb-24 px-4 pt-6 space-y-5">
      <div className="space-y-0.5">
        <p className="font-mono text-[10px] tracking-[0.25em] text-system-glow/60 uppercase">
          ▣ ACTIVITY LOG
        </p>
        <h1 className="font-mono font-black text-xl tracking-widest text-white uppercase">
          Quest Log
        </h1>
      </div>

      <SystemWindow title="ACTIVE STREAKS">
        {streakEntries.length === 0 ? (
          <p className="font-mono text-xs text-slate-600 tracking-widest text-center py-2 uppercase">
            No active streaks — complete quests to start one.
          </p>
        ) : (
          <div className="space-y-2">
            {streakEntries.map(rec => {
              const mult = streakMultiplier(rec.count)
              return (
                <div
                  key={rec.templateId}
                  className="flex items-center justify-between py-1 border-b border-system-glow/10 last:border-0"
                >
                  <div className="space-y-0.5">
                    <p className="font-mono text-xs text-white font-semibold tracking-wide">
                      {rec.templateId}
                    </p>
                    {rec.lastCompletedDay && (
                      <p className="font-mono text-[10px] text-slate-600">
                        Last: {rec.lastCompletedDay}
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="font-mono text-sm font-bold text-system-glow">
                      🔥 {rec.count}
                    </p>
                    <p className="font-mono text-[10px] text-system-accent">
                      ×{mult.toFixed(2)} EXP
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SystemWindow>

      <SystemWindow title="DAILY HISTORY">
        {history.length === 0 ? (
          <p className="font-mono text-xs text-slate-600 tracking-widest text-center py-2 uppercase">
            No history yet — complete your first day.
          </p>
        ) : (
          <div className="space-y-2">
            {[...history].reverse().map((entry, i) => {
              const completionRate =
                entry.issued > 0
                  ? Math.round((entry.completed / entry.issued) * 100)
                  : 0
              return (
                <div
                  key={`${entry.day}-${i}`}
                  className="flex items-center justify-between py-1 border-b border-system-glow/10 last:border-0"
                >
                  <p className="font-mono text-xs text-slate-300">{entry.day}</p>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-500">
                      {entry.completed}/{entry.issued}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        completionRate === 100
                          ? 'text-system-glow'
                          : completionRate >= 50
                          ? 'text-system-accent'
                          : 'text-system-danger'
                      }`}
                    >
                      {completionRate}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SystemWindow>
    </div>
  )
}
