import { completeQuest } from './quests'
import { STAT_TYPES, type Player, type QuestInstance, type StreakRecord, type PenaltyZone } from './types'

function freshPlayer(): Player {
  const stats = Object.fromEntries(STAT_TYPES.map(t => [t, { type: t, subLevel: 0, statXP: 0 }])) as Player['stats']
  return { level: 1, currentEXP: 0, freeStatPoints: 0, classRank: 'E', currency: 0, gateKeys: 0, stats }
}
const quest = (): QuestInstance => ({
  instanceId: 'i1', templateId: 'q1', title: 'Push-ups', description: '', stat: 'STR',
  baseEXP: 50, baseStatXP: 20, issuedAt: 0, deadline: 999, completed: false, completedAt: null, isRedemption: false,
})
const noPenalty: PenaltyZone = { active: false, debuffMultiplier: 1, enteredAt: null }

test('completing a quest grants EXP and stat-XP and increments streak', () => {
  const r = completeQuest({ player: freshPlayer(), quest: quest(), streak: undefined, penalty: noPenalty, today: '2026-06-04', now: 10 })
  expect(r.player.currentEXP).toBe(50)
  expect(r.player.stats.STR.statXP).toBeGreaterThan(0)
  expect(r.streak.count).toBe(1)
  expect(r.quest.completed).toBe(true)
  expect(r.quest.completedAt).toBe(10)
})

test('higher streak multiplies stat-XP (consistency matters)', () => {
  const lowStreak: StreakRecord = { templateId: 'q1', count: 0, lastCompletedDay: '2026-06-03' }
  const highStreak: StreakRecord = { templateId: 'q1', count: 14, lastCompletedDay: '2026-06-03' }
  const low = completeQuest({ player: freshPlayer(), quest: quest(), streak: lowStreak, penalty: noPenalty, today: '2026-06-04', now: 10 })
  const high = completeQuest({ player: freshPlayer(), quest: quest(), streak: highStreak, penalty: noPenalty, today: '2026-06-04', now: 10 })
  expect(high.player.stats.STR.statXP).toBeGreaterThan(low.player.stats.STR.statXP)
})

test('penalty debuff reduces gains', () => {
  const debuff: PenaltyZone = { active: true, debuffMultiplier: 0.5, enteredAt: 1 }
  const r = completeQuest({ player: freshPlayer(), quest: quest(), streak: undefined, penalty: debuff, today: '2026-06-04', now: 10 })
  expect(r.player.currentEXP).toBe(25)
})

test('completing an already-completed quest is a no-op', () => {
  const q = { ...quest(), completed: true, completedAt: 5 }
  const r = completeQuest({ player: freshPlayer(), quest: q, streak: undefined, penalty: noPenalty, today: '2026-06-04', now: 10 })
  expect(r.player.currentEXP).toBe(0)
})
