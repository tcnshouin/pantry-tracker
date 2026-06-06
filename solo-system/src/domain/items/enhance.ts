import { balanceConfig } from '../balanceConfig'
import { roundBonusValue } from './generation'
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
    bonuses: item.bonuses.map(b => ({ ...b, value: roundBonusValue(b.kind, b.value * (1 + g)) })),
  }
}
