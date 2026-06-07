# Solo System — Phase 2c (ARISE Shadow Army + Sidebar Nav) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the ARISE shadow army — raise defeated enemies into shadows that deal a per-round Shadow Strike (deployed up to a level-scaling cap) — and replace the bottom tab bar with a top hamburger + slide-in sidebar drawer.

**Architecture:** A pure shadows domain (`src/domain/shadows/`) computes shadow power, ARISE rolls, deploy cap, and deployed power. The combat engine applies a deterministic Shadow Strike each round from a `shadowPower` value carried on `CombatState` (engine stays pure). The store rolls ARISE on a gate win and manages deployment. Schema migrates v3 → v4. A `TopBar` + `NavDrawer` replace `BottomNav`.

**Tech Stack:** Existing — React + Vite + TS + Tailwind + Zustand + Dexie + framer-motion + lucide-react + Vitest. No new deps.

**Core principle (enforced):** Raising/deploying shadows and the Shadow Strike touch only the shadow collection and combat — never level/EXP/stat-XP. A guard test asserts a full combat with deployed shadows leaves level/currentEXP/statXP/subLevel unchanged.

**Working dir:** `solo-system/` inside the worktree `/Users/andreupaz/sololevelling/.claude/worktrees/solo-phase2c`. Paths relative to `solo-system/`. **Run `npm install` first.** Tests: `npx vitest run <path>`; build: `npm run build`.

**Standing rule:** No comments in any code files. None.

---

## File structure

```
src/domain/shadows/types.ts    (new) Shadow type
src/domain/shadows/army.ts     (new) ariseFromEnemy, rollArise, deployCap, deployedShadowPower, shadowPowerFromEnemy
src/domain/balanceConfig.ts    (modify) add shadows block
src/domain/types.ts            (modify) SaveState.shadows + .deployedShadowIds
src/domain/combat/types.ts     (modify) CombatState.shadowPower? + risenShadows?
src/domain/combat/engine.ts    (modify) Shadow Strike each round
src/domain/gates.ts            (modify) buildCombatState gains shadowPower param
src/persistence/repository.ts  (modify) SCHEMA_VERSION=4, freshSaveState fields, migrate v3->v4
src/store/useSystemStore.ts    (modify) arise on win, deploy/undeploy, pass shadowPower, risenShadows
src/components/ShadowCard.tsx   (new)
src/screens/ShadowArmyScreen.tsx(new)
src/components/TopBar.tsx        (new)
src/components/NavDrawer.tsx     (new)
src/components/BottomNav.tsx     (delete)
src/App.tsx                      (modify) TopBar + NavDrawer + /shadows; drop BottomNav
src/screens/{Home,Status,Log,Gates,Inventory}Screen.tsx (modify) drop pb-24
src/screens/BattleScreen.tsx     (modify) risen-shadow overlay
```

## Conventions
TDD per code task. No comments. Shadows domain is pure (no React/Dexie/Date.now); randomness only via the seeded RNG in `src/domain/combat/rng.ts` (`nextRandom`, `rollChance`).

---

## Task 1: Shadow types + config + SaveState/CombatState fields + migration

**Files:** Create `src/domain/shadows/types.ts`; modify `src/domain/balanceConfig.ts`, `src/domain/types.ts`, `src/domain/combat/types.ts`, `src/persistence/repository.ts`.

- [ ] **Step 1: Create `src/domain/shadows/types.ts`**
```ts
export interface Shadow {
  id: string
  sourceEnemyId: string
  name: string
  power: number
}
```

- [ ] **Step 2: Add the `shadows` block to `balanceConfig.ts`** (inside `balanceConfig`, after the `loot` block):
```ts
  shadows: {
    arise: { normalChance: 0.2, bossChance: 0.6 },
    powerPerSourceFactor: 0.5,
    shadowStrikeFactor: 1,
    baseDeployCap: 3,
    deployCapPerLevels: 10,
  },
```

- [ ] **Step 3: Extend `SaveState` in `types.ts`** — add import + two fields:
```ts
import type { Shadow } from './shadows/types'
```
In `SaveState`:
```ts
  shadows: Shadow[]
  deployedShadowIds: string[]
```

- [ ] **Step 4: Extend `CombatState` in `src/domain/combat/types.ts`** — add import + two optional fields:
```ts
import type { Shadow } from '../shadows/types'
```
In `CombatState`:
```ts
  shadowPower?: number
  risenShadows?: Shadow[]
```
(Both optional so existing engine tests that build `CombatState` literals without them still compile.)

- [ ] **Step 5: Update `repository.ts`** — bump version, fresh fields, and migration step:
- `export const SCHEMA_VERSION = 4`
- In `freshSaveState` returned object add:
```ts
    shadows: [],
    deployedShadowIds: [],
```
- In `migrate`, add after the `schemaVersion < 3` step:
```ts
  if (s.schemaVersion < 4) {
    s = { ...s, shadows: (s as { shadows?: Shadow[] }).shadows ?? [], deployedShadowIds: (s as { deployedShadowIds?: string[] }).deployedShadowIds ?? [], schemaVersion: 4 }
  }
```
(Import `Shadow` in repository.ts if needed for the cast, or use `as any` consistent with existing style — match how the v3 step casts.)

- [ ] **Step 6: Verify** — `npx vitest run` (existing 101 tests still pass; bumping SCHEMA_VERSION requires the migrate step you just added so the existing migration tests stay green) and `npm run build`. Fix any type errors.

- [ ] **Step 7: Commit**
```bash
git add src/domain/shadows/types.ts src/domain/balanceConfig.ts src/domain/types.ts src/domain/combat/types.ts src/persistence/repository.ts
git commit -m "feat(solo-system): shadow types, config, SaveState + CombatState fields, migrate v4"
```

---

## Task 2: Migration v3 → v4 tests

**Files:** Create `src/persistence/migration_v4.test.ts`

- [ ] **Step 1: Test** `src/persistence/migration_v4.test.ts`:
```ts
import { db, SAVE_KEY } from './db'
import { loadState, freshSaveState, SCHEMA_VERSION } from './repository'

beforeEach(async () => { await db.saves.clear() })

test('a v3 save gains shadows + deployedShadowIds and becomes v4', async () => {
  const v3: any = freshSaveState(4)
  delete v3.shadows
  delete v3.deployedShadowIds
  v3.schemaVersion = 3
  await db.saves.put({ key: SAVE_KEY, state: v3 })
  const loaded = await loadState()
  expect(loaded?.schemaVersion).toBe(SCHEMA_VERSION)
  expect(loaded?.shadows).toEqual([])
  expect(loaded?.deployedShadowIds).toEqual([])
})

test('a v1 save composes all migrations to v4', async () => {
  const v1: any = freshSaveState(4)
  delete v1.gates; delete v1.inventory; delete v1.equipment; delete v1.shadows; delete v1.deployedShadowIds
  v1.schemaVersion = 1
  await db.saves.put({ key: SAVE_KEY, state: v1 })
  const loaded = await loadState()
  expect(loaded?.schemaVersion).toBe(4)
  expect(loaded?.gates).toEqual({ clearedGateIds: [] })
  expect(loaded?.inventory).toEqual([])
  expect(loaded?.shadows).toEqual([])
  expect(loaded?.deployedShadowIds).toEqual([])
})
```

- [ ] **Step 2: Run → PASS** (migration implemented in Task 1). If a real bug surfaces, STOP and report.

- [ ] **Step 3: Commit**
```bash
git add src/persistence/migration_v4.test.ts
git commit -m "test(solo-system): v3->v4 and v1->v4 migration coverage"
```

---

## Task 3: Shadows domain (army.ts)

**Files:** Create `src/domain/shadows/army.ts`, `src/domain/shadows/army.test.ts`

- [ ] **Step 1: Failing test** `src/domain/shadows/army.test.ts`:
```ts
import { ariseFromEnemy, rollArise, deployCap, deployedShadowPower, shadowPowerFromEnemy } from './army'
import { enemyLibrary } from '../../data/enemyLibrary'
import type { Shadow } from './types'

test('shadowPowerFromEnemy scales with enemy stats; bosses are stronger', () => {
  const goblin = enemyLibrary.find(e => e.id === 'goblin')!
  const boss = enemyLibrary.find(e => e.id === 'gate_e_boss')!
  expect(shadowPowerFromEnemy(boss)).toBeGreaterThan(shadowPowerFromEnemy(goblin))
  expect(shadowPowerFromEnemy(goblin)).toBeGreaterThan(0)
})

test('ariseFromEnemy builds a named shadow from a known enemy', () => {
  const s = ariseFromEnemy('goblin', 123)
  expect(s.sourceEnemyId).toBe('goblin')
  expect(s.name).toMatch(/Goblin/)
  expect(s.power).toBeGreaterThan(0)
  expect(s.id).toBeTruthy()
})

test('rollArise is forced by chance bounds', () => {
  expect(rollArise(1, 99).raised).toBe(true)
  expect(rollArise(0, 99).raised).toBe(false)
})

test('deployCap rises with level', () => {
  expect(deployCap(1)).toBe(3)
  expect(deployCap(20)).toBe(5)
})

test('deployedShadowPower sums only deployed shadows', () => {
  const shadows: Shadow[] = [
    { id: 'a', sourceEnemyId: 'goblin', name: 'A', power: 10 },
    { id: 'b', sourceEnemyId: 'imp', name: 'B', power: 5 },
    { id: 'c', sourceEnemyId: 'orc', name: 'C', power: 20 },
  ]
  expect(deployedShadowPower(shadows, ['a', 'c'])).toBe(30)
  expect(deployedShadowPower(shadows, [])).toBe(0)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `src/domain/shadows/army.ts`**
```ts
import { balanceConfig } from '../balanceConfig'
import { rollChance } from '../combat/rng'
import { enemyLibrary, type EnemyDef } from '../../data/enemyLibrary'
import type { Shadow } from './types'

export function shadowPowerFromEnemy(e: EnemyDef): number {
  return Math.round((e.attack + e.hp / 10 + e.defense) * balanceConfig.shadows.powerPerSourceFactor)
}

export function ariseFromEnemy(enemyId: string, seed: number): Shadow {
  const e = enemyLibrary.find(x => x.id === enemyId)
  if (!e) throw new Error(`unknown enemy ${enemyId}`)
  return { id: `shadow-${seed}`, sourceEnemyId: e.id, name: `Shadow of ${e.name}`, power: shadowPowerFromEnemy(e) }
}

export function rollArise(chance: number, state: number): { raised: boolean; state: number } {
  const r = rollChance(state, chance)
  return { raised: r.hit, state: r.state }
}

export function deployCap(level: number): number {
  return balanceConfig.shadows.baseDeployCap + Math.floor(level / balanceConfig.shadows.deployCapPerLevels)
}

export function deployedShadowPower(shadows: Shadow[], deployedIds: string[]): number {
  return shadows.filter(s => deployedIds.includes(s.id)).reduce((a, s) => a + s.power, 0)
}
```
(Confirm `EnemyDef` is exported from `enemyLibrary.ts`; it is.)

- [ ] **Step 4: Run → PASS.** Full suite + build.

- [ ] **Step 5: Commit**
```bash
git add src/domain/shadows/army.ts src/domain/shadows/army.test.ts
git commit -m "feat(solo-system): shadow army domain (arise, deploy cap, power)"
```

---

## Task 4: Shadow Strike in the combat engine

**Files:** Modify `src/domain/combat/engine.ts`; create `src/domain/combat/engine_shadow.test.ts`

- [ ] **Step 1: Failing test** `src/domain/combat/engine_shadow.test.ts`:
```ts
import { applyPlayerAction } from './engine'
import type { Combatant, CombatState } from './types'

function mk(over: Partial<Combatant>): Combatant {
  return {
    id: 'x', name: 'X', isPlayer: false, hp: 100, maxHP: 100, mp: 30, maxMP: 30,
    attack: 0, defense: 0, speed: 5, skillPowerMult: 1, critChance: 0, critMultiplier: 1.75,
    dodgeChance: 0, buffs: [], defending: false, ...over,
  }
}
function state(over: Partial<CombatState>): CombatState {
  return {
    gateId: 'g', goldReward: 0,
    player: mk({ id: 'p', name: 'Hunter', isPlayer: true, attack: 0, speed: 10 }),
    enemies: [mk({ id: 'e1', name: 'Goblin', hp: 999 })],
    currentEnemyIndex: 0, round: 1, phase: 'player', log: [], rngState: 1, nextLogId: 1, ...over,
  }
}

test('shadow strike damages the current enemy each round', () => {
  const s = applyPlayerAction(state({ shadowPower: 15 }), { type: 'defend' })
  expect(s.enemies[0].hp).toBe(999 - 15)
})

test('shadow strike can finish an enemy and advance to the next', () => {
  const s = applyPlayerAction(
    state({ shadowPower: 50, enemies: [mk({ id: 'e1', hp: 5 }), mk({ id: 'boss', hp: 80 })] }),
    { type: 'defend' },
  )
  expect(s.phase).toBe('player')
  expect(s.currentEnemyIndex).toBe(1)
})

test('shadow strike can finish the boss and win', () => {
  const s = applyPlayerAction(state({ shadowPower: 50, enemies: [mk({ id: 'boss', hp: 5 })] }), { type: 'defend' })
  expect(s.phase).toBe('won')
})

test('zero / undefined shadow power adds no extra damage', () => {
  const none = applyPlayerAction(state({ player: mk({ id: 'p', isPlayer: true, attack: 10, speed: 10 }) }), { type: 'attack' })
  expect(none.enemies[0].hp).toBe(999 - 10)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Modify the tail of `applyPlayerAction` in `engine.ts`.** Replace the existing end-of-function block (from `const enemies = s.enemies.map(...)` through the final `return s`) with:
```ts
  const enemies = s.enemies.map((e, i) => (i === s.currentEnemyIndex ? enemy : e))
  s = { ...s, player, enemies, rngState: rng, round: s.round + 1 }
  for (const t of logs) s = log(s, t)

  const shadowPower = s.shadowPower ?? 0
  const current = s.enemies[s.currentEnemyIndex]
  if (shadowPower > 0 && current.hp > 0) {
    const dmg = Math.max(1, shadowPower)
    s = { ...s, enemies: s.enemies.map((e, i) => i === s.currentEnemyIndex ? { ...e, hp: Math.max(0, e.hp - dmg) } : e) }
    s = log(s, `Your shadows strike ${current.name} for ${dmg}`)
  }

  if (s.player.hp <= 0) return { ...s, phase: 'lost' }
  const finalEnemy = s.enemies[s.currentEnemyIndex]
  if (finalEnemy.hp <= 0) {
    if (s.currentEnemyIndex >= s.enemies.length - 1) return { ...s, phase: 'won' }
    s = { ...s, currentEnemyIndex: s.currentEnemyIndex + 1 }
    return log(s, `${s.enemies[s.currentEnemyIndex].name} appears`)
  }
  return s
```
This inserts the Shadow Strike between the enemy-array reconstruction and the death checks, and updates the death checks to read the post-strike state (`s.player`, `finalEnemy`). With `shadowPower` absent/0 the behavior is identical to before (all existing engine tests stay green).

- [ ] **Step 4: Run → PASS.** Full suite + build (existing engine + skills_effects tests must stay green).

- [ ] **Step 5: Commit**
```bash
git add src/domain/combat/engine.ts src/domain/combat/engine_shadow.test.ts
git commit -m "feat(solo-system): shadow strike each combat round"
```

---

## Task 5: buildCombatState shadowPower param

**Files:** Modify `src/domain/gates.ts`, `src/domain/gates.test.ts`, `src/store/useSystemStore.ts`

- [ ] **Step 1: Update existing gates tests + add one.** In `src/domain/gates.test.ts`, every `buildCombatState(gateE1, player({}), <equipment>, <seed>)` call gains a `shadowPower` arg before the seed: `buildCombatState(gateE1, player({}), emptyEquipment, 0, 12345)`. Add:
```ts
test('buildCombatState carries the provided shadow power', () => {
  const cs = buildCombatState(gateE1, player({}), { weapon: null, armor: null, accessory: null }, 25, 1)
  expect(cs.shadowPower).toBe(25)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Modify `src/domain/gates.ts`** — change `buildCombatState`'s signature to insert `shadowPower` before `seed`:
```ts
export function buildCombatState(gate: GateDef, player: Player, equipment: Equipment, shadowPower: number, seed: number): CombatState {
```
and add `shadowPower,` to the returned `CombatState` object.

- [ ] **Step 4: Update the store call site.** In `useSystemStore.ts` `enterGate`, the call `buildCombatState(gate, next.player, next.equipment, clock.now())` becomes `buildCombatState(gate, next.player, next.equipment, 0, clock.now())` for now (Task 6 computes the real shadowPower). This keeps the build green.

- [ ] **Step 5: Run → PASS.** Full suite + build.

- [ ] **Step 6: Commit**
```bash
git add src/domain/gates.ts src/domain/gates.test.ts src/store/useSystemStore.ts
git commit -m "feat(solo-system): buildCombatState carries shadow power"
```

---

## Task 6: Store integration (arise, deploy/undeploy, shadowPower, guard)

**Files:** Modify `src/store/useSystemStore.ts`; create `src/store/shadows.test.ts`

- [ ] **Step 1: Failing test** `src/store/shadows.test.ts`:
```ts
import { createSystemStore } from './useSystemStore'
import { db } from '../persistence/db'

const clock = (ms: number) => ({ now: () => ms })
beforeEach(async () => { await db.saves.clear() })

async function ready() {
  const store = createSystemStore({ clock: clock(Date.now()) })
  await store.getState().hydrate()
  store.setState(s => ({ save: { ...s.save, player: { ...s.save.player, gateKeys: 5, stats: Object.fromEntries(Object.entries(s.save.player.stats).map(([k, v]) => [k, { ...v, subLevel: 10 }])) as typeof s.save.player.stats } } }))
  return store
}

test('deployShadow respects the cap; undeploy frees a slot', async () => {
  const store = await ready()
  const shadows = Array.from({ length: 6 }, (_, i) => ({ id: `s${i}`, sourceEnemyId: 'goblin', name: 'G', power: 5 }))
  store.setState(s => ({ save: { ...s.save, shadows } }))
  for (const sh of shadows) store.getState().deployShadow(sh.id)
  expect(store.getState().save.deployedShadowIds.length).toBe(3)
  store.getState().undeployShadow('s0')
  expect(store.getState().save.deployedShadowIds.length).toBe(2)
  store.getState().deployShadow('s5')
  expect(store.getState().save.deployedShadowIds.length).toBe(3)
})

test('winning a gate can raise shadows and never changes level/EXP/statXP', async () => {
  const store = await ready()
  const before = store.getState().save.player
  store.getState().enterGate('gate-e1')
  let guard = 0
  while (store.getState().combat?.phase === 'player' && guard++ < 500) store.getState().combatAction({ type: 'attack' })
  const after = store.getState().save
  expect(after.player.level).toBe(before.level)
  expect(after.player.currentEXP).toBe(before.currentEXP)
  expect(after.player.stats.STR.statXP).toBe(before.stats.STR.statXP)
  expect(after.player.stats.STR.subLevel).toBe(before.stats.STR.subLevel)
})

test('deployed shadows deal damage in the next gate (combat log shows a shadow strike)', async () => {
  const store = await ready()
  store.setState(s => ({ save: { ...s.save, shadows: [{ id: 'x', sourceEnemyId: 'gate_e_boss', name: 'Boss Shadow', power: 30 }], deployedShadowIds: ['x'] } }))
  store.getState().enterGate('gate-e1')
  store.getState().combatAction({ type: 'defend' })
  const log = store.getState().combat?.log.map(l => l.text).join(' ') ?? ''
  expect(log).toMatch(/shadows strike/i)
})

test('fleeing raises no shadows', async () => {
  const store = await ready()
  const n = store.getState().save.shadows.length
  store.getState().enterGate('gate-e1')
  store.getState().fleeGate()
  expect(store.getState().save.shadows.length).toBe(n)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Modify `src/store/useSystemStore.ts`**
- Imports:
```ts
import { ariseFromEnemy, rollArise, deployCap, deployedShadowPower } from '../domain/shadows/army'
import { nextRandom } from '../domain/combat/rng'
import type { Shadow } from '../domain/shadows/types'
```
- Extend `SystemState` interface:
```ts
  deployShadow: (id: string) => void
  undeployShadow: (id: string) => void
```
- `enterGate`: compute and pass shadowPower:
```ts
        const sp = deployedShadowPower(save.shadows, save.deployedShadowIds) * balanceConfig.shadows.shadowStrikeFactor
        const next: SaveState = { ...save, player: { ...save.player, gateKeys: save.player.gateKeys - gate.keyCost } }
        persist(next)
        const combat = buildCombatState(gate, next.player, next.equipment, sp, clock.now())
        set({ save: next, combat })
```
- `combatAction` won branch: after computing `drops` and `clearedGateIds`, add ARISE rolls and include `shadows` + `risenShadows`:
```ts
          const cfg = balanceConfig.shadows.arise
          let astate = (clock.now() & 0x7fffffff) || 1
          const risen: Shadow[] = []
          if (gate) {
            gate.enemyIds.forEach((eid, i) => {
              const chance = i === gate.enemyIds.length - 1 ? cfg.bossChance : cfg.normalChance
              const r = rollArise(chance, astate); astate = r.state
              if (r.raised) {
                const base = ariseFromEnemy(eid, astate); astate = nextRandom(astate).state
                risen.push({ ...base, id: `shadow-${clock.now()}-${i}-${Math.random().toString(36).slice(2, 6)}` })
              }
            })
          }
          const next: SaveState = {
            ...save,
            player: { ...save.player, currency: save.player.currency + nextCombat.goldReward },
            gates: { clearedGateIds },
            inventory: [...save.inventory, ...drops],
            shadows: [...save.shadows, ...risen],
          }
          persist(next)
          set({ save: next, combat: { ...nextCombat, droppedItems: drops, risenShadows: risen } })
```
- Add the two actions:
```ts
      deployShadow: (id: string) => {
        const save = get().save
        if (save.deployedShadowIds.includes(id)) return
        if (!save.shadows.some(s => s.id === id)) return
        if (save.deployedShadowIds.length >= deployCap(save.player.level)) return
        const next: SaveState = { ...save, deployedShadowIds: [...save.deployedShadowIds, id] }
        persist(next)
        set({ save: next })
      },

      undeployShadow: (id: string) => {
        const save = get().save
        if (!save.deployedShadowIds.includes(id)) return
        const next: SaveState = { ...save, deployedShadowIds: save.deployedShadowIds.filter(x => x !== id) }
        persist(next)
        set({ save: next })
      },
```

- [ ] **Step 4: Run → PASS.** Full suite + build. (The arise win-test asserts only the invariant, not that shadows were raised, since ARISE is chance-based; the deployed-damage test forces a deploy to verify the strike fires.)

- [ ] **Step 5: Commit**
```bash
git add src/store/useSystemStore.ts src/store/shadows.test.ts
git commit -m "feat(solo-system): store ARISE on win, deploy/undeploy, shadow power in combat"
```

---

## Task 7: ShadowCard component

**Files:** Create `src/components/ShadowCard.tsx`, `src/components/ShadowCard.test.tsx`

- [ ] **Step 1: Failing test** `src/components/ShadowCard.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { ShadowCard } from './ShadowCard'
import type { Shadow } from '../domain/shadows/types'

const shadow: Shadow = { id: 's', sourceEnemyId: 'gate_e_boss', name: 'Shadow of Gatekeeper', power: 18 }

test('shows the shadow name and power', () => {
  render(<ShadowCard shadow={shadow} deployed={false} />)
  expect(screen.getByText(/Shadow of Gatekeeper/)).toBeInTheDocument()
  expect(screen.getByText(/18/)).toBeInTheDocument()
})

test('shows a deployed badge when deployed', () => {
  render(<ShadowCard shadow={shadow} deployed />)
  expect(screen.getByText(/DEPLOYED/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run → FAIL, implement, run → PASS.**
`ShadowCard.tsx` props `{ shadow: Shadow; deployed: boolean; onClick?: () => void }`. Render the name, a "PWR {power}" stat, and a "DEPLOYED" badge (cyan) when `deployed`. Clickable when `onClick` given; deployed cards get a highlighted border. System-window aesthetic; no store imports.

- [ ] **Step 3: Commit**
```bash
git add src/components/ShadowCard.tsx src/components/ShadowCard.test.tsx
git commit -m "feat(solo-system): shadow card component"
```

---

## Task 8: Sidebar nav (TopBar + NavDrawer, remove BottomNav)

**Files:** Create `src/components/TopBar.tsx`, `src/components/NavDrawer.tsx`; delete `src/components/BottomNav.tsx`; modify `src/App.tsx` and the five screens with `pb-24`.

- [ ] **Step 1: Create `src/components/TopBar.tsx`**
```tsx
import { Menu } from 'lucide-react'

export function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-system-panel/95 border-b border-system-glow/20 backdrop-blur-md">
      <button onClick={onMenu} aria-label="Open menu" className="-ml-2 p-2 text-system-glow">
        <Menu size={22} />
      </button>
      <span className="font-mono text-sm uppercase tracking-[0.3em] text-system-glow">The System</span>
    </header>
  )
}
```

- [ ] **Step 2: Create `src/components/NavDrawer.tsx`**
```tsx
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, BarChart3, Swords, Backpack, Ghost, History } from 'lucide-react'

const links = [
  { to: '/', label: 'HOME', Icon: Home },
  { to: '/status', label: 'STATUS', Icon: BarChart3 },
  { to: '/gates', label: 'GATES', Icon: Swords },
  { to: '/inventory', label: 'ITEMS', Icon: Backpack },
  { to: '/shadows', label: 'SHADOWS', Icon: Ghost },
  { to: '/log', label: 'LOG', Icon: History },
]

export function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.nav
            className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-system-panel border-r border-system-glow/30 shadow-glow p-4"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
          >
            <div className="mt-2 mb-6 font-mono text-sm uppercase tracking-[0.3em] text-system-glow">The System</div>
            <div className="flex flex-col gap-1">
              {links.map(({ to, label, Icon }) => (
                <NavLink
                  key={to} to={to} end={to === '/'} onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded px-3 py-3 ${isActive ? 'text-system-glow bg-system-glow/10' : 'text-slate-400 hover:text-slate-200'}`
                  }
                >
                  <Icon size={20} />
                  <span className="font-mono text-xs uppercase tracking-widest">{label}</span>
                </NavLink>
              ))}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Rewrite `src/App.tsx`** to use TopBar + NavDrawer and drop BottomNav (also adds the `/shadows` route — `ShadowArmyScreen` is created in Task 9; import it now and create a temporary stub if needed, OR do the route in Task 9. To keep this task's build green, leave the `/shadows` route out here and add it in Task 9.):
```tsx
import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { useSystemStore, systemStore } from './store/useSystemStore'
import { TopBar } from './components/TopBar'
import { NavDrawer } from './components/NavDrawer'
import { PenaltyZoneOverlay } from './components/PenaltyZoneOverlay'
import { HomeScreen } from './screens/HomeScreen'
import { StatusScreen } from './screens/StatusScreen'
import { LogScreen } from './screens/LogScreen'
import { GatesScreen } from './screens/GatesScreen'
import { BattleScreen } from './screens/BattleScreen'
import { InventoryScreen } from './screens/InventoryScreen'

export default function App() {
  const ready = useSystemStore(s => s.ready)
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    systemStore.getState().hydrate()
      .then(() => systemStore.getState().checkPenalty())
      .catch(console.error)
    const id = setInterval(() => { systemStore.getState().checkPenalty() }, 30000)
    return () => clearInterval(id)
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen bg-system-bg flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-system-glow/30 border-t-system-glow animate-spin" style={{ boxShadow: '0 0 16px #38bdf8' }} />
        <p className="font-mono text-system-glow text-sm tracking-[0.3em] uppercase animate-pulse">INITIALIZING SYSTEM…</p>
      </div>
    )
  }

  return (
    <HashRouter>
      <TopBar onMenu={() => setNavOpen(true)} />
      <NavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
      <PenaltyZoneOverlay />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/status" element={<StatusScreen />} />
        <Route path="/log" element={<LogScreen />} />
        <Route path="/gates" element={<GatesScreen />} />
        <Route path="/battle" element={<BattleScreen />} />
        <Route path="/inventory" element={<InventoryScreen />} />
      </Routes>
    </HashRouter>
  )
}
```

- [ ] **Step 4: Delete `src/components/BottomNav.tsx`** (`git rm src/components/BottomNav.tsx`). Confirm nothing else imports it (`grep -rn BottomNav src/` → only App.tsx, now removed).

- [ ] **Step 5: Remove `pb-24` bottom padding** from the five screens that have it for the old bottom bar: `HomeScreen.tsx`, `StatusScreen.tsx`, `LogScreen.tsx`, `GatesScreen.tsx`, `InventoryScreen.tsx`. Replace `pb-24` with `pb-8` (content now sits under the sticky TopBar; no overlap). Leave other classes unchanged.

- [ ] **Step 6: Verify** — `npx vitest run` (all green; the App smoke test, if it asserts old nav text, may need a tweak — keep it asserting the loading text or a stable element). `npm run build` clean. Optionally `npm run dev` to confirm the drawer opens/closes.

- [ ] **Step 7: Commit**
```bash
git add -A src/components src/App.tsx src/screens
git commit -m "feat(solo-system): replace bottom nav with top bar + slide-in drawer"
```

---

## Task 9: Shadow Army screen + route + battle overlay

**Files:** Create `src/screens/ShadowArmyScreen.tsx`; modify `src/App.tsx`, `src/screens/BattleScreen.tsx`

- [ ] **Step 1: ShadowArmyScreen** (`src/screens/ShadowArmyScreen.tsx`)
- Read `save` + `deployShadow`/`undeployShadow` from the store; import `deployCap`, `deployedShadowPower` from `../domain/shadows/army` and `balanceConfig`.
- Header: "SHADOW ARMY", showing `{deployedShadowIds.length} / {deployCap(player.level)} DEPLOYED` and total strike = `deployedShadowPower(...) * balanceConfig.shadows.shadowStrikeFactor`.
- List `save.shadows` as `ShadowCard`s (deployed highlighted). Tapping a deployed shadow calls `undeployShadow(id)`; tapping an undeployed one calls `deployShadow(id)` (which no-ops at cap — reflect disabled state visually when `deployedShadowIds.length >= cap` and the shadow isn't deployed).
- Empty state: "No shadows yet. Win Gates and ARISE the fallen." `pb-8`.

- [ ] **Step 2: Add the route + import in `App.tsx`** — `import { ShadowArmyScreen }` and `<Route path="/shadows" element={<ShadowArmyScreen />} />`. (The drawer already links to `/shadows`.)

- [ ] **Step 3: BattleScreen win overlay** — when `combat.phase === 'won'` and `combat.risenShadows?.length`, render an "ARISE!" section listing the risen shadows (reuse `ShadowCard` with `deployed={false}` or a compact list), under the loot/gold.

- [ ] **Step 4: Verify** — `npx vitest run` (all green) + `npm run build`. Optionally `npm run dev`: open drawer → Shadows; confirm deploy/undeploy.

- [ ] **Step 5: Commit**
```bash
git add src/screens/ShadowArmyScreen.tsx src/App.tsx src/screens/BattleScreen.tsx
git commit -m "feat(solo-system): shadow army screen, route, and ARISE battle overlay"
```

---

## Task 10: README + final verification

**Files:** Modify `README.md`

- [ ] **Step 1:** Add a "Shadow Army (Phase 2c)" section: defeated enemies can be raised (ARISE) on a win; deployed shadows (up to a level-scaling cap) deal a Shadow Strike each round; manage on the Shadows screen. Note the nav change (bottom bar → hamburger + sidebar drawer). Shadow constants live in `balanceConfig.shadows`. Move shadow army from "Planned" to "Done"; Phase 2 is now complete.

- [ ] **Step 2: Final verification** — `npx vitest run` and `npm run build`, both clean.

- [ ] **Step 3: Commit**
```bash
git add README.md
git commit -m "docs(solo-system): document Phase 2c shadow army and sidebar nav"
```

---

## Definition of done (2c)
- Winning a gate can raise shadows ("ARISE!" overlay), added to the army; losing/fleeing raises none.
- Deploying shadows (up to the cap) makes them deal a Shadow Strike each round in the next gate (visible in the log, can finish enemies).
- The bottom bar is gone; a top hamburger opens a slide-in drawer with all six destinations; selecting one navigates and closes it.
- A full combat with deployed shadows leaves level/EXP/stat-XP unchanged (guard).
- v3 saves migrate to v4 (and v1 → v4 composes).
- Full Vitest suite green; production build clean; verified in-browser.

## Out of scope (later)
- Shadows as independent combatants, shadow leveling/fusion, named boss shadows.
- Phase 3 (AI quests, Supabase sync, push notifications); Phase 4 (rank-up dungeons, titles, endless/prestige).
