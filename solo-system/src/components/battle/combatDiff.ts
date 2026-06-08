import type { CombatState } from '../../domain/combat/types'

export type CombatEvent =
  | { kind: 'enemyHit'; amount: number; crit: boolean }
  | { kind: 'playerHit'; amount: number; crit: boolean }
  | { kind: 'dodge'; target: 'enemy' | 'player' }
  | { kind: 'shadowStrike' }
  | { kind: 'enemyHeavy' }
  | { kind: 'playerSkill' }
  | { kind: 'defend' }
  | { kind: 'enemyAdvance' }
  | { kind: 'won' }
  | { kind: 'lost' }

export function diffCombat(prev: CombatState, next: CombatState): CombatEvent[] {
  const events: CombatEvent[] = []
  const newLines = next.log.slice(prev.log.length).map(l => l.text)
  const newText = newLines.join(' ')

  const playerName = next.player.name
  const enemyName = next.enemies[prev.currentEnemyIndex]?.name ?? ''

  const enemyHitCrit = newLines.some(l => l.includes('(CRIT)') && l.startsWith(playerName))
  const playerHitCrit = newLines.some(l => l.includes('(CRIT)') && l.startsWith(enemyName))

  const activeIdx = prev.currentEnemyIndex
  const dEnemy = (prev.enemies[activeIdx]?.hp ?? 0) - (next.enemies[activeIdx]?.hp ?? 0)
  if (dEnemy > 0) events.push({ kind: 'enemyHit', amount: dEnemy, crit: enemyHitCrit })

  const dPlayer = prev.player.hp - next.player.hp
  if (dPlayer > 0) events.push({ kind: 'playerHit', amount: dPlayer, crit: playerHitCrit })

  if (newText.includes('dodged')) {
    const currentEnemyName = next.enemies[next.currentEnemyIndex]?.name ?? ''
    const enemyDodged = currentEnemyName !== '' && newText.includes(`${currentEnemyName} dodged`)
    events.push({ kind: 'dodge', target: enemyDodged ? 'enemy' : 'player' })
  }
  if (newText.includes('shadows strike')) events.push({ kind: 'shadowStrike' })
  if (newText.includes('unleashes a heavy strike')) events.push({ kind: 'enemyHeavy' })
  if (newText.includes('used ')) events.push({ kind: 'playerSkill' })
  if (newText.includes('defends')) events.push({ kind: 'defend' })

  if (next.currentEnemyIndex > prev.currentEnemyIndex) events.push({ kind: 'enemyAdvance' })
  if (next.phase === 'won') events.push({ kind: 'won' })
  if (next.phase === 'lost') events.push({ kind: 'lost' })

  return events
}
