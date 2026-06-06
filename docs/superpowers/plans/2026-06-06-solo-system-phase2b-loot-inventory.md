# Solo System — Phase 2b (Loot & Inventory) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add item drops, an inventory, a 3-slot equipment system, gear that boosts combat AND amplifies real quest rewards, and gold-fueled enhancement — without combat ever granting real EXP/stat-XP.

**Architecture:** A pure, unit-tested items domain under `src/domain/items/` (types, generation via the existing seeded RNG, equipment aggregation, enhancement) plus `src/data/itemLibrary.ts`. The store rolls drops on a gate win and gains equip/unequip/enhance actions; quest completion gains optional reward multipliers from equipped gear; combat folds equipped combat bonuses onto the hunter. Schema migrates v2 → v3. A new Inventory screen renders it.

**Tech Stack:** Existing — React + Vite + TS + Tailwind + Zustand + Dexie + framer-motion + lucide-react + Vitest. No new deps.

**Core principle (enforced):** Combat/drops/equip/enhance touch only items and gold — never level/EXP/stat-XP. Gear's reward multipliers apply ONLY inside `completeQuest` (a real quest). A guard test asserts a full combat + equip + enhance leaves level/currentEXP/statXP/subLevel unchanged.

**Working dir:** `solo-system/` inside the worktree `/Users/andreupaz/sololevelling/.claude/worktrees/solo-phase2b`. Paths below are relative to `solo-system/`. **Run `npm install` first** (fresh worktree). Tests: `npx vitest run <path>`; build: `npm run build`.

**Standing rule:** No comments in any code files. None.

---

## File structure

```
src/domain/items/types.ts        (new) item/equipment types
src/domain/items/generation.ts   (new) generateItem + rollGateDrop + shared rounding
src/domain/items/bonuses.ts      (new) aggregateEquipment
src/domain/items/enhance.ts      (new) enhanceCost + enhanceItem
src/data/itemLibrary.ts          (new) base item templates
src/domain/balanceConfig.ts      (modify) add `loot` block
src/domain/types.ts              (modify) SaveState.inventory + .equipment
src/domain/combat/types.ts       (modify) CombatState.droppedItems?
src/persistence/repository.ts    (modify) SCHEMA_VERSION=3, freshSaveState fields, migrate v2->v3
src/domain/quests.ts             (modify) optional rewardMultipliers
src/domain/gates.ts              (modify) buildCombatState gains equipment param
src/store/useSystemStore.ts      (modify) drops on win, equip/unequip/enhance, pass multipliers+equipment, droppedItems
src/components/ItemCard.tsx       (new)
src/screens/InventoryScreen.tsx   (new)
src/components/BottomNav.tsx      (modify) Inventory tab
src/App.tsx                       (modify) /inventory route
src/screens/BattleScreen.tsx      (modify) loot in win overlay
```

## Conventions
TDD per code task (failing test → run → implement → run → commit). No comments. Items domain is pure (no React/Dexie/Date.now); randomness only via the seeded RNG in `src/domain/combat/rng.ts` (`nextRandom(state) → {value, state}`).

---

## Task 1: Item types + loot config + SaveState/CombatState fields

**Files:** Create `src/domain/items/types.ts`; modify `src/domain/balanceConfig.ts`, `src/domain/types.ts`, `src/domain/combat/types.ts`, `src/persistence/repository.ts`.

- [ ] **Step 1: Create `src/domain/items/types.ts`**
```ts
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
```

- [ ] **Step 2: Add the `loot` block to `balanceConfig.ts`** (inside the `balanceConfig` object, after `combat`):
```ts
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
```

- [ ] **Step 3: Extend `SaveState` in `types.ts`** — add an import and two fields:
```ts
import type { Item, Equipment } from './items/types'
```
(if a type-only import grouping exists, follow it). Add to `SaveState`:
```ts
  inventory: Item[]
  equipment: Equipment
```

- [ ] **Step 4: Add `droppedItems` to `CombatState` in `src/domain/combat/types.ts`**
Add an import `import type { Item } from '../items/types'` and the optional field to `CombatState`:
```ts
  droppedItems?: Item[]
```

- [ ] **Step 5: Update `repository.ts`** — bump version and fresh fields (migration logic is Task 2):
- Change `export const SCHEMA_VERSION = 2` → `= 3`.
- In `freshSaveState`'s returned object add:
```ts
    inventory: [],
    equipment: { weapon: null, armor: null, accessory: null },
```

- [ ] **Step 6: Verify** — `npx vitest run` (existing 75 pass; `freshSaveState` is the only SaveState constructor so types compile) and `npm run build`. Fix any type errors.

- [ ] **Step 7: Commit**
```bash
git add src/domain/items/types.ts src/domain/balanceConfig.ts src/domain/types.ts src/domain/combat/types.ts src/persistence/repository.ts
git commit -m "feat(solo-system): item types, loot config, inventory/equipment + droppedItems fields"
```

---

## Task 2: Migration v2 → v3

**Files:** Modify `src/persistence/repository.ts`; create `src/persistence/migration_v3.test.ts`

- [ ] **Step 1: Failing test** `src/persistence/migration_v3.test.ts`:
```ts
import { db, SAVE_KEY } from './db'
import { loadState, freshSaveState, SCHEMA_VERSION } from './repository'

beforeEach(async () => { await db.saves.clear() })

test('a v2 save gains inventory + equipment and becomes v3', async () => {
  const v2: any = freshSaveState(4)
  delete v2.inventory
  delete v2.equipment
  v2.schemaVersion = 2
  await db.saves.put({ key: SAVE_KEY, state: v2 })
  const loaded = await loadState()
  expect(loaded?.schemaVersion).toBe(SCHEMA_VERSION)
  expect(loaded?.inventory).toEqual([])
  expect(loaded?.equipment).toEqual({ weapon: null, armor: null, accessory: null })
})

test('a v1 save composes both migrations to v3', async () => {
  const v1: any = freshSaveState(4)
  delete v1.gates
  delete v1.inventory
  delete v1.equipment
  v1.schemaVersion = 1
  await db.saves.put({ key: SAVE_KEY, state: v1 })
  const loaded = await loadState()
  expect(loaded?.schemaVersion).toBe(3)
  expect(loaded?.gates).toEqual({ clearedGateIds: [] })
  expect(loaded?.inventory).toEqual([])
  expect(loaded?.equipment).toEqual({ weapon: null, armor: null, accessory: null })
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Extend `migrate` in `repository.ts`** (add the v3 step after the existing v2 step):
```ts
function migrate(raw: SaveState): SaveState {
  let s = raw
  if (s.schemaVersion < 2) {
    s = { ...s, gates: s.gates ?? { clearedGateIds: [] }, schemaVersion: 2 }
  }
  if (s.schemaVersion < 3) {
    s = {
      ...s,
      inventory: s.inventory ?? [],
      equipment: s.equipment ?? { weapon: null, armor: null, accessory: null },
      schemaVersion: 3,
    }
  }
  return s
}
```

- [ ] **Step 4: Run → PASS.** Full suite + build.

- [ ] **Step 5: Commit**
```bash
git add src/persistence/repository.ts src/persistence/migration_v3.test.ts
git commit -m "feat(solo-system): schema migration v2 to v3 (inventory + equipment)"
```

---

## Task 3: Item library + generation

**Files:** Create `src/data/itemLibrary.ts`, `src/domain/items/generation.ts`, `src/domain/items/generation.test.ts`

- [ ] **Step 1: Create `src/data/itemLibrary.ts`**
```ts
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
```

- [ ] **Step 2: Failing test** `src/domain/items/generation.test.ts`:
```ts
import { generateItem, rollGateDrop, roundBonusValue } from './generation'
import { itemLibrary } from '../../data/itemLibrary'
import type { GateDef } from '../../data/gateLibrary'

const weaponTemplate = itemLibrary.find(t => t.slot === 'weapon')!

test('generateItem is deterministic for a given seed', () => {
  const a = generateItem(weaponTemplate, 'rare', 999)
  const b = generateItem(weaponTemplate, 'rare', 999)
  expect(a.bonuses).toEqual(b.bonuses)
  expect(a.slot).toBe('weapon')
  expect(a.rarity).toBe('rare')
  expect(a.enhanceLevel).toBe(0)
})

test('higher rarity rolls a bigger primary bonus and more affixes', () => {
  const common = generateItem(weaponTemplate, 'common', 5)
  const legendary = generateItem(weaponTemplate, 'legendary', 5)
  expect(common.bonuses).toHaveLength(1)
  expect(legendary.bonuses.length).toBeGreaterThan(common.bonuses.length)
  expect(legendary.bonuses[0].value).toBeGreaterThan(common.bonuses[0].value)
})

test('the primary bonus matches the template', () => {
  const item = generateItem(weaponTemplate, 'common', 7)
  expect(item.bonuses[0].kind).toBe('attack')
})

test('roundBonusValue keeps fractional kinds to 3 decimals and integer kinds whole', () => {
  expect(roundBonusValue('attack', 3.7)).toBe(4)
  expect(roundBonusValue('critChance', 0.04567)).toBe(0.046)
})

test('rollGateDrop always yields at least the guaranteed boss drop', () => {
  const gate = { id: 'g', name: 'G', rankTier: 'E', keyCost: 1, goldReward: 10, enemyIds: [], unlockedBy: null } as GateDef
  const items = rollGateDrop(gate, 12345)
  expect(items.length).toBeGreaterThanOrEqual(1)
  expect(items[0].id).toBeTruthy()
})
```

- [ ] **Step 3: Run → FAIL.**

- [ ] **Step 4: Implement `src/domain/items/generation.ts`**
```ts
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

function pickAffix(state: number, exclude: BonusKind): { kind: BonusKind; state: number } {
  const pool = balanceConfig.loot.affixPool.filter(k => k !== exclude) as BonusKind[]
  const r = nextRandom(state)
  return { kind: pool[Math.floor(r.value * pool.length)], state: r.state }
}

export function generateItem(template: ItemTemplate, rarity: Rarity, seed: number): Item {
  let state = (seed & 0x7fffffff) || 1
  const rarityMult = balanceConfig.loot.rarityMultiplier[rarity]
  const primary = rollBonus(template.primaryBonus, rarityMult, state); state = primary.state
  const bonuses: ItemBonus[] = [primary.bonus]
  const affixCount = balanceConfig.loot.affixCountByRarity[rarity]
  for (let i = 0; i < affixCount; i++) {
    const pick = pickAffix(state, template.primaryBonus); state = pick.state
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
```
(Note: the `+ 7` on the bonus drop seed keeps its id distinct from the first drop when states are close. The store should pass time-based seeds so ids are unique across runs.)

- [ ] **Step 5: Run → PASS.** Full suite + build.

- [ ] **Step 6: Commit**
```bash
git add src/data/itemLibrary.ts src/domain/items/generation.ts src/domain/items/generation.test.ts
git commit -m "feat(solo-system): item library and seeded item generation + gate drops"
```

---

## Task 4: Equipment aggregation

**Files:** Create `src/domain/items/bonuses.ts`, `src/domain/items/bonuses.test.ts`

- [ ] **Step 1: Failing test** `src/domain/items/bonuses.test.ts`:
```ts
import { aggregateEquipment } from './bonuses'
import type { Equipment, Item } from './types'

const item = (over: Partial<Item>): Item => ({ id: 'i', baseId: 'b', name: 'N', slot: 'weapon', rarity: 'common', enhanceLevel: 0, bonuses: [], ...over })
const empty: Equipment = { weapon: null, armor: null, accessory: null }

test('empty equipment yields zero combat bonuses and 1x multipliers', () => {
  const t = aggregateEquipment(empty)
  expect(t.combat).toEqual({ attack: 0, maxHP: 0, defense: 0, critChance: 0, skillPowerMult: 0 })
  expect(t.reward).toEqual({ expMult: 1, statXpMult: 1 })
})

test('combat bonuses sum and reward fractions add onto 1x', () => {
  const t = aggregateEquipment({
    weapon: item({ slot: 'weapon', bonuses: [{ kind: 'attack', value: 5 }, { kind: 'expMult', value: 0.1 }] }),
    armor: item({ slot: 'armor', bonuses: [{ kind: 'maxHP', value: 20 }, { kind: 'attack', value: 3 }] }),
    accessory: item({ slot: 'accessory', bonuses: [{ kind: 'statXpMult', value: 0.05 }, { kind: 'critChance', value: 0.04 }] }),
  })
  expect(t.combat.attack).toBe(8)
  expect(t.combat.maxHP).toBe(20)
  expect(t.combat.critChance).toBeCloseTo(0.04)
  expect(t.reward.expMult).toBeCloseTo(1.1)
  expect(t.reward.statXpMult).toBeCloseTo(1.05)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `src/domain/items/bonuses.ts`**
```ts
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
```

- [ ] **Step 4: Run → PASS.** Full suite + build.

- [ ] **Step 5: Commit**
```bash
git add src/domain/items/bonuses.ts src/domain/items/bonuses.test.ts
git commit -m "feat(solo-system): aggregate equipped item bonuses"
```

---

## Task 5: Enhancement

**Files:** Create `src/domain/items/enhance.ts`, `src/domain/items/enhance.test.ts`

- [ ] **Step 1: Failing test** `src/domain/items/enhance.test.ts`:
```ts
import { enhanceCost, enhanceItem } from './enhance'
import type { Item } from './types'

const item = (over: Partial<Item>): Item => ({ id: 'i', baseId: 'b', name: 'N', slot: 'weapon', rarity: 'common', enhanceLevel: 0, bonuses: [{ kind: 'attack', value: 10 }], ...over })

test('enhanceCost rises with enhance level', () => {
  const a = enhanceCost(item({ enhanceLevel: 0 }))
  const b = enhanceCost(item({ enhanceLevel: 3 }))
  expect(b).toBeGreaterThan(a)
})

test('enhanceCost rises with rarity', () => {
  expect(enhanceCost(item({ rarity: 'legendary' }))).toBeGreaterThan(enhanceCost(item({ rarity: 'common' })))
})

test('enhanceItem raises level and grows bonus values', () => {
  const e = enhanceItem(item({ enhanceLevel: 0, bonuses: [{ kind: 'attack', value: 10 }] }))
  expect(e.enhanceLevel).toBe(1)
  expect(e.bonuses[0].value).toBeGreaterThan(10)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `src/domain/items/enhance.ts`**
```ts
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
```

- [ ] **Step 4: Run → PASS.** Full suite + build.

- [ ] **Step 5: Commit**
```bash
git add src/domain/items/enhance.ts src/domain/items/enhance.test.ts
git commit -m "feat(solo-system): item enhancement cost and upgrade"
```

---

## Task 6: completeQuest reward multipliers

**Files:** Modify `src/domain/quests.ts`; create `src/domain/quests_multipliers.test.ts`

- [ ] **Step 1: Failing test** `src/domain/quests_multipliers.test.ts`:
```ts
import { completeQuest } from './quests'
import { STAT_TYPES, type Player, type QuestInstance, type PenaltyZone } from './types'

function freshPlayer(): Player {
  const stats = Object.fromEntries(STAT_TYPES.map(t => [t, { type: t, subLevel: 0, statXP: 0 }])) as Player['stats']
  return { level: 1, currentEXP: 0, freeStatPoints: 0, classRank: 'E', currency: 0, gateKeys: 0, stats }
}
const quest = (): QuestInstance => ({ instanceId: 'i', templateId: 'q', title: '', description: '', stat: 'STR', baseEXP: 50, baseStatXP: 20, issuedAt: 0, deadline: 999, completed: false, completedAt: null, isRedemption: false })
const noPenalty: PenaltyZone = { active: false, debuffMultiplier: 1, enteredAt: null }

test('reward multipliers scale EXP and stat-XP', () => {
  const base = completeQuest({ player: freshPlayer(), quest: quest(), streak: undefined, penalty: noPenalty, today: '2026-06-06', now: 1 })
  const boosted = completeQuest({ player: freshPlayer(), quest: quest(), streak: undefined, penalty: noPenalty, today: '2026-06-06', now: 1, rewardMultipliers: { expMult: 2, statXpMult: 2 } })
  expect(boosted.player.currentEXP).toBe(base.player.currentEXP * 2)
  expect(boosted.player.stats.STR.statXP).toBeGreaterThan(base.player.stats.STR.statXP)
})

test('currency and gateKeys grants are NOT multiplied', () => {
  const boosted = completeQuest({ player: freshPlayer(), quest: quest(), streak: undefined, penalty: noPenalty, today: '2026-06-06', now: 1, rewardMultipliers: { expMult: 5, statXpMult: 5 } })
  expect(boosted.player.currency).toBe(10)
  expect(boosted.player.gateKeys).toBe(1)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Modify `src/domain/quests.ts`** — extend the input interface and apply multipliers:
- Add to `CompleteQuestInput`:
```ts
  rewardMultipliers?: { expMult: number; statXpMult: number }
```
- In `completeQuest`, after computing `debuff` and `mult`, change the gain lines to:
```ts
  const rm = input.rewardMultipliers ?? { expMult: 1, statXpMult: 1 }
  const expGain = quest.baseEXP * debuff * rm.expMult
  const statGain = quest.baseStatXP * mult * debuff * rm.statXpMult
```
(Leave the `currency + 10` and `gateKeys + 1` lines untouched.)

- [ ] **Step 4: Run → PASS.** Full suite + build (existing quests tests omit the field → default 1×, still green).

- [ ] **Step 5: Commit**
```bash
git add src/domain/quests.ts src/domain/quests_multipliers.test.ts
git commit -m "feat(solo-system): optional gear reward multipliers in completeQuest"
```

---

## Task 7: Fold equipment combat bonuses into the hunter

**Files:** Modify `src/domain/gates.ts`, `src/domain/gates.test.ts`

- [ ] **Step 1: Update the existing test + add a gear test in `src/domain/gates.test.ts`**
The existing `buildCombatState` test calls `buildCombatState(gateE1, player({}), 12345)`. Change it to pass empty equipment: `buildCombatState(gateE1, player({}), emptyEquipment, 12345)` where `const emptyEquipment = { weapon: null, armor: null, accessory: null }`. Then add:
```ts
test('equipped gear raises the hunter combat stats', () => {
  const eq = { weapon: { id: 'w', baseId: 'b', name: 'W', slot: 'weapon' as const, rarity: 'common' as const, enhanceLevel: 0, bonuses: [{ kind: 'attack' as const, value: 10 }, { kind: 'maxHP' as const, value: 40 }] }, armor: null, accessory: null }
  const bare = buildCombatState(gateE1, player({}), { weapon: null, armor: null, accessory: null }, 1)
  const geared = buildCombatState(gateE1, player({}), eq, 1)
  expect(geared.player.attack).toBe(bare.player.attack + 10)
  expect(geared.player.maxHP).toBe(bare.player.maxHP + 40)
  expect(geared.player.hp).toBe(geared.player.maxHP)
})
```
(Import the `Equipment` type or inline the literal as above.)

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Modify `src/domain/gates.ts`**
- Import: `import { aggregateEquipment } from './items/bonuses'` and `import type { Equipment } from './items/types'`.
- Change `playerCombatant(player)` to `playerCombatant(player, equipment)` and fold totals:
```ts
function playerCombatant(player: Player, equipment: Equipment): Combatant {
  const d = deriveCombatStats(player)
  const t = aggregateEquipment(equipment).combat
  const maxHP = d.maxHP + t.maxHP
  const maxMP = d.maxMP
  return {
    id: 'player', name: 'Hunter', isPlayer: true,
    hp: maxHP, maxHP, mp: maxMP, maxMP,
    attack: d.attack + t.attack, defense: d.defense + t.defense, speed: d.speed,
    skillPowerMult: d.skillPowerMult + t.skillPowerMult,
    critChance: Math.min(1, d.critChance + t.critChance), critMultiplier: d.critMultiplier,
    dodgeChance: d.dodgeChance,
    buffs: [], defending: false,
  }
}
```
- Change `buildCombatState(gate, player, seed)` signature to `buildCombatState(gate: GateDef, player: Player, equipment: Equipment, seed: number)` and call `playerCombatant(player, equipment)`.

- [ ] **Step 4: Run → PASS.** Full suite + build. NOTE: the store currently calls `buildCombatState(gate, next.player, clock.now())` — this will now be a type error until Task 8 updates it. To keep this task's build green, update that single call site now to `buildCombatState(gate, next.player, next.equipment, clock.now())` (Task 8 covers the rest of the store).

- [ ] **Step 5: Commit**
```bash
git add src/domain/gates.ts src/domain/gates.test.ts src/store/useSystemStore.ts
git commit -m "feat(solo-system): fold equipped gear combat bonuses into the hunter"
```

---

## Task 8: Store integration (drops, equip/unequip/enhance, multipliers, guard)

**Files:** Modify `src/store/useSystemStore.ts`; create `src/store/loot.test.ts`

- [ ] **Step 1: Failing test** `src/store/loot.test.ts`:
```ts
import { createSystemStore } from './useSystemStore'
import { db } from '../persistence/db'

const clock = (ms: number) => ({ now: () => ms })
beforeEach(async () => { await db.saves.clear() })

async function ready() {
  const store = createSystemStore({ clock: clock(Date.now()) })
  await store.getState().hydrate()
  store.setState(s => ({ save: { ...s.save, player: { ...s.save.player, gateKeys: 5, currency: 1000, stats: Object.fromEntries(Object.entries(s.save.player.stats).map(([k, v]) => [k, { ...v, subLevel: 10 }])) as typeof s.save.player.stats } } }))
  return store
}

test('winning a gate drops at least one item into inventory and does not change level/EXP/statXP', async () => {
  const store = await ready()
  const before = store.getState().save.player
  store.getState().enterGate('gate-e1')
  let guard = 0
  while (store.getState().combat?.phase === 'player' && guard++ < 500) store.getState().combatAction({ type: 'attack' })
  const after = store.getState().save
  if (store.getState().combat?.phase === 'won') {
    expect(after.inventory.length).toBeGreaterThanOrEqual(1)
    expect(store.getState().combat?.droppedItems?.length).toBeGreaterThanOrEqual(1)
  }
  expect(after.player.level).toBe(before.level)
  expect(after.player.currentEXP).toBe(before.currentEXP)
  expect(after.player.stats.STR.statXP).toBe(before.stats.STR.statXP)
  expect(after.player.stats.STR.subLevel).toBe(before.stats.STR.subLevel)
})

test('equip moves an item from inventory to its slot; unequip returns it', async () => {
  const store = await ready()
  const it = { id: 'w1', baseId: 'b', name: 'W', slot: 'weapon' as const, rarity: 'common' as const, enhanceLevel: 0, bonuses: [{ kind: 'attack' as const, value: 5 }] }
  store.setState(s => ({ save: { ...s.save, inventory: [it] } }))
  store.getState().equipItem('w1')
  expect(store.getState().save.equipment.weapon?.id).toBe('w1')
  expect(store.getState().save.inventory).toHaveLength(0)
  store.getState().unequipItem('weapon')
  expect(store.getState().save.equipment.weapon).toBeNull()
  expect(store.getState().save.inventory).toHaveLength(1)
})

test('equipping a second item of the same slot returns the previous one to inventory', async () => {
  const store = await ready()
  const a = { id: 'a', baseId: 'b', name: 'A', slot: 'weapon' as const, rarity: 'common' as const, enhanceLevel: 0, bonuses: [] }
  const b = { id: 'b2', baseId: 'b', name: 'B', slot: 'weapon' as const, rarity: 'common' as const, enhanceLevel: 0, bonuses: [] }
  store.setState(s => ({ save: { ...s.save, inventory: [a, b] } }))
  store.getState().equipItem('a')
  store.getState().equipItem('b2')
  expect(store.getState().save.equipment.weapon?.id).toBe('b2')
  expect(store.getState().save.inventory.map(i => i.id)).toContain('a')
})

test('enhanceItem spends gold and upgrades; insufficient gold is a no-op', async () => {
  const store = await ready()
  const it = { id: 'w1', baseId: 'b', name: 'W', slot: 'weapon' as const, rarity: 'common' as const, enhanceLevel: 0, bonuses: [{ kind: 'attack' as const, value: 10 }] }
  store.setState(s => ({ save: { ...s.save, inventory: [it], player: { ...s.save.player, currency: 1000 } } }))
  store.getState().enhanceItem('w1')
  expect(store.getState().save.inventory[0].enhanceLevel).toBe(1)
  expect(store.getState().save.player.currency).toBeLessThan(1000)

  store.setState(s => ({ save: { ...s.save, player: { ...s.save.player, currency: 0 } } }))
  const lvl = store.getState().save.inventory[0].enhanceLevel
  store.getState().enhanceItem('w1')
  expect(store.getState().save.inventory[0].enhanceLevel).toBe(lvl)
})

test('equipped reward gear multiplies real quest EXP', async () => {
  const store = await ready()
  const charm = { id: 'c', baseId: 'b', name: 'Charm', slot: 'accessory' as const, rarity: 'rare' as const, enhanceLevel: 0, bonuses: [{ kind: 'expMult' as const, value: 1 }] }
  store.setState(s => ({ save: { ...s.save, equipment: { weapon: null, armor: null, accessory: charm } } }))
  const q = store.getState().save.quests[0]
  const expBefore = store.getState().save.player.currentEXP
  await store.getState().completeQuest(q.instanceId)
  const gained = store.getState().save.player.currentEXP - expBefore
  expect(gained).toBeGreaterThan(q.baseEXP)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Modify `src/store/useSystemStore.ts`**
- Imports:
```ts
import { aggregateEquipment } from '../domain/items/bonuses'
import { enhanceCost, enhanceItem as enhanceItemDomain } from '../domain/items/enhance'
import { rollGateDrop } from '../domain/items/generation'
import type { ItemSlot } from '../domain/items/types'
```
- Extend `SystemState` interface:
```ts
  equipItem: (itemId: string) => void
  unequipItem: (slot: ItemSlot) => void
  enhanceItem: (itemId: string) => void
```
- In `completeQuest`, pass multipliers — change the `domainComplete({...})` call to include:
```ts
          rewardMultipliers: aggregateEquipment(save.equipment).reward,
```
- `enterGate` already passes `next.equipment` (done in Task 7). If not, ensure `buildCombatState(gate, next.player, next.equipment, clock.now())`.
- In `combatAction` `won` branch, roll drops and attach:
```ts
        if (nextCombat.phase === 'won') {
          const save = get().save
          const gate = gateLibrary.find(g => g.id === nextCombat.gateId)
          const drops = gate ? rollGateDrop(gate, clock.now()) : []
          const clearedGateIds = save.gates.clearedGateIds.includes(nextCombat.gateId)
            ? save.gates.clearedGateIds
            : [...save.gates.clearedGateIds, nextCombat.gateId]
          const next: SaveState = {
            ...save,
            player: { ...save.player, currency: save.player.currency + nextCombat.goldReward },
            gates: { clearedGateIds },
            inventory: [...save.inventory, ...drops],
          }
          persist(next)
          set({ save: next, combat: { ...nextCombat, droppedItems: drops } })
        } else {
          set({ combat: nextCombat })
        }
```
- Add the three new actions (near the other actions):
```ts
      equipItem: (itemId: string) => {
        const save = get().save
        const item = save.inventory.find(i => i.id === itemId)
        if (!item) return
        const prev = save.equipment[item.slot]
        const inventory = save.inventory.filter(i => i.id !== itemId)
        if (prev) inventory.push(prev)
        const next: SaveState = { ...save, inventory, equipment: { ...save.equipment, [item.slot]: item } }
        persist(next)
        set({ save: next })
      },

      unequipItem: (slot: ItemSlot) => {
        const save = get().save
        const item = save.equipment[slot]
        if (!item) return
        const next: SaveState = { ...save, inventory: [...save.inventory, item], equipment: { ...save.equipment, [slot]: null } }
        persist(next)
        set({ save: next })
      },

      enhanceItem: (itemId: string) => {
        const save = get().save
        const inInv = save.inventory.find(i => i.id === itemId)
        const slot = (['weapon', 'armor', 'accessory'] as ItemSlot[]).find(s => save.equipment[s]?.id === itemId)
        const item = inInv ?? (slot ? save.equipment[slot] : undefined)
        if (!item) return
        const cost = enhanceCost(item)
        if (save.player.currency < cost) return
        const upgraded = enhanceItemDomain(item)
        const next: SaveState = {
          ...save,
          player: { ...save.player, currency: save.player.currency - cost },
          inventory: inInv ? save.inventory.map(i => i.id === itemId ? upgraded : i) : save.inventory,
          equipment: slot ? { ...save.equipment, [slot]: upgraded } : save.equipment,
        }
        persist(next)
        set({ save: next })
      },
```

- [ ] **Step 4: Run → PASS.** Full suite + build.

- [ ] **Step 5: Commit**
```bash
git add src/store/useSystemStore.ts src/store/loot.test.ts
git commit -m "feat(solo-system): store loot drops, equip/unequip/enhance, reward multipliers, guard"
```

---

## Task 9: ItemCard component

**Files:** Create `src/components/ItemCard.tsx`, `src/components/ItemCard.test.tsx`

- [ ] **Step 1: Failing test** `src/components/ItemCard.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { ItemCard } from './ItemCard'
import type { Item } from '../domain/items/types'

const item: Item = { id: 'i', baseId: 'b', name: 'Shadow Edge', slot: 'weapon', rarity: 'epic', enhanceLevel: 2, bonuses: [{ kind: 'attack', value: 12 }] }

test('shows item name, enhance level, and a bonus', () => {
  render(<ItemCard item={item} />)
  expect(screen.getByText(/Shadow Edge/)).toBeInTheDocument()
  expect(screen.getByText(/\+2/)).toBeInTheDocument()
  expect(screen.getByText(/ATK/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run → FAIL, implement, run → PASS.**
`ItemCard.tsx` props `{ item: Item; selected?: boolean; onClick?: () => void }`. Render the name (colored by rarity — define a `rarityColor: Record<Rarity,string>` map of Tailwind classes), the slot, the enhance level as `+{enhanceLevel}` when > 0, and a compact list of bonuses with short labels (attack→ATK, maxHP→HP, defense→DEF, critChance→CRIT, skillPowerMult→SKILL, expMult→EXP, statXpMult→STAT-XP; format fractional kinds as percentages). System-window aesthetic; clickable if `onClick` given.

- [ ] **Step 3: Commit**
```bash
git add src/components/ItemCard.tsx src/components/ItemCard.test.tsx
git commit -m "feat(solo-system): item card component"
```

---

## Task 10: Inventory screen + nav + route + battle loot

**Files:** Create `src/screens/InventoryScreen.tsx`; modify `src/components/BottomNav.tsx`, `src/App.tsx`, `src/screens/BattleScreen.tsx`

- [ ] **Step 1: InventoryScreen** (`src/screens/InventoryScreen.tsx`)
- Read `save` + actions `equipItem`, `unequipItem`, `enhanceItem` from the store.
- Show current gold.
- **Equipment slots**: for each of `weapon/armor/accessory`, show the equipped `ItemCard` (or an "empty" placeholder) with an **Unequip** button when filled.
- **Inventory**: list `save.inventory` as `ItemCard`s. Selecting one (local `useState` selectedId) opens a detail area with all bonuses and buttons: **Equip** (if in inventory), **Enhance ({enhanceCost} gold)** disabled when `save.player.currency < enhanceCost(item)`.
- Use `enhanceCost` from `../domain/items/enhance` for the label. Bottom padding `pb-24`.

- [ ] **Step 2: BottomNav** — import `Backpack` from lucide-react, add `{ to: '/inventory', label: 'ITEMS', Icon: Backpack }` to `links`.

- [ ] **Step 3: App.tsx** — import `InventoryScreen`, add `<Route path="/inventory" element={<InventoryScreen />} />`.

- [ ] **Step 4: BattleScreen win overlay** — when `combat.phase === 'won'` and `combat.droppedItems?.length`, render the dropped items (rarity-colored, e.g. small `ItemCard`s or a list) under the gold reward labeled "LOOT OBTAINED".

- [ ] **Step 5: Verify** — `npx vitest run` (all green) + `npm run build`. Optionally `npm run dev` and check the Inventory tab + equipping.

- [ ] **Step 6: Commit**
```bash
git add src/screens/InventoryScreen.tsx src/components/BottomNav.tsx src/App.tsx src/screens/BattleScreen.tsx
git commit -m "feat(solo-system): inventory screen, items nav tab, battle loot display"
```

---

## Task 11: README + final verification

**Files:** Modify `README.md`

- [ ] **Step 1:** Add a "Loot & Inventory (Phase 2b)" section: items drop from gate clears, rarities, 3 equipment slots, gear boosts combat AND multiplies real quest rewards (only on real completion), enhancement spends gold; loot constants live in `balanceConfig.loot`, base items in `src/data/itemLibrary.ts`. Move loot/inventory from "Planned" to "Done"; keep 2c (shadow army) under Planned.

- [ ] **Step 2: Final verification** — `npx vitest run` and `npm run build`, both clean.

- [ ] **Step 3: Commit**
```bash
git add README.md
git commit -m "docs(solo-system): document Phase 2b loot and inventory"
```

---

## Definition of done (2b)
- Clearing a gate drops ≥1 rarity-rolled item (shown in win overlay) into inventory; losing drops nothing.
- Equipping gear raises the hunter's combat stats next gate AND multiplies real quest EXP/stat-XP.
- Enhancing spends gold and grows bonuses; insufficient gold is a no-op.
- A full combat + equip + enhance leaves level/EXP/stat-XP unchanged (guard test green).
- v2 saves migrate to v3 (and v1 → v3 composes).
- Full Vitest suite green; production build clean; verified in-browser.

## Out of scope (later)
- 2c: ARISE shadow army.
- Salvage, set bonuses, sockets, consumables, trading.
- Phase 3 (AI quests, sync, notifications); Phase 4 (rank-up dungeons, titles, endless).
