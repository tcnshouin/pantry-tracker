import { useSystemStore } from '../store/useSystemStore'
import { SystemWindow } from '../components/SystemWindow'
import { ShadowCard } from '../components/ShadowCard'
import { deployCap, deployedShadowPower } from '../domain/shadows/army'
import { balanceConfig } from '../domain/balanceConfig'

export function ShadowArmyScreen() {
  const save = useSystemStore(s => s.save)
  const deployShadow = useSystemStore(s => s.deployShadow)
  const undeployShadow = useSystemStore(s => s.undeployShadow)

  const cap = deployCap(save.player.level)
  const deployedCount = save.deployedShadowIds.length
  const strike = deployedShadowPower(save.shadows, save.deployedShadowIds) * balanceConfig.shadows.shadowStrikeFactor

  return (
    <div className="min-h-screen bg-system-bg px-4 pt-6 pb-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-[0.25em] text-system-glow/60 uppercase">
          ▣ SHADOW ARMY
        </p>
      </div>

      <SystemWindow title="SHADOW ARMY">
        <div className="flex items-center justify-between gap-4">
          <div className="text-center">
            <p className="font-mono text-[10px] tracking-widest uppercase text-slate-500">
              DEPLOYED
            </p>
            <p className="font-mono text-xl font-black text-system-glow"
              style={{ textShadow: '0 0 12px #38bdf8' }}
            >
              {deployedCount} / {cap}
            </p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[10px] tracking-widest uppercase text-slate-500">
              SHADOW STRIKE
            </p>
            <p className="font-mono text-xl font-black text-system-glow"
              style={{ textShadow: '0 0 12px #38bdf8' }}
            >
              {strike}
            </p>
          </div>
        </div>
      </SystemWindow>

      <SystemWindow title="SOLDIERS">
        {save.shadows.length === 0 ? (
          <p className="font-mono text-xs text-slate-500 text-center py-4 tracking-wider">
            No shadows yet. Win Gates and ARISE the fallen.
          </p>
        ) : (
          <div className="space-y-2">
            {save.shadows.map(shadow => {
              const deployed = save.deployedShadowIds.includes(shadow.id)
              const disabled = !deployed && deployedCount >= cap
              return (
                <ShadowCard
                  key={shadow.id}
                  shadow={shadow}
                  deployed={deployed}
                  onClick={() => deployed ? undeployShadow(shadow.id) : deployShadow(shadow.id)}
                  disabled={disabled}
                />
              )
            })}
          </div>
        )}
      </SystemWindow>
    </div>
  )
}
