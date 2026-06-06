# Solo System — Phase 2b (Loot & Inventory) Design Spec

**Date:** 2026-06-06
**Status:** Approved (pending implementation plan)
**Builds on:** Phase 1 (honest core) + Phase 2a (combat + gates), both merged. App at `solo-system/`.

## 1. Summary

Phase 2b adds the loot economy: items drop from cleared Gates, live in an inventory, and
can be equipped across three slots. Equipped gear both strengthens the hunter in combat
and amplifies the rewards from completing **real** quests. Gold (earned from gate clears)
fuels item enhancement. This is slice 2 of 3 in Phase 2 (2a combat+gates done; 2c shadow
army next).

### Core principle (unbreakable, inherited)

Combat NEVER grants real EXP or stat-XP. Item drops, equipping, and enhancement touch only
**items** and **gold** — never level/EXP/stat-XP. The one place gear affects real
progression is a **multiplier applied at the moment a real quest is completed** — it
amplifies a real completion, it never generates progress on its own and never fires from
combat. A guard test asserts a full combat + equip + enhance leaves level/EXP/stat-XP
unchanged.

## 2. Goals & non-goals

### Goals
- Items drop from gate clears, with templated bases and rarity-scaled rolled values.
- A 3-slot equipment system (Weapon / Armor / Accessory) and an inventory.
- Equipped gear adds combat bonuses (folded onto the hunter at combat start) and
  real-reward multipliers (folded into quest completion).
- Gold-fueled enhancement as a long-term sink.
- Fully deterministic, unit-tested item generation via the existing seeded RNG.
- Schema migration v2 → v3.

### Non-goals (deferred)
- ARISE / shadow army (2c).
- Salvage/dismantle, set bonuses, sockets/gems, item trading.
- Consumables/potions (would require a different inventory category; out of scope).
- Procedural prefix/suffix naming beyond the templated-base + affix model below.

## 3. Item model

- **Slots:** `weapon | armor | accessory`. **Rarities:** `common | uncommon | rare | epic | legendary` (color-coded in UI).
- **Bonus kinds:**
  - Combat: `attack`, `maxHP`, `defense`, `critChance`, `skillPowerMult`.
  - Real-reward: `expMult`, `statXpMult`.
- **Item instance:**
  ```ts
  interface ItemBonus { kind: BonusKind; value: number }
  interface Item {
    id: string          // unique instance id
    baseId: string      // template id
    name: string
    slot: ItemSlot
    rarity: Rarity
    enhanceLevel: number
    bonuses: ItemBonus[]
  }
  ```
- **Base template** (`src/data/itemLibrary.ts`):
  ```ts
  interface ItemTemplate { baseId: string; name: string; slot: ItemSlot; primaryBonus: BonusKind }
  ```
  Ship a handful per slot (e.g. weapons primary `attack`; armor primary `maxHP` or
  `defense`; accessories primary `critChance`/`skillPowerMult`/reward mults).

### 3.1 Generation (`src/domain/items/generation.ts`)
- `generateItem(template, rarity, seed) → Item`: rolls the **primary bonus** within a
  rarity-scaled range, then adds **extra affixes** (count by rarity: common 0, uncommon 1,
  rare 1, epic 2, legendary 3) drawn from an affix pool, each rolled in its range. Rolls
  use the existing seeded RNG (`nextRandom`) so results are deterministic for a given seed.
  `enhanceLevel` starts at 0.
- All ranges, rarity multipliers, and affix counts live in `balanceConfig.loot`.
- Reward-multiplier bonuses (`expMult`, `statXpMult`) are stored as fractional additions
  (e.g. `0.10` = +10%); combat bonuses are flat additive numbers (`critChance`,
  `skillPowerMult` fractional; `attack`/`maxHP`/`defense` integer).

## 4. Drops (`src/domain/items/generation.ts` + store)

- On a **gate win**, the store rolls loot: `rollGateDrop(gate, seed)` →
  - **Boss always drops 1 item.** Rarity is weighted by the gate's `rankTier`
    (`balanceConfig.loot.rarityWeightsByTier`), slot chosen at random, base chosen from
    that slot's templates, then `generateItem`.
  - **Bonus drop:** an independent `bonusDropChance` roll may add a second item.
- **Loss/flee → no drops.**
- Dropped items are returned alongside the combat result so the BattleScreen win overlay
  can display them (rarity-colored), and are appended to `inventory` in the same commit
  that grants gold and marks the gate cleared.

## 5. Equipment & where gear applies

- `Player`/`SaveState` gains:
  ```ts
  inventory: Item[]
  equipment: { weapon: Item | null; armor: Item | null; accessory: Item | null }
  ```
- **Combat:** `aggregateEquipment(equipment) → { combat: Record<combatBonusKind, number>, reward: { expMult, statXpMult } }`
  (pure, in `src/domain/items/bonuses.ts`). `gates.buildCombatState` adds the combat
  totals onto the hunter combatant *after* `deriveCombatStats` (which stays stat-only and
  unchanged — preserving 2a's tested signature). `maxHP` bonus also raises starting `hp`.
  This requires `buildCombatState`'s signature to grow an `equipment` parameter
  (`buildCombatState(gate, player, equipment, seed)` or similar); update its one call site
  in the store and its existing tests accordingly. The seeded RNG (`nextRandom`) used by
  item generation already lives at `src/domain/combat/rng.ts` — reuse it.
- **Real rewards:** extend the existing `CompleteQuestInput` interface (in
  `domain/quests.ts`) with an optional field
  `rewardMultipliers?: { expMult: number; statXpMult: number }` (default `{1,1}` when
  absent). It multiplies ONLY the computed `expGain` by `expMult` and `statGain` by
  `statXpMult`. The flat `currency + 10` and `gateKeys + 1` grants per completion are
  **not** multiplied — they stay exactly as today. The store passes
  `aggregateEquipment(equipment).reward` (each mult = `1 + sum of gear fractions`). This
  multiplier is the ONLY new touch to the quest progression path; existing `completeQuest`
  tests (which omit the field) must remain green unchanged.

## 6. Enhancement (`src/domain/items/enhance.ts`)

- `enhanceCost(item) → number`: scales with rarity and current `enhanceLevel`
  (`balanceConfig.loot.enhance`).
- `enhanceItem(item) → Item`: returns a new item with `enhanceLevel + 1` and each bonus
  value scaled up by `balanceConfig.loot.enhance.bonusGrowthPerLevel`.
- Store `enhanceItem(itemId)`: if `player.currency >= enhanceCost`, deduct gold, replace
  the item in inventory/equipment with the enhanced version, persist. Rejects (no-op) if
  insufficient gold or item not found.

## 7. Data model + migration

- `SaveState` gains `inventory` and `equipment` (above). Three coordinated changes in
  `repository.ts`:
  1. Bump the `SCHEMA_VERSION` constant **2 → 3**.
  2. Add `inventory: []` and `equipment: { weapon: null, armor: null, accessory: null }` to
     `freshSaveState` (so new saves are valid v3).
  3. Extend `migrate` with a `schemaVersion < 3` step that adds those two fields, composing
     after the existing `schemaVersion < 2` step (so a v1 save flows v1→v2→v3 in one load).
  All unit-tested (v2→v3 adds fields; v1→v3 composes both steps).
- Item instance ids are generated from a counter/seed so saves stay deterministic in tests.

## 8. Store integration (`useSystemStore`)

- The gate-win commit additionally rolls drops and appends them to `inventory`; the
  returned combat state carries the dropped items for the overlay. This requires adding an
  optional `droppedItems?: Item[]` field to `CombatState` in `src/domain/combat/types.ts`,
  populated by the store on win.
- New actions: `equipItem(itemId)` (move from inventory to the matching slot, return any
  displaced item to inventory), `unequipItem(slot)`, `enhanceItem(itemId)`.
- `completeQuest` call site passes `rewardMultipliers` from `aggregateEquipment`.
- `enterGate`/`buildCombatState` call site passes `equipment` so combat bonuses apply.
- All actions persist via the existing `persist(next)` pattern. None touch
  level/EXP/statXP.

## 9. UI

- **InventoryScreen** (`/inventory`, new bottom-nav tab, e.g. `Backpack` icon):
  - Top: the 3 equipment slots showing the equipped item (name, rarity color, bonuses) or
    "empty", each with an Unequip action.
  - Below: the inventory list as rarity-colored `ItemCard`s. Selecting one opens a detail
    panel: full bonuses, and **Equip** (or **Unequip** if equipped) + **Enhance (cost N
    gold)** (disabled if gold < cost). Show current gold.
- **BattleScreen** win overlay: list the loot obtained (rarity-colored) under the gold.
- **`ItemCard`** reusable component (name, slot, rarity color, key bonuses, enhance level).

## 10. Testing (TDD)

- `generation`: deterministic output per seed; rarity scales primary bonus; affix count by
  rarity; ids unique.
- `bonuses`: `aggregateEquipment` sums combat bonuses and composes reward multipliers
  (empty equipment → all combat 0, mults 1).
- `enhance`: `enhanceCost` rises with level/rarity; `enhanceItem` raises level and grows
  bonuses.
- `drops`: `rollGateDrop` always yields ≥1 item (boss guaranteed); rarity respects tier
  weighting (statistical/seeded check); bonus drop respected.
- `quests`: `completeQuest` with `rewardMultipliers` scales EXP and stat-XP; default 1×
  unchanged (existing tests stay green).
- `gates`/combat: equipped gear raises the hunter combatant's attack/HP/etc.
- store: equip/unequip/enhance behave correctly; **guard test** — a full combat plus
  equipping and enhancing leaves level/currentEXP/statXP/subLevel unchanged; gold spent on
  enhance; insufficient-gold enhance is a no-op.
- `repository`: v2 → v3 migration adds inventory + equipment; v1 save migrates through to
  v3.

## 11. Balance config additions (`balanceConfig.loot`)

`rarities` (order + color tokens), `rarityWeightsByTier` (per gate rank), `bonusRanges`
(per bonus kind, base min/max), `rarityMultiplier` (per rarity), `affixCountByRarity`,
`affixPool` (eligible kinds), `bonusDropChance`, `enhance` (`baseCost`,
`costGrowthPerLevel`, `rarityCostMultiplier`, `bonusGrowthPerLevel`).

## 12. Definition of done (2b)

- Clearing a gate drops at least one rarity-rolled item (shown in the win overlay) into the
  inventory; losing drops nothing.
- Equipping gear visibly raises the hunter's combat stats in the next gate, and raises the
  EXP/stat-XP gained from completing a real quest.
- Enhancing an item spends gold and increases its bonuses; insufficient gold is a no-op.
- A full combat + equip + enhance causes ZERO change to level/EXP/stat-XP (guard test).
- v2 saves migrate cleanly to v3 (and v1 → v3 through both steps).
- Full Vitest suite green; production build clean; verified in-browser.

## 13. New / changed files

```
src/domain/items/types.ts        (new)
src/domain/items/generation.ts   (new)
src/domain/items/bonuses.ts      (new)
src/domain/items/enhance.ts      (new)
src/data/itemLibrary.ts          (new)
src/domain/balanceConfig.ts      (add loot block)
src/domain/types.ts              (add inventory + equipment to SaveState)
src/domain/combat/types.ts       (add optional droppedItems to CombatState)
src/persistence/repository.ts    (SCHEMA_VERSION 3, freshSaveState fields, migrate v2->v3)
src/domain/quests.ts             (optional rewardMultipliers)
src/domain/gates.ts              (fold equipment combat bonuses into hunter)
src/store/useSystemStore.ts      (drops on win, equip/unequip/enhance, pass multipliers)
src/components/ItemCard.tsx       (new)
src/screens/InventoryScreen.tsx   (new)
src/components/BottomNav.tsx      (add Inventory tab)
src/App.tsx                       (add /inventory route)
src/screens/BattleScreen.tsx      (loot in win overlay)
```
