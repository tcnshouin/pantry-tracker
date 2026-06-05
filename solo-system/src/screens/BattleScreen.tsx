import { useRef, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useSystemStore } from '../store/useSystemStore'
import { CombatantBar } from '../components/CombatantBar'
import { SystemWindow } from '../components/SystemWindow'
import { listSkills, skillUnlocked } from '../domain/combat/skills'

export function BattleScreen() {
  const combat = useSystemStore(s => s.combat)
  const save = useSystemStore(s => s.save)
  const combatAction = useSystemStore(s => s.combatAction)
  const fleeGate = useSystemStore(s => s.fleeGate)
  const navigate = useNavigate()
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [combat?.log])

  if (!combat) {
    return <Navigate to="/gates" replace />
  }

  const currentEnemy = combat.enemies[combat.currentEnemyIndex]
  const isPlayerTurn = combat.phase === 'player'
  const isOver = combat.phase === 'won' || combat.phase === 'lost'
  const visibleLog = combat.log.slice(-8)
  const unlockedSkills = listSkills().filter(s => skillUnlocked(s, save.player.level))

  function handleFlee() {
    fleeGate()
    navigate('/gates')
  }

  return (
    <div className="min-h-screen bg-system-bg pb-6 px-4 pt-6 flex flex-col gap-4 relative">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-[0.25em] text-system-glow/60 uppercase">
          ▣ GATE BATTLE
        </p>
        <span className="font-mono text-[10px] text-slate-500 tracking-widest uppercase">
          WAVE {combat.currentEnemyIndex + 1} / {combat.enemies.length}
        </span>
      </div>

      <CombatantBar
        name={currentEnemy.name}
        hp={currentEnemy.hp}
        maxHP={currentEnemy.maxHP}
        mp={currentEnemy.mp}
        maxMP={currentEnemy.maxMP}
        isPlayer={false}
      />

      <SystemWindow title="COMBAT LOG">
        <div
          ref={logRef}
          className="h-32 overflow-y-auto space-y-0.5 scrollbar-none"
        >
          {visibleLog.map(entry => (
            <p
              key={entry.id}
              className="font-mono text-[11px] text-slate-300 leading-relaxed"
            >
              {entry.text}
            </p>
          ))}
        </div>
      </SystemWindow>

      <CombatantBar
        name={combat.player.name}
        hp={combat.player.hp}
        maxHP={combat.player.maxHP}
        mp={combat.player.mp}
        maxMP={combat.player.maxMP}
        isPlayer={true}
      />

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => combatAction({ type: 'attack' })}
            disabled={!isPlayerTurn}
            className={`min-h-[52px] font-mono text-xs tracking-widest uppercase font-bold rounded border px-4 py-3 transition-all ${
              isPlayerTurn
                ? 'border-system-glow text-system-glow hover:bg-system-glow/10 active:scale-95'
                : 'border-slate-700 text-slate-600 cursor-not-allowed'
            }`}
          >
            ATTACK
          </button>

          <button
            onClick={() => combatAction({ type: 'defend' })}
            disabled={!isPlayerTurn}
            className={`min-h-[52px] font-mono text-xs tracking-widest uppercase font-bold rounded border px-4 py-3 transition-all ${
              isPlayerTurn
                ? 'border-blue-500 text-blue-400 hover:bg-blue-500/10 active:scale-95'
                : 'border-slate-700 text-slate-600 cursor-not-allowed'
            }`}
          >
            DEFEND
          </button>
        </div>

        {unlockedSkills.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {unlockedSkills.map(skill => {
              const notEnoughMp = combat.player.mp < skill.mpCost
              const disabled = !isPlayerTurn || notEnoughMp
              return (
                <button
                  key={skill.id}
                  onClick={() => combatAction({ type: 'skill', skillId: skill.id })}
                  disabled={disabled}
                  className={`min-h-[52px] font-mono text-[10px] tracking-widest uppercase font-bold rounded border px-3 py-3 transition-all leading-tight ${
                    disabled
                      ? 'border-slate-700 text-slate-600 cursor-not-allowed'
                      : 'border-purple-500 text-purple-400 hover:bg-purple-500/10 active:scale-95'
                  }`}
                >
                  <span className="block">{skill.name}</span>
                  <span className="block text-[9px] opacity-70">{skill.mpCost} MP</span>
                </button>
              )
            })}
          </div>
        )}

        <button
          onClick={handleFlee}
          className="w-full min-h-[44px] font-mono text-xs tracking-widest uppercase font-bold rounded border border-system-danger/40 text-system-danger/60 hover:border-system-danger hover:text-system-danger hover:bg-system-danger/10 active:scale-95 transition-all px-4 py-3"
        >
          FLEE
        </button>
      </div>

      {isOver && (
        <div className="absolute inset-0 bg-system-bg/90 flex flex-col items-center justify-center gap-6 z-50">
          {combat.phase === 'won' ? (
            <div className="text-center space-y-3">
              <p
                className="font-mono text-3xl font-black tracking-[0.2em] uppercase text-system-glow"
                style={{ textShadow: '0 0 24px #38bdf8, 0 0 48px #38bdf860' }}
              >
                GATE CLEARED
              </p>
              <p className="font-mono text-lg font-bold text-system-accent tracking-widest">
                +{combat.goldReward} GOLD
              </p>
            </div>
          ) : (
            <p
              className="font-mono text-3xl font-black tracking-[0.2em] uppercase text-system-danger"
              style={{ textShadow: '0 0 24px #ef4444, 0 0 48px #ef444460' }}
            >
              DEFEATED
            </p>
          )}

          <button
            onClick={handleFlee}
            className="min-h-[52px] min-w-[160px] font-mono text-sm tracking-widest uppercase font-bold rounded border border-system-glow text-system-glow hover:bg-system-glow/10 active:scale-95 transition-all px-6 py-3"
          >
            RETURN
          </button>
        </div>
      )}
    </div>
  )
}
