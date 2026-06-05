import { useNavigate } from 'react-router-dom'
import { useSystemStore, systemStore } from '../store/useSystemStore'
import { SystemWindow } from '../components/SystemWindow'
import { gateLibrary } from '../data/gateLibrary'
import { gateUnlocked, canEnterGate } from '../domain/gates'

const RANK_COLORS: Record<string, string> = {
  E: 'text-slate-400 border-slate-500/50',
  D: 'text-green-400 border-green-500/50',
  C: 'text-blue-400 border-blue-500/50',
  B: 'text-purple-400 border-purple-500/50',
  A: 'text-yellow-400 border-yellow-500/50',
  S: 'text-system-danger border-system-danger/50',
}

export function GatesScreen() {
  const save = useSystemStore(s => s.save)
  const enterGate = useSystemStore(s => s.enterGate)
  const navigate = useNavigate()

  function handleEnter(gateId: string) {
    enterGate(gateId)
    if (systemStore.getState().combat) navigate('/battle')
  }

  return (
    <div className="min-h-screen bg-system-bg pb-24 px-4 pt-6 space-y-4">
      <SystemWindow title="GATE SELECTION">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate-500 tracking-widest uppercase">KEYS</span>
            <span className="font-mono text-base font-bold text-system-glow">
              {save.player.gateKeys}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate-500 tracking-widest uppercase">GOLD</span>
            <span className="font-mono text-base font-bold text-system-accent">
              {save.player.currency.toLocaleString()}
            </span>
          </div>
        </div>
      </SystemWindow>

      <div className="space-y-3">
        {gateLibrary.map(gate => {
          const cleared = save.gates.clearedGateIds.includes(gate.id)
          const unlocked = gateUnlocked(gate, save.gates.clearedGateIds)
          const canEnter = canEnterGate(gate, save.player, save.gates.clearedGateIds)
          const rankColor = RANK_COLORS[gate.rankTier] ?? 'text-slate-400 border-slate-500/50'

          return (
            <SystemWindow key={gate.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-mono text-[10px] tracking-widest uppercase border rounded px-1.5 py-0.5 font-bold ${rankColor}`}
                    >
                      {gate.rankTier}-RANK
                    </span>
                    {cleared && (
                      <span className="font-mono text-[10px] tracking-widest uppercase border rounded px-1.5 py-0.5 font-bold text-system-glow border-system-glow/50">
                        CLEARED
                      </span>
                    )}
                    {!unlocked && (
                      <span className="font-mono text-[10px] tracking-widest uppercase border rounded px-1.5 py-0.5 font-bold text-slate-600 border-slate-700">
                        LOCKED
                      </span>
                    )}
                  </div>

                  <p className="font-mono text-sm font-semibold text-white leading-tight">
                    {gate.name}
                  </p>

                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">COST</span>
                      <span className="font-mono text-xs text-system-glow font-bold">{gate.keyCost} KEY{gate.keyCost !== 1 ? 'S' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">REWARD</span>
                      <span className="font-mono text-xs text-system-accent font-bold">{gate.goldReward} GOLD</span>
                    </div>
                  </div>
                </div>

                {unlocked ? (
                  <button
                    onClick={() => handleEnter(gate.id)}
                    disabled={!canEnter}
                    className={`min-w-[80px] min-h-[44px] font-mono text-xs tracking-widest uppercase font-bold rounded border px-4 py-2 transition-all ${
                      canEnter
                        ? 'border-system-glow text-system-glow hover:bg-system-glow/10 active:scale-95'
                        : 'border-slate-700 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    ENTER
                  </button>
                ) : (
                  <div className="min-w-[80px]" />
                )}
              </div>
            </SystemWindow>
          )
        })}
      </div>
    </div>
  )
}
