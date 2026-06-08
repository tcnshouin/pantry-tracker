import { issueRitualQuests } from './rituals'
import type { RitualTemplate } from './types'

const ritual = (over: Partial<RitualTemplate>): RitualTemplate => ({ id: 'r1', title: 'Pushups', description: 'do them', stat: 'STR', difficulty: 'medium', durationMinutes: 120, ...over })

test('issues one instance per ritual, tagged source ritual', () => {
  const out = issueRitualQuests([ritual({}), ritual({ id: 'r2', title: 'Read' })], 1000)
  expect(out).toHaveLength(2)
  expect(out[0].source).toBe('ritual')
  expect(out[0].isRedemption).toBe(false)
  expect(out[0].templateId).toBe('r1')
  expect(out[0].deadline).toBe(1000 + 120 * 60_000)
})

test('rewards come from the difficulty preset', () => {
  const easy = issueRitualQuests([ritual({ difficulty: 'easy' })], 0)[0]
  const hard = issueRitualQuests([ritual({ difficulty: 'hard' })], 0)[0]
  expect(hard.baseEXP).toBeGreaterThan(easy.baseEXP)
  expect(hard.baseStatXP).toBeGreaterThan(easy.baseStatXP)
})

test('empty rituals yields no quests', () => {
  expect(issueRitualQuests([], 0)).toEqual([])
})
