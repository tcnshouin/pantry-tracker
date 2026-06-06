import { enhanceCost, enhanceItem } from './enhance'
import type { Item } from './types'

const item = (over: Partial<Item>): Item => ({ id: 'i', baseId: 'b', name: 'N', slot: 'weapon', rarity: 'common', enhanceLevel: 0, bonuses: [{ kind: 'attack', value: 10 }], ...over })

test('enhanceCost rises with enhance level', () => {
  expect(enhanceCost(item({ enhanceLevel: 3 }))).toBeGreaterThan(enhanceCost(item({ enhanceLevel: 0 })))
})

test('enhanceCost rises with rarity', () => {
  expect(enhanceCost(item({ rarity: 'legendary' }))).toBeGreaterThan(enhanceCost(item({ rarity: 'common' })))
})

test('enhanceItem raises level and grows bonus values', () => {
  const e = enhanceItem(item({ enhanceLevel: 0, bonuses: [{ kind: 'attack', value: 10 }] }))
  expect(e.enhanceLevel).toBe(1)
  expect(e.bonuses[0].value).toBeGreaterThan(10)
})

test('a small integer bonus still grows by at least 1 per enhance', () => {
  const e = enhanceItem(item({ bonuses: [{ kind: 'defense', value: 2 }] }))
  expect(e.bonuses[0].value).toBeGreaterThanOrEqual(3)
})

test('a fractional bonus grows multiplicatively', () => {
  const e = enhanceItem(item({ bonuses: [{ kind: 'critChance', value: 0.04 }] }))
  expect(e.bonuses[0].value).toBeCloseTo(0.046)
})
