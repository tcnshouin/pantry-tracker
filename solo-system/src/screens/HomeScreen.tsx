import { useSystemStore } from '../store/useSystemStore'
import { systemStore } from '../store/useSystemStore'
import { ExpBar } from '../components/ExpBar'
import { QuestCard } from '../components/QuestCard'
import { expToNext } from '../domain/leveling'

export function HomeScreen() {
  const player = useSystemStore(s => s.save.player)
  const quests = useSystemStore(s => s.save.quests)

  return (
    <div className="min-h-screen bg-system-bg pb-8 px-4 pt-6 space-y-6">
      <div className="space-y-1">
        <p className="font-mono text-[10px] tracking-[0.25em] text-system-glow/60 uppercase">
          ▣ SYSTEM NOTIFICATION
        </p>
        <ExpBar
          level={player.level}
          classRank={player.classRank}
          currentEXP={player.currentEXP}
          expToNext={expToNext(player.level)}
        />
      </div>

      <div className="flex gap-3">
        <div className="flex items-center gap-1.5 bg-system-panel border border-system-glow/20 rounded px-3 py-1.5">
          <span className="font-mono text-[10px] text-slate-500 tracking-widest uppercase">
            GOLD
          </span>
          <span className="font-mono text-sm font-bold text-system-accent">
            {player.currency.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-system-panel border border-system-glow/20 rounded px-3 py-1.5">
          <span className="font-mono text-[10px] text-slate-500 tracking-widest uppercase">
            KEYS
          </span>
          <span className="font-mono text-sm font-bold text-system-accent">
            {player.gateKeys}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-0.5">
          <h2 className="font-mono font-black text-sm tracking-[0.2em] uppercase text-white">
            DAILY QUESTS
          </h2>
          <p className="font-mono text-[11px] text-system-accent/50 tracking-wide">
            Arise, Hunter. Your tasks await.
          </p>
        </div>

        {quests.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="font-mono text-slate-600 text-sm tracking-widest uppercase">
              NO ACTIVE QUESTS
            </p>
            <p className="font-mono text-xs text-slate-700">
              New quests will be issued at reset.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {quests.map(quest => (
              <QuestCard
                key={quest.instanceId}
                quest={quest}
                onComplete={id => systemStore.getState().completeQuest(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
