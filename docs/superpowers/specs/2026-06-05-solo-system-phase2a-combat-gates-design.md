# Solo System — Phase 2a (Turn-Based Combat + Gates) Design Spec

**Date:** 2026-06-05
**Status:** Approved (pending implementation plan)
**Builds on:** Phase 1 (honest core), merged. App lives at `solo-system/`.

## 1. Summary

Phase 2a adds the first slice of the game layer: a **turn-based combat system** and
**Gates** (dungeons). The player's hunter is powered entirely by the five real-life
stats earned in Phase 1. Entering a Gate costs a Gate Key (earned only from completing
real quests); clearing it yields gold. This is the reward/fantasy layer that sits on top
of the honest habit core.

Phase 2 is sliced into 2a (combat + gates — this spec), 2b (loot + inventory), and
2c (ARISE shadow army). Each slice is its own spec → plan → build and is shippable alone.

### Core principle (unbreakable, inherited from Phase 1)

**Combat NEVER grants real EXP or stat-XP.** The only way to increase player level or
stat progress is completing real-life quests. Combat consumes Gate Keys (earned from
quests) and yields only gold (and, in 2b, loot). Any change that lets combat produce
real progression must be rejected. Real life is the sole power source.

## 2. Goals & non-goals

### Goals
- A genuinely tactical turn-based battle loop driven by the player's real stats.
- Gates as a war of attrition: a wave of enemies then a boss, HP/MP carried across.
- Gold rewards on clear; no rewards on loss; no real-life penalty ever.
- Fully unit-tested combat via a seeded, injectable RNG.
- A clean schema migration (v1 → v2) that also closes the Phase 1 "no migration" gap.

### Non-goals (deferred to later slices)
- Loot drops, item rarities, inventory, equipment, enhancement (2b).
- ARISE / shadow army (2c).
- Class rank-up boss dungeons, titles, endless mode (Phase 4).
- Consumable items / potions in battle (depend on inventory → 2b).

## 3. Stat → combat derivation

Combat stats derive from each stat's `subLevel` (the durable integer earned through
consistency). All constants live in a new `combat` block in `src/domain/balanceConfig.ts`
and are tunable.

| Combat attribute | Formula |
|---|---|
| Max HP | `combat.baseHP + VIT × combat.hpPerVit` (50 + VIT×10) |
| Max MP | `combat.baseMP + INT × combat.mpPerInt` (20 + INT×3) |
| Attack | `combat.baseAttack + STR × combat.attackPerStr` (5 + STR×2) |
| Speed (turn order) | `AGI` |
| Skill power multiplier | `1 + INT × combat.skillPowerPerInt` (1 + INT×0.05) |
| Crit chance | `min(combat.critCap, PER × combat.critPerPer)` (min(0.5, PER×0.01)) |
| Crit multiplier | `combat.critMultiplier` (1.75) |
| Dodge chance | `min(combat.dodgeCap, PER × combat.dodgePerPer)` (min(0.25, PER×0.005)) |

Damage = `max(1, attacker.attack − defender.defense)`, then multiplied by crit and any
active buffs/debuffs. (Defense for the player derives from VIT or is 0 in 2a unless a
skill/defend modifies it; enemies carry their own `defense`. Keep player base defense
simple — a small `combat.basePlayerDefense`, tunable.)

A derived snapshot is computed by a pure function `deriveCombatStats(player)` →
`{ maxHP, maxMP, attack, defense, speed, skillPowerMult, critChance, critMultiplier, dodgeChance }`.

## 4. Actions & skills

On the player's turn they choose one action:

- **Attack** — free; deals base damage (with crit/dodge rolls).
- **Defend** — halves incoming damage until the player's next turn and restores
  `combat.defendMpRestoreFraction` of max MP (≈10%).
- **Skill** — costs MP; locked until the player reaches its unlock level.

Skills (defined in `src/domain/combat/skills.ts`, each a pure effect):

| Skill | Unlock level | MP cost | Effect |
|---|---|---|---|
| Power Strike | 1 | 8 | Heavy hit: `attack × 1.8 × skillPowerMult`, can crit |
| Mend | 3 | 12 | Heal self: `(baseHeal + INT × k) × skillPowerMult` |
| Focus | 5 | 10 | Buff: +crit chance for 3 turns |
| Weaken | 8 | 14 | Debuff: reduce target attack & defense for 3 turns |

All skill numbers live in `balanceConfig.combat.skills`. Crit/dodge and any randomness
use a seeded RNG (`src/domain/combat/rng.ts`) injected into the engine so tests are
deterministic.

## 5. Gate structure, economy & rewards

- A **Gate** is an ordered sequence of enemies: a **wave** of 2–3 normal enemies, then a
  **boss**. **HP and MP carry across the entire gate** — no heals between fights — making
  it a war of attrition that rewards strong stats and smart Defend/skill timing.
- **Entry costs 1 Gate Key** (`gate.keyCost`, default 1). The key is spent on entry.
- **Win** (boss defeated): grant `gate.goldReward`, mark the gate cleared
  (`clearedGateIds`). (A loot hook exists for 2b but drops nothing in 2a.)
- **Lose** (player HP → 0) or **Flee**: the run ends, no rewards. The key is already
  spent; the player is not charged again. **No real-life penalty.**
- Gates are defined in `src/data/gateLibrary.ts` (id, name, rankTier, enemy/boss
  sequence, keyCost, goldReward, `unlockedBy` previous gate id or null). Enemies are
  defined in `src/data/enemyLibrary.ts` (id, name, hp, attack, defense, speed,
  critChance, isBoss).
- **Unlocking:** a gate is enterable if `unlockedBy` is null or that gate id is in
  `clearedGateIds`, and the player has ≥ keyCost Gate Keys. Ship at least the first 2–3
  gates (E-tier) for 2a.

## 6. Combat engine (turn resolution)

Pure and isolated in `src/domain/combat/engine.ts`. The combat session is **ephemeral**
runtime state (held in the store, not persisted); abandoning the app mid-battle forfeits
the run.

- `CombatState`: `{ player: Combatant, enemies: Combatant[], currentEnemyIndex, turnQueue,
  phase: 'player' | 'enemy' | 'won' | 'lost', log: CombatLogEntry[], rngState }`.
- `Combatant`: `{ name, hp, maxHP, mp, maxMP, attack, defense, speed, critChance,
  critMultiplier, dodgeChance, buffs: Buff[], isDefending }`.
- Turn order within a round is by descending `speed`. The `turnQueue` is rebuilt at the
  start of each new round (not once per fight), so it stays correct if a speed-affecting
  buff is added later. Within a round, defeated combatants are skipped.
- `applyPlayerAction(state, action)` → new state + appended log entries; then enemy turn(s)
  resolve via a simple deterministic AI (`enemyTurn`): a normal attack, except every
  `combat.enemyHeavyMoveEveryNRounds` rounds (default 3) it uses a heavier telegraphed
  hit (damage × `combat.enemyHeavyMoveMultiplier`, default 1.5). Both values live in the
  `combat` block of `balanceConfig.ts`.
- After each defeat, advance `currentEnemyIndex`; when the boss falls, `phase = 'won'`.
  When player HP ≤ 0, `phase = 'lost'`.
- Buffs/debuffs decrement each round; Defend clears at the player's next turn.
- All mutations return new objects (no in-place mutation) for testability.

## 7. Data model + migration

- `SaveState` gains `gates: { clearedGateIds: string[] }`.
- Existing `Player.gateKeys` and `Player.currency` (gold) are reused: entry decrements
  `gateKeys`, clear increments `currency`.
- **`schemaVersion` bumps 1 → 2.** `repository.loadState` runs a `migrate(raw)` that, for
  a v1 save, adds `gates: { clearedGateIds: [] }` and sets `schemaVersion = 2`. The
  migration is unit-tested. This also establishes the migration pattern flagged as
  missing in the Phase 1 review.

## 8. Store integration

`useSystemStore` gains:
- `combat: CombatState | null` (ephemeral) in store state (not in `SaveState`, not
  persisted).
- `enterGate(gateId)` — validates keys + unlock; on success decrements `gateKeys`
  (persisted), builds the initial `CombatState` via `gates.ts` + `deriveCombatStats`.
- `combatAction(action)` — delegates to the engine; on `won`, commits gold +
  `clearedGateIds` to `SaveState` and persists, then clears `combat`; on `lost`, clears
  `combat` (no rewards).
- `fleeGate()` — abandons the current combat (no rewards), clears `combat`.

The reward commit is the ONLY place combat touches `SaveState`, and it touches only
`currency` and `gates` — never `level`, `currentEXP`, or `statXP`.

## 9. UI

- **GatesScreen** (`/gates`): lists gates with rank tier, key cost, gold reward, locked/
  cleared state, and an ENTER button (disabled when locked or insufficient keys). Shows
  current Gate Keys. System-window aesthetic, danger/cyan accents.
- **BattleScreen** (`/battle`, shown when `combat` is active): renders the player and
  current enemy as `CombatantBar`s (HP/MP bars), the wave/boss progress, a scrolling
  combat log, and the action buttons (Attack / Defend / Skill menu / Flee). Skills the
  player hasn't unlocked are hidden or disabled; skills the player can't afford (MP) are
  disabled. On win/loss, a result overlay with rewards (or "DEFEATED") and a return to
  Gates.
- **BottomNav**: add a **Gates** entry (lucide icon, e.g. `Swords`/`DoorOpen`). Battle is
  reached by entering a gate, not a nav tab.

## 10. Testing (TDD)

- `deriveCombatStats` — formula correctness from sample players.
- `rng` — deterministic sequence for a given seed.
- `skills` — each skill's effect (damage, heal, buff/debuff application).
- `engine` — attack damage, crit (forced via seeded rng), dodge (forced), defend damage
  reduction + MP restore, MP cost gating, enemy turn, defeat → advance, boss defeat →
  `won`, player death → `lost`, buff/debuff expiry.
- `gates` — entry validation (insufficient keys, locked gate), initial state construction.
- store — `enterGate` decrements keys + builds combat; win commits gold + clearedGateIds +
  persists; loss commits nothing; flee clears combat; **assert no change to level/EXP/
  statXP across a full combat** (core-principle guard).
- `repository` — v1 → v2 migration adds `gates` and bumps version; v2 loads unchanged.
- UI logic kept thin; a light test for any non-trivial render logic (e.g. action
  availability) as in Phase 1's CountdownTimer.

## 11. New / changed files

```
solo-system/src/domain/combat/types.ts        (new)
solo-system/src/domain/combat/rng.ts          (new)
solo-system/src/domain/combat/derive.ts       (new)
solo-system/src/domain/combat/skills.ts       (new)
solo-system/src/domain/combat/engine.ts       (new)
solo-system/src/domain/gates.ts               (new)
solo-system/src/data/enemyLibrary.ts          (new)
solo-system/src/data/gateLibrary.ts           (new)
solo-system/src/domain/balanceConfig.ts       (add combat block)
solo-system/src/domain/types.ts               (add gates to SaveState, combat types ref)
solo-system/src/persistence/repository.ts     (migration v1→v2)
solo-system/src/store/useSystemStore.ts       (combat actions + reward commit)
solo-system/src/screens/GatesScreen.tsx       (new)
solo-system/src/screens/BattleScreen.tsx      (new)
solo-system/src/components/CombatantBar.tsx    (new)
solo-system/src/components/BottomNav.tsx       (add Gates)
solo-system/src/App.tsx                        (add routes)
```

## 12. Definition of done (2a)

- From Gates, spend a key to enter a gate, fight a wave + boss in turn-based combat using
  Attack/Defend/Skills, with HP/MP carrying across fights.
- Crit/dodge/skills work and are deterministic under a seeded RNG in tests.
- Winning grants gold and marks the gate cleared (unlocking the next); losing/fleeing
  grants nothing; entry spent the key.
- A full combat causes ZERO change to player level / EXP / stat-XP.
- v1 saves migrate cleanly to v2.
- Full Vitest suite green; production build clean; verified rendering in-browser.
