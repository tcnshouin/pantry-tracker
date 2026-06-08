# Solo System — Visual Overhaul V1 (Battle Stage) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Battle screen into a staged scene of holographic SVG fighters — hunter (holding the equipped weapon) + deployed shadow squad vs the current enemy with the wave queued behind — with per-enemy and per-weapon attack animations and floating hit/damage numbers, all as a pure presentation layer over the existing combat state.

**Architecture:** New SVG sprite components + a `spriteRegistry`; a pure `diffCombat(prev,next)` that turns two combat snapshots into animation events (driven by HP deltas + verified log substrings); a `useCombatAnimations` hook; a `BattleStage` that lays out the fighters responsively (full wave + a scaling shadow squad with "+N" overflow) and plays the animations via Framer Motion. `BattleScreen` mounts the stage; nothing in `domain/`, `store/`, or `persistence/` changes.

**Tech Stack:** Existing — React + Vite + TS + Tailwind + Zustand + framer-motion + Vitest. No new deps.

**Hard constraint:** PURE PRESENTATION. No change to combat math, engine, store, domain, persistence, balance, or schema. The existing 122 tests must stay green. Animations are fire-and-forget and never gate gameplay (action buttons still disabled unless `combat.phase === 'player'`).

**Working dir:** `solo-system/` in the worktree `/Users/andreupaz/sololevelling/.claude/worktrees/solo-visual-v1`. Paths relative to `solo-system/`. **Run `npm install` first.** Tests: `npx vitest run <path>`; build: `npm run build`.

**Standing rule:** No comments in any code files. None.

## Art direction (holographic neon)
Every sprite is a self-contained SVG React component with a `viewBox`, built from simple shapes (`ellipse`, `path`, `line`, `polygon`), a `size` prop (px), a tint color, and a soft glow (CSS `filter: drop-shadow` or an SVG blur). Hunter = cyan `#38bdf8`; enemies tinted by kind (goblin `#4ade80`, imp `#a855f7`, wolf `#94a3b8`, orc `#65a30d`, bosses `#ef4444`); shadows = `#1e1b4b`/violet with faint glow. Keep them readable silhouettes, not detailed art. Mobile-first; nothing overflows a ~375px viewport.

---

## File structure
```
src/components/sprites/spriteRegistry.ts     (new) enemyId->sprite, weaponBaseId->sprite, fallbacks
src/components/sprites/HunterSprite.tsx       (new)
src/components/sprites/EnemySprite.tsx        (new) switch on id -> per-enemy SVG
src/components/sprites/WeaponSprite.tsx       (new) switch on baseId -> per-weapon SVG
src/components/sprites/ShadowSprite.tsx       (new)
src/components/battle/FloatingDamage.tsx      (new)
src/components/battle/combatDiff.ts           (new) CombatEvent + diffCombat (pure)
src/components/battle/useCombatAnimations.ts  (new) hook wrapping diffCombat with a ref
src/components/battle/animations.ts           (new) enemyAttacks + weaponAttacks variant maps + getters
src/components/battle/BattleStage.tsx         (new) the staged scene
src/screens/BattleScreen.tsx                  (modify) mount BattleStage; remove standalone CombatantBars; keep log/actions/overlay
```

---

## Task 1: Sprite components + registry

**Files:** create the five files under `src/components/sprites/` + `src/components/sprites/spriteRegistry.test.tsx`.

- [ ] **Step 1: Failing test** `src/components/sprites/spriteRegistry.test.tsx`:
```tsx
import { render } from '@testing-library/react'
import { EnemySprite } from './EnemySprite'
import { WeaponSprite } from './WeaponSprite'
import { enemyLibrary } from '../../data/enemyLibrary'
import { itemLibrary } from '../../data/itemLibrary'

test('every enemy id renders an svg sprite', () => {
  for (const e of enemyLibrary) {
    const { container } = render(<EnemySprite enemyId={e.id} size={64} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  }
})

test('an unknown enemy id still renders a fallback svg', () => {
  const { container } = render(<EnemySprite enemyId={'does-not-exist'} size={64} />)
  expect(container.querySelector('svg')).toBeInTheDocument()
})

test('every weapon baseId renders an svg, and no-weapon renders unarmed svg', () => {
  for (const w of itemLibrary.filter(i => i.slot === 'weapon')) {
    const { container } = render(<WeaponSprite baseId={w.baseId} size={32} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  }
  const { container } = render(<WeaponSprite baseId={null} size={32} />)
  expect(container.querySelector('svg')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement the sprites.**
- `HunterSprite.tsx`: props `{ size: number; weaponBaseId?: string | null; className?: string }`. Renders a cyan SVG humanoid (head ellipse, torso path, two arms, two legs) with a glow, and renders `<WeaponSprite baseId={weaponBaseId ?? null} size={size*0.5} />` positioned at the hand. viewBox e.g. `0 0 100 120`.
- `EnemySprite.tsx`: props `{ enemyId: string; size: number; className?: string }`. A `switch (enemyId)` returns a distinct SVG per id with the kind tint:
  - `goblin` (green, small hunched body, pointy ears), `imp` (purple, winged), `wolf` (grey, four-legged quadruped), `orc` (olive, bulky, tusks), `gate_e_boss` "Gatekeeper" (red, tall armored), `gate_d_boss` "Stone Golem" (red, blocky rock body). `default` → a generic red wraith fallback.
  - **You must produce a distinct, recognizable silhouette per enemy.** Use the goblin as the template pattern below and vary shape/limbs/color for the others.
- `WeaponSprite.tsx`: props `{ baseId: string | null; size: number; className?: string }`. `switch (baseId)`: `rusted-blade` (straight sword), `hunters-dagger` (short blade), `shadow-edge` (curved glowing blade), `default`/`null` → nothing or a faint fist glyph (unarmed). Cyan tint.
- `ShadowSprite.tsx`: props `{ size: number; className?: string }`. A dark-violet hooded silhouette with faint glow (used for the squad + ARISE).
- `spriteRegistry.ts`: optional helper exporting `enemyTint(enemyId)` and `ENEMY_IDS`/lists if useful; the per-id `switch` can live in the components. Keep this file for any shared maps (e.g. tint colors) so components and `animations.ts` share them.

**Goblin template (pattern to follow for the others):**
```tsx
function Goblin({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 6px #4ade8088)' }}>
      <ellipse cx="50" cy="40" rx="22" ry="20" fill="none" stroke="#4ade80" strokeWidth="3" />
      <polygon points="30,30 18,14 36,26" fill="#4ade80" opacity="0.8" />
      <polygon points="70,30 82,14 64,26" fill="#4ade80" opacity="0.8" />
      <circle cx="42" cy="40" r="3" fill="#4ade80" />
      <circle cx="58" cy="40" r="3" fill="#4ade80" />
      <path d="M38 58 Q50 90 62 58" fill="none" stroke="#4ade80" strokeWidth="3" />
      <line x1="40" y1="70" x2="30" y2="90" stroke="#4ade80" strokeWidth="3" />
      <line x1="60" y1="70" x2="70" y2="90" stroke="#4ade80" strokeWidth="3" />
    </svg>
  )
}
```

- [ ] **Step 4: Run → PASS.** Full suite + build.

- [ ] **Step 5: Commit**
```bash
git add src/components/sprites
git commit -m "feat(solo-system): holographic SVG sprites (hunter, enemies, weapons, shadow) + registry"
```

---

## Task 2: FloatingDamage component

**Files:** create `src/components/battle/FloatingDamage.tsx`, `src/components/battle/FloatingDamage.test.tsx`

- [ ] **Step 1: Failing test**:
```tsx
import { render, screen } from '@testing-library/react'
import { FloatingDamage } from './FloatingDamage'

test('renders the damage amount', () => {
  render(<FloatingDamage amount={24} crit={false} miss={false} />)
  expect(screen.getByText('24')).toBeInTheDocument()
})

test('renders MISS when miss', () => {
  render(<FloatingDamage amount={0} crit={false} miss />)
  expect(screen.getByText(/MISS/i)).toBeInTheDocument()
})

test('crit shows a CRIT marker', () => {
  render(<FloatingDamage amount={50} crit miss={false} />)
  expect(screen.getByText('50')).toBeInTheDocument()
  expect(screen.getByText(/CRIT/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run → FAIL, implement, run → PASS.**
`FloatingDamage.tsx` props `{ amount: number; crit: boolean; miss: boolean }`. A framer-motion `motion.div` that animates upward + fades (`initial={{ y: 0, opacity: 1 }} animate={{ y: -40, opacity: 0 }}`). If `miss` → show "MISS" (slate); else show the number — crit is larger + gold (`text-amber-300`) with a small "CRIT" tag, normal is red (`text-system-danger`). Absolute-positioned, `pointer-events-none`.

- [ ] **Step 3: Commit**
```bash
git add src/components/battle/FloatingDamage.tsx src/components/battle/FloatingDamage.test.tsx
git commit -m "feat(solo-system): floating damage number component"
```

---

## Task 3: Combat snapshot diff + animation hook

**Files:** create `src/components/battle/combatDiff.ts`, `src/components/battle/combatDiff.test.ts`, `src/components/battle/useCombatAnimations.ts`

- [ ] **Step 1: Failing test** `src/components/battle/combatDiff.test.ts`:
```ts
import { diffCombat, type CombatEvent } from './combatDiff'
import type { Combatant, CombatState } from '../../domain/combat/types'

function mk(over: Partial<Combatant>): Combatant {
  return { id: 'x', name: 'X', isPlayer: false, hp: 100, maxHP: 100, mp: 0, maxMP: 0, attack: 0, defense: 0, speed: 0, skillPowerMult: 1, critChance: 0, critMultiplier: 1.75, dodgeChance: 0, buffs: [], defending: false, ...over }
}
function st(over: Partial<CombatState>): CombatState {
  return { gateId: 'g', goldReward: 0, player: mk({ id: 'p', isPlayer: true }), enemies: [mk({ id: 'e1' })], currentEnemyIndex: 0, round: 1, phase: 'player', log: [], rngState: 1, nextLogId: 1, ...over }
}
function withLog(s: CombatState, texts: string[]): CombatState {
  return { ...s, log: texts.map((t, i) => ({ id: i, text: t })) }
}

test('enemy hp drop -> enemyHit with amount', () => {
  const prev = st({})
  const next = withLog(st({ enemies: [mk({ id: 'e1', hp: 76 })] }), ['Hunter hit X for 24'])
  const ev = diffCombat(prev, next)
  expect(ev).toContainEqual<CombatEvent>({ kind: 'enemyHit', amount: 24, crit: false })
})

test('crit flag from log', () => {
  const prev = st({})
  const next = withLog(st({ enemies: [mk({ id: 'e1', hp: 60 })] }), ['Hunter hit X for 40 (CRIT)'])
  expect(diffCombat(prev, next)).toContainEqual<CombatEvent>({ kind: 'enemyHit', amount: 40, crit: true })
})

test('player hp drop -> playerHit', () => {
  const prev = st({})
  const next = withLog(st({ player: mk({ id: 'p', isPlayer: true, hp: 90 }) }), ['X hit Hunter for 10'])
  expect(diffCombat(prev, next)).toContainEqual<CombatEvent>({ kind: 'playerHit', amount: 10, crit: false })
})

test('index advance -> enemyAdvance plus killing enemyHit', () => {
  const prev = st({ enemies: [mk({ id: 'e1', hp: 5 }), mk({ id: 'e2' })] })
  const next = withLog(st({ enemies: [mk({ id: 'e1', hp: 0 }), mk({ id: 'e2' })], currentEnemyIndex: 1 }), ['Hunter hit X for 5', 'e2 appears'])
  const ev = diffCombat(prev, next)
  expect(ev).toContainEqual<CombatEvent>({ kind: 'enemyHit', amount: 5, crit: false })
  expect(ev.some(e => e.kind === 'enemyAdvance')).toBe(true)
})

test('shadow strike, heavy, skill, dodge, win cues', () => {
  const prev = st({})
  const next = withLog(st({ enemies: [mk({ id: 'e1', hp: 70 })], phase: 'won' }), [
    'Your shadows strike X for 30', 'X unleashes a heavy strike! X hit Hunter for 0', 'Hunter used Power Strike: ...', 'X dodged Hunter\'s attack',
  ])
  const ev = diffCombat(prev, next)
  expect(ev.some(e => e.kind === 'shadowStrike')).toBe(true)
  expect(ev.some(e => e.kind === 'enemyHeavy')).toBe(true)
  expect(ev.some(e => e.kind === 'playerSkill')).toBe(true)
  expect(ev.some(e => e.kind === 'dodge')).toBe(true)
  expect(ev.some(e => e.kind === 'won')).toBe(true)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `combatDiff.ts`**
```ts
import type { CombatState } from '../../domain/combat/types'

export type CombatEvent =
  | { kind: 'enemyHit'; amount: number; crit: boolean }
  | { kind: 'playerHit'; amount: number; crit: boolean }
  | { kind: 'dodge'; target: 'enemy' | 'player' }
  | { kind: 'shadowStrike' }
  | { kind: 'enemyHeavy' }
  | { kind: 'playerSkill' }
  | { kind: 'enemyAdvance' }
  | { kind: 'won' }
  | { kind: 'lost' }

export function diffCombat(prev: CombatState, next: CombatState): CombatEvent[] {
  const events: CombatEvent[] = []
  const newText = next.log.slice(prev.log.length).map(l => l.text).join(' ')
  const crit = newText.includes('(CRIT)')

  const activeIdx = prev.currentEnemyIndex
  const dEnemy = (prev.enemies[activeIdx]?.hp ?? 0) - (next.enemies[activeIdx]?.hp ?? 0)
  if (dEnemy > 0) events.push({ kind: 'enemyHit', amount: dEnemy, crit })

  const dPlayer = prev.player.hp - next.player.hp
  if (dPlayer > 0) events.push({ kind: 'playerHit', amount: dPlayer, crit })

  if (newText.includes('dodged')) {
    const enemyName = next.enemies[next.currentEnemyIndex]?.name ?? ''
    const enemyDodged = enemyName !== '' && newText.includes(`${enemyName} dodged`)
    events.push({ kind: 'dodge', target: enemyDodged ? 'enemy' : 'player' })
  }
  if (newText.includes('shadows strike')) events.push({ kind: 'shadowStrike' })
  if (newText.includes('unleashes a heavy strike')) events.push({ kind: 'enemyHeavy' })
  if (newText.includes('used ')) events.push({ kind: 'playerSkill' })

  if (next.currentEnemyIndex > prev.currentEnemyIndex) events.push({ kind: 'enemyAdvance' })
  if (next.phase === 'won') events.push({ kind: 'won' })
  if (next.phase === 'lost') events.push({ kind: 'lost' })

  return events
}
```

- [ ] **Step 4: Run → PASS.**

- [ ] **Step 5: Implement `useCombatAnimations.ts`** (no separate test; it wraps the tested pure fn):
```ts
import { useEffect, useRef, useState } from 'react'
import type { CombatState } from '../../domain/combat/types'
import { diffCombat, type CombatEvent } from './combatDiff'

export interface AnimationBatch { id: number; events: CombatEvent[] }

export function useCombatAnimations(combat: CombatState | null): AnimationBatch {
  const prevRef = useRef<CombatState | null>(null)
  const idRef = useRef(0)
  const [batch, setBatch] = useState<AnimationBatch>({ id: 0, events: [] })

  useEffect(() => {
    if (!combat) { prevRef.current = null; return }
    const prev = prevRef.current
    if (prev && prev !== combat) {
      const events = diffCombat(prev, combat)
      if (events.length > 0) {
        idRef.current += 1
        setBatch({ id: idRef.current, events })
      }
    }
    prevRef.current = combat
  }, [combat])

  return batch
}
```

- [ ] **Step 6: Run full suite + build, then commit**
```bash
git add src/components/battle/combatDiff.ts src/components/battle/combatDiff.test.ts src/components/battle/useCombatAnimations.ts
git commit -m "feat(solo-system): combat snapshot diff -> animation events + hook"
```

---

## Task 4: Attack animation maps

**Files:** create `src/components/battle/animations.ts`, `src/components/battle/animations.test.ts`

These are Framer Motion variant objects keyed by enemy id and weapon baseId, with getter functions that fall back. They describe the transient "attack" motion (e.g. a translate/scale keyframe sequence) the stage applies to the attacking sprite.

- [ ] **Step 1: Failing test** `src/components/battle/animations.test.ts`:
```ts
import { getEnemyAttack, getWeaponAttack } from './animations'
import { enemyLibrary } from '../../data/enemyLibrary'
import { itemLibrary } from '../../data/itemLibrary'

test('every enemy id has an attack motion (or fallback)', () => {
  for (const e of enemyLibrary) expect(getEnemyAttack(e.id)).toBeTruthy()
  expect(getEnemyAttack('unknown')).toBeTruthy()
})

test('every weapon baseId + unarmed has an attack motion', () => {
  for (const w of itemLibrary.filter(i => i.slot === 'weapon')) expect(getWeaponAttack(w.baseId)).toBeTruthy()
  expect(getWeaponAttack(null)).toBeTruthy()
})

test('heavy enemy attack differs from normal', () => {
  expect(getEnemyAttack('orc', true)).not.toEqual(getEnemyAttack('orc', false))
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `animations.ts`.** Define a `MotionKeyframes` type (a record of `x`/`y`/`scale`/`rotate` arrays + `transition`). Provide `enemyAttacks: Record<string, MotionKeyframes>` for each enemy id (goblin quick stab = small fast lunge toward hunter; wolf pounce = bigger forward leap; imp dive; orc heavy overhead; golem slam; gatekeeper = guard-break) and a `default`. `getEnemyAttack(id, heavy=false)` returns the entry (or default); when `heavy`, returns a stronger variant (e.g. larger translate/scale + red flag) — ensure it is a different object/values so the test passes. `weaponAttacks: Record<string, MotionKeyframes>` for `rusted-blade` (arc slash), `hunters-dagger` (fast double-stab), `shadow-edge` (phantom slash), `unarmed` (jab); `getWeaponAttack(baseId|null)` falls back to `unarmed`. Keep the motions short (~250–500ms). Direction note: enemy attacks translate toward the hunter (down-left in stage coords); the hunter attack translates toward the enemy (up-right) — the stage applies sign based on facing.

- [ ] **Step 4: Run → PASS. Full suite + build. Commit**
```bash
git add src/components/battle/animations.ts src/components/battle/animations.test.ts
git commit -m "feat(solo-system): per-enemy and per-weapon attack motion maps"
```

---

## Task 5: BattleStage

**Files:** create `src/components/battle/BattleStage.tsx`, `src/components/battle/BattleStage.test.tsx`

- [ ] **Step 1: Failing test** `src/components/battle/BattleStage.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { BattleStage } from './BattleStage'
import type { Combatant, CombatState } from '../../domain/combat/types'
import type { Shadow } from '../../domain/shadows/types'

function mk(over: Partial<Combatant>): Combatant {
  return { id: 'x', name: 'X', isPlayer: false, hp: 50, maxHP: 50, mp: 0, maxMP: 0, attack: 0, defense: 0, speed: 0, skillPowerMult: 1, critChance: 0, critMultiplier: 1.75, dodgeChance: 0, buffs: [], defending: false, ...over }
}
const combat: CombatState = {
  gateId: 'gate-e1', goldReward: 0,
  player: mk({ id: 'p', name: 'Hunter', isPlayer: true }),
  enemies: [mk({ id: 'goblin', name: 'Goblin' }), mk({ id: 'imp', name: 'Imp' }), mk({ id: 'gate_e_boss', name: 'Gatekeeper' })],
  currentEnemyIndex: 0, round: 1, phase: 'player', log: [], rngState: 1, nextLogId: 1,
}

test('renders the current enemy name and the hunter', () => {
  render(<BattleStage combat={combat} weaponBaseId={null} shadows={[]} deployedIds={[]} batch={{ id: 0, events: [] }} />)
  expect(screen.getByText('Goblin')).toBeInTheDocument()
  expect(screen.getByText('Hunter')).toBeInTheDocument()
})

test('shows queued wave count behind the current enemy', () => {
  const { container } = render(<BattleStage combat={combat} weaponBaseId={null} shadows={[]} deployedIds={[]} batch={{ id: 0, events: [] }} />)
  expect(container.querySelectorAll('[data-queued-enemy]').length).toBe(2)
})

test('renders deployed shadows and a +N overflow badge past the display cap', () => {
  const shadows: Shadow[] = Array.from({ length: 12 }, (_, i) => ({ id: `s${i}`, sourceEnemyId: 'goblin', name: 'G', power: 5 }))
  const deployedIds = shadows.map(s => s.id)
  render(<BattleStage combat={combat} weaponBaseId={null} shadows={shadows} deployedIds={deployedIds} batch={{ id: 0, events: [] }} />)
  expect(screen.getByText(/\+\d+/)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `BattleStage.tsx`.**
Props: `{ combat: CombatState; weaponBaseId: string | null; shadows: Shadow[]; deployedIds: string[]; batch: AnimationBatch }`.
- Layout: a `relative` stage box (fixed height, e.g. `h-72`) with a gradient/ground backdrop tinted by `combat.gateId`'s rank (optional; a simple gradient is fine).
- **Enemy zone (top-right):** the current enemy via `EnemySprite enemyId={combat.enemies[currentEnemyIndex].id}` (large) with its name + a small HP bar (reuse `CombatantBar` or a slim bar). The queued enemies (`combat.enemies.slice(currentEnemyIndex+1)`) render small + dimmed, each wrapped in an element carrying `data-queued-enemy` (test relies on this). If more than ~5 queued, cap displayed and add a "+N".
- **Hunter zone (bottom-left):** `HunterSprite weaponBaseId={weaponBaseId}` (large) with name + HP/MP bar. The deployed shadows (filter `shadows` by `deployedIds`) render as a **responsive ranked formation** of `ShadowSprite`s: show up to `DISPLAY_CAP` (e.g. 8), scaling figure size down as count rises; if `deployed.length > DISPLAY_CAP`, render `DISPLAY_CAP` and a `+{deployed.length - DISPLAY_CAP}` badge (test relies on a `+N` text).
- **Animations:** consume `batch` (keyed by `batch.id`): when a new batch arrives, play the relevant motions — `enemyHit` → shake/flash the enemy + mount a `FloatingDamage amount crit` over the enemy; `playerHit` → shake the hunter + `FloatingDamage` over the hunter; `dodge` → "MISS" floater on the target; `shadowStrike` → a spectral slash overlay on the enemy; `enemyHeavy`/normal enemy attack → translate the enemy sprite via `getEnemyAttack(id, heavy)`; `playerSkill`/basic attack → translate the hunter sprite via `getWeaponAttack(weaponBaseId)`; `enemyAdvance` → brief fade of the outgoing enemy; `won`/`lost` → defeat fade (the existing overlay still handles the result panel). Use `AnimatePresence` for floaters keyed by `batch.id`. Whether the player's motion is "attack" vs "skill" can both use the weapon motion in V1.
- Everything must fit ~375px wide; use fl-relative positioning, not fixed pixels that overflow.

- [ ] **Step 4: Run → PASS.** Full suite + build.

- [ ] **Step 5: Commit**
```bash
git add src/components/battle/BattleStage.tsx src/components/battle/BattleStage.test.tsx
git commit -m "feat(solo-system): battle stage with positioned fighters, shadow squad, animations"
```

---

## Task 6: Wire BattleStage into BattleScreen

**Files:** modify `src/screens/BattleScreen.tsx`

- [ ] **Step 1: Edit BattleScreen.**
- Import `BattleStage` and `useCombatAnimations`.
- After `const combat = ...` etc., add `const batch = useCombatAnimations(combat)`.
- Replace the two standalone `<CombatantBar .../>` elements (enemy + player) and the bare WAVE header area with `<BattleStage combat={combat} weaponBaseId={save.equipment.weapon?.baseId ?? null} shadows={save.shadows} deployedIds={save.deployedShadowIds} batch={batch} />` placed near the top (keep the "▣ GATE BATTLE / WAVE x / y" header line above it). Keep the COMBAT LOG `SystemWindow`, the action buttons, and the win/lose overlay exactly as they are. (The stage now shows the HP bars, so the separate CombatantBars are removed; if you prefer, keep the player's bar inside the stage — just don't double-render.)
- Keep the `useEffect` that auto-scrolls the log.

- [ ] **Step 2: Verify** — `npx vitest run` (all green; if the existing App/BattleScreen smoke relied on a removed element, adjust the test minimally without weakening it) and `npm run build` clean.

- [ ] **Step 3: Manual/preview check (document):** enter a gate, confirm the stage shows the hunter (with weapon) + enemy, attacks animate, damage numbers float, shadow strike plays, defeat dissolves, and it fits a 375px mobile viewport with a full wave + many deployed shadows.

- [ ] **Step 4: Commit**
```bash
git add src/screens/BattleScreen.tsx
git commit -m "feat(solo-system): mount battle stage in BattleScreen with combat animations"
```

---

## Task 7: README + final verification

**Files:** modify `README.md`

- [ ] **Step 1:** Add a "Battle visuals (Visual V1)" note: holographic SVG hunter/enemies, equipped weapon shown, per-enemy & per-weapon attack animations, floating damage, shadow squad on the battle stage; note it's presentation-only. Mention V2 (gear paper-doll) is next.

- [ ] **Step 2: Final verification** — `npx vitest run` and `npm run build`, both clean.

- [ ] **Step 3: Commit**
```bash
git add README.md
git commit -m "docs(solo-system): document battle visuals (Visual V1)"
```

---

## Definition of done (Visual V1)
- Battle screen renders a staged scene: hunter (holding equipped weapon) + deployed shadow squad vs the current enemy with the wave queued behind, all as holographic SVG.
- Each enemy has a distinct sprite + attack animation (heavy variant on heavy turns); the hunter's attack motion matches the equipped weapon (or unarmed).
- Hits shake/flash the target and float a damage number (crit/MISS variants) in both directions; shadow strike, skill, and defeat animations play.
- Responsive and intact at max capacity (full wave + large shadow squad with "+N") on a ~375px viewport.
- No domain/store/persistence change; full suite green; build clean; verified in-browser.

## Out of scope (V2+)
- Armor/accessory paper-doll on the hunter (Status + battle), rarity auras, equipped-look changes.
- Parallax/particle backgrounds, per-skill distinct effects, sound.
