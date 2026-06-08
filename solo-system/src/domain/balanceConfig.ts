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
  loot: {
    affixCountByRarity: { common: 0, uncommon: 1, rare: 1, epic: 2, legendary: 3 } as Record<string, number>,
    rarityMultiplier: { common: 1, uncommon: 1.3, rare: 1.7, epic: 2.3, legendary: 3 } as Record<string, number>,
    bonusRanges: {
      attack: { min: 2, max: 5 },
      maxHP: { min: 10, max: 25 },
      defense: { min: 1, max: 3 },
      critChance: { min: 0.02, max: 0.05 },
      skillPowerMult: { min: 0.03, max: 0.08 },
      expMult: { min: 0.03, max: 0.08 },
      statXpMult: { min: 0.03, max: 0.08 },
    } as Record<string, { min: number; max: number }>,
    affixPool: ['attack', 'maxHP', 'defense', 'critChance', 'skillPowerMult', 'expMult', 'statXpMult'] as string[],
    rarityWeightsByTier: {
      E: { common: 70, uncommon: 25, rare: 5, epic: 0, legendary: 0 },
      D: { common: 45, uncommon: 35, rare: 17, epic: 3, legendary: 0 },
      C: { common: 25, uncommon: 35, rare: 28, epic: 10, legendary: 2 },
    } as Record<string, Record<string, number>>,
    bonusDropChance: 0.25,
    enhance: {
      baseCost: 25,
      costGrowthPerLevel: 1.6,
      rarityCostMultiplier: { common: 1, uncommon: 1.5, rare: 2.2, epic: 3, legendary: 4 } as Record<string, number>,
      bonusGrowthPerLevel: 0.15,
    },
  },
  shadows: {
    arise: { normalChance: 0.2, bossChance: 0.6 },
    powerPerSourceFactor: 0.5,
    shadowStrikeFactor: 1,
    baseDeployCap: 3,
    deployCapPerLevels: 10,
  },
  rituals: {
    difficulties: {
      easy:   { baseEXP: 25, baseStatXP: 12 },
      medium: { baseEXP: 45, baseStatXP: 22 },
      hard:   { baseEXP: 70, baseStatXP: 35 },
    } as Record<string, { baseEXP: number; baseStatXP: number }>,
    defaultDurationMinutes: 16 * 60,
    maxRituals: 12,
  },
  classRankThresholds: {
    E: 1, D: 13, C: 26, B: 39, A: 52, S: 65, NATIONAL: 80, MONARCH: 100,
  } as Record<ClassRank, number>,
}

export const statLabels: Record<StatType, string> = {
  STR: 'Strength', VIT: 'Vitality', AGI: 'Agility', INT: 'Intelligence', PER: 'Perception',
}
