# Solo System — Phase 2c (ARISE Shadow Army + Sidebar Nav) Design Spec

**Date:** 2026-06-08
**Status:** Approved (pending implementation plan)
**Builds on:** Phase 1 + Phase 2a (combat/gates) + Phase 2b (loot/inventory), all merged. App at `solo-system/`.

## 1. Summary

Phase 2c is the final Phase 2 slice. It adds the **ARISE shadow army**: defeated monsters
can be raised as shadows that fight beside the hunter via a **Shadow Strike** each combat
round. The player collects unlimited shadows but deploys a capped squad; only deployed
shadows power the strike. This slice also **replaces the bottom tab bar with a slide-in
sidebar drawer** (the nav has outgrown a bottom bar at 6 destinations).

### Core principle (unbreakable, inherited)

Raising, deploying, and the Shadow Strike touch only the shadow collection and combat —
never level/EXP/stat-XP. Combat (now including the Shadow Strike) still grants no real
progression. A guard test asserts a full combat with deployed shadows leaves
level/currentEXP/statXP/subLevel unchanged.

## 2. Goals & non-goals

### Goals
- Raise shadows from defeated enemies on a gate win (chance-based; boss more likely).
- Collect unlimited shadows; deploy up to a level-scaling cap.
- Deployed shadows deal a combined Shadow Strike to the current enemy each round.
- A Shadow Army screen to view/deploy/undeploy.
- Replace the bottom nav with a top app bar (hamburger) + slide-in left drawer.
- Deterministic, unit-tested via the existing seeded RNG. Schema migration v3 → v4.

### Non-goals (later)
- Shadows as full independent combatants (separate turns/AI/targeting) — out of scope;
  the Shadow Strike models the army's contribution without a multi-combatant engine.
- Shadow leveling/fusion/upgrading, named/unique boss shadows, shadow rarities beyond
  source-derived power.
- Phase 3 (AI quests, sync, notifications) and Phase 4 features.

## 3. Shadow model

- ```ts
  interface Shadow { id: string; sourceEnemyId: string; name: string; power: number }
  ```
- **Power** derived from the source enemy at raise time:
  `round((enemy.attack + enemy.hp / 10 + enemy.defense) × shadows.powerPerSourceFactor)`.
  Bosses (high hp/attack) yield much stronger shadows. `name` = `Shadow of {enemy.name}`.
- `SaveState` gains `shadows: Shadow[]` and `deployedShadowIds: string[]`.
  **schemaVersion 3 → 4**; migration adds both as empty arrays, composing after the
  v1→v2 and v2→v3 steps. Unit-tested.

## 4. Raising (ARISE) on gate win

- Pure helper `ariseFromEnemy(enemyId, seed) → Shadow` (looks up `enemyLibrary`, applies
  the power formula; unique id from the seed).
- On a **win**, the store rolls ARISE for each enemy in the cleared gate
  (`rollArise(chance, state)` using the seeded RNG). The gate's **last** `enemyId` is the
  boss and uses `shadows.arise.bossChance`; the rest use `shadows.arise.normalChance`.
  Raised shadows are appended to `save.shadows` and attached to the returned combat state
  as `risenShadows` for the win overlay ("ARISE!"). **Loss/flee raises nothing.**

## 5. Deployment (capped squad)

- `deployCap(level) = shadows.baseDeployCap + floor(level / shadows.deployCapPerLevels)`
  (pure). Example: base 3, +1 every 10 levels.
- Store actions `deployShadow(id)` / `undeployShadow(id)` maintain `deployedShadowIds`;
  `deployShadow` rejects (no-op) when the squad is already at `deployCap` or the id is
  unknown/already deployed. `undeployShadow` removes the id.
- Only deployed shadows contribute to the Shadow Strike.

## 6. Shadow Strike in combat

- Pure helper `deployedShadowPower(shadows, deployedIds) → number` (sum of deployed
  shadow `power`). The store multiplies by `shadows.shadowStrikeFactor` to get per-round
  strike damage and provides it to combat.
- `CombatState` gains `shadowPower: number` (0 when none deployed) and an optional
  `risenShadows?: Shadow[]`. `gates.buildCombatState` takes a `shadowPower` argument
  (an ADDITIONAL param beyond the existing `(gate, player, equipment, seed)` — proposed
  order `(gate, player, equipment, shadowPower, seed)`) and sets it on the state (keeping
  the engine pure — shadowPower is plain data). The one existing call site in
  `useSystemStore.enterGate` must be updated to pass the computed shadowPower, and the
  existing `gates.test.ts` calls updated to pass `0`.
- The **engine** (`applyPlayerAction`): the Shadow Strike block must be inserted **between
  the `enemies = s.enemies.map(...)` reconstruction line and the `if (player.hp <= 0)`
  death check** — i.e. after the player/enemy actions resolve and buffs decay, but before
  any death/advance/win checks. If `shadowPower > 0` and the current enemy is still alive
  (hp > 0), apply a Shadow Strike to the current enemy: `damage = max(1, shadowPower)`
  (flat bonus damage; update the enemy in the `enemies` array and append a log entry "Your
  shadows strike {enemy} for {n}"). Because it runs before the death checks, it can finish
  an enemy (triggering advance/win in the existing checks below). It applies once per
  round, to the current enemy only. Deterministic — no randomness, no MP cost. (`rollArise`
  uses the existing `rollChance` helper in `rng.ts`; the Strike itself uses no RNG.)

## 7. Store / data flow

- `enterGate`: compute `shadowPower = deployedShadowPower(save.shadows, save.deployedShadowIds) × shadows.shadowStrikeFactor`, pass to `buildCombatState`.
- `combatAction` win branch: in addition to existing gold/loot/clear logic, roll ARISE for
  the gate's enemies, append new shadows to `save.shadows`, and attach `risenShadows` to
  the combat state set into the store.
- New actions `deployShadow` / `undeployShadow`.
- All actions persist via the existing `persist(next)` pattern; none touch
  level/EXP/statXP.

## 8. Navigation rework (bottom bar → sidebar drawer)

- **Remove** the fixed `BottomNav`. **Add**:
  - `TopBar` — a sticky top app bar with a hamburger (☰) button and the app title
    ("THE SYSTEM"); system-window aesthetic.
  - `NavDrawer` — a slide-in left panel (framer-motion) listing all destinations with
    icon + label: Home (`/`), Status (`/status`), Gates (`/gates`), Items (`/inventory`),
    Shadows (`/shadows`), Log (`/log`). A semi-opaque backdrop dismisses it; selecting a
    destination navigates and closes it. Active route highlighted in cyan.
  - Open/close state is local React state in `App` (or a tiny dedicated store slice);
    not persisted.
- **Screens**: remove the `pb-24` bottom padding added for the old bottom bar; content now
  flows under the sticky `TopBar` (add appropriate top spacing). `PenaltyZoneOverlay`
  still mounts above everything. `BattleScreen` is reached by entering a gate (not in the
  drawer), as today.
- `BottomNav.tsx` is removed; its links list moves into `NavDrawer`.

## 9. UI — Shadow Army screen

- **ShadowArmyScreen** (`/shadows`): header shows deployed count vs cap
  (e.g. "ARMY — 3 / 4 DEPLOYED") and the current total Shadow Strike damage. Lists shadows
  as `ShadowCard`s (name, source, power), deployed ones highlighted with a "DEPLOYED"
  badge. Tapping toggles deploy/undeploy; deploy is disabled when at cap. Empty state:
  "No shadows yet. Win Gates and ARISE the fallen." Reusable `ShadowCard` component.
- **BattleScreen**: the Shadow Strike already appears in the combat log (engine-logged);
  the win overlay lists any `risenShadows` under loot, styled as "ARISE!".

## 10. Balance config (`balanceConfig.shadows`)

`arise: { normalChance, bossChance }`, `powerPerSourceFactor`, `shadowStrikeFactor`,
`baseDeployCap`, `deployCapPerLevels`.

## 11. New / changed files

```
src/domain/shadows/types.ts      (new) Shadow type
src/domain/shadows/army.ts       (new) ariseFromEnemy, rollArise, deployCap, deployedShadowPower
src/domain/balanceConfig.ts      (modify) add shadows block
src/domain/types.ts              (modify) SaveState.shadows + .deployedShadowIds
src/domain/combat/types.ts       (modify) CombatState.shadowPower + risenShadows?
src/domain/combat/engine.ts      (modify) Shadow Strike each round
src/domain/gates.ts              (modify) buildCombatState gains shadowPower param
src/persistence/repository.ts    (modify) SCHEMA_VERSION=4, freshSaveState fields, migrate v3->v4
src/store/useSystemStore.ts      (modify) arise on win, deploy/undeploy, pass shadowPower, risenShadows
src/components/ShadowCard.tsx     (new)
src/screens/ShadowArmyScreen.tsx  (new)
src/components/TopBar.tsx          (new)
src/components/NavDrawer.tsx       (new)
src/components/BottomNav.tsx       (remove)
src/App.tsx                        (modify) TopBar + NavDrawer + /shadows route; drop BottomNav
src/screens/*.tsx                  (modify) swap pb-24 bottom padding for top spacing
src/screens/BattleScreen.tsx       (modify) risen-shadow overlay
```

## 12. Testing (TDD)

- `army`: `ariseFromEnemy` power formula + name; `rollArise` forced true/false via seed;
  `deployCap` scales with level; `deployedShadowPower` sums only deployed.
- `engine`: Shadow Strike damages the current enemy each round; can finish an enemy
  (advances/wins); `shadowPower: 0` is a no-op; existing engine tests stay green (they use
  states without `shadowPower` → treat undefined as 0).
- store: arise-on-win appends shadows and sets `risenShadows`; loss/flee raises none;
  deploy/undeploy respect the cap; `enterGate` threads shadowPower so deployed shadows
  deal damage in combat; **guard** — combat with deployed shadows leaves
  level/EXP/statXP/subLevel unchanged.
- `repository`: v3 → v4 migration adds shadows + deployedShadowIds; v1 → v4 composes all
  steps.
- UI: a light test for `ShadowCard` (renders name/power/deployed state); nav can be
  manually verified (drawer open/close, navigation) plus a smoke render.

## 13. Definition of done (2c)

- Winning a gate can raise shadows (shown as "ARISE!" in the overlay), added to the army;
  losing raises none.
- Deploying shadows (up to the cap) makes them deal a Shadow Strike each round in the next
  gate, visible in the combat log and capable of finishing enemies.
- The bottom bar is gone; a top hamburger opens a slide-in drawer with all six
  destinations; navigation works and the drawer closes on selection.
- A full combat with deployed shadows causes ZERO change to level/EXP/stat-XP (guard).
- v3 saves migrate to v4 (and v1 → v4 composes).
- Full Vitest suite green; production build clean; verified in-browser.
