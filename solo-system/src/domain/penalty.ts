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
