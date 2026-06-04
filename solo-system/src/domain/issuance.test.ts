import { issueDailyQuests, needsNewDay } from './issuance'
import { questLibrary } from '../data/questLibrary'

test('needsNewDay true when stored dayKey differs from current', () => {
  expect(needsNewDay(null, '2026-06-04')).toBe(true)
  expect(needsNewDay('2026-06-03', '2026-06-04')).toBe(true)
  expect(needsNewDay('2026-06-04', '2026-06-04')).toBe(false)
})

test('issues the configured number of quests', () => {
  const quests = issueDailyQuests({ library: questLibrary, count: 4, now: 1000, durationOverrideMs: null, seed: 1 })
  expect(quests).toHaveLength(4)
})

test('issued quests have future deadlines and are not completed', () => {
  const quests = issueDailyQuests({ library: questLibrary, count: 4, now: 1000, durationOverrideMs: null, seed: 1 })
  quests.forEach(q => {
    expect(q.deadline).toBeGreaterThan(1000)
    expect(q.completed).toBe(false)
    expect(q.instanceId).toBeTruthy()
  })
})

test('selection is deterministic for a given seed', () => {
  const a = issueDailyQuests({ library: questLibrary, count: 4, now: 0, durationOverrideMs: null, seed: 42 })
  const b = issueDailyQuests({ library: questLibrary, count: 4, now: 0, durationOverrideMs: null, seed: 42 })
  expect(a.map(q => q.templateId)).toEqual(b.map(q => q.templateId))
})
