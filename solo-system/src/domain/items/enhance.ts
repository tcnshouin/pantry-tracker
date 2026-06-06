import { balanceConfig } from '../balanceConfig'
import { roundBonusValue } from './generation'
import { FRACTIONAL_BONUSES } from './types'
import type { Item } from './types'

export function enhanceCost(item: Item): number {
  const e = balanceConfig.loot.enhance
  return Math.round(e.baseCost * e.rarityCostMultiplier[item.rarity] * Math.pow(e.costGrowthPerLevel, item.enhanceLevel))
}

export function enhanceItem(item: Item): Item {
  const g = balanceConfig.loot.enhance.bonusGrowthPerLevel
  return {
    ...item,
    enhanceLevel: item.enhanceLevel + 1,
    bonuses: item.bonuses.map(b => ({
      ...b,
      value: FRACTIONAL_BONUSES.includes(b.kind)
        ? roundBonusValue(b.kind, b.value * (1 + g))
        : Math.max(b.value + 1, Math.round(b.value * (1 + g))),
    })),
  }
}
