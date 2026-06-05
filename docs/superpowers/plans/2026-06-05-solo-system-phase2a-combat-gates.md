# Solo System — Phase 2a (Turn-Based Combat + Gates) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a turn-based combat system and Gates (dungeons) to the Solo System app, where the hunter's power derives entirely from the player's real-life stats, entry costs Gate Keys earned from quests, and clearing a gate yields gold — without combat ever granting real EXP or stat-XP.

**Architecture:** A pure, fully unit-tested combat domain under `src/domain/combat/` (seeded RNG, stat→combat derivation, skills, turn-resolution engine) plus `src/domain/gates.ts` and data libraries. The Zustand store holds an **ephemeral** `combat` session and commits only gold + cleared-gate ids to the persisted `SaveState`. A schema migration takes v1 saves to v2. Two new screens (Gates, Battle) render it.

**Tech Stack:** Existing — React 19 + Vite + TypeScript + Tailwind + Zustand + Dexie + framer-motion + lucide-react + Vitest. No new dependencies.

**Core principle (enforced):** Completing a real-life quest is the ONLY source of EXP/stat-XP. Combat reads stats and writes only `currency` and `gates.clearedGateIds`. A dedicated store test asserts level/EXP/statXP are unchanged across a full combat. Reject any change that violates this.

**Working directory:** `solo-system/` inside the worktree at `/Users/andreupaz/sololevelling/.claude/worktrees/solo-phase2a`. All paths below are relative to `solo-system/`. Run tests with `npx vitest run <path>` (or `npm test`); build with `npm run build`. **Run `npm install` first** — this is a fresh worktree checkout with no `node_modules`.

**Standing rule:** No comments in any code files. None.

---

## File structure (new + changed)

```
src/domain/combat/types.ts     (new) all combat types
src/domain/combat/rng.ts       (new) seeded deterministic RNG
src/domain/combat/derive.ts    (new) deriveCombatStats(player) -> DerivedCombatStats
src/domain/combat/skills.ts    (new) skill defs + pure effects
src/domain/combat/engine.ts    (new) turn resolution, enemy AI, wave advance, win/loss
src/domain/gates.ts            (new) gate entry validation + initial CombatState builder
src/data/enemyLibrary.ts       (new) enemy stat blocks
src/data/gateLibrary.ts        (new) gate definitions (wave + boss)
src/domain/balanceConfig.ts    (modify) add `combat` block
src/domain/types.ts            (modify) add `gates` to SaveState
src/persistence/repository.ts  (modify) SCHEMA_VERSION=2 + migrate() in loadState; freshSaveState gains gates
src/store/useSystemStore.ts    (modify) combat state + enterGate/combatAction/fleeGate + reward commit
src/components/CombatantBar.tsx (new) HP/MP bar for a combatant
src/screens/GatesScreen.tsx    (new) gate list + enter
src/screens/BattleScreen.tsx   (new) battle UI
src/components/BottomNav.tsx   (modify) add Gates tab
src/App.tsx                    (modify) add /gates and /battle routes
```

---

## Conventions for every code task
- TDD: write failing test → run (confirm right failure) → implement minimally → run (confirm pass) → commit.
- No comments in code.
- Domain combat code is pure: no React, no Dexie, no `Date.now()`. Randomness flows only through the seeded RNG state in `CombatState`.
- All mutations return new objects (no in-place mutation).

---

## Task 1: Combat config + types + SaveState.gates

**Files:**
- Modify: `src/domain/balanceConfig.ts`, `src/domain/types.ts`, `src/persistence/repository.ts`
- Create: `src/domain/combat/types.ts`

- [ ] **Step 1: Add the `combat` block to `balanceConfig.ts`**

Inside the `balanceConfig` object (after `redemptionQuest`), add:
```ts
  combat: {
    baseHP: 50, hpPerVit: 10,
    baseMP: 20, mpPerInt: 3,
    baseAttack: 5, attackPerStr: 2,
    basePlayerDefense: 2, defensePerVit: 1,
    skillPowerPerInt: 0.05,
    critCap: 0.5, critPerPer: 0.01, critMultiplier: 1.75,
    dodgeCap: 0.25, dodgePerPer: 0.005,
    defendDamageReduction: 0.5, defendMpRestoreFraction: 0.1,
    enemyHeavyMoveEveryNRounds: 3, enemyHeavyMoveMultiplier: 1.5,
    skills: {
      powerStrike: { id: 'powerStrike', name: 'Power Strike', unlockLevel: 1, mpCost: 8, attackMult: 1.8 },
      mend: { id: 'mend', name: 'Mend', unlockLevel: 3, mpCost: 12, baseHeal: 20, healPerInt: 3 },
      focus: { id: 'focus', name: 'Focus', unlockLevel: 5, mpCost: 10, critBonus: 0.25, turns: 3 },
      weaken: { id: 'weaken', name: 'Weaken', unlockLevel: 8, mpCost: 14, attackDown: 0.3, defenseDown: 0.3, turns: 3 },
    },
  },
```

- [ ] **Step 2: Add `gates` to `SaveState` in `types.ts`**

Add the field to the `SaveState` interface:
```ts
  gates: { clearedGateIds: string[] }
```

- [ ] **Step 3: Create `src/domain/combat/types.ts`**

```ts
export interface DerivedCombatStats {
  maxHP: number
  maxMP: number
  attack: number
  defense: number
  speed: number
  skillPowerMult: number
  critChance: number
  critMultiplier: number
  dodgeChance: number
}

export type BuffKind = 'critUp' | 'attackDown' | 'defenseDown'

export interface Buff { kind: BuffKind; amount: number; turnsLeft: number }

export interface Combatant {
  id: string
  name: string
  isPlayer: boolean
  hp: number
  maxHP: number
  mp: number
  maxMP: number
  attack: number
  defense: number
  speed: number
  skillPowerMult: number
  critChance: number
  critMultiplier: number
  dodgeChance: number
  buffs: Buff[]
  defending: boolean
}

export type CombatPhase = 'player' | 'won' | 'lost'

export interface CombatLogEntry { id: number; text: string }

export interface CombatState {
  gateId: string
  goldReward: number
  player: Combatant
  enemies: Combatant[]
  currentEnemyIndex: number
  round: number
  phase: CombatPhase
  log: CombatLogEntry[]
  rngState: number
  nextLogId: number
}

export type PlayerAction =
  | { type: 'attack' }
  | { type: 'defend' }
  | { type: 'skill'; skillId: string }
```

- [ ] **Step 4: Update `freshSaveState` and `SCHEMA_VERSION` defaults in `repository.ts`**

Bump the constant and add `gates` to `freshSaveState` (migration logic comes in Task 8; here just make fresh saves valid):
```ts
export const SCHEMA_VERSION = 2
```
In the object returned by `freshSaveState`, add:
```ts
    gates: { clearedGateIds: [] },
```

- [ ] **Step 5: Verify compile + existing tests still pass**

Run: `npx vitest run` and `npm run build`. Existing 41 tests must still pass (adding an optional-but-required field to SaveState may surface type errors in existing fresh-state usage — `freshSaveState` now sets it, so the only consumers are fine). Expected: PASS + clean build.

- [ ] **Step 6: Commit**
```bash
git add src/domain/balanceConfig.ts src/domain/types.ts src/domain/combat/types.ts src/persistence/repository.ts
git commit -m "feat(solo-system): combat config, combat types, SaveState.gates"
```

---

## Task 2: Seeded RNG

**Files:** Create `src/domain/combat/rng.ts`, `src/domain/combat/rng.test.ts`

- [ ] **Step 1: Failing test** `src/domain/combat/rng.test.ts`:
```ts
import { nextRandom, rollChance } from './rng'

test('nextRandom is deterministic for a given state', () => {
  const a = nextRandom(42)
  const b = nextRandom(42)
  expect(a.value).toBe(b.value)
  expect(a.state).toBe(b.state)
  expect(a.value).toBeGreaterThanOrEqual(0)
  expect(a.value).toBeLessThan(1)
})

test('nextRandom advances state to a different value', () => {
  const a = nextRandom(42)
  const c = nextRandom(a.state)
  expect(c.state).not.toBe(a.state)
})

test('rollChance is always true at 1 and always false at 0', () => {
  expect(rollChance(123, 1).hit).toBe(true)
  expect(rollChance(123, 0).hit).toBe(false)
})
```

- [ ] **Step 2: Run → FAIL.** `npx vitest run src/domain/combat/rng.test.ts`

- [ ] **Step 3: Implement `src/domain/combat/rng.ts`**
```ts
export function nextRandom(state: number): { value: number; state: number } {
  const s = (state * 1103515245 + 12345) & 0x7fffffff
  return { value: s / 0x7fffffff, state: s }
}

export function rollChance(state: number, chance: number): { hit: boolean; state: number } {
  const r = nextRandom(state)
  return { hit: r.value < chance, state: r.state }
}
```

- [ ] **Step 4: Run → PASS.**

- [ ] **Step 5: Commit**
```bash
git add src/domain/combat/rng.ts src/domain/combat/rng.test.ts
git commit -m "feat(solo-system): seeded deterministic combat RNG"
```

---

## Task 3: deriveCombatStats

**Files:** Create `src/domain/combat/derive.ts`, `src/domain/combat/derive.test.ts`

- [ ] **Step 1: Failing test** `src/domain/combat/derive.test.ts`:
```ts
import { deriveCombatStats } from './derive'
import { STAT_TYPES, type Player } from '../types'

function player(subLevels: Partial<Record<string, number>>): Player {
  const stats = Object.fromEntries(STAT_TYPES.map(t => [t, { type: t, subLevel: subLevels[t] ?? 0, statXP: 0 }])) as Player['stats']
  return { level: 1, currentEXP: 0, freeStatPoints: 0, classRank: 'E', currency: 0, gateKeys: 0, stats }
}

test('derives HP/MP/attack/speed from sublevels', () => {
  const d = deriveCombatStats(player({ VIT: 3, INT: 4, STR: 5, AGI: 7 }))
  expect(d.maxHP).toBe(50 + 3 * 10)
  expect(d.maxMP).toBe(20 + 4 * 3)
  expect(d.attack).toBe(5 + 5 * 2)
  expect(d.speed).toBe(7)
})

test('crit and dodge scale with PER and are capped', () => {
  const low = deriveCombatStats(player({ PER: 10 }))
  expect(low.critChance).toBeCloseTo(0.1)
  expect(low.dodgeChance).toBeCloseTo(0.05)
  const high = deriveCombatStats(player({ PER: 1000 }))
  expect(high.critChance).toBe(0.5)
  expect(high.dodgeChance).toBe(0.25)
})

test('skill power multiplier scales with INT', () => {
  expect(deriveCombatStats(player({ INT: 10 })).skillPowerMult).toBeCloseTo(1.5)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `src/domain/combat/derive.ts`**
```ts
import { balanceConfig } from '../balanceConfig'
import type { Player } from '../types'
import type { DerivedCombatStats } from './types'

export function deriveCombatStats(player: Player): DerivedCombatStats {
  const c = balanceConfig.combat
  const s = player.stats
  return {
    maxHP: c.baseHP + s.VIT.subLevel * c.hpPerVit,
    maxMP: c.baseMP + s.INT.subLevel * c.mpPerInt,
    attack: c.baseAttack + s.STR.subLevel * c.attackPerStr,
    defense: c.basePlayerDefense + s.VIT.subLevel * c.defensePerVit,
    speed: s.AGI.subLevel,
    skillPowerMult: 1 + s.INT.subLevel * c.skillPowerPerInt,
    critChance: Math.min(c.critCap, s.PER.subLevel * c.critPerPer),
    critMultiplier: c.critMultiplier,
    dodgeChance: Math.min(c.dodgeCap, s.PER.subLevel * c.dodgePerPer),
  }
}
```

- [ ] **Step 4: Run → PASS.**

- [ ] **Step 5: Commit**
```bash
git add src/domain/combat/derive.ts src/domain/combat/derive.test.ts
git commit -m "feat(solo-system): derive combat stats from player sublevels"
```

---

## Task 4: Skills

Skills are pure effects applied to a `{ player, enemy }` pair. They return new combatants (and never read randomness — crit on skills is handled by the engine's attack resolver when `attackMult` skills deal damage). To keep skills pure and engine-driven, each skill returns a descriptor the engine applies.

**Files:** Create `src/domain/combat/skills.ts`, `src/domain/combat/skills.test.ts`

- [ ] **Step 1: Failing test** `src/domain/combat/skills.test.ts`:
```ts
import { getSkill, listSkills, skillUnlocked } from './skills'

test('getSkill returns a defined skill by id', () => {
  expect(getSkill('powerStrike')?.name).toBe('Power Strike')
  expect(getSkill('nope')).toBeUndefined()
})

test('listSkills returns all four skills in unlock order', () => {
  expect(listSkills().map(s => s.id)).toEqual(['powerStrike', 'mend', 'focus', 'weaken'])
})

test('skillUnlocked compares player level to unlock level', () => {
  expect(skillUnlocked(getSkill('mend')!, 2)).toBe(false)
  expect(skillUnlocked(getSkill('mend')!, 3)).toBe(true)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `src/domain/combat/skills.ts`**
```ts
import { balanceConfig } from '../balanceConfig'

export type SkillKind = 'damage' | 'heal' | 'buffCrit' | 'debuff'

export interface SkillDef {
  id: string
  name: string
  unlockLevel: number
  mpCost: number
  kind: SkillKind
  attackMult?: number
  baseHeal?: number
  healPerInt?: number
  critBonus?: number
  attackDown?: number
  defenseDown?: number
  turns?: number
}

const c = balanceConfig.combat.skills

const SKILLS: SkillDef[] = [
  { ...c.powerStrike, kind: 'damage' },
  { ...c.mend, kind: 'heal' },
  { ...c.focus, kind: 'buffCrit' },
  { ...c.weaken, kind: 'debuff' },
]

export function listSkills(): SkillDef[] {
  return SKILLS
}

export function getSkill(id: string): SkillDef | undefined {
  return SKILLS.find(s => s.id === id)
}

export function skillUnlocked(skill: SkillDef, playerLevel: number): boolean {
  return playerLevel >= skill.unlockLevel
}
```

- [ ] **Step 4: Run → PASS.**

- [ ] **Step 5: Commit**
```bash
git add src/domain/combat/skills.ts src/domain/combat/skills.test.ts
git commit -m "feat(solo-system): combat skill definitions and unlock checks"
```

---

## Task 5: Combat engine core (attack, defend, enemy turn, wave, win/loss)

**Files:** Create `src/domain/combat/engine.ts`, `src/domain/combat/engine.test.ts`

This is the heart of 2a. Combat is effectively 1v1 against `enemies[currentEnemyIndex]`; when an enemy dies, advance to the next; when the boss (last) dies, `won`. Each call to `applyPlayerAction` resolves one round: both combatants act in speed order (player wins ties), then buffs decrement and defend resets.

- [ ] **Step 1: Failing test** `src/domain/combat/engine.test.ts`:
```ts
import { applyPlayerAction } from './engine'
import type { Combatant, CombatState } from './types'

function mk(over: Partial<Combatant>): Combatant {
  return {
    id: 'x', name: 'X', isPlayer: false, hp: 100, maxHP: 100, mp: 30, maxMP: 30,
    attack: 20, defense: 0, speed: 5, skillPowerMult: 1, critChance: 0, critMultiplier: 1.75,
    dodgeChance: 0, buffs: [], defending: false, ...over,
  }
}

function state(over: Partial<CombatState>): CombatState {
  return {
    gateId: 'g', goldReward: 50,
    player: mk({ id: 'p', name: 'Hunter', isPlayer: true, attack: 20, speed: 10 }),
    enemies: [mk({ id: 'e1', name: 'Goblin', hp: 30, attack: 8 })],
    currentEnemyIndex: 0, round: 1, phase: 'player', log: [], rngState: 1, nextLogId: 1, ...over,
  }
}

test('attack deals attack-minus-defense damage to the current enemy', () => {
  const s = applyPlayerAction(state({}), { type: 'attack' })
  expect(s.enemies[0].hp).toBe(30 - 20)
})

test('faster player kills a weak enemy before it strikes back', () => {
  const s = applyPlayerAction(state({ enemies: [mkLow()] }), { type: 'attack' })
  function mkLow() { return mk({ id: 'e1', hp: 10, attack: 8, speed: 1 }) }
  expect(s.player.hp).toBe(100)
})

test('defend halves incoming damage', () => {
  const s = applyPlayerAction(state({ player: mk({ id: 'p', isPlayer: true, attack: 20, speed: 1, hp: 100 }), enemies: [mk({ id: 'e1', hp: 999, attack: 20, speed: 10 })] }), { type: 'defend' })
  expect(s.player.hp).toBe(100 - 10)
})

test('defeating the only enemy (boss) wins', () => {
  const s = applyPlayerAction(state({ enemies: [mk({ id: 'boss', hp: 5, attack: 0 })] }), { type: 'attack' })
  expect(s.phase).toBe('won')
})

test('defeating a non-final enemy advances to the next with HP carried', () => {
  const s = applyPlayerAction(
    state({ enemies: [mk({ id: 'e1', hp: 5, attack: 0 }), mk({ id: 'boss', hp: 50, attack: 0 })] }),
    { type: 'attack' },
  )
  expect(s.phase).toBe('player')
  expect(s.currentEnemyIndex).toBe(1)
})

test('player dying loses', () => {
  const s = applyPlayerAction(
    state({ player: mk({ id: 'p', isPlayer: true, hp: 5, attack: 0, speed: 1 }), enemies: [mk({ id: 'e1', hp: 999, attack: 50, speed: 10 })] }),
    { type: 'attack' },
  )
  expect(s.phase).toBe('lost')
})

test('forced crit via dodge/crit chance multiplies damage', () => {
  const s = applyPlayerAction(state({ player: mk({ id: 'p', isPlayer: true, attack: 20, speed: 10, critChance: 1 }), enemies: [mk({ id: 'e1', hp: 999 })] }), { type: 'attack' })
  expect(s.enemies[0].hp).toBe(999 - Math.round(20 * 1.75))
})

test('enemy dodge can negate damage', () => {
  const s = applyPlayerAction(state({ enemies: [mk({ id: 'e1', hp: 30, dodgeChance: 1 })] }), { type: 'attack' })
  expect(s.enemies[0].hp).toBe(30)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `src/domain/combat/engine.ts`**
```ts
import { balanceConfig } from '../balanceConfig'
import { nextRandom } from './rng'
import type { Buff, Combatant, CombatState, PlayerAction } from './types'
import { getSkill } from './skills'

function critBonus(c: Combatant): number {
  return c.buffs.filter(b => b.kind === 'critUp').reduce((a, b) => a + b.amount, 0)
}
function effAttack(c: Combatant): number {
  const down = c.buffs.filter(b => b.kind === 'attackDown').reduce((a, b) => a + b.amount, 0)
  return c.attack * (1 - down)
}
function effDefense(c: Combatant): number {
  const down = c.buffs.filter(b => b.kind === 'defenseDown').reduce((a, b) => a + b.amount, 0)
  return c.defense * (1 - down)
}

interface AttackResult { hp: number; rngState: number; text: string }

function resolveAttack(attacker: Combatant, defender: Combatant, rngState: number, mult: number): AttackResult {
  let rng = rngState
  const dodgeRoll = nextRandom(rng); rng = dodgeRoll.state
  if (dodgeRoll.value < defender.dodgeChance) {
    return { hp: defender.hp, rngState: rng, text: `${defender.name} dodged ${attacker.name}'s attack` }
  }
  let dmg = Math.max(1, effAttack(attacker) * mult - effDefense(defender))
  if (defender.defending) dmg *= 1 - balanceConfig.combat.defendDamageReduction
  const critRoll = nextRandom(rng); rng = critRoll.state
  const crit = critRoll.value < attacker.critChance + critBonus(attacker)
  if (crit) dmg *= attacker.critMultiplier
  const final = Math.round(dmg)
  return { hp: Math.max(0, defender.hp - final), rngState: rng, text: `${attacker.name} hit ${defender.name} for ${final}${crit ? ' (CRIT)' : ''}` }
}

function decay(buffs: Buff[]): Buff[] {
  return buffs.map(b => ({ ...b, turnsLeft: b.turnsLeft - 1 })).filter(b => b.turnsLeft > 0)
}

function log(state: CombatState, text: string): CombatState {
  return { ...state, log: [...state.log, { id: state.nextLogId, text }], nextLogId: state.nextLogId + 1 }
}

export function applyPlayerAction(state: CombatState, action: PlayerAction): CombatState {
  if (state.phase !== 'player') return state
  let s: CombatState = state
  let player = { ...s.player, defending: action.type === 'defend' }
  let enemy = { ...s.enemies[s.currentEnemyIndex] }
  let rng = s.rngState
  const logs: string[] = []

  const doPlayer = () => {
    if (player.hp <= 0) return
    if (action.type === 'attack') {
      const r = resolveAttack(player, enemy, rng, 1); rng = r.rngState; enemy = { ...enemy, hp: r.hp }; logs.push(r.text)
    } else if (action.type === 'defend') {
      const restore = Math.round(player.maxMP * balanceConfig.combat.defendMpRestoreFraction)
      player = { ...player, mp: Math.min(player.maxMP, player.mp + restore) }
      logs.push(`${player.name} defends`)
    } else if (action.type === 'skill') {
      const skill = getSkill(action.skillId)
      if (!skill || player.mp < skill.mpCost) { logs.push('Not enough MP'); return }
      player = { ...player, mp: player.mp - skill.mpCost }
      if (skill.kind === 'damage') {
        const r = resolveAttack(player, enemy, rng, skill.attackMult ?? 1); rng = r.rngState; enemy = { ...enemy, hp: r.hp }; logs.push(`${player.name} used ${skill.name}: ${r.text}`)
      } else if (skill.kind === 'heal') {
        const heal = Math.round(((skill.baseHeal ?? 0) + 0) * player.skillPowerMult)
        player = { ...player, hp: Math.min(player.maxHP, player.hp + heal) }
        logs.push(`${player.name} used ${skill.name} and healed ${heal}`)
      } else if (skill.kind === 'buffCrit') {
        player = { ...player, buffs: [...player.buffs, { kind: 'critUp', amount: skill.critBonus ?? 0, turnsLeft: (skill.turns ?? 1) + 1 }] }
        logs.push(`${player.name} used ${skill.name}`)
      } else if (skill.kind === 'debuff') {
        enemy = { ...enemy, buffs: [...enemy.buffs, { kind: 'attackDown', amount: skill.attackDown ?? 0, turnsLeft: (skill.turns ?? 1) + 1 }, { kind: 'defenseDown', amount: skill.defenseDown ?? 0, turnsLeft: (skill.turns ?? 1) + 1 }] }
        logs.push(`${player.name} used ${skill.name} on ${enemy.name}`)
      }
    }
  }

  const doEnemy = () => {
    if (enemy.hp <= 0) return
    const heavy = s.round % balanceConfig.combat.enemyHeavyMoveEveryNRounds === 0
    const mult = heavy ? balanceConfig.combat.enemyHeavyMoveMultiplier : 1
    const r = resolveAttack(enemy, player, rng, mult); rng = r.rngState; player = { ...player, hp: r.hp }
    logs.push(heavy ? `${enemy.name} unleashes a heavy strike! ${r.text}` : r.text)
  }

  if (player.speed >= enemy.speed) { doPlayer(); doEnemy() } else { doEnemy(); doPlayer() }

  player = { ...player, buffs: decay(player.buffs), defending: false }
  enemy = { ...enemy, buffs: decay(enemy.buffs) }

  const enemies = s.enemies.map((e, i) => (i === s.currentEnemyIndex ? enemy : e))
  s = { ...s, player, enemies, rngState: rng, round: s.round + 1 }
  for (const t of logs) s = log(s, t)

  if (player.hp <= 0) return { ...s, phase: 'lost' }
  if (enemy.hp <= 0) {
    if (s.currentEnemyIndex >= s.enemies.length - 1) return { ...s, phase: 'won' }
    s = { ...s, currentEnemyIndex: s.currentEnemyIndex + 1 }
    return log(s, `${s.enemies[s.currentEnemyIndex].name} appears`)
  }
  return s
}
```

- [ ] **Step 4: Run → PASS.** Adjust nothing in tests; if a test fails, fix the engine, not the test (unless the test encodes a wrong expectation about rounding/order — confirm against the spec first).

- [ ] **Step 5: Commit**
```bash
git add src/domain/combat/engine.ts src/domain/combat/engine.test.ts
git commit -m "feat(solo-system): turn-based combat engine (attack/defend/skills, enemy AI, wave, win/loss)"
```

---

## Task 6: Skill behavior tests (lock in skill effects)

Task 5 already implements skills; this task adds focused tests proving each skill's effect, plus the Mend INT scaling (Task 5's heal used `baseHeal` only — fix it here to include INT scaling via the player's derived attack proxy is wrong; instead scale by a stored `intForHeal`). To keep skills pure and correct, Mend scales on `skillPowerMult` and a flat `baseHeal` only in 2a (INT already feeds `skillPowerMult`). Confirm and test that.

**Files:** Create `src/domain/combat/skills_effects.test.ts`

- [ ] **Step 1: Failing/também-confirming test** `src/domain/combat/skills_effects.test.ts`:
```ts
import { applyPlayerAction } from './engine'
import type { Combatant, CombatState } from './types'
import { balanceConfig } from '../balanceConfig'

function mk(over: Partial<Combatant>): Combatant {
  return {
    id: 'x', name: 'X', isPlayer: false, hp: 100, maxHP: 100, mp: 30, maxMP: 30,
    attack: 20, defense: 0, speed: 5, skillPowerMult: 1, critChance: 0, critMultiplier: 1.75,
    dodgeChance: 0, buffs: [], defending: false, ...over,
  }
}
function state(over: Partial<CombatState>): CombatState {
  return { gateId: 'g', goldReward: 0, player: mk({ id: 'p', isPlayer: true, speed: 10 }),
    enemies: [mk({ id: 'e1', hp: 999, attack: 0 })], currentEnemyIndex: 0, round: 1, phase: 'player',
    log: [], rngState: 1, nextLogId: 1, ...over }
}

test('Power Strike costs MP and deals attackMult damage', () => {
  const s = applyPlayerAction(state({}), { type: 'skill', skillId: 'powerStrike' })
  const cfg = balanceConfig.combat.skills.powerStrike
  expect(s.player.mp).toBe(30 - cfg.mpCost)
  expect(s.enemies[0].hp).toBe(999 - Math.round(20 * cfg.attackMult))
})

test('Mend heals and costs MP', () => {
  const s = applyPlayerAction(state({ player: mk({ id: 'p', isPlayer: true, speed: 10, hp: 10, maxHP: 100, skillPowerMult: 1 }) }), { type: 'skill', skillId: 'mend' })
  const cfg = balanceConfig.combat.skills.mend
  expect(s.player.mp).toBe(30 - cfg.mpCost)
  expect(s.player.hp).toBe(10 + Math.round(cfg.baseHeal * 1))
})

test('Focus adds a temporary crit buff', () => {
  const s = applyPlayerAction(state({}), { type: 'skill', skillId: 'focus' })
  expect(s.player.buffs.some(b => b.kind === 'critUp')).toBe(true)
})

test('Weaken applies attack/defense debuffs to the enemy', () => {
  const s = applyPlayerAction(state({}), { type: 'skill', skillId: 'weaken' })
  expect(s.enemies[0].buffs.some(b => b.kind === 'attackDown')).toBe(true)
  expect(s.enemies[0].buffs.some(b => b.kind === 'defenseDown')).toBe(true)
})

test('a skill with insufficient MP is a no-op for resources', () => {
  const s = applyPlayerAction(state({ player: mk({ id: 'p', isPlayer: true, speed: 10, mp: 0 }) }), { type: 'skill', skillId: 'powerStrike' })
  expect(s.player.mp).toBe(0)
  expect(s.enemies[0].hp).toBe(999)
})
```

- [ ] **Step 2: Run.** If the Mend heal test fails because Task 5's heal formula differs, reconcile: the canonical Mend heal in 2a is `Math.round(baseHeal * skillPowerMult)` (INT influences via `skillPowerMult`). Update `engine.ts` Mend branch to `const heal = Math.round((skill.baseHeal ?? 0) * player.skillPowerMult)` so it matches this test. Re-run → PASS.

- [ ] **Step 3: Commit**
```bash
git add src/domain/combat/skills_effects.test.ts src/domain/combat/engine.ts
git commit -m "test(solo-system): lock in skill effects; Mend scales on skill power"
```

---

## Task 7: Enemy & gate libraries + gates.ts

**Files:** Create `src/data/enemyLibrary.ts`, `src/data/gateLibrary.ts`, `src/domain/gates.ts`, `src/domain/gates.test.ts`

- [ ] **Step 1: Create `src/data/enemyLibrary.ts`**
```ts
export interface EnemyDef {
  id: string
  name: string
  hp: number
  attack: number
  defense: number
  speed: number
  critChance: number
  dodgeChance: number
}

export const enemyLibrary: EnemyDef[] = [
  { id: 'goblin', name: 'Goblin', hp: 45, attack: 8, defense: 1, speed: 4, critChance: 0.02, dodgeChance: 0.02 },
  { id: 'imp', name: 'Imp', hp: 35, attack: 10, defense: 0, speed: 8, critChance: 0.05, dodgeChance: 0.05 },
  { id: 'wolf', name: 'Shadow Wolf', hp: 60, attack: 11, defense: 2, speed: 7, critChance: 0.05, dodgeChance: 0.03 },
  { id: 'orc', name: 'Orc Grunt', hp: 90, attack: 14, defense: 4, speed: 3, critChance: 0.03, dodgeChance: 0.0 },
  { id: 'gate_e_boss', name: 'Gatekeeper', hp: 140, attack: 16, defense: 5, speed: 5, critChance: 0.05, dodgeChance: 0.02 },
  { id: 'gate_d_boss', name: 'Stone Golem', hp: 240, attack: 22, defense: 8, speed: 4, critChance: 0.05, dodgeChance: 0.0 },
]
```

- [ ] **Step 2: Create `src/data/gateLibrary.ts`**
```ts
export interface GateDef {
  id: string
  name: string
  rankTier: string
  keyCost: number
  goldReward: number
  enemyIds: string[]
  unlockedBy: string | null
}

export const gateLibrary: GateDef[] = [
  { id: 'gate-e1', name: 'E-Rank Gate: Awakening', rankTier: 'E', keyCost: 1, goldReward: 40, enemyIds: ['goblin', 'imp', 'gate_e_boss'], unlockedBy: null },
  { id: 'gate-e2', name: 'E-Rank Gate: Den', rankTier: 'E', keyCost: 1, goldReward: 60, enemyIds: ['wolf', 'goblin', 'orc', 'gate_e_boss'], unlockedBy: 'gate-e1' },
  { id: 'gate-d1', name: 'D-Rank Gate: Quarry', rankTier: 'D', keyCost: 2, goldReward: 110, enemyIds: ['orc', 'wolf', 'orc', 'gate_d_boss'], unlockedBy: 'gate-e2' },
]
```

- [ ] **Step 3: Failing test** `src/domain/gates.test.ts`:
```ts
import { gateUnlocked, canEnterGate, buildCombatState } from './gates'
import { gateLibrary } from '../data/gateLibrary'
import { STAT_TYPES, type Player } from './types'

function player(over: Partial<Player>): Player {
  const stats = Object.fromEntries(STAT_TYPES.map(t => [t, { type: t, subLevel: 5, statXP: 0 }])) as Player['stats']
  return { level: 5, currentEXP: 0, freeStatPoints: 0, classRank: 'E', currency: 0, gateKeys: 3, stats, ...over }
}
const gateE1 = gateLibrary.find(g => g.id === 'gate-e1')!
const gateE2 = gateLibrary.find(g => g.id === 'gate-e2')!

test('first gate is unlocked; later gate needs its predecessor cleared', () => {
  expect(gateUnlocked(gateE1, [])).toBe(true)
  expect(gateUnlocked(gateE2, [])).toBe(false)
  expect(gateUnlocked(gateE2, ['gate-e1'])).toBe(true)
})

test('canEnterGate requires unlock + enough keys', () => {
  expect(canEnterGate(gateE1, player({ gateKeys: 1 }), [])).toBe(true)
  expect(canEnterGate(gateE1, player({ gateKeys: 0 }), [])).toBe(false)
  expect(canEnterGate(gateE2, player({ gateKeys: 3 }), [])).toBe(false)
})

test('buildCombatState creates a player combatant and the enemy sequence at full HP', () => {
  const cs = buildCombatState(gateE1, player({}), 12345)
  expect(cs.player.isPlayer).toBe(true)
  expect(cs.player.hp).toBe(cs.player.maxHP)
  expect(cs.enemies).toHaveLength(gateE1.enemyIds.length)
  expect(cs.enemies[0].hp).toBe(cs.enemies[0].maxHP)
  expect(cs.phase).toBe('player')
  expect(cs.goldReward).toBe(gateE1.goldReward)
})
```

- [ ] **Step 4: Run → FAIL.**

- [ ] **Step 5: Implement `src/domain/gates.ts`**
```ts
import { deriveCombatStats } from './combat/derive'
import type { Combatant, CombatState } from './combat/types'
import type { Player } from './types'
import { enemyLibrary } from '../data/enemyLibrary'
import type { GateDef } from '../data/gateLibrary'

export function gateUnlocked(gate: GateDef, clearedGateIds: string[]): boolean {
  return gate.unlockedBy === null || clearedGateIds.includes(gate.unlockedBy)
}

export function canEnterGate(gate: GateDef, player: Player, clearedGateIds: string[]): boolean {
  return gateUnlocked(gate, clearedGateIds) && player.gateKeys >= gate.keyCost
}

function playerCombatant(player: Player): Combatant {
  const d = deriveCombatStats(player)
  return {
    id: 'player', name: 'Hunter', isPlayer: true,
    hp: d.maxHP, maxHP: d.maxHP, mp: d.maxMP, maxMP: d.maxMP,
    attack: d.attack, defense: d.defense, speed: d.speed, skillPowerMult: d.skillPowerMult,
    critChance: d.critChance, critMultiplier: d.critMultiplier, dodgeChance: d.dodgeChance,
    buffs: [], defending: false,
  }
}

function enemyCombatant(id: string): Combatant {
  const e = enemyLibrary.find(x => x.id === id)
  if (!e) throw new Error(`unknown enemy ${id}`)
  return {
    id: e.id, name: e.name, isPlayer: false,
    hp: e.hp, maxHP: e.hp, mp: 0, maxMP: 0,
    attack: e.attack, defense: e.defense, speed: e.speed, skillPowerMult: 1,
    critChance: e.critChance, critMultiplier: 1.75, dodgeChance: e.dodgeChance,
    buffs: [], defending: false,
  }
}

export function buildCombatState(gate: GateDef, player: Player, seed: number): CombatState {
  return {
    gateId: gate.id,
    goldReward: gate.goldReward,
    player: playerCombatant(player),
    enemies: gate.enemyIds.map(enemyCombatant),
    currentEnemyIndex: 0,
    round: 1,
    phase: 'player',
    log: [{ id: 0, text: `You enter ${gate.name}` }],
    rngState: (seed & 0x7fffffff) || 1,
    nextLogId: 1,
  }
}
```

- [ ] **Step 6: Run → PASS.** Then full suite + build.

- [ ] **Step 7: Commit**
```bash
git add src/data/enemyLibrary.ts src/data/gateLibrary.ts src/domain/gates.ts src/domain/gates.test.ts
git commit -m "feat(solo-system): enemy/gate libraries and gate entry + combat-state builder"
```

---

## Task 8: Persistence migration v1 → v2

**Files:** Modify `src/persistence/repository.ts`; create `src/persistence/migration.test.ts`

- [ ] **Step 1: Failing test** `src/persistence/migration.test.ts`:
```ts
import { db, SAVE_KEY } from './db'
import { loadState, freshSaveState, SCHEMA_VERSION } from './repository'

beforeEach(async () => { await db.saves.clear() })

test('a v1 save (no gates) is migrated to v2 with empty clearedGateIds', async () => {
  const v1: any = freshSaveState(4)
  delete v1.gates
  v1.schemaVersion = 1
  await db.saves.put({ key: SAVE_KEY, state: v1 })
  const loaded = await loadState()
  expect(loaded?.schemaVersion).toBe(SCHEMA_VERSION)
  expect(loaded?.gates).toEqual({ clearedGateIds: [] })
})

test('a current v2 save loads unchanged', async () => {
  const v2 = freshSaveState(4)
  v2.gates.clearedGateIds.push('gate-e1')
  await db.saves.put({ key: SAVE_KEY, state: v2 })
  const loaded = await loadState()
  expect(loaded?.gates.clearedGateIds).toEqual(['gate-e1'])
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement migration in `repository.ts`**

Add a `migrate` function and call it in `loadState`:
```ts
function migrate(raw: SaveState): SaveState {
  let s = raw
  if (s.schemaVersion < 2) {
    s = { ...s, gates: s.gates ?? { clearedGateIds: [] }, schemaVersion: 2 }
  }
  return s
}

export async function loadState(): Promise<SaveState | null> {
  const row = await db.saves.get(SAVE_KEY)
  return row ? migrate(row.state) : null
}
```
(Keep `saveState` unchanged.)

- [ ] **Step 4: Run → PASS.** Full suite + build.

- [ ] **Step 5: Commit**
```bash
git add src/persistence/repository.ts src/persistence/migration.test.ts
git commit -m "feat(solo-system): schema migration v1 to v2 (gates field)"
```

---

## Task 9: Store integration (combat actions + reward commit + invariant guard)

**Files:** Modify `src/store/useSystemStore.ts`; create `src/store/combat.test.ts`

The store gains an **ephemeral** `combat: CombatState | null` (not in SaveState, not persisted) and three actions. The reward commit touches only `currency` and `gates.clearedGateIds`.

- [ ] **Step 1: Failing test** `src/store/combat.test.ts`:
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

test('enterGate spends a key and starts a combat session', async () => {
  const store = await ready()
  const keysBefore = store.getState().save.player.gateKeys
  store.getState().enterGate('gate-e1')
  expect(store.getState().combat).not.toBeNull()
  expect(store.getState().save.player.gateKeys).toBe(keysBefore - 1)
})

test('enterGate is rejected when locked or out of keys', async () => {
  const store = await ready()
  store.setState(s => ({ save: { ...s.save, player: { ...s.save.player, gateKeys: 0 } } }))
  store.getState().enterGate('gate-e1')
  expect(store.getState().combat).toBeNull()
})

test('winning a gate grants gold, marks it cleared, ends combat, and does NOT change level/EXP/statXP', async () => {
  const store = await ready()
  const before = store.getState().save.player
  store.getState().enterGate('gate-e1')
  let guard = 0
  while (store.getState().combat && guard++ < 500) {
    store.getState().combatAction({ type: 'attack' })
  }
  const after = store.getState().save
  expect(after.player.level).toBe(before.level)
  expect(after.player.currentEXP).toBe(before.currentEXP)
  expect(after.player.stats.STR.statXP).toBe(before.stats.STR.statXP)
  expect(after.player.stats.STR.subLevel).toBe(before.stats.STR.subLevel)
  if (after.gates.clearedGateIds.includes('gate-e1')) {
    expect(after.player.currency).toBeGreaterThan(before.currency)
  }
})

test('fleeGate ends combat with no rewards', async () => {
  const store = await ready()
  store.getState().enterGate('gate-e1')
  const goldBefore = store.getState().save.player.currency
  store.getState().fleeGate()
  expect(store.getState().combat).toBeNull()
  expect(store.getState().save.player.currency).toBe(goldBefore)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement store changes in `useSystemStore.ts`**

Add imports:
```ts
import { canEnterGate, buildCombatState } from '../domain/gates'
import { applyPlayerAction } from '../domain/combat/engine'
import { gateLibrary } from '../data/gateLibrary'
import type { CombatState, PlayerAction } from '../domain/combat/types'
```
Extend the `SystemState` interface:
```ts
  combat: CombatState | null
  enterGate: (gateId: string) => void
  combatAction: (action: PlayerAction) => void
  fleeGate: () => void
```
Initialize `combat: null` in the returned store object, and add the actions (place near the other actions):
```ts
      combat: null,

      enterGate: (gateId: string) => {
        const save = get().save
        const gate = gateLibrary.find(g => g.id === gateId)
        if (!gate) return
        if (!canEnterGate(gate, save.player, save.gates.clearedGateIds)) return
        const next: SaveState = { ...save, player: { ...save.player, gateKeys: save.player.gateKeys - gate.keyCost } }
        persist(next)
        const combat = buildCombatState(gate, next.player, clock.now())
        set({ save: next, combat })
      },

      combatAction: (action: PlayerAction) => {
        const combat = get().combat
        if (!combat || combat.phase !== 'player') return
        const nextCombat = applyPlayerAction(combat, action)
        if (nextCombat.phase === 'won') {
          const save = get().save
          const clearedGateIds = save.gates.clearedGateIds.includes(nextCombat.gateId)
            ? save.gates.clearedGateIds
            : [...save.gates.clearedGateIds, nextCombat.gateId]
          const next: SaveState = {
            ...save,
            player: { ...save.player, currency: save.player.currency + nextCombat.goldReward },
            gates: { clearedGateIds },
          }
          persist(next)
          set({ save: next, combat: nextCombat })
        } else {
          set({ combat: nextCombat })
        }
      },

      fleeGate: () => { set({ combat: null }) },
```
Note: on `won`/`lost` the combat object is kept briefly so the BattleScreen can show a result overlay; the screen calls `fleeGate()` (or a return handler) to clear it. Keep `combat` set on win/lost; clearing happens when the user dismisses.

- [ ] **Step 4: Run → PASS.** Full suite + build.

- [ ] **Step 5: Commit**
```bash
git add src/store/useSystemStore.ts src/store/combat.test.ts
git commit -m "feat(solo-system): store combat actions, reward commit, core-principle guard"
```

---

## Task 10: CombatantBar component

**Files:** Create `src/components/CombatantBar.tsx`, `src/components/CombatantBar.test.tsx`

- [ ] **Step 1: Failing test** `src/components/CombatantBar.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { CombatantBar } from './CombatantBar'

test('shows name and HP numbers', () => {
  render(<CombatantBar name="Hunter" hp={30} maxHP={120} mp={10} maxMP={20} isPlayer />)
  expect(screen.getByText('Hunter')).toBeInTheDocument()
  expect(screen.getByText(/30\s*\/\s*120/)).toBeInTheDocument()
})

test('enemy bar omits MP', () => {
  render(<CombatantBar name="Goblin" hp={10} maxHP={45} mp={0} maxMP={0} isPlayer={false} />)
  expect(screen.queryByText(/MP/i)).toBeNull()
})
```

- [ ] **Step 2: Run → FAIL, implement, run → PASS.**

`CombatantBar.tsx` props: `{ name: string; hp: number; maxHP: number; mp: number; maxMP: number; isPlayer: boolean }`. Render the name, an HP bar (cyan for player, red/danger for enemy) with `hp / maxHP` text clamped 0–100%, and — only when `isPlayer` and `maxMP > 0` — an MP bar with `MP {mp}/{maxMP}`. Use system-window styling.

- [ ] **Step 3: Commit**
```bash
git add src/components/CombatantBar.tsx src/components/CombatantBar.test.tsx
git commit -m "feat(solo-system): combatant HP/MP bar component"
```

---

## Task 11: Gates + Battle screens, nav, routes

**Files:** Create `src/screens/GatesScreen.tsx`, `src/screens/BattleScreen.tsx`; modify `src/components/BottomNav.tsx`, `src/App.tsx`

- [ ] **Step 1: GatesScreen** (`src/screens/GatesScreen.tsx`)
- Reads `useSystemStore(s => s.save)` and `enterGate` + `combat`.
- Shows current Gate Keys and gold.
- Maps `gateLibrary` to cards (use `SystemWindow`): name, rank tier, key cost, gold reward, and state — **Cleared** (in `save.gates.clearedGateIds`), **Locked** (`!gateUnlocked`), or an **ENTER** button (disabled if `!canEnterGate`). Use `gateUnlocked`/`canEnterGate` from `../domain/gates`.
- On ENTER, call `enterGate(gate.id)` then navigate to `/battle` (`useNavigate`).

- [ ] **Step 2: BattleScreen** (`src/screens/BattleScreen.tsx`)
- Reads `combat` from the store. If `combat` is null, redirect to `/gates` (`<Navigate to="/gates" />`).
- Renders the player `CombatantBar` and the current enemy `CombatantBar` (`combat.enemies[combat.currentEnemyIndex]`), plus wave progress (e.g. "Enemy 2 / 3").
- A scrolling combat log (last ~8 entries from `combat.log`, newest visible).
- Action buttons: **Attack**, **Defend**, a **Skills** group (from `listSkills()`, shown only if `skillUnlocked(skill, save.player.level)`, disabled if `combat.player.mp < skill.mpCost`), and **Flee**. Each calls `combatAction(...)` / `fleeGate()`.
- When `combat.phase === 'won'` or `'lost'`, show a result overlay ("GATE CLEARED — +{gold} gold" or "DEFEATED") with a **RETURN** button that calls `fleeGate()` and navigates to `/gates`.
- Disable action buttons unless `combat.phase === 'player'`.

- [ ] **Step 3: Add Gates to BottomNav** (`src/components/BottomNav.tsx`)
Add to the `links` array (import an icon, e.g. `Swords` from lucide-react):
```ts
  { to: '/gates', label: 'GATES', Icon: Swords },
```

- [ ] **Step 4: Add routes in `App.tsx`**
Import `GatesScreen` and `BattleScreen` and add inside `<Routes>`:
```tsx
        <Route path="/gates" element={<GatesScreen />} />
        <Route path="/battle" element={<BattleScreen />} />
```

- [ ] **Step 5: Verify** — `npx vitest run` (all green) and `npm run build` (clean). Optionally `npm run dev` and sanity-check entering a gate and fighting.

- [ ] **Step 6: Commit**
```bash
git add src/screens/GatesScreen.tsx src/screens/BattleScreen.tsx src/components/BottomNav.tsx src/App.tsx
git commit -m "feat(solo-system): gates and battle screens with nav and routes"
```

---

## Task 12: README update + final verification

**Files:** Modify `src/../README.md` (the `solo-system/README.md`)

- [ ] **Step 1: Update README** — add a "Phase 2a — Combat & Gates" section: how combat works (stats power the hunter, key on entry, gold on clear, no real-life penalty, combat never grants real EXP/stat-XP), the skills and their unlock levels, and where combat constants live (`balanceConfig.combat`). Move combat from the "Not in Phase 1" list into a "Done" list; keep 2b (loot/inventory) and 2c (shadows) listed as upcoming.

- [ ] **Step 2: Final verification**
```bash
npx vitest run
npm run build
```
Both must pass cleanly.

- [ ] **Step 3: Commit**
```bash
git add README.md
git commit -m "docs(solo-system): document Phase 2a combat and gates"
```

---

## Definition of done (Phase 2a)
- Enter a gate from the Gates screen (spends a key), fight a wave + boss in turn-based combat using Attack/Defend/Skills with HP/MP carrying across fights.
- Crit/dodge/skills behave deterministically under the seeded RNG in tests.
- Winning grants gold and unlocks the next gate; losing/fleeing grants nothing; the key was spent on entry.
- A full combat causes ZERO change to level/EXP/stat-XP (guard test green).
- v1 saves migrate cleanly to v2.
- Full Vitest suite green; production build clean; verified rendering in-browser.

## Out of scope (later)
- 2b: loot drops, rarities, inventory, equipment, enhancement, consumables.
- 2c: ARISE shadow army.
- Phase 4: rank-up boss dungeons, titles, endless/prestige.
