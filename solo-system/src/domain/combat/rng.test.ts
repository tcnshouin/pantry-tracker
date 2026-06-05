import { nextRandom, rollChance } from './rng'

test('nextRandom is deterministic for a given state', () => {
  const a = nextRandom(42)
  const b = nextRandom(42)
  expect(a.value).toBe(b.value)
  expect(a.state).toBe(b.state)
  expect(a.value).toBeGreaterThanOrEqual(0)
  expect(a.value).toBeLessThan(1)
})

test('nextRandom advances state to a different value', () => {
  const a = nextRandom(42)
  const c = nextRandom(a.state)
  expect(c.state).not.toBe(a.state)
})

test('rollChance is always true at 1 and always false at 0', () => {
  expect(rollChance(123, 1).hit).toBe(true)
  expect(rollChance(123, 0).hit).toBe(false)
})
