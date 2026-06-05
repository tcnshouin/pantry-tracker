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
  combat: {
    baseHP: 50, hpPerVit: 10,
    baseMP: 20, mpPerInt: 3,
    baseAttack: 5, attackPerStr: 2,
    basePlayerDefense: 2, defensePerVit: 1,
    skillPowerPerInt: 0.05,
    critCap: 0.5, critPerPer: 0.01, critMultiplier: 1.75,
    dodgeCap: 0.25, dodgePerPer: 0.005,
    defendDamageReduction: 0.5, defendMpRestoreFraction: 0.1,
    enemyHeavyMoveEveryNRounds: 3, enemyHeavyMoveMultiplier: 1.5,
    skills: {
      powerStrike: { id: 'powerStrike', name: 'Power Strike', unlockLevel: 1, mpCost: 8, attackMult: 1.8 },
      mend: { id: 'mend', name: 'Mend', unlockLevel: 3, mpCost: 12, baseHeal: 20 },
      focus: { id: 'focus', name: 'Focus', unlockLevel: 5, mpCost: 10, critBonus: 0.25, turns: 3 },
      weaken: { id: 'weaken', name: 'Weaken', unlockLevel: 8, mpCost: 14, attackDown: 0.3, defenseDown: 0.3, turns: 3 },
    },
  },
  classRankThresholds: {
    E: 1, D: 13, C: 26, B: 39, A: 52, S: 65, NATIONAL: 80, MONARCH: 100,
  } as Record<ClassRank, number>,
}

export const statLabels: Record<StatType, string> = {
  STR: 'Strength', VIT: 'Vitality', AGI: 'Agility', INT: 'Intelligence', PER: 'Perception',
}
