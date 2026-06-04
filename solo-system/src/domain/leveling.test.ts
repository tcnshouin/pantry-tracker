import { expToNext, addExp } from './leveling'
import { STAT_TYPES, type Player } from './types'

function freshPlayer(): Player {
  const stats = Object.fromEntries(STAT_TYPES.map(t => [t, { type: t, subLevel: 0, statXP: 0 }])) as Player['stats']
  return { level: 1, currentEXP: 0, freeStatPoints: 0, classRank: 'E', currency: 0, gateKeys: 0, stats }
}

test('expToNext grows on the exponential curve', () => {
  expect(expToNext(1)).toBe(100)
  expect(expToNext(10)).toBeGreaterThan(expToNext(9))
  expect(expToNext(50)).toBeGreaterThan(expToNext(10) * 5)
})

test('adding exp below threshold does not level up', () => {
  const p = addExp(freshPlayer(), 50)
  expect(p.level).toBe(1)
  expect(p.currentEXP).toBe(50)
  expect(p.freeStatPoints).toBe(0)
})

test('crossing the threshold levels up, bumps every stat by 1, grants free points', () => {
  const p = addExp(freshPlayer(), 100)
  expect(p.level).toBe(2)
  expect(p.currentEXP).toBe(0)
  expect(p.freeStatPoints).toBe(5)
  STAT_TYPES.forEach(t => expect(p.stats[t].subLevel).toBe(1))
})

test('a single large exp gain can multi-level and carry remainder', () => {
  const p = addExp(freshPlayer(), 100 + expToNext(2) + 10)
  expect(p.level).toBe(3)
  expect(p.currentEXP).toBe(10)
  expect(p.freeStatPoints).toBe(10)
})

test('class rank advances at thresholds', () => {
  let p = freshPlayer()
  p = { ...p, level: 13 }
  p = addExp(p, 0)
  expect(p.classRank).toBe('D')
})
