import { applyPlayerAction } from './engine'
import type { Combatant, CombatState } from './types'
import { balanceConfig } from '../balanceConfig'

function mk(over: Partial<Combatant>): Combatant {
  return {
    id: 'x', name: 'X', isPlayer: false, hp: 100, maxHP: 100, mp: 30, maxMP: 30,
    attack: 20, defense: 0, speed: 5, skillPowerMult: 1, critChance: 0, critMultiplier: 1.75,
    dodgeChance: 0, buffs: [], defending: false, ...over,
  }
}
function state(over: Partial<CombatState>): CombatState {
  return { gateId: 'g', goldReward: 0, player: mk({ id: 'p', isPlayer: true, speed: 10 }),
    enemies: [mk({ id: 'e1', hp: 999, attack: 0 })], currentEnemyIndex: 0, round: 1, phase: 'player',
    log: [], rngState: 1, nextLogId: 1, ...over }
}

test('Power Strike costs MP and deals attackMult damage (skillPowerMult 1)', () => {
  const s = applyPlayerAction(state({}), { type: 'skill', skillId: 'powerStrike' })
  const cfg = balanceConfig.combat.skills.powerStrike
  expect(s.player.mp).toBe(30 - cfg.mpCost)
  expect(s.enemies[0].hp).toBe(999 - Math.round(20 * cfg.attackMult))
})

test('Mend heals and costs MP', () => {
  const s = applyPlayerAction(state({ player: mk({ id: 'p', isPlayer: true, speed: 10, hp: 10, maxHP: 100, skillPowerMult: 1, dodgeChance: 1 }) }), { type: 'skill', skillId: 'mend' })
  const cfg = balanceConfig.combat.skills.mend
  expect(s.player.mp).toBe(30 - cfg.mpCost)
  expect(s.player.hp).toBe(10 + Math.round(cfg.baseHeal * 1))
})

test('Focus adds a temporary crit buff', () => {
  const s = applyPlayerAction(state({}), { type: 'skill', skillId: 'focus' })
  expect(s.player.buffs.some(b => b.kind === 'critUp')).toBe(true)
})

test('Weaken applies attack/defense debuffs to the enemy', () => {
  const s = applyPlayerAction(state({}), { type: 'skill', skillId: 'weaken' })
  expect(s.enemies[0].buffs.some(b => b.kind === 'attackDown')).toBe(true)
  expect(s.enemies[0].buffs.some(b => b.kind === 'defenseDown')).toBe(true)
})

test('a skill with insufficient MP is a no-op for resources', () => {
  const s = applyPlayerAction(state({ player: mk({ id: 'p', isPlayer: true, speed: 10, mp: 0 }) }), { type: 'skill', skillId: 'powerStrike' })
  expect(s.player.mp).toBe(0)
  expect(s.enemies[0].hp).toBe(999)
})
