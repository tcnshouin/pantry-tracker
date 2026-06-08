import { diffCombat, type CombatEvent } from './combatDiff'
import type { Combatant, CombatState } from '../../domain/combat/types'

function mk(over: Partial<Combatant>): Combatant {
  return { id: 'x', name: 'X', isPlayer: false, hp: 100, maxHP: 100, mp: 0, maxMP: 0, attack: 0, defense: 0, speed: 0, skillPowerMult: 1, critChance: 0, critMultiplier: 1.75, dodgeChance: 0, buffs: [], defending: false, ...over }
}
function st(over: Partial<CombatState>): CombatState {
  return { gateId: 'g', goldReward: 0, player: mk({ id: 'p', isPlayer: true }), enemies: [mk({ id: 'e1' })], currentEnemyIndex: 0, round: 1, phase: 'player', log: [], rngState: 1, nextLogId: 1, ...over }
}
function withLog(s: CombatState, texts: string[]): CombatState { return { ...s, log: texts.map((t, i) => ({ id: i, text: t })) } }

test('enemy hp drop -> enemyHit with amount', () => {
  const ev = diffCombat(st({}), withLog(st({ enemies: [mk({ id: 'e1', hp: 76 })] }), ['Hunter hit X for 24']))
  expect(ev).toContainEqual<CombatEvent>({ kind: 'enemyHit', amount: 24, crit: false })
})
test('crit flag from log', () => {
  const ev = diffCombat(st({}), withLog(st({ enemies: [mk({ id: 'e1', hp: 60 })] }), ['Hunter hit X for 40 (CRIT)']))
  expect(ev).toContainEqual<CombatEvent>({ kind: 'enemyHit', amount: 40, crit: true })
})
test('player hp drop -> playerHit', () => {
  const ev = diffCombat(st({}), withLog(st({ player: mk({ id: 'p', isPlayer: true, hp: 90 }) }), ['X hit Hunter for 10']))
  expect(ev).toContainEqual<CombatEvent>({ kind: 'playerHit', amount: 10, crit: false })
})
test('index advance -> enemyAdvance plus killing enemyHit', () => {
  const prev = st({ enemies: [mk({ id: 'e1', hp: 5 }), mk({ id: 'e2' })] })
  const next = withLog(st({ enemies: [mk({ id: 'e1', hp: 0 }), mk({ id: 'e2' })], currentEnemyIndex: 1 }), ['Hunter hit X for 5', 'e2 appears'])
  const ev = diffCombat(prev, next)
  expect(ev).toContainEqual<CombatEvent>({ kind: 'enemyHit', amount: 5, crit: false })
  expect(ev.some(e => e.kind === 'enemyAdvance')).toBe(true)
})
test('shadow strike, heavy, skill, dodge, win cues', () => {
  const next = withLog(st({ enemies: [mk({ id: 'e1', hp: 70 })], phase: 'won' }), [
    'Your shadows strike X for 30', 'X unleashes a heavy strike! X hit Hunter for 0', 'Hunter used Power Strike: ...', "X dodged Hunter's attack",
  ])
  const ev = diffCombat(st({}), next)
  expect(ev.some(e => e.kind === 'shadowStrike')).toBe(true)
  expect(ev.some(e => e.kind === 'enemyHeavy')).toBe(true)
  expect(ev.some(e => e.kind === 'playerSkill')).toBe(true)
  expect(ev.some(e => e.kind === 'dodge')).toBe(true)
  expect(ev.some(e => e.kind === 'won')).toBe(true)
})
