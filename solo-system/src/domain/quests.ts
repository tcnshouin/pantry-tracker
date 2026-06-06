import { addExp } from './leveling'
import { applyStatXP } from './stats'
import { bumpStreak, streakMultiplier } from './streaks'
import type { Player, PenaltyZone, QuestInstance, StreakRecord } from './types'

export interface CompleteQuestInput {
  player: Player
  quest: QuestInstance
  streak: StreakRecord | undefined
  penalty: PenaltyZone
  today: string
  now: number
  rewardMultipliers?: { expMult: number; statXpMult: number }
}
export interface CompleteQuestResult {
  player: Player
  quest: QuestInstance
  streak: StreakRecord
}

export function completeQuest(input: CompleteQuestInput): CompleteQuestResult {
  const { player, quest, streak, penalty, today, now } = input
  if (quest.completed) {
    return { player, quest, streak: streak ?? { templateId: quest.templateId, count: 0, lastCompletedDay: null } }
  }
  const debuff = penalty.active ? penalty.debuffMultiplier : 1
  const newStreak = bumpStreak(streak, quest.templateId, today)
  const mult = streakMultiplier(newStreak.count)

  const rm = input.rewardMultipliers ?? { expMult: 1, statXpMult: 1 }
  const expGain = quest.baseEXP * debuff * rm.expMult
  const statGain = quest.baseStatXP * mult * debuff * rm.statXpMult

  let next = addExp(player, expGain)
  next = { ...next, stats: { ...next.stats, [quest.stat]: applyStatXP(next.stats[quest.stat], statGain) } }
  next = { ...next, currency: next.currency + 10, gateKeys: next.gateKeys + 1 }

  return {
    player: next,
    quest: { ...quest, completed: true, completedAt: now },
    streak: newStreak,
  }
}
