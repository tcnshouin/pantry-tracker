import { dayKey, type Clock } from './time'

const fixed = (iso: string): Clock => ({ now: () => new Date(iso).getTime() })

test('dayKey returns YYYY-MM-DD for the configured reset hour', () => {
  expect(dayKey(new Date('2026-06-04T03:00:00').getTime(), 4)).toBe('2026-06-03')
  expect(dayKey(new Date('2026-06-04T04:00:00').getTime(), 4)).toBe('2026-06-04')
})

test('clock is injectable', () => {
  const c = fixed('2026-06-04T12:00:00')
  expect(typeof c.now()).toBe('number')
})
