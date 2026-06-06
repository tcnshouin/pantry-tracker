export type ItemSlot = 'weapon' | 'armor' | 'accessory'
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type CombatBonusKind = 'attack' | 'maxHP' | 'defense' | 'critChance' | 'skillPowerMult'
export type RewardBonusKind = 'expMult' | 'statXpMult'
export type BonusKind = CombatBonusKind | RewardBonusKind

export interface ItemBonus { kind: BonusKind; value: number }

export interface Item {
  id: string
  baseId: string
  name: string
  slot: ItemSlot
  rarity: Rarity
  enhanceLevel: number
  bonuses: ItemBonus[]
}

export interface ItemTemplate { baseId: string; name: string; slot: ItemSlot; primaryBonus: BonusKind }

export interface Equipment { weapon: Item | null; armor: Item | null; accessory: Item | null }

export const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']
export const FRACTIONAL_BONUSES: BonusKind[] = ['critChance', 'skillPowerMult', 'expMult', 'statXpMult']
