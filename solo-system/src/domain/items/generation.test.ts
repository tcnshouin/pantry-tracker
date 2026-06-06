import { generateItem, rollGateDrop, roundBonusValue } from './generation'
import { itemLibrary } from '../../data/itemLibrary'
import type { GateDef } from '../../data/gateLibrary'

const weaponTemplate = itemLibrary.find(t => t.slot === 'weapon')!

test('generateItem is deterministic for a given seed', () => {
  const a = generateItem(weaponTemplate, 'rare', 999)
  const b = generateItem(weaponTemplate, 'rare', 999)
  expect(a.bonuses).toEqual(b.bonuses)
  expect(a.slot).toBe('weapon')
  expect(a.rarity).toBe('rare')
  expect(a.enhanceLevel).toBe(0)
})

test('higher rarity rolls a bigger primary bonus and more affixes', () => {
  const common = generateItem(weaponTemplate, 'common', 5)
  const legendary = generateItem(weaponTemplate, 'legendary', 5)
  expect(common.bonuses).toHaveLength(1)
  expect(legendary.bonuses.length).toBeGreaterThan(common.bonuses.length)
  expect(legendary.bonuses[0].value).toBeGreaterThan(common.bonuses[0].value)
})

test('the primary bonus matches the template', () => {
  const item = generateItem(weaponTemplate, 'common', 7)
  expect(item.bonuses[0].kind).toBe('attack')
})

test('roundBonusValue keeps fractional kinds to 3 decimals and integer kinds whole', () => {
  expect(roundBonusValue('attack', 3.7)).toBe(4)
  expect(roundBonusValue('critChance', 0.04567)).toBe(0.046)
})

test('rollGateDrop always yields at least the guaranteed boss drop', () => {
  const gate = { id: 'g', name: 'G', rankTier: 'E', keyCost: 1, goldReward: 10, enemyIds: [], unlockedBy: null } as GateDef
  const items = rollGateDrop(gate, 12345)
  expect(items.length).toBeGreaterThanOrEqual(1)
  expect(items[0].id).toBeTruthy()
})
