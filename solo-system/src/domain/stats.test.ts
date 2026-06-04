import { applyStatXP } from './stats'
import type { Stat } from './types'

const stat = (subLevel: number, statXP: number): Stat => ({ type: 'STR', subLevel, statXP })

test('stat-XP accumulates without sub-level until threshold', () => {
  const s = applyStatXP(stat(0, 0), 40)
  expect(s.subLevel).toBe(0)
  expect(s.statXP).toBe(40)
})

test('reaching threshold raises sub-level and carries remainder', () => {
  const s = applyStatXP(stat(0, 80), 30)
  expect(s.subLevel).toBe(1)
  expect(s.statXP).toBe(10)
})
