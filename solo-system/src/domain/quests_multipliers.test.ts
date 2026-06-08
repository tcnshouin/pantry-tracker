import { completeQuest } from './quests'
import { STAT_TYPES, type Player, type QuestInstance, type PenaltyZone } from './types'

function freshPlayer(): Player {
  const stats = Object.fromEntries(STAT_TYPES.map(t => [t, { type: t, subLevel: 0, statXP: 0 }])) as Player['stats']
  return { level: 1, currentEXP: 0, freeStatPoints: 0, classRank: 'E', currency: 0, gateKeys: 0, stats }
}
const quest = (): QuestInstance => ({ instanceId: 'i', templateId: 'q', title: '', description: '', stat: 'STR', baseEXP: 40, baseStatXP: 20, issuedAt: 0, deadline: 999, completed: false, completedAt: null, isRedemption: false, source: 'library' })
const noPenalty: PenaltyZone = { active: false, debuffMultiplier: 1, enteredAt: null }

test('reward multipliers scale EXP and stat-XP', () => {
  const base = completeQuest({ player: freshPlayer(), quest: quest(), streak: undefined, penalty: noPenalty, today: '2026-06-06', now: 1 })
  const boosted = completeQuest({ player: freshPlayer(), quest: quest(), streak: undefined, penalty: noPenalty, today: '2026-06-06', now: 1, rewardMultipliers: { expMult: 2, statXpMult: 2 } })
  expect(boosted.player.currentEXP).toBe(base.player.currentEXP * 2)
  expect(boosted.player.stats.STR.statXP).toBeGreaterThan(base.player.stats.STR.statXP)
})

test('currency and gateKeys grants are NOT multiplied', () => {
  const boosted = completeQuest({ player: freshPlayer(), quest: quest(), streak: undefined, penalty: noPenalty, today: '2026-06-06', now: 1, rewardMultipliers: { expMult: 5, statXpMult: 5 } })
  expect(boosted.player.currency).toBe(10)
  expect(boosted.player.gateKeys).toBe(1)
})
