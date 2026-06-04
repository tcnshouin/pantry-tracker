# Solo System — Phase 1 (Honest Core) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working, installable PWA where the user receives daily real-life quests (checkbox + countdown timer), and completing them — consistently — drives EXP, level-ups, and the five Solo Leveling stats, with a Penalty Zone for missed quests. All data persists on-device.

**Architecture:** A pure, fully unit-tested **domain engine** (leveling, stat-XP with a consistency/streak multiplier, quest rewards, penalty logic, daily issuance) sits underneath a **Zustand store** that holds runtime state and persists through a **Dexie (IndexedDB)** repository. A small set of React screens (System Home, Status Window, Penalty Zone overlay, History) render the state. The app is a **PWA** (installable, offline). No combat, no AI, no cloud sync, no push notifications in this phase — those are Phases 2/3.

**Tech Stack:** React 19 + Vite + TypeScript + Tailwind CSS + Zustand (state) + Dexie (IndexedDB) + framer-motion (System-window animations) + lucide-react (icons) + Vitest + @testing-library/react + fake-indexeddb (tests) + vite-plugin-pwa.

**Core principle (enforced in this plan):** Completing a real-life quest is the ONLY thing that grants EXP and stat-XP. There is no other code path that increases player level or stat progress. Reviewers and implementers must reject any change that violates this.

**Directory:** All work happens in `solo-system/` at the repo root (sibling to `edgelab/`). All paths below are relative to the repo root.

---

## File Structure (decided up front)

```
solo-system/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  tailwind.config.js
  postcss.config.cjs
  public/
    icons/icon-192.png, icon-512.png, apple-touch-icon.png   (placeholder art)
  src/
    main.tsx                      # React entry + store hydration
    App.tsx                       # router/shell + bottom nav + penalty overlay mount
    index.css                     # Tailwind directives + base theme

    domain/                       # PURE logic — no React, no Dexie, no I/O
      types.ts                    # all domain types (Player, Stat, Quest*, PenaltyZone, etc.)
      balanceConfig.ts            # ALL tunable constants in one place
      leveling.ts                 # expToNext, addExp, level-up resolution
      stats.ts                    # stat-XP + consistency(streak) multiplier + stat sub-leveling
      streaks.ts                  # streak update/reset helpers
      quests.ts                   # reward calc for completing a quest
      penalty.ts                  # penalty-zone enter/clear logic
      issuance.ts                 # daily quest selection + daily-reset detection
      time.ts                     # injectable "now" + day-key helpers (testable clock)

    data/
      questLibrary.ts             # static starter quest templates mapped to stats

    persistence/
      db.ts                       # Dexie schema/instance
      repository.ts               # load/save the single SaveState blob (+ migrations later)

    store/
      useSystemStore.ts           # Zustand store: state + actions wiring domain+persistence

    components/
      SystemWindow.tsx            # reusable glowing blue panel wrapper
      QuestCard.tsx               # one quest: title, stat tag, checkbox, CountdownTimer
      CountdownTimer.tsx          # live ticking countdown to a deadline
      StatBar.tsx                 # one stat row with sub-level + xp bar
      ExpBar.tsx                  # player level + exp bar
      BottomNav.tsx               # Home / Status / Log nav
      PenaltyZoneOverlay.tsx      # full-screen red takeover

    screens/
      HomeScreen.tsx              # today's quests
      StatusScreen.tsx            # the blue status window + point allocation
      LogScreen.tsx               # streaks + simple history list

    test/
      setup.ts                    # vitest + testing-library + fake-indexeddb setup
```

Domain files are pure and tested in isolation. The store is the only place domain + persistence meet. UI reads the store.

---

## Conventions for every code task

- **TDD:** write the failing test, run it (confirm the *right* failure), implement minimally, run it (confirm pass), commit.
- **No comments in code files** (user standing preference — do not add code comments).
- Test commands run from inside `solo-system/`: `cd solo-system && npx vitest run <path>`.
- Commit from the repo root with paths under `solo-system/`.
- Use the injectable clock from `domain/time.ts` everywhere time matters — never call `Date.now()` directly in domain code, so tests are deterministic.

---

## Task 1: Scaffold the project

**Files:**
- Create: `solo-system/package.json`, `solo-system/vite.config.ts`, `solo-system/tsconfig.json`, `solo-system/tsconfig.node.json`, `solo-system/index.html`, `solo-system/tailwind.config.js`, `solo-system/postcss.config.cjs`, `solo-system/src/main.tsx`, `solo-system/src/App.tsx`, `solo-system/src/index.css`, `solo-system/src/test/setup.ts`, `solo-system/.gitignore`

- [ ] **Step 1: Scaffold with Vite and install deps**

Run from repo root:
```bash
cd solo-system 2>/dev/null || (npm create vite@latest solo-system -- --template react-ts && cd solo-system)
cd solo-system
npm install
npm install zustand dexie framer-motion lucide-react react-router-dom
npm install -D tailwindcss@3 postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom fake-indexeddb vite-plugin-pwa
npx tailwindcss init -p
```

- [ ] **Step 2: Configure Tailwind**

`solo-system/tailwind.config.js`:
```js
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        system: { bg: '#05070f', panel: '#0a1326', glow: '#38bdf8', accent: '#60a5fa', danger: '#ef4444' },
      },
      boxShadow: { glow: '0 0 20px rgba(56,189,248,0.45), inset 0 0 12px rgba(56,189,248,0.25)' },
    },
  },
  plugins: [],
}
```

`solo-system/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: dark; }
body { @apply bg-system-bg text-slate-100; margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; }
```

- [ ] **Step 3: Configure Vitest**

In `solo-system/vite.config.ts` add a test config and the PWA plugin import is added in Task 13. For now:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```
(If TS complains about the `test` key, add `/// <reference types="vitest" />` at the top.)

`solo-system/src/test/setup.ts`:
```ts
import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
```

- [ ] **Step 4: Add the smoke test**

`solo-system/src/App.tsx` (temporary minimal version, replaced in Task 9+):
```tsx
export default function App() {
  return <div>THE SYSTEM</div>
}
```

`solo-system/src/App.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the system shell', () => {
  render(<App />)
  expect(screen.getByText(/THE SYSTEM/i)).toBeInTheDocument()
})
```

- [ ] **Step 5: Run the smoke test (confirm pass) and the build**

```bash
cd solo-system && npx vitest run src/App.test.tsx
npm run build
```
Expected: test PASS; build succeeds.

- [ ] **Step 6: Commit**

```bash
git add solo-system
git commit -m "chore(solo-system): scaffold React+TS+Tailwind+Vitest PWA base"
```

---

## Task 2: Domain types + balanceConfig + testable clock

**Files:**
- Create: `solo-system/src/domain/types.ts`, `solo-system/src/domain/balanceConfig.ts`, `solo-system/src/domain/time.ts`, `solo-system/src/domain/time.test.ts`

- [ ] **Step 1: Write the failing test for the clock/day-key**

`solo-system/src/domain/time.test.ts`:
```ts
import { dayKey, type Clock } from './time'

const fixed = (iso: string): Clock => ({ now: () => new Date(iso).getTime() })

test('dayKey returns YYYY-MM-DD for the configured reset hour', () => {
  // 03:00 local with reset hour 4 still counts as the previous day
  expect(dayKey(new Date('2026-06-04T03:00:00').getTime(), 4)).toBe('2026-06-03')
  expect(dayKey(new Date('2026-06-04T04:00:00').getTime(), 4)).toBe('2026-06-04')
})

test('clock is injectable', () => {
  const c = fixed('2026-06-04T12:00:00')
  expect(typeof c.now()).toBe('number')
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd solo-system && npx vitest run src/domain/time.test.ts`
Expected: FAIL (module not found / `dayKey` undefined).

- [ ] **Step 3: Implement `time.ts`**

```ts
export interface Clock { now: () => number }
export const systemClock: Clock = { now: () => Date.now() }

export function dayKey(ms: number, resetHour: number): string {
  const d = new Date(ms - resetHour * 3600_000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
```

- [ ] **Step 4: Run to verify pass**

Run: `cd solo-system && npx vitest run src/domain/time.test.ts`
Expected: PASS.

- [ ] **Step 5: Add types and balanceConfig (no test needed — pure declarations)**

`solo-system/src/domain/types.ts`:
```ts
export type StatType = 'STR' | 'VIT' | 'AGI' | 'INT' | 'PER'
export const STAT_TYPES: StatType[] = ['STR', 'VIT', 'AGI', 'INT', 'PER']

export type ClassRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'NATIONAL' | 'MONARCH'

export interface Stat { type: StatType; subLevel: number; statXP: number }

export interface Player {
  level: number
  currentEXP: number
  freeStatPoints: number
  classRank: ClassRank
  currency: number
  gateKeys: number
  stats: Record<StatType, Stat>
}

export interface QuestTemplate {
  id: string
  title: string
  description: string
  stat: StatType
  baseEXP: number
  baseStatXP: number
  durationMinutes: number
}

export interface QuestInstance {
  instanceId: string
  templateId: string
  title: string
  description: string
  stat: StatType
  baseEXP: number
  baseStatXP: number
  issuedAt: number
  deadline: number
  completed: boolean
  completedAt: number | null
  isRedemption: boolean
}

export interface StreakRecord { templateId: string; count: number; lastCompletedDay: string | null }

export interface PenaltyZone { active: boolean; debuffMultiplier: number; enteredAt: number | null }

export interface SaveState {
  schemaVersion: number
  player: Player
  dayKey: string | null
  quests: QuestInstance[]
  streaks: Record<string, StreakRecord>
  penalty: PenaltyZone
  settings: { resetHour: number }
  history: { day: string; completed: number; issued: number }[]
}
```

`solo-system/src/domain/balanceConfig.ts`:
```ts
import type { ClassRank, StatType } from './types'

export const balanceConfig = {
  baseExpConstant: 100,
  expCurveExponent: 1.6,
  freeStatPointsPerLevel: 5,
  statXPPerSubLevel: 100,
  streakMultiplierStep: 0.05,
  streakMultiplierMax: 2,
  penaltyDebuffMultiplier: 0.5,
  dailyQuestCount: 4,
  defaultResetHour: 4,
  classRankThresholds: {
    E: 1, D: 13, C: 26, B: 39, A: 52, S: 65, NATIONAL: 80, MONARCH: 100,
  } as Record<ClassRank, number>,
}

export const statLabels: Record<StatType, string> = {
  STR: 'Strength', VIT: 'Vitality', AGI: 'Agility', INT: 'Intelligence', PER: 'Perception',
}
```

- [ ] **Step 6: Commit**

```bash
git add solo-system/src/domain
git commit -m "feat(solo-system): domain types, balance config, testable clock"
```

---

## Task 3: Leveling engine

**Files:**
- Create: `solo-system/src/domain/leveling.ts`, `solo-system/src/domain/leveling.test.ts`

- [ ] **Step 1: Write the failing tests**

`solo-system/src/domain/leveling.test.ts`:
```ts
import { expToNext, addExp } from './leveling'
import { STAT_TYPES, type Player } from './types'

function freshPlayer(): Player {
  const stats = Object.fromEntries(STAT_TYPES.map(t => [t, { type: t, subLevel: 0, statXP: 0 }])) as Player['stats']
  return { level: 1, currentEXP: 0, freeStatPoints: 0, classRank: 'E', currency: 0, gateKeys: 0, stats }
}

test('expToNext grows on the exponential curve', () => {
  expect(expToNext(1)).toBe(100)
  expect(expToNext(10)).toBeGreaterThan(expToNext(9))
  expect(expToNext(50)).toBeGreaterThan(expToNext(10) * 5)
})

test('adding exp below threshold does not level up', () => {
  const p = addExp(freshPlayer(), 50)
  expect(p.level).toBe(1)
  expect(p.currentEXP).toBe(50)
  expect(p.freeStatPoints).toBe(0)
})

test('crossing the threshold levels up, bumps every stat by 1, grants free points', () => {
  const p = addExp(freshPlayer(), 100)
  expect(p.level).toBe(2)
  expect(p.currentEXP).toBe(0)
  expect(p.freeStatPoints).toBe(5)
  STAT_TYPES.forEach(t => expect(p.stats[t].subLevel).toBe(1))
})

test('a single large exp gain can multi-level and carry remainder', () => {
  const p = addExp(freshPlayer(), 100 + expToNext(2) + 10)
  expect(p.level).toBe(3)
  expect(p.currentEXP).toBe(10)
  expect(p.freeStatPoints).toBe(10)
})

test('class rank advances at thresholds', () => {
  let p = freshPlayer()
  p = { ...p, level: 13 }
  p = addExp(p, 0)
  expect(p.classRank).toBe('D')
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd solo-system && npx vitest run src/domain/leveling.test.ts` → FAIL.

- [ ] **Step 3: Implement `leveling.ts`**

```ts
import { balanceConfig } from './balanceConfig'
import { STAT_TYPES, type ClassRank, type Player } from './types'

export function expToNext(level: number): number {
  return Math.round(balanceConfig.baseExpConstant * Math.pow(level, balanceConfig.expCurveExponent))
}

function rankForLevel(level: number): ClassRank {
  const t = balanceConfig.classRankThresholds
  const order: ClassRank[] = ['MONARCH', 'NATIONAL', 'S', 'A', 'B', 'C', 'D', 'E']
  return order.find(r => level >= t[r]) ?? 'E'
}

export function addExp(player: Player, amount: number): Player {
  let { level, currentEXP, freeStatPoints } = player
  const stats = { ...player.stats }
  currentEXP += Math.max(0, Math.round(amount))

  while (currentEXP >= expToNext(level)) {
    currentEXP -= expToNext(level)
    level += 1
    freeStatPoints += balanceConfig.freeStatPointsPerLevel
    for (const t of STAT_TYPES) {
      stats[t] = { ...stats[t], subLevel: stats[t].subLevel + 1 }
    }
  }

  return { ...player, level, currentEXP, freeStatPoints, stats, classRank: rankForLevel(level) }
}
```

- [ ] **Step 4: Run to verify pass** → `cd solo-system && npx vitest run src/domain/leveling.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add solo-system/src/domain/leveling.ts solo-system/src/domain/leveling.test.ts
git commit -m "feat(solo-system): exponential leveling engine with stat bumps and rank tiers"
```

---

## Task 4: Streaks + consistency multiplier + stat-XP

**Files:**
- Create: `solo-system/src/domain/streaks.ts`, `solo-system/src/domain/stats.ts`, `solo-system/src/domain/streaks.test.ts`, `solo-system/src/domain/stats.test.ts`

- [ ] **Step 1: Write the failing tests for streaks**

`solo-system/src/domain/streaks.test.ts`:
```ts
import { bumpStreak, resetStreak, streakMultiplier } from './streaks'
import type { StreakRecord } from './types'

const rec = (count: number, last: string | null): StreakRecord => ({ templateId: 'q1', count, lastCompletedDay: last })

test('first completion sets streak to 1', () => {
  expect(bumpStreak(undefined, 'q1', '2026-06-04').count).toBe(1)
})

test('consecutive day increments streak', () => {
  expect(bumpStreak(rec(3, '2026-06-03'), 'q1', '2026-06-04').count).toBe(4)
})

test('same-day completion does not double-count', () => {
  expect(bumpStreak(rec(3, '2026-06-04'), 'q1', '2026-06-04').count).toBe(3)
})

test('gap resets streak to 1', () => {
  expect(bumpStreak(rec(9, '2026-06-01'), 'q1', '2026-06-04').count).toBe(1)
})

test('multiplier rises with streak and caps', () => {
  expect(streakMultiplier(0)).toBe(1)
  expect(streakMultiplier(7)).toBeCloseTo(1.35)
  expect(streakMultiplier(1000)).toBe(2)
})

test('resetStreak zeroes the count', () => {
  expect(resetStreak(rec(9, '2026-06-03')).count).toBe(0)
})
```

- [ ] **Step 2: Run → FAIL.** `cd solo-system && npx vitest run src/domain/streaks.test.ts`

- [ ] **Step 3: Implement `streaks.ts`**

```ts
import { balanceConfig } from './balanceConfig'
import type { StreakRecord } from './types'

function prevDay(dayKey: string): string {
  const d = new Date(dayKey + 'T12:00:00')
  d.setDate(d.getDate() - 1)
  return dayKey.slice(0, 8) + String(d.getDate()).padStart(2, '0') === dayKey
    ? dayKey
    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function bumpStreak(rec: StreakRecord | undefined, templateId: string, today: string): StreakRecord {
  if (!rec) return { templateId, count: 1, lastCompletedDay: today }
  if (rec.lastCompletedDay === today) return rec
  const consecutive = rec.lastCompletedDay === prevDay(today)
  return { templateId, count: consecutive ? rec.count + 1 : 1, lastCompletedDay: today }
}

export function resetStreak(rec: StreakRecord): StreakRecord {
  return { ...rec, count: 0 }
}

export function streakMultiplier(count: number): number {
  const m = 1 + count * balanceConfig.streakMultiplierStep
  return Math.min(m, balanceConfig.streakMultiplierMax)
}
```

- [ ] **Step 4: Run → PASS.**

- [ ] **Step 5: Write the failing tests for stat application**

`solo-system/src/domain/stats.test.ts`:
```ts
import { applyStatXP } from './stats'
import type { Stat } from './types'

const stat = (subLevel: number, statXP: number): Stat => ({ type: 'STR', subLevel, statXP })

test('stat-XP accumulates without sub-level until threshold', () => {
  const s = applyStatXP(stat(0, 0), 40)
  expect(s.subLevel).toBe(0)
  expect(s.statXP).toBe(40)
})

test('reaching threshold raises sub-level and carries remainder', () => {
  const s = applyStatXP(stat(0, 80), 30)
  expect(s.subLevel).toBe(1)
  expect(s.statXP).toBe(10)
})
```

- [ ] **Step 6: Run → FAIL, implement `stats.ts`, run → PASS**

`solo-system/src/domain/stats.ts`:
```ts
import { balanceConfig } from './balanceConfig'
import type { Stat } from './types'

export function applyStatXP(stat: Stat, amount: number): Stat {
  let subLevel = stat.subLevel
  let statXP = stat.statXP + Math.max(0, Math.round(amount))
  while (statXP >= balanceConfig.statXPPerSubLevel) {
    statXP -= balanceConfig.statXPPerSubLevel
    subLevel += 1
  }
  return { ...stat, subLevel, statXP }
}
```

- [ ] **Step 7: Commit**

```bash
git add solo-system/src/domain/streaks.ts solo-system/src/domain/streaks.test.ts solo-system/src/domain/stats.ts solo-system/src/domain/stats.test.ts
git commit -m "feat(solo-system): streak engine, consistency multiplier, stat sub-leveling"
```

---

## Task 5: Quest completion rewards

**Files:**
- Create: `solo-system/src/domain/quests.ts`, `solo-system/src/domain/quests.test.ts`

This composes leveling + stats + streaks. The consistency multiplier applies to **stat-XP** (consistency upgrades the stat), and the active penalty debuff reduces both EXP and stat-XP gains.

- [ ] **Step 1: Write the failing test**

`solo-system/src/domain/quests.test.ts`:
```ts
import { completeQuest } from './quests'
import { STAT_TYPES, type Player, type QuestInstance, type StreakRecord, type PenaltyZone } from './types'

function freshPlayer(): Player {
  const stats = Object.fromEntries(STAT_TYPES.map(t => [t, { type: t, subLevel: 0, statXP: 0 }])) as Player['stats']
  return { level: 1, currentEXP: 0, freeStatPoints: 0, classRank: 'E', currency: 0, gateKeys: 0, stats }
}
const quest = (): QuestInstance => ({
  instanceId: 'i1', templateId: 'q1', title: 'Push-ups', description: '', stat: 'STR',
  baseEXP: 50, baseStatXP: 20, issuedAt: 0, deadline: 999, completed: false, completedAt: null, isRedemption: false,
})
const noPenalty: PenaltyZone = { active: false, debuffMultiplier: 1, enteredAt: null }

test('completing a quest grants EXP and stat-XP and increments streak', () => {
  const r = completeQuest({ player: freshPlayer(), quest: quest(), streak: undefined, penalty: noPenalty, today: '2026-06-04', now: 10 })
  expect(r.player.currentEXP).toBe(50)
  expect(r.player.stats.STR.statXP).toBeGreaterThan(0)
  expect(r.streak.count).toBe(1)
  expect(r.quest.completed).toBe(true)
  expect(r.quest.completedAt).toBe(10)
})

test('higher streak multiplies stat-XP (consistency matters)', () => {
  const lowStreak: StreakRecord = { templateId: 'q1', count: 0, lastCompletedDay: '2026-06-03' }
  const highStreak: StreakRecord = { templateId: 'q1', count: 14, lastCompletedDay: '2026-06-03' }
  const low = completeQuest({ player: freshPlayer(), quest: quest(), streak: lowStreak, penalty: noPenalty, today: '2026-06-04', now: 10 })
  const high = completeQuest({ player: freshPlayer(), quest: quest(), streak: highStreak, penalty: noPenalty, today: '2026-06-04', now: 10 })
  expect(high.player.stats.STR.statXP).toBeGreaterThan(low.player.stats.STR.statXP)
})

test('penalty debuff reduces gains', () => {
  const debuff: PenaltyZone = { active: true, debuffMultiplier: 0.5, enteredAt: 1 }
  const r = completeQuest({ player: freshPlayer(), quest: quest(), streak: undefined, penalty: debuff, today: '2026-06-04', now: 10 })
  expect(r.player.currentEXP).toBe(25)
})

test('completing an already-completed quest is a no-op', () => {
  const q = { ...quest(), completed: true, completedAt: 5 }
  const r = completeQuest({ player: freshPlayer(), quest: q, streak: undefined, penalty: noPenalty, today: '2026-06-04', now: 10 })
  expect(r.player.currentEXP).toBe(0)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `quests.ts`**

```ts
import { addExp } from './leveling'
import { applyStatXP } from './stats'
import { bumpStreak, streakMultiplier } from './streaks'
import type { Player, PenaltyZone, QuestInstance, StreakRecord } from './types'

export interface CompleteQuestInput {
  player: Player
  quest: QuestInstance
  streak: StreakRecord | undefined
  penalty: PenaltyZone
  today: string
  now: number
}
export interface CompleteQuestResult {
  player: Player
  quest: QuestInstance
  streak: StreakRecord
}

export function completeQuest(input: CompleteQuestInput): CompleteQuestResult {
  const { player, quest, streak, penalty, today, now } = input
  if (quest.completed) {
    return { player, quest, streak: streak ?? { templateId: quest.templateId, count: 0, lastCompletedDay: null } }
  }
  const debuff = penalty.active ? penalty.debuffMultiplier : 1
  const newStreak = bumpStreak(streak, quest.templateId, today)
  const mult = streakMultiplier(newStreak.count)

  const expGain = quest.baseEXP * debuff
  const statGain = quest.baseStatXP * mult * debuff

  let next = addExp(player, expGain)
  next = { ...next, stats: { ...next.stats, [quest.stat]: applyStatXP(next.stats[quest.stat], statGain) } }
  next = { ...next, currency: next.currency + 10, gateKeys: next.gateKeys + 1 }

  return {
    player: next,
    quest: { ...quest, completed: true, completedAt: now },
    streak: newStreak,
  }
}
```

- [ ] **Step 4: Run → PASS.**

- [ ] **Step 5: Commit**

```bash
git add solo-system/src/domain/quests.ts solo-system/src/domain/quests.test.ts
git commit -m "feat(solo-system): quest completion rewards (exp, stat-xp, streak, currency, keys)"
```

---

## Task 6: Penalty Zone logic

**Files:**
- Create: `solo-system/src/domain/penalty.ts`, `solo-system/src/domain/penalty.test.ts`

Spec rules (§6.1): a missed quest (deadline passed, not completed) → enter Penalty Zone: streak for that quest resets + EXP-reduction debuff. Only one zone active at a time (further misses refresh, not stack). The zone is cleared by completing a redemption quest. An active zone carries across the daily reset; new quests still issue; debuff persists until cleared.

- [ ] **Step 1: Write the failing tests**

`solo-system/src/domain/penalty.test.ts`:
```ts
import { detectMissedQuests, enterPenalty, clearPenalty } from './penalty'
import type { PenaltyZone, QuestInstance } from './types'

const q = (over: Partial<QuestInstance>): QuestInstance => ({
  instanceId: 'i', templateId: 't', title: '', description: '', stat: 'STR',
  baseEXP: 10, baseStatXP: 5, issuedAt: 0, deadline: 100, completed: false, completedAt: null, isRedemption: false, ...over,
})
const inactive: PenaltyZone = { active: false, debuffMultiplier: 1, enteredAt: null }

test('detects past-deadline incomplete quests as missed', () => {
  const quests = [q({ instanceId: 'a', deadline: 50 }), q({ instanceId: 'b', deadline: 200 }), q({ instanceId: 'c', deadline: 50, completed: true })]
  const missed = detectMissedQuests(quests, 100)
  expect(missed.map(m => m.instanceId)).toEqual(['a'])
})

test('redemption quests are never counted as missed', () => {
  const quests = [q({ instanceId: 'r', deadline: 50, isRedemption: true })]
  expect(detectMissedQuests(quests, 100)).toEqual([])
})

test('entering penalty activates debuff and records time', () => {
  const z = enterPenalty(inactive, 500)
  expect(z.active).toBe(true)
  expect(z.debuffMultiplier).toBeLessThan(1)
  expect(z.enteredAt).toBe(500)
})

test('entering when already active refreshes rather than stacking', () => {
  const z1 = enterPenalty(inactive, 100)
  const z2 = enterPenalty(z1, 200)
  expect(z2.debuffMultiplier).toBe(z1.debuffMultiplier)
  expect(z2.enteredAt).toBe(200)
})

test('clearing penalty restores normal multiplier', () => {
  const cleared = clearPenalty(enterPenalty(inactive, 1))
  expect(cleared.active).toBe(false)
  expect(cleared.debuffMultiplier).toBe(1)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `penalty.ts`**

```ts
import { balanceConfig } from './balanceConfig'
import type { PenaltyZone, QuestInstance } from './types'

export function detectMissedQuests(quests: QuestInstance[], now: number): QuestInstance[] {
  return quests.filter(q => !q.completed && !q.isRedemption && q.deadline <= now)
}

export function enterPenalty(_zone: PenaltyZone, now: number): PenaltyZone {
  return { active: true, debuffMultiplier: balanceConfig.penaltyDebuffMultiplier, enteredAt: now }
}

export function clearPenalty(_zone: PenaltyZone): PenaltyZone {
  return { active: false, debuffMultiplier: 1, enteredAt: null }
}
```

- [ ] **Step 4: Run → PASS.**

- [ ] **Step 5: Commit**

```bash
git add solo-system/src/domain/penalty.ts solo-system/src/domain/penalty.test.ts
git commit -m "feat(solo-system): penalty zone detection, entry, and clearing"
```

---

## Task 7: Quest library + daily issuance

**Files:**
- Create: `solo-system/src/data/questLibrary.ts`, `solo-system/src/domain/issuance.ts`, `solo-system/src/domain/issuance.test.ts`

- [ ] **Step 1: Create the quest library (static data, no test)**

`solo-system/src/data/questLibrary.ts` — at least 3 templates per stat (15+ total). Example shape:
```ts
import type { QuestTemplate } from '../domain/types'

export const questLibrary: QuestTemplate[] = [
  { id: 'str-pushups', title: 'Push-ups x30', description: 'Do 30 push-ups.', stat: 'STR', baseEXP: 40, baseStatXP: 20, durationMinutes: 120 },
  { id: 'str-squats', title: 'Bodyweight squats x40', description: 'Do 40 squats.', stat: 'STR', baseEXP: 40, baseStatXP: 20, durationMinutes: 120 },
  { id: 'str-plank', title: 'Plank 2 min', description: 'Hold a plank for 2 minutes.', stat: 'STR', baseEXP: 35, baseStatXP: 18, durationMinutes: 120 },
  { id: 'vit-water', title: 'Drink 2L water', description: 'Hydrate through the day.', stat: 'VIT', baseEXP: 30, baseStatXP: 15, durationMinutes: 720 },
  { id: 'vit-sleep', title: 'Sleep 7+ hours', description: 'Log a full night of sleep.', stat: 'VIT', baseEXP: 50, baseStatXP: 25, durationMinutes: 1440 },
  { id: 'vit-walk', title: 'Walk 6000 steps', description: 'Get moving.', stat: 'VIT', baseEXP: 40, baseStatXP: 20, durationMinutes: 720 },
  { id: 'agi-earlyrise', title: 'Wake before 7am', description: 'Out of bed early.', stat: 'AGI', baseEXP: 45, baseStatXP: 22, durationMinutes: 60 },
  { id: 'agi-tidy', title: 'Tidy your space 10 min', description: 'Quick reset of your room/desk.', stat: 'AGI', baseEXP: 30, baseStatXP: 15, durationMinutes: 240 },
  { id: 'agi-nosnooze', title: 'No procrastination block', description: 'One 25-min focused task, no delay.', stat: 'AGI', baseEXP: 40, baseStatXP: 20, durationMinutes: 240 },
  { id: 'int-read', title: 'Read 10 pages', description: 'Read 10 pages of a book.', stat: 'INT', baseEXP: 40, baseStatXP: 20, durationMinutes: 360 },
  { id: 'int-study', title: 'Study 30 min', description: 'Focused study/learning.', stat: 'INT', baseEXP: 50, baseStatXP: 25, durationMinutes: 360 },
  { id: 'int-skill', title: 'Practice a skill 20 min', description: 'Deliberate practice.', stat: 'INT', baseEXP: 45, baseStatXP: 22, durationMinutes: 360 },
  { id: 'per-meditate', title: 'Meditate 10 min', description: 'Sit and breathe.', stat: 'PER', baseEXP: 40, baseStatXP: 20, durationMinutes: 480 },
  { id: 'per-journal', title: 'Journal 5 min', description: 'Write a short reflection.', stat: 'PER', baseEXP: 35, baseStatXP: 18, durationMinutes: 480 },
  { id: 'per-nodoom', title: 'No doomscroll first hour', description: 'No social feeds for the first waking hour.', stat: 'PER', baseEXP: 45, baseStatXP: 22, durationMinutes: 120 },
]
```

- [ ] **Step 2: Write the failing tests for issuance**

`solo-system/src/domain/issuance.test.ts`:
```ts
import { issueDailyQuests, needsNewDay } from './issuance'
import { questLibrary } from '../data/questLibrary'

test('needsNewDay true when stored dayKey differs from current', () => {
  expect(needsNewDay(null, '2026-06-04')).toBe(true)
  expect(needsNewDay('2026-06-03', '2026-06-04')).toBe(true)
  expect(needsNewDay('2026-06-04', '2026-06-04')).toBe(false)
})

test('issues the configured number of quests', () => {
  const quests = issueDailyQuests({ library: questLibrary, count: 4, now: 1000, durationOverrideMs: null, seed: 1 })
  expect(quests).toHaveLength(4)
})

test('issued quests have future deadlines and are not completed', () => {
  const quests = issueDailyQuests({ library: questLibrary, count: 4, now: 1000, durationOverrideMs: null, seed: 1 })
  quests.forEach(q => {
    expect(q.deadline).toBeGreaterThan(1000)
    expect(q.completed).toBe(false)
    expect(q.instanceId).toBeTruthy()
  })
})

test('selection is deterministic for a given seed', () => {
  const a = issueDailyQuests({ library: questLibrary, count: 4, now: 0, durationOverrideMs: null, seed: 42 })
  const b = issueDailyQuests({ library: questLibrary, count: 4, now: 0, durationOverrideMs: null, seed: 42 })
  expect(a.map(q => q.templateId)).toEqual(b.map(q => q.templateId))
})
```

- [ ] **Step 3: Run → FAIL.**

- [ ] **Step 4: Implement `issuance.ts`**

```ts
import type { QuestInstance, QuestTemplate } from './types'

export function needsNewDay(storedDayKey: string | null, currentDayKey: string): boolean {
  return storedDayKey !== currentDayKey
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed || 1
  const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export interface IssueInput {
  library: QuestTemplate[]
  count: number
  now: number
  durationOverrideMs: number | null
  seed: number
}

export function issueDailyQuests(input: IssueInput): QuestInstance[] {
  const { library, count, now, durationOverrideMs, seed } = input
  const chosen = seededShuffle(library, seed).slice(0, count)
  return chosen.map((t, i) => ({
    instanceId: `${now}-${i}-${t.id}`,
    templateId: t.id,
    title: t.title,
    description: t.description,
    stat: t.stat,
    baseEXP: t.baseEXP,
    baseStatXP: t.baseStatXP,
    issuedAt: now,
    deadline: now + (durationOverrideMs ?? t.durationMinutes * 60_000),
    completed: false,
    completedAt: null,
    isRedemption: false,
  }))
}
```

- [ ] **Step 5: Run → PASS.**

- [ ] **Step 6: Commit**

```bash
git add solo-system/src/data/questLibrary.ts solo-system/src/domain/issuance.ts solo-system/src/domain/issuance.test.ts
git commit -m "feat(solo-system): quest library and deterministic daily issuance"
```

---

## Task 8: Persistence layer (Dexie)

**Files:**
- Create: `solo-system/src/persistence/db.ts`, `solo-system/src/persistence/repository.ts`, `solo-system/src/persistence/repository.test.ts`

Single-row save model: the whole `SaveState` is stored under a fixed key. Simple, robust, and easy to sync later.

- [ ] **Step 1: Write the failing test (uses fake-indexeddb from setup)**

`solo-system/src/persistence/repository.test.ts`:
```ts
import { loadState, saveState, freshSaveState } from './repository'

test('loadState returns null when nothing is stored', async () => {
  expect(await loadState()).toBeNull()
})

test('saveState then loadState round-trips', async () => {
  const s = freshSaveState(4)
  s.player.level = 7
  await saveState(s)
  const loaded = await loadState()
  expect(loaded?.player.level).toBe(7)
  expect(loaded?.settings.resetHour).toBe(4)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `db.ts` and `repository.ts`**

`solo-system/src/persistence/db.ts`:
```ts
import Dexie, { type Table } from 'dexie'
import type { SaveState } from '../domain/types'

export interface SaveRow { key: string; state: SaveState }

export class SystemDB extends Dexie {
  saves!: Table<SaveRow, string>
  constructor() {
    super('solo-system')
    this.version(1).stores({ saves: 'key' })
  }
}

export const db = new SystemDB()
export const SAVE_KEY = 'primary'
```

`solo-system/src/persistence/repository.ts`:
```ts
import { STAT_TYPES, type Player, type SaveState } from '../domain/types'
import { db, SAVE_KEY } from './db'

export const SCHEMA_VERSION = 1

export function freshPlayer(): Player {
  const stats = Object.fromEntries(STAT_TYPES.map(t => [t, { type: t, subLevel: 0, statXP: 0 }])) as Player['stats']
  return { level: 1, currentEXP: 0, freeStatPoints: 0, classRank: 'E', currency: 0, gateKeys: 0, stats }
}

export function freshSaveState(resetHour: number): SaveState {
  return {
    schemaVersion: SCHEMA_VERSION,
    player: freshPlayer(),
    dayKey: null,
    quests: [],
    streaks: {},
    penalty: { active: false, debuffMultiplier: 1, enteredAt: null },
    settings: { resetHour },
    history: [],
  }
}

export async function loadState(): Promise<SaveState | null> {
  const row = await db.saves.get(SAVE_KEY)
  return row?.state ?? null
}

export async function saveState(state: SaveState): Promise<void> {
  await db.saves.put({ key: SAVE_KEY, state })
}
```

- [ ] **Step 4: Run → PASS.**

- [ ] **Step 5: Commit**

```bash
git add solo-system/src/persistence
git commit -m "feat(solo-system): Dexie persistence with single-row save state"
```

---

## Task 9: Zustand store (engine + persistence wiring)

**Files:**
- Create: `solo-system/src/store/useSystemStore.ts`, `solo-system/src/store/useSystemStore.test.ts`

The store is the single integration point. It holds `SaveState`, exposes actions, persists after every mutation, and runs the daily-rollover + penalty checks on hydrate/tick.

- [ ] **Step 1: Write the failing integration tests**

`solo-system/src/store/useSystemStore.test.ts`:
```ts
import { createSystemStore } from './useSystemStore'

const clock = (ms: number) => ({ now: () => ms })

test('hydrate on a fresh DB issues a daily quest set', async () => {
  const store = createSystemStore({ clock: clock(new Date('2026-06-04T08:00:00').getTime()) })
  await store.getState().hydrate()
  expect(store.getState().save.quests.length).toBeGreaterThan(0)
  expect(store.getState().save.player.level).toBe(1)
})

test('completing a quest raises EXP and persists', async () => {
  const store = createSystemStore({ clock: clock(new Date('2026-06-04T08:00:00').getTime()) })
  await store.getState().hydrate()
  const first = store.getState().save.quests[0]
  await store.getState().completeQuest(first.instanceId)
  const done = store.getState().save.quests.find(q => q.instanceId === first.instanceId)
  expect(done?.completed).toBe(true)
  expect(store.getState().save.player.currentEXP).toBeGreaterThan(0)
})

test('a passed deadline with an incomplete quest enters the penalty zone on checkPenalty', async () => {
  const t0 = new Date('2026-06-04T08:00:00').getTime()
  const store = createSystemStore({ clock: clock(t0) })
  await store.getState().hydrate()
  store.getState().__setClock(clock(t0 + 1000 * 60 * 60 * 48))
  store.getState().checkPenalty()
  expect(store.getState().save.penalty.active).toBe(true)
})

test('allocateStatPoint spends a free point and raises the stat sub-level', async () => {
  const store = createSystemStore({ clock: clock(Date.now()) })
  await store.getState().hydrate()
  store.setState(s => ({ save: { ...s.save, player: { ...s.save.player, freeStatPoints: 3 } } }))
  store.getState().allocateStatPoint('STR')
  expect(store.getState().save.player.freeStatPoints).toBe(2)
  expect(store.getState().save.player.stats.STR.subLevel).toBe(1)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `useSystemStore.ts`**

Key responsibilities: hydrate (load or create save → run daily rollover → persist), completeQuest (delegate to `completeQuest` domain fn → if quest was a redemption, clear penalty → persist), checkPenalty (detect missed → reset their streaks → enterPenalty → persist), allocateStatPoint, and a daily-rollover routine (when `needsNewDay`, archive yesterday's counts to history, issue new quests, keep penalty as-is).

```ts
import { createStore } from 'zustand/vanilla'
import { useStore } from 'zustand'
import { type Clock, systemClock, dayKey } from '../domain/time'
import { balanceConfig } from '../domain/balanceConfig'
import { completeQuest as domainComplete } from '../domain/quests'
import { detectMissedQuests, enterPenalty, clearPenalty } from '../domain/penalty'
import { issueDailyQuests, needsNewDay } from '../domain/issuance'
import { resetStreak } from '../domain/streaks'
import { questLibrary } from '../data/questLibrary'
import { freshSaveState, loadState, saveState } from '../persistence/repository'
import type { SaveState, StatType } from '../domain/types'

interface SystemState {
  save: SaveState
  ready: boolean
  hydrate: () => Promise<void>
  completeQuest: (instanceId: string) => Promise<void>
  checkPenalty: () => void
  allocateStatPoint: (stat: StatType) => void
  __setClock: (c: Clock) => void
}

export function createSystemStore(opts?: { clock?: Clock }) {
  let clock = opts?.clock ?? systemClock

  return createStore<SystemState>((set, get) => {
    const persist = (save: SaveState) => { void saveState(save) }

    const rolloverIfNeeded = (save: SaveState): SaveState => {
      const today = dayKey(clock.now(), save.settings.resetHour)
      if (!needsNewDay(save.dayKey, today)) return save
      const history = save.dayKey
        ? [...save.history, { day: save.dayKey, completed: save.quests.filter(q => q.completed).length, issued: save.quests.length }]
        : save.history
      const quests = issueDailyQuests({
        library: questLibrary, count: balanceConfig.dailyQuestCount,
        now: clock.now(), durationOverrideMs: null, seed: hashDay(today),
      })
      return { ...save, dayKey: today, quests, history }
    }

    return {
      save: freshSaveState(balanceConfig.defaultResetHour),
      ready: false,
      __setClock: (c: Clock) => { clock = c },

      hydrate: async () => {
        const loaded = (await loadState()) ?? freshSaveState(balanceConfig.defaultResetHour)
        const rolled = rolloverIfNeeded(loaded)
        persist(rolled)
        set({ save: rolled, ready: true })
      },

      completeQuest: async (instanceId: string) => {
        const save = get().save
        const quest = save.quests.find(q => q.instanceId === instanceId)
        if (!quest || quest.completed) return
        const today = dayKey(clock.now(), save.settings.resetHour)
        const result = domainComplete({
          player: save.player, quest, streak: save.streaks[quest.templateId],
          penalty: save.penalty, today, now: clock.now(),
        })
        let penalty = save.penalty
        if (quest.isRedemption) penalty = clearPenalty(penalty)
        const next: SaveState = {
          ...save,
          player: result.player,
          quests: save.quests.map(q => q.instanceId === instanceId ? result.quest : q),
          streaks: { ...save.streaks, [quest.templateId]: result.streak },
          penalty,
        }
        persist(next)
        set({ save: next })
      },

      checkPenalty: () => {
        const save = get().save
        const missed = detectMissedQuests(save.quests, clock.now())
        if (missed.length === 0) return
        const streaks = { ...save.streaks }
        for (const m of missed) {
          if (streaks[m.templateId]) streaks[m.templateId] = resetStreak(streaks[m.templateId])
        }
        const next: SaveState = { ...save, streaks, penalty: enterPenalty(save.penalty, clock.now()) }
        persist(next)
        set({ save: next })
      },

      allocateStatPoint: (stat: StatType) => {
        const save = get().save
        if (save.player.freeStatPoints <= 0) return
        const s = save.player.stats[stat]
        const next: SaveState = {
          ...save,
          player: {
            ...save.player,
            freeStatPoints: save.player.freeStatPoints - 1,
            stats: { ...save.player.stats, [stat]: { ...s, subLevel: s.subLevel + 1 } },
          },
        }
        persist(next)
        set({ save: next })
      },
    }
  })
}

function hashDay(day: string): number {
  let h = 0
  for (let i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) & 0x7fffffff
  return h || 1
}

export const systemStore = createSystemStore()
export const useSystemStore = <T,>(sel: (s: SystemState) => T) => useStore(systemStore, sel)
```

- [ ] **Step 4: Run → PASS.** `cd solo-system && npx vitest run src/store/useSystemStore.test.ts`

- [ ] **Step 5: Commit**

```bash
git add solo-system/src/store
git commit -m "feat(solo-system): zustand store wiring engine, persistence, daily rollover, penalty checks"
```

---

## Task 10: Shared UI components

**Files:**
- Create: `solo-system/src/components/SystemWindow.tsx`, `CountdownTimer.tsx`, `StatBar.tsx`, `ExpBar.tsx`, `components/CountdownTimer.test.tsx`

UI tasks are lighter on TDD; test the one component with real logic (the countdown).

- [ ] **Step 1: Write the failing test for CountdownTimer**

`solo-system/src/components/CountdownTimer.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { CountdownTimer } from './CountdownTimer'

test('shows remaining time and an expired state', () => {
  const now = 1_000_000
  render(<CountdownTimer deadline={now + 90_000} nowMs={now} />)
  expect(screen.getByText(/01:30/)).toBeInTheDocument()
})

test('shows EXPIRED when past deadline', () => {
  const now = 1_000_000
  render(<CountdownTimer deadline={now - 1} nowMs={now} />)
  expect(screen.getByText(/EXPIRED/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run → FAIL, implement, run → PASS**

`CountdownTimer.tsx` accepts an optional `nowMs` (for tests) and otherwise ticks every second via `setInterval`, formatting `mm:ss` or `HH:MM:SS`. `SystemWindow.tsx` is a styled bordered panel with the `shadow-glow` class and a subtle framer-motion fade/scale in. `StatBar.tsx` renders stat label, sub-level, and a progress bar of `statXP / statXPPerSubLevel`. `ExpBar.tsx` renders level, rank, and `currentEXP / expToNext(level)`.

- [ ] **Step 3: Commit**

```bash
git add solo-system/src/components
git commit -m "feat(solo-system): system window, countdown timer, stat and exp bars"
```

---

## Task 11: Screens + nav + App shell

**Files:**
- Create: `solo-system/src/components/QuestCard.tsx`, `BottomNav.tsx`, `PenaltyZoneOverlay.tsx`, `solo-system/src/screens/HomeScreen.tsx`, `StatusScreen.tsx`, `LogScreen.tsx`
- Modify: `solo-system/src/App.tsx`, `solo-system/src/main.tsx`

- [ ] **Step 1: Build the screens (no new domain logic; render store state)**

- `QuestCard` — `SystemWindow` containing title, stat tag, `CountdownTimer` (deadline from quest), and a checkbox/button that calls `completeQuest(instanceId)`; completed cards show a chec. Disabled when expired.
- `HomeScreen` — `ExpBar` at top, list of today's `quests` as `QuestCard`s, an empty state if none.
- `StatusScreen` — the iconic blue status window: level, class rank, five `StatBar`s, `freeStatPoints` with a `+` button per stat calling `allocateStatPoint`.
- `LogScreen` — current per-quest streaks and the `history` list (day, completed/issued).
- `PenaltyZoneOverlay` — fixed full-screen red wash shown when `save.penalty.active`; explains the debuff and points the user to clear it by completing the redemption quest. (Generating the redemption quest into the active set can be a small helper invoked in `checkPenalty`; if deferred, the overlay simply states the debuff is active until tomorrow's quests are cleared — keep within Phase 1 by having `checkPenalty` append one redemption `QuestInstance` flagged `isRedemption` mapped to a random stat with higher reward.)
- `BottomNav` — Home / Status / Log using `react-router-dom` routes `/`, `/status`, `/log`.

- [ ] **Step 2: Wire `App.tsx` and `main.tsx`**

`App.tsx`: `BrowserRouter` (or `HashRouter` for static hosting safety) with routes to the three screens, `BottomNav`, and `PenaltyZoneOverlay` mounted above everything. On mount, call `hydrate()` then set an interval calling `checkPenalty()` every 30s.

`main.tsx`: render `<App/>` into `#root` with `index.css` imported.

- [ ] **Step 3: Run the full test suite and the dev build**

```bash
cd solo-system && npx vitest run
npm run build
```
Expected: all tests PASS; build succeeds.

- [ ] **Step 4: Manual smoke (document, not automated)**

Run `npm run dev`, open the URL, confirm: quests render with ticking timers; completing a quest fills the EXP bar; Status shows stats and lets you allocate points after a level-up; reload preserves state.

- [ ] **Step 5: Commit**

```bash
git add solo-system/src
git commit -m "feat(solo-system): home, status, and log screens with nav and penalty overlay"
```

---

## Task 12: PWA installability + offline

**Files:**
- Modify: `solo-system/vite.config.ts`, `solo-system/index.html`
- Create: `solo-system/public/icons/*` (placeholder PNGs), web manifest via plugin

- [ ] **Step 1: Add `vite-plugin-pwa` config**

In `vite.config.ts` add `VitePWA({ registerType: 'autoUpdate', manifest: { name: 'The System', short_name: 'System', theme_color: '#05070f', background_color: '#05070f', display: 'standalone', icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }] } })` to the plugins array.

- [ ] **Step 2: Add icons and apple meta tags**

Drop placeholder 192/512 PNGs in `public/icons/`. In `index.html` add `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="theme-color" content="#05070f">`, and the apple-touch-icon link.

- [ ] **Step 3: Build and verify the service worker + manifest are emitted**

```bash
cd solo-system && npm run build
ls dist/manifest.webmanifest dist/sw.js 2>/dev/null || ls dist
```
Expected: `manifest.webmanifest` and a service worker file are present in `dist/`.

- [ ] **Step 4: Verify offline-readiness manually (document)**

`npm run preview`, install via browser, confirm it loads offline after first visit and appears as a standalone app.

- [ ] **Step 5: Commit**

```bash
git add solo-system
git commit -m "feat(solo-system): PWA manifest, icons, service worker for installable offline app"
```

---

## Task 13: README + final verification

**Files:**
- Create: `solo-system/README.md`

- [ ] **Step 1: Write the README**

Document: what the app is (Phase 1 honest core), how to run (`npm install`, `npm run dev`, `npm run build`, `npm run preview`), how to install to an iPhone home screen via Safari, where balance constants live (`src/domain/balanceConfig.ts`), and what's intentionally NOT in Phase 1 (combat, AI quests, cloud sync, push notifications).

- [ ] **Step 2: Final full verification**

```bash
cd solo-system && npx vitest run && npm run build
```
Expected: all tests PASS, clean build.

- [ ] **Step 3: Commit**

```bash
git add solo-system/README.md
git commit -m "docs(solo-system): Phase 1 README and run instructions"
```

---

## Definition of done (Phase 1)

- Installable PWA that runs offline on an iPhone home screen.
- Daily quests issue automatically, each with a live countdown; completing them grants EXP and stat-XP.
- Consistency (streaks) multiplies stat gains; one-off bursts do not.
- Crossing the EXP threshold levels up, bumps all stats, and grants allocatable points.
- Missing a quest enters the Penalty Zone (streak reset + EXP debuff) until a redemption quest clears it.
- All state persists locally and survives reload.
- The only code path that grants EXP/stat-XP is quest completion.
- Full Vitest suite green; production build clean.

## Explicitly out of scope (later phases)

- Phase 2: Gates, turn-based combat, loot, inventory, shadow army.
- Phase 3: DeepSeek AI quest generation, Supabase sync/auth, push notifications.
- Phase 4: class tier-up boss dungeons, titles, endless/prestige mode, full aesthetic polish.
