import { bumpStreak, resetStreak, streakMultiplier } from './streaks'
import type { StreakRecord } from './types'

const rec = (count: number, last: string | null): StreakRecord => ({ templateId: 'q1', count, lastCompletedDay: last })

test('first completion sets streak to 1', () => {
  expect(bumpStreak(undefined, 'q1', '2026-06-04').count).toBe(1)
})

test('consecutive day increments streak', () => {
  expect(bumpStreak(rec(3, '2026-06-03'), 'q1', '2026-06-04').count).toBe(4)
})

test('same-day completion does not double-count', () => {
  expect(bumpStreak(rec(3, '2026-06-04'), 'q1', '2026-06-04').count).toBe(3)
})

test('gap resets streak to 1', () => {
  expect(bumpStreak(rec(9, '2026-06-01'), 'q1', '2026-06-04').count).toBe(1)
})

test('multiplier rises with streak and caps', () => {
  expect(streakMultiplier(0)).toBe(1)
  expect(streakMultiplier(7)).toBeCloseTo(1.35)
  expect(streakMultiplier(1000)).toBe(2)
})

test('resetStreak zeroes the count', () => {
  expect(resetStreak(rec(9, '2026-06-03')).count).toBe(0)
})
