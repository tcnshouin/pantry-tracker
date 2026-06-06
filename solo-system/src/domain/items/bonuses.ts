import type { CombatBonusKind, Equipment } from './types'

export interface EquipmentTotals {
  combat: Record<CombatBonusKind, number>
  reward: { expMult: number; statXpMult: number }
}

export function aggregateEquipment(eq: Equipment): EquipmentTotals {
  const totals: EquipmentTotals = {
    combat: { attack: 0, maxHP: 0, defense: 0, critChance: 0, skillPowerMult: 0 },
    reward: { expMult: 1, statXpMult: 1 },
  }
  for (const item of [eq.weapon, eq.armor, eq.accessory]) {
    if (!item) continue
    for (const b of item.bonuses) {
      if (b.kind === 'expMult') totals.reward.expMult += b.value
      else if (b.kind === 'statXpMult') totals.reward.statXpMult += b.value
      else totals.combat[b.kind] += b.value
    }
  }
  return totals
}
