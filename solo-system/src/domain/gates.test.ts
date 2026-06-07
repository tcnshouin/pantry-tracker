import { gateUnlocked, canEnterGate, buildCombatState } from './gates'
import { gateLibrary } from '../data/gateLibrary'
import { STAT_TYPES, type Player } from './types'

function player(over: Partial<Player>): Player {
  const stats = Object.fromEntries(STAT_TYPES.map(t => [t, { type: t, subLevel: 5, statXP: 0 }])) as Player['stats']
  return { level: 5, currentEXP: 0, freeStatPoints: 0, classRank: 'E', currency: 0, gateKeys: 3, stats, ...over }
}
const gateE1 = gateLibrary.find(g => g.id === 'gate-e1')!
const gateE2 = gateLibrary.find(g => g.id === 'gate-e2')!
const emptyEquipment = { weapon: null, armor: null, accessory: null }

test('first gate is unlocked; later gate needs its predecessor cleared', () => {
  expect(gateUnlocked(gateE1, [])).toBe(true)
  expect(gateUnlocked(gateE2, [])).toBe(false)
  expect(gateUnlocked(gateE2, ['gate-e1'])).toBe(true)
})

test('canEnterGate requires unlock + enough keys', () => {
  expect(canEnterGate(gateE1, player({ gateKeys: 1 }), [])).toBe(true)
  expect(canEnterGate(gateE1, player({ gateKeys: 0 }), [])).toBe(false)
  expect(canEnterGate(gateE2, player({ gateKeys: 3 }), [])).toBe(false)
})

test('equipped gear raises the hunter combat stats', () => {
  const eq = { weapon: { id: 'w', baseId: 'b', name: 'W', slot: 'weapon' as const, rarity: 'common' as const, enhanceLevel: 0, bonuses: [{ kind: 'attack' as const, value: 10 }, { kind: 'maxHP' as const, value: 40 }] }, armor: null, accessory: null }
  const bare = buildCombatState(gateE1, player({}), { weapon: null, armor: null, accessory: null }, 0, 1)
  const geared = buildCombatState(gateE1, player({}), eq, 0, 1)
  expect(geared.player.attack).toBe(bare.player.attack + 10)
  expect(geared.player.maxHP).toBe(bare.player.maxHP + 40)
  expect(geared.player.hp).toBe(geared.player.maxHP)
})

test('buildCombatState creates a player combatant and the enemy sequence at full HP', () => {
  const cs = buildCombatState(gateE1, player({}), emptyEquipment, 0, 12345)
  expect(cs.player.isPlayer).toBe(true)
  expect(cs.player.hp).toBe(cs.player.maxHP)
  expect(cs.enemies).toHaveLength(gateE1.enemyIds.length)
  expect(cs.enemies[0].hp).toBe(cs.enemies[0].maxHP)
  expect(cs.phase).toBe('player')
  expect(cs.goldReward).toBe(gateE1.goldReward)
})

test('buildCombatState carries the provided shadow power', () => {
  const cs = buildCombatState(gateE1, player({}), { weapon: null, armor: null, accessory: null }, 25, 1)
  expect(cs.shadowPower).toBe(25)
})
