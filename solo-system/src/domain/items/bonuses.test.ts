import { aggregateEquipment } from './bonuses'
import type { Equipment, Item } from './types'

const item = (over: Partial<Item>): Item => ({ id: 'i', baseId: 'b', name: 'N', slot: 'weapon', rarity: 'common', enhanceLevel: 0, bonuses: [], ...over })
const empty: Equipment = { weapon: null, armor: null, accessory: null }

test('empty equipment yields zero combat bonuses and 1x multipliers', () => {
  const t = aggregateEquipment(empty)
  expect(t.combat).toEqual({ attack: 0, maxHP: 0, defense: 0, critChance: 0, skillPowerMult: 0 })
  expect(t.reward).toEqual({ expMult: 1, statXpMult: 1 })
})

test('combat bonuses sum and reward fractions add onto 1x', () => {
  const t = aggregateEquipment({
    weapon: item({ slot: 'weapon', bonuses: [{ kind: 'attack', value: 5 }, { kind: 'expMult', value: 0.1 }] }),
    armor: item({ slot: 'armor', bonuses: [{ kind: 'maxHP', value: 20 }, { kind: 'attack', value: 3 }] }),
    accessory: item({ slot: 'accessory', bonuses: [{ kind: 'statXpMult', value: 0.05 }, { kind: 'critChance', value: 0.04 }] }),
  })
  expect(t.combat.attack).toBe(8)
  expect(t.combat.maxHP).toBe(20)
  expect(t.combat.critChance).toBeCloseTo(0.04)
  expect(t.reward.expMult).toBeCloseTo(1.1)
  expect(t.reward.statXpMult).toBeCloseTo(1.05)
})
