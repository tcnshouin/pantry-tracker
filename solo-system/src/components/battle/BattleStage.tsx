import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TargetAndTransition } from 'framer-motion'
import type { CombatState } from '../../domain/combat/types'
import type { Shadow } from '../../domain/shadows/types'
import type { AnimationBatch } from './useCombatAnimations'
import { HunterSprite } from '../sprites/HunterSprite'
import { EnemySprite } from '../sprites/EnemySprite'
import { ShadowSprite } from '../sprites/ShadowSprite'
import { FloatingDamage } from './FloatingDamage'
import { CombatantBar } from '../CombatantBar'
import { getEnemyAttack, getWeaponAttack } from './animations'

interface Props {
  combat: CombatState
  weaponBaseId: string | null
  shadows: Shadow[]
  deployedIds: string[]
  batch: AnimationBatch
}

interface Floater {
  key: number
  side: 'enemy' | 'player'
  amount: number
  crit: boolean
  miss: boolean
}

const DISPLAY_CAP = 8
const QUEUED_CAP = 5

let floaterCounter = 0

export function BattleStage({ combat, weaponBaseId, shadows, deployedIds, batch }: Props) {
  const currentEnemy = combat.enemies[combat.currentEnemyIndex]
  const queuedEnemies = combat.enemies.slice(combat.currentEnemyIndex + 1)

  const deployed = shadows.filter(s => deployedIds.includes(s.id))
  const visibleShadows = deployed.slice(0, DISPLAY_CAP)
  const shadowOverflow = deployed.length - DISPLAY_CAP
  const shadowSize = deployed.length > 5 ? 22 : 30

  const [floaters, setFloaters] = useState<Floater[]>([])
  const [enemyAnim, setEnemyAnim] = useState<TargetAndTransition | null>(null)
  const [hunterAnim, setHunterAnim] = useState<TargetAndTransition | null>(null)
  const [enemyFlash, setEnemyFlash] = useState(false)
  const [playerFlash, setPlayerFlash] = useState(false)
  const [shadowOverlay, setShadowOverlay] = useState(false)
  const [enemyFade, setEnemyFade] = useState(false)
  const [playerFade, setPlayerFade] = useState(false)
  const prevBatchId = useRef(0)

  useEffect(() => {
    if (batch.id === 0 || batch.id === prevBatchId.current) return
    prevBatchId.current = batch.id

    const newFloaters: Floater[] = []
    let doEnemyFlash = false
    let doPlayerFlash = false
    let doShadowOverlay = false
    let doEnemyFade = false
    let doPlayerFade = false
    let triggerEnemyAnim = false
    let triggerHunterAnim = false
    let enemyHeavy = false
    let playerSkill = false

    for (const ev of batch.events) {
      if (ev.kind === 'enemyHit') {
        floaterCounter++
        newFloaters.push({ key: floaterCounter, side: 'enemy', amount: ev.amount, crit: ev.crit, miss: false })
        doEnemyFlash = true
        triggerHunterAnim = true
      } else if (ev.kind === 'playerHit') {
        floaterCounter++
        newFloaters.push({ key: floaterCounter, side: 'player', amount: ev.amount, crit: ev.crit, miss: false })
        doPlayerFlash = true
        triggerEnemyAnim = true
      } else if (ev.kind === 'dodge') {
        floaterCounter++
        newFloaters.push({ key: floaterCounter, side: ev.target, amount: 0, crit: false, miss: true })
      } else if (ev.kind === 'shadowStrike') {
        doShadowOverlay = true
        doEnemyFlash = true
      } else if (ev.kind === 'enemyHeavy') {
        enemyHeavy = true
        triggerEnemyAnim = true
      } else if (ev.kind === 'playerSkill') {
        playerSkill = true
        triggerHunterAnim = true
      } else if (ev.kind === 'won' || ev.kind === 'enemyAdvance') {
        doEnemyFade = true
      } else if (ev.kind === 'lost') {
        doPlayerFade = true
      }
    }

    if (newFloaters.length > 0) {
      setFloaters(prev => [...prev, ...newFloaters])
      const keys = newFloaters.map(f => f.key)
      setTimeout(() => {
        setFloaters(prev => prev.filter(f => !keys.includes(f.key)))
      }, 1100)
    }

    if (triggerEnemyAnim) {
      const kf = getEnemyAttack(currentEnemy?.id ?? 'default', enemyHeavy)
      const anim: TargetAndTransition = {}
      if (kf.x) anim.x = kf.x
      if (kf.y) anim.y = kf.y
      if (kf.scale) anim.scale = kf.scale
      if (kf.rotate) anim.rotate = kf.rotate
      setEnemyAnim(anim)
      setTimeout(() => setEnemyAnim(null), ((kf.transition?.duration ?? 0.35) * 1000) + 50)
    }

    if (triggerHunterAnim || playerSkill) {
      const kf = getWeaponAttack(weaponBaseId)
      const anim: TargetAndTransition = {}
      if (kf.x) anim.x = kf.x
      if (kf.y) anim.y = kf.y
      if (kf.scale) anim.scale = kf.scale
      if (kf.rotate) anim.rotate = kf.rotate
      setHunterAnim(anim)
      setTimeout(() => setHunterAnim(null), ((kf.transition?.duration ?? 0.35) * 1000) + 50)
    }

    if (doEnemyFlash) {
      setEnemyFlash(true)
      setTimeout(() => setEnemyFlash(false), 300)
    }
    if (doPlayerFlash) {
      setPlayerFlash(true)
      setTimeout(() => setPlayerFlash(false), 300)
    }
    if (doShadowOverlay) {
      setShadowOverlay(true)
      setTimeout(() => setShadowOverlay(false), 400)
    }
    if (doEnemyFade) {
      setEnemyFade(true)
      setTimeout(() => setEnemyFade(false), 500)
    }
    if (doPlayerFade) {
      setPlayerFade(true)
      setTimeout(() => setPlayerFade(false), 500)
    }
  }, [batch.id])

  const enemyFloaters = floaters.filter(f => f.side === 'enemy')
  const playerFloaters = floaters.filter(f => f.side === 'player')

  const queuedVisible = queuedEnemies.slice(0, QUEUED_CAP)
  const queuedOverflow = queuedEnemies.length - QUEUED_CAP

  return (
    <div
      className="relative h-72 rounded-xl overflow-hidden w-full"
      style={{
        background: 'linear-gradient(180deg, #050816 0%, #0a0f2e 55%, #0d1a1a 100%)',
        boxShadow: 'inset 0 0 60px rgba(56,189,248,0.05)',
      }}
    >
      <div
        className="absolute inset-x-0 bottom-0 h-14 rounded-b-xl"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(56,189,248,0.06) 100%)',
          borderTop: '1px solid rgba(56,189,248,0.1)',
        }}
      />

      <div className="absolute inset-0 flex">
        <div className="flex-1 flex flex-col justify-end p-3 gap-2 min-w-0">
          <div className="relative self-start" style={{ opacity: playerFade ? 0.3 : 1, transition: 'opacity 0.3s' }}>
            <motion.div
              animate={hunterAnim ?? { x: 0, y: 0, scale: 1, rotate: 0 }}
              transition={{ duration: 0.35 }}
              style={{ display: 'inline-block' }}
            >
              <HunterSprite
                size={96}
                weaponBaseId={weaponBaseId}
                className={playerFlash ? 'brightness-200' : ''}
              />
            </motion.div>
            <AnimatePresence>
              {playerFloaters.map(f => (
                <FloatingDamage key={f.key} amount={f.amount} crit={f.crit} miss={f.miss} />
              ))}
            </AnimatePresence>
          </div>

          <div className="w-full">
            <CombatantBar
              name={combat.player.name}
              hp={combat.player.hp}
              maxHP={combat.player.maxHP}
              mp={combat.player.mp}
              maxMP={combat.player.maxMP}
              isPlayer
            />
          </div>

          {visibleShadows.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              {visibleShadows.map(s => (
                <ShadowSprite key={s.id} size={shadowSize} />
              ))}
              {shadowOverflow > 0 && (
                <span className="font-mono text-xs text-violet-400 bg-violet-900/40 px-1.5 py-0.5 rounded border border-violet-500/30">
                  +{shadowOverflow}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-end justify-start p-3 gap-2 min-w-0">
          {currentEnemy && (
            <>
              <div className="relative self-end" style={{ opacity: enemyFade ? 0.3 : 1, transition: 'opacity 0.3s' }}>
                <motion.div
                  animate={enemyAnim ?? { x: 0, y: 0, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.35 }}
                  style={{ display: 'inline-block' }}
                >
                  <EnemySprite
                    enemyId={currentEnemy.id}
                    size={96}
                    className={enemyFlash ? 'brightness-200' : ''}
                  />
                </motion.div>
                {shadowOverlay && (
                  <div
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: 'radial-gradient(circle, rgba(167,139,250,0.6) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                <AnimatePresence>
                  {enemyFloaters.map(f => (
                    <FloatingDamage key={f.key} amount={f.amount} crit={f.crit} miss={f.miss} />
                  ))}
                </AnimatePresence>
              </div>

              <div className="w-full max-w-[160px]">
                <div className="font-mono text-xs tracking-widest text-system-danger uppercase mb-1 text-right">
                  {currentEnemy.name}
                </div>
                <div className="h-2 bg-black/50 rounded overflow-hidden border border-red-500/20">
                  <div
                    className="h-full bg-red-500 rounded transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(0, currentEnemy.maxHP > 0 ? (currentEnemy.hp / currentEnemy.maxHP) * 100 : 0))}%`,
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {queuedVisible.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-end mt-1">
              {queuedVisible.map((enemy, i) => (
                <div
                  key={enemy.id + i}
                  data-queued-enemy
                  className="opacity-40"
                >
                  <EnemySprite enemyId={enemy.id} size={36} />
                </div>
              ))}
              {queuedOverflow > 0 && (
                <span className="font-mono text-xs text-red-400 bg-red-900/30 px-1 py-0.5 rounded self-center">
                  +{queuedOverflow}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
