import { detectMissedQuests, enterPenalty, clearPenalty } from './penalty'
import type { PenaltyZone, QuestInstance } from './types'

const q = (over: Partial<QuestInstance>): QuestInstance => ({
  instanceId: 'i', templateId: 't', title: '', description: '', stat: 'STR',
  baseEXP: 10, baseStatXP: 5, issuedAt: 0, deadline: 100, completed: false, completedAt: null, isRedemption: false, source: 'library', ...over,
})
const inactive: PenaltyZone = { active: false, debuffMultiplier: 1, enteredAt: null }

test('detects past-deadline incomplete quests as missed', () => {
  const quests = [q({ instanceId: 'a', deadline: 50 }), q({ instanceId: 'b', deadline: 200 }), q({ instanceId: 'c', deadline: 50, completed: true })]
  const missed = detectMissedQuests(quests, 100)
  expect(missed.map(m => m.instanceId)).toEqual(['a'])
})

test('redemption quests are never counted as missed', () => {
  const quests = [q({ instanceId: 'r', deadline: 50, isRedemption: true })]
  expect(detectMissedQuests(quests, 100)).toEqual([])
})

test('entering penalty activates debuff and records time', () => {
  const z = enterPenalty(inactive, 500)
  expect(z.active).toBe(true)
  expect(z.debuffMultiplier).toBeLessThan(1)
  expect(z.enteredAt).toBe(500)
})

test('entering when already active refreshes rather than stacking', () => {
  const z1 = enterPenalty(inactive, 100)
  const z2 = enterPenalty(z1, 200)
  expect(z2.debuffMultiplier).toBe(z1.debuffMultiplier)
  expect(z2.enteredAt).toBe(200)
})

test('clearing penalty restores normal multiplier', () => {
  const cleared = clearPenalty(enterPenalty(inactive, 1))
  expect(cleared.active).toBe(false)
  expect(cleared.debuffMultiplier).toBe(1)
})
