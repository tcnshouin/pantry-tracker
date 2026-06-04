import { balanceConfig } from './balanceConfig'
import type { PenaltyZone, QuestInstance } from './types'

export function detectMissedQuests(quests: QuestInstance[], now: number): QuestInstance[] {
  return quests.filter(q => !q.completed && !q.isRedemption && q.deadline <= now)
}

export function enterPenalty(_zone: PenaltyZone, now: number): PenaltyZone {
  return { active: true, debuffMultiplier: balanceConfig.penaltyDebuffMultiplier, enteredAt: now }
}

export function clearPenalty(_zone: PenaltyZone): PenaltyZone {
  return { active: false, debuffMultiplier: 1, enteredAt: null }
}

export function buildRedemptionQuest(now: number): QuestInstance {
  return {
    instanceId: `redemption-${now}`,
    templateId: 'redemption',
    title: 'Penalty Quest: Redemption',
    description: 'Clear this to escape the Penalty Zone and lift the debuff.',
    stat: 'STR',
    baseEXP: balanceConfig.redemptionQuest.baseEXP,
    baseStatXP: balanceConfig.redemptionQuest.baseStatXP,
    issuedAt: now,
    deadline: now + balanceConfig.redemptionQuest.durationMinutes * 60_000,
    completed: false,
    completedAt: null,
    isRedemption: true,
  }
}
