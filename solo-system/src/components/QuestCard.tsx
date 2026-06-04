import { SystemWindow } from './SystemWindow'
import { CountdownTimer } from './CountdownTimer'
import type { QuestInstance } from '../domain/types'

interface Props {
  quest: QuestInstance
  onComplete: (instanceId: string) => void
}

export function QuestCard({ quest, onComplete }: Props) {
  const now = Date.now()
  const expired = !quest.completed && quest.deadline < now
  const isRedemption = quest.isRedemption

  const borderClass = isRedemption
    ? 'border-system-danger/60'
    : quest.completed
    ? 'border-system-glow/60'
    : expired
    ? 'border-slate-600/40'
    : ''

  return (
    <SystemWindow className={borderClass}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isRedemption && (
              <div className="mb-1">
                <span className="font-mono text-[10px] tracking-widest text-system-danger uppercase bg-system-danger/10 border border-system-danger/40 px-2 py-0.5 rounded">
                  ⚠ PENALTY QUEST
                </span>
              </div>
            )}
            <h3
              className={`font-mono font-bold text-sm tracking-wide uppercase leading-tight ${
                quest.completed
                  ? 'text-system-glow'
                  : expired
                  ? 'text-slate-500'
                  : isRedemption
                  ? 'text-system-danger'
                  : 'text-white'
              }`}
            >
              {quest.title}
            </h3>
          </div>
          <span
            className={`font-mono text-xs font-bold px-2 py-1 rounded border shrink-0 ${
              isRedemption
                ? 'text-system-danger border-system-danger/50 bg-system-danger/10'
                : 'text-system-glow border-system-glow/40 bg-system-glow/10'
            }`}
          >
            {quest.stat}
          </span>
        </div>

        <p
          className={`text-sm leading-snug ${
            expired && !quest.completed ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          {quest.description}
        </p>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="text-xs font-mono">
            {quest.completed ? null : (
              <span className="text-slate-500 mr-1 uppercase tracking-widest text-[10px]">
                TIME:
              </span>
            )}
            {quest.completed ? null : <CountdownTimer deadline={quest.deadline} />}
          </div>

          {quest.completed ? (
            <div className="flex items-center gap-2 text-system-glow font-mono font-bold text-sm tracking-widest">
              <span className="text-lg leading-none">✓</span>
              <span>COMPLETE</span>
            </div>
          ) : expired ? (
            <span className="font-mono text-xs tracking-widest text-slate-600 uppercase font-bold">
              FAILED
            </span>
          ) : (
            <button
              onClick={() => onComplete(quest.instanceId)}
              className={`min-h-[44px] px-5 py-2 rounded font-mono font-bold text-sm tracking-widest uppercase transition-all active:scale-95 ${
                isRedemption
                  ? 'bg-system-danger/20 border border-system-danger/60 text-system-danger hover:bg-system-danger/30'
                  : 'bg-system-glow/10 border border-system-glow/50 text-system-glow hover:bg-system-glow/20'
              }`}
            >
              COMPLETE
            </button>
          )}
        </div>
      </div>
    </SystemWindow>
  )
}
