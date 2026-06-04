import type { ClassRank, StatType } from './types'

export const balanceConfig = {
  baseExpConstant: 100,
  expCurveExponent: 1.6,
  freeStatPointsPerLevel: 5,
  statXPPerSubLevel: 100,
  streakMultiplierStep: 0.05,
  streakMultiplierMax: 2,
  penaltyDebuffMultiplier: 0.5,
  dailyQuestCount: 4,
  defaultResetHour: 4,
  redemptionQuest: { baseEXP: 80, baseStatXP: 30, durationMinutes: 24 * 60 },
  classRankThresholds: {
    E: 1, D: 13, C: 26, B: 39, A: 52, S: 65, NATIONAL: 80, MONARCH: 100,
  } as Record<ClassRank, number>,
}

export const statLabels: Record<StatType, string> = {
  STR: 'Strength', VIT: 'Vitality', AGI: 'Agility', INT: 'Intelligence', PER: 'Perception',
}
