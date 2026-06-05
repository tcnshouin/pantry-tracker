import { deriveCombatStats } from './derive'
import { STAT_TYPES, type Player } from '../types'

function player(subLevels: Partial<Record<string, number>>): Player {
  const stats = Object.fromEntries(STAT_TYPES.map(t => [t, { type: t, subLevel: subLevels[t] ?? 0, statXP: 0 }])) as Player['stats']
  return { level: 1, currentEXP: 0, freeStatPoints: 0, classRank: 'E', currency: 0, gateKeys: 0, stats }
}

test('derives HP/MP/attack/speed from sublevels', () => {
  const d = deriveCombatStats(player({ VIT: 3, INT: 4, STR: 5, AGI: 7 }))
  expect(d.maxHP).toBe(50 + 3 * 10)
  expect(d.maxMP).toBe(20 + 4 * 3)
  expect(d.attack).toBe(5 + 5 * 2)
  expect(d.speed).toBe(7)
})

test('crit and dodge scale with PER and are capped', () => {
  const low = deriveCombatStats(player({ PER: 10 }))
  expect(low.critChance).toBeCloseTo(0.1)
  expect(low.dodgeChance).toBeCloseTo(0.05)
  const high = deriveCombatStats(player({ PER: 1000 }))
  expect(high.critChance).toBe(0.5)
  expect(high.dodgeChance).toBe(0.25)
})

test('skill power multiplier scales with INT', () => {
  expect(deriveCombatStats(player({ INT: 10 })).skillPowerMult).toBeCloseTo(1.5)
})
