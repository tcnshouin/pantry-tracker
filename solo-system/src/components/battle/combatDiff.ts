import type { CombatState } from '../../domain/combat/types'

export type CombatEvent =
  | { kind: 'enemyHit'; amount: number; crit: boolean }
  | { kind: 'playerHit'; amount: number; crit: boolean }
  | { kind: 'dodge'; target: 'enemy' | 'player' }
  | { kind: 'shadowStrike' }
  | { kind: 'enemyHeavy' }
  | { kind: 'playerSkill' }
  | { kind: 'enemyAdvance' }
  | { kind: 'won' }
  | { kind: 'lost' }

export function diffCombat(prev: CombatState, next: CombatState): CombatEvent[] {
  const events: CombatEvent[] = []
  const newText = next.log.slice(prev.log.length).map(l => l.text).join(' ')
  const crit = newText.includes('(CRIT)')

  const activeIdx = prev.currentEnemyIndex
  const dEnemy = (prev.enemies[activeIdx]?.hp ?? 0) - (next.enemies[activeIdx]?.hp ?? 0)
  if (dEnemy > 0) events.push({ kind: 'enemyHit', amount: dEnemy, crit })

  const dPlayer = prev.player.hp - next.player.hp
  if (dPlayer > 0) events.push({ kind: 'playerHit', amount: dPlayer, crit })

  if (newText.includes('dodged')) {
    const enemyName = next.enemies[next.currentEnemyIndex]?.name ?? ''
    const enemyDodged = enemyName !== '' && newText.includes(`${enemyName} dodged`)
    events.push({ kind: 'dodge', target: enemyDodged ? 'enemy' : 'player' })
  }
  if (newText.includes('shadows strike')) events.push({ kind: 'shadowStrike' })
  if (newText.includes('unleashes a heavy strike')) events.push({ kind: 'enemyHeavy' })
  if (newText.includes('used ')) events.push({ kind: 'playerSkill' })

  if (next.currentEnemyIndex > prev.currentEnemyIndex) events.push({ kind: 'enemyAdvance' })
  if (next.phase === 'won') events.push({ kind: 'won' })
  if (next.phase === 'lost') events.push({ kind: 'lost' })

  return events
}
