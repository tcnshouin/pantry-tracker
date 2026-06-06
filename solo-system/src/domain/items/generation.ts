import { balanceConfig } from '../balanceConfig'
import { nextRandom } from '../combat/rng'
import { FRACTIONAL_BONUSES, type BonusKind, type Item, type ItemBonus, type ItemTemplate, type Rarity } from './types'
import { itemLibrary } from '../../data/itemLibrary'
import type { GateDef } from '../../data/gateLibrary'

export function roundBonusValue(kind: BonusKind, raw: number): number {
  return FRACTIONAL_BONUSES.includes(kind) ? Math.round(raw * 1000) / 1000 : Math.round(raw)
}

function rollBonus(kind: BonusKind, rarityMult: number, state: number): { bonus: ItemBonus; state: number } {
  const range = balanceConfig.loot.bonusRanges[kind]
  const r = nextRandom(state)
  const raw = (range.min + r.value * (range.max - range.min)) * rarityMult
  return { bonus: { kind, value: roundBonusValue(kind, raw) }, state: r.state }
}

function pickAffix(state: number, exclude: BonusKind[]): { kind: BonusKind; state: number } | null {
  const pool = (balanceConfig.loot.affixPool as BonusKind[]).filter(k => !exclude.includes(k))
  if (pool.length === 0) return null
  const r = nextRandom(state)
  return { kind: pool[Math.floor(r.value * pool.length)], state: r.state }
}

export function generateItem(template: ItemTemplate, rarity: Rarity, seed: number): Item {
  let state = (seed & 0x7fffffff) || 1
  const rarityMult = balanceConfig.loot.rarityMultiplier[rarity]
  const primary = rollBonus(template.primaryBonus, rarityMult, state); state = primary.state
  const bonuses: ItemBonus[] = [primary.bonus]
  const affixCount = balanceConfig.loot.affixCountByRarity[rarity]
  const chosen: BonusKind[] = [template.primaryBonus]
  for (let i = 0; i < affixCount; i++) {
    const pick = pickAffix(state, chosen)
    if (!pick) break
    state = pick.state
    chosen.push(pick.kind)
    const b = rollBonus(pick.kind, rarityMult, state); state = b.state
    bonuses.push(b.bonus)
  }
  return { id: `item-${seed}`, baseId: template.baseId, name: template.name, slot: template.slot, rarity, enhanceLevel: 0, bonuses }
}

function weightedRarity(weights: Record<string, number>, state: number): { rarity: Rarity; state: number } {
  const entries = Object.entries(weights) as [Rarity, number][]
  const total = entries.reduce((a, [, w]) => a + w, 0)
  const r = nextRandom(state)
  let roll = r.value * total
  for (const [rarity, w] of entries) {
    roll -= w
    if (roll < 0) return { rarity, state: r.state }
  }
  return { rarity: entries[0][0], state: r.state }
}

function pickTemplate(state: number): { template: ItemTemplate; state: number } {
  const r = nextRandom(state)
  return { template: itemLibrary[Math.floor(r.value * itemLibrary.length)], state: r.state }
}

export function rollGateDrop(gate: GateDef, seed: number): Item[] {
  let state = (seed & 0x7fffffff) || 1
  const weights = balanceConfig.loot.rarityWeightsByTier[gate.rankTier] ?? balanceConfig.loot.rarityWeightsByTier.E
  const items: Item[] = []

  const r1 = weightedRarity(weights, state); state = r1.state
  const t1 = pickTemplate(state); state = t1.state
  items.push(generateItem(t1.template, r1.rarity, state))
  state = nextRandom(state).state

  const bonus = nextRandom(state); state = bonus.state
  if (bonus.value < balanceConfig.loot.bonusDropChance) {
    const r2 = weightedRarity(weights, state); state = r2.state
    const t2 = pickTemplate(state); state = t2.state
    items.push(generateItem(t2.template, r2.rarity, state + 7))
  }
  return items
}
