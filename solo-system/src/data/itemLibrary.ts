import type { ItemTemplate } from '../domain/items/types'

export const itemLibrary: ItemTemplate[] = [
  { baseId: 'rusted-blade', name: 'Rusted Blade', slot: 'weapon', primaryBonus: 'attack' },
  { baseId: 'hunters-dagger', name: "Hunter's Dagger", slot: 'weapon', primaryBonus: 'attack' },
  { baseId: 'shadow-edge', name: 'Shadow Edge', slot: 'weapon', primaryBonus: 'attack' },
  { baseId: 'leather-vest', name: 'Leather Vest', slot: 'armor', primaryBonus: 'maxHP' },
  { baseId: 'iron-plate', name: 'Iron Plate', slot: 'armor', primaryBonus: 'defense' },
  { baseId: 'shadow-cloak', name: 'Shadow Cloak', slot: 'armor', primaryBonus: 'maxHP' },
  { baseId: 'focus-ring', name: 'Focus Ring', slot: 'accessory', primaryBonus: 'critChance' },
  { baseId: 'sage-amulet', name: 'Sage Amulet', slot: 'accessory', primaryBonus: 'skillPowerMult' },
  { baseId: 'scholars-charm', name: "Scholar's Charm", slot: 'accessory', primaryBonus: 'expMult' },
]
