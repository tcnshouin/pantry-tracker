# Solo System — Phase 3a-1 (Rituals: Fixed Daily Quests) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add user-defined "Rituals" — quests that auto-appear every day (alongside the rotating library quests), are managed on a new screen, grant difficulty-preset rewards, and send you to the Penalty Zone if missed.

**Architecture:** A `RitualTemplate` list on `SaveState`, a pure `issueRitualQuests` helper, daily rollover that issues rituals + library, store add/update/delete actions, a new Rituals screen, and a `source` field on `QuestInstance` for tagging. Rituals reuse the existing completeQuest/penalty/streak paths — no engine change. Schema v4 → v5.

**Tech Stack:** Existing — React + TS + Tailwind + Zustand + Dexie + framer-motion + lucide-react + Vitest. No new deps.

**Working dir:** `solo-system/` in worktree `/Users/andreupaz/sololevelling/.claude/worktrees/solo-3a1`. Paths relative to `solo-system/`. **Run `npm install` first.** Tests `npx vitest run`; build `npm run build`.

**Standing rule:** No comments in any code files. None.

---

## File structure
```
src/domain/types.ts            (modify) RitualDifficulty, RitualTemplate, SaveState.rituals, QuestInstance.source
src/domain/balanceConfig.ts    (modify) rituals block
src/domain/issuance.ts         (modify) stamp source:'library' on library instances
src/domain/penalty.ts          (modify) buildRedemptionQuest stamps source:'redemption'
src/domain/rituals.ts          (new) issueRitualQuests
src/persistence/repository.ts  (modify) SCHEMA_VERSION=5, freshSaveState.rituals, migrate v4->v5 + source backfill
src/store/useSystemStore.ts    (modify) rollover issues rituals; addRitual/updateRitual/deleteRitual
src/components/QuestCard.tsx     (modify) RITUAL badge from quest.source
src/screens/RitualsScreen.tsx    (new) list + add/edit/delete form
src/components/NavDrawer.tsx     (modify) Rituals entry
src/App.tsx                      (modify) /rituals route
```

---

## Task 1: Types + config + source field + migration scaffolding

Adding a REQUIRED `source` to `QuestInstance` forces every creation site to set it, so this task updates all three (issuance, penalty redemption, and the migration backfill) together to keep the build green.

**Files:** modify `src/domain/types.ts`, `src/domain/balanceConfig.ts`, `src/domain/issuance.ts`, `src/domain/penalty.ts`, `src/persistence/repository.ts`.

- [ ] **Step 1: `types.ts`** — add types + fields:
```ts
export type RitualDifficulty = 'easy' | 'medium' | 'hard'

export interface RitualTemplate {
  id: string
  title: string
  description: string
  stat: StatType
  difficulty: RitualDifficulty
  durationMinutes: number
}
```
Add to `QuestInstance` (required): `source: 'ritual' | 'library' | 'redemption'`.
Add to `SaveState`: `rituals: RitualTemplate[]`.

- [ ] **Step 2: `balanceConfig.ts`** — add inside `balanceConfig` (after `shadows`):
```ts
  rituals: {
    difficulties: {
      easy:   { baseEXP: 25, baseStatXP: 12 },
      medium: { baseEXP: 45, baseStatXP: 22 },
      hard:   { baseEXP: 70, baseStatXP: 35 },
    } as Record<string, { baseEXP: number; baseStatXP: number }>,
    defaultDurationMinutes: 16 * 60,
    maxRituals: 12,
  },
```

- [ ] **Step 3: `issuance.ts`** — in `issueDailyQuests`'s returned instance object, add `source: 'library' as const,`.

- [ ] **Step 4: `penalty.ts`** — in `buildRedemptionQuest`'s returned object, add `source: 'redemption' as const,`.

- [ ] **Step 5: `repository.ts`** — bump + fresh + migrate:
- `export const SCHEMA_VERSION = 5`.
- In `freshSaveState` add `rituals: [],`.
- In `migrate`, after the `< 4` block:
```ts
  if (s.schemaVersion < 5) {
    s = {
      ...s,
      rituals: (s as { rituals?: SaveState['rituals'] }).rituals ?? [],
      quests: (s.quests ?? []).map(q => ({
        ...q,
        source: (q as { source?: QuestInstance['source'] }).source ?? (q.isRedemption ? 'redemption' : 'library'),
      })),
      schemaVersion: 5,
    }
  }
```
(Import `QuestInstance` type in repository.ts if not already; or use `as any` consistent with the existing v2/v3 cast style.)

- [ ] **Step 6: Fix the known fallout, then verify.** Adding the required `source` breaks compilation in exactly three existing test factories that build `QuestInstance` literals without it — add `source: 'library'` to each:
  - `src/domain/quests.test.ts` (the `quest()` factory)
  - `src/domain/quests_multipliers.test.ts` (its `quest()` factory)
  - `src/domain/penalty.test.ts` (the `q()` factory)
  Also, bumping `SCHEMA_VERSION` to 5 breaks one hardcoded assertion: in `src/persistence/migration_v4.test.ts`, the "v1 save composes all migrations to v4" test asserts `expect(loaded?.schemaVersion).toBe(4)` — change that `4` to `5` (the chain now migrates through v5). Do NOT weaken any assertions otherwise.
  Then run `npx vitest run` (all green) and `npm run build` (clean).

- [ ] **Step 7: Commit**
```bash
git add src/domain/types.ts src/domain/balanceConfig.ts src/domain/issuance.ts src/domain/penalty.ts src/persistence/repository.ts
git commit -m "feat(solo-system): ritual types, config, quest source field, migrate v5 scaffolding"
```

---

## Task 2: Migration v4 → v5 tests

**Files:** create `src/persistence/migration_v5.test.ts`

- [ ] **Step 1: Test**:
```ts
import { db, SAVE_KEY } from './db'
import { loadState, freshSaveState, SCHEMA_VERSION } from './repository'

beforeEach(async () => { await db.saves.clear() })

test('a v4 save gains rituals and backfills quest source', async () => {
  const v4: any = freshSaveState(4)
  delete v4.rituals
  v4.schemaVersion = 4
  v4.quests = [
    { instanceId: 'a', templateId: 't', title: 'X', description: '', stat: 'STR', baseEXP: 10, baseStatXP: 5, issuedAt: 0, deadline: 9, completed: false, completedAt: null, isRedemption: false },
    { instanceId: 'b', templateId: 'r', title: 'R', description: '', stat: 'VIT', baseEXP: 10, baseStatXP: 5, issuedAt: 0, deadline: 9, completed: false, completedAt: null, isRedemption: true },
  ]
  await db.saves.put({ key: SAVE_KEY, state: v4 })
  const loaded = await loadState()
  expect(loaded?.schemaVersion).toBe(SCHEMA_VERSION)
  expect(loaded?.rituals).toEqual([])
  expect(loaded?.quests[0].source).toBe('library')
  expect(loaded?.quests[1].source).toBe('redemption')
})

test('a v1 save composes all migrations to v5', async () => {
  const v1: any = freshSaveState(4)
  delete v1.gates; delete v1.inventory; delete v1.equipment; delete v1.shadows; delete v1.deployedShadowIds; delete v1.rituals
  v1.schemaVersion = 1
  await db.saves.put({ key: SAVE_KEY, state: v1 })
  const loaded = await loadState()
  expect(loaded?.schemaVersion).toBe(5)
  expect(loaded?.rituals).toEqual([])
  expect(loaded?.shadows).toEqual([])
})
```

- [ ] **Step 2: Run → PASS** (migration implemented in Task 1). If a real bug, STOP and report.

- [ ] **Step 3: Commit**
```bash
git add src/persistence/migration_v5.test.ts
git commit -m "test(solo-system): v4->v5 migration (rituals + quest source backfill)"
```

---

## Task 3: issueRitualQuests

**Files:** create `src/domain/rituals.ts`, `src/domain/rituals.test.ts`

- [ ] **Step 1: Failing test** `src/domain/rituals.test.ts`:
```ts
import { issueRitualQuests } from './rituals'
import type { RitualTemplate } from './types'

const ritual = (over: Partial<RitualTemplate>): RitualTemplate => ({ id: 'r1', title: 'Pushups', description: 'do them', stat: 'STR', difficulty: 'medium', durationMinutes: 120, ...over })

test('issues one instance per ritual, tagged source ritual', () => {
  const out = issueRitualQuests([ritual({}), ritual({ id: 'r2', title: 'Read' })], 1000)
  expect(out).toHaveLength(2)
  expect(out[0].source).toBe('ritual')
  expect(out[0].isRedemption).toBe(false)
  expect(out[0].templateId).toBe('r1')
  expect(out[0].deadline).toBe(1000 + 120 * 60_000)
})

test('rewards come from the difficulty preset', () => {
  const easy = issueRitualQuests([ritual({ difficulty: 'easy' })], 0)[0]
  const hard = issueRitualQuests([ritual({ difficulty: 'hard' })], 0)[0]
  expect(hard.baseEXP).toBeGreaterThan(easy.baseEXP)
  expect(hard.baseStatXP).toBeGreaterThan(easy.baseStatXP)
})

test('empty rituals yields no quests', () => {
  expect(issueRitualQuests([], 0)).toEqual([])
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `src/domain/rituals.ts`**
```ts
import { balanceConfig } from './balanceConfig'
import type { QuestInstance, RitualTemplate } from './types'

export function issueRitualQuests(rituals: RitualTemplate[], now: number, durationOverrideMs: number | null = null): QuestInstance[] {
  return rituals.map((r, i) => {
    const reward = balanceConfig.rituals.difficulties[r.difficulty]
    return {
      instanceId: `ritual-${now}-${i}-${r.id}`,
      templateId: r.id,
      title: r.title,
      description: r.description,
      stat: r.stat,
      baseEXP: reward.baseEXP,
      baseStatXP: reward.baseStatXP,
      issuedAt: now,
      deadline: now + (durationOverrideMs ?? r.durationMinutes * 60_000),
      completed: false,
      completedAt: null,
      isRedemption: false,
      source: 'ritual',
    }
  })
}
```

- [ ] **Step 4: Run → PASS.** Full suite + build.

- [ ] **Step 5: Commit**
```bash
git add src/domain/rituals.ts src/domain/rituals.test.ts
git commit -m "feat(solo-system): issueRitualQuests from ritual templates + difficulty rewards"
```

---

## Task 4: Store — rollover + add/update/delete rituals

**Files:** modify `src/store/useSystemStore.ts`; create `src/store/rituals.test.ts`

- [ ] **Step 1: Failing test** `src/store/rituals.test.ts`:
```ts
import { createSystemStore } from './useSystemStore'
import { db } from '../persistence/db'

const clock = (ms: number) => ({ now: () => ms })
beforeEach(async () => { await db.saves.clear() })

async function ready(ms = Date.now()) {
  const store = createSystemStore({ clock: clock(ms) })
  await store.getState().hydrate()
  return store
}

test('addRitual stores it and issues an instance for today', async () => {
  const store = await ready()
  store.getState().addRitual({ title: 'Meditate', description: 'sit', stat: 'PER', difficulty: 'easy', durationMinutes: 600 })
  expect(store.getState().save.rituals).toHaveLength(1)
  const inst = store.getState().save.quests.filter(q => q.source === 'ritual')
  expect(inst).toHaveLength(1)
  expect(inst[0].title).toBe('Meditate')
})

test('addRitual rejects blank title and caps at maxRituals', async () => {
  const store = await ready()
  store.getState().addRitual({ title: '  ', description: '', stat: 'STR', difficulty: 'easy', durationMinutes: 60 })
  expect(store.getState().save.rituals).toHaveLength(0)
  for (let i = 0; i < 20; i++) store.getState().addRitual({ title: 'R' + i, description: '', stat: 'STR', difficulty: 'easy', durationMinutes: 60 })
  expect(store.getState().save.rituals.length).toBeLessThanOrEqual(12)
})

test('deleteRitual removes the template (today instance stays)', async () => {
  const store = await ready()
  store.getState().addRitual({ title: 'Read', description: '', stat: 'INT', difficulty: 'medium', durationMinutes: 600 })
  const id = store.getState().save.rituals[0].id
  store.getState().deleteRitual(id)
  expect(store.getState().save.rituals).toHaveLength(0)
})

test('updateRitual edits the template', async () => {
  const store = await ready()
  store.getState().addRitual({ title: 'Run', description: '', stat: 'VIT', difficulty: 'easy', durationMinutes: 600 })
  const id = store.getState().save.rituals[0].id
  store.getState().updateRitual(id, { difficulty: 'hard', title: 'Long Run' })
  expect(store.getState().save.rituals[0].difficulty).toBe('hard')
  expect(store.getState().save.rituals[0].title).toBe('Long Run')
})

test('a rolled-over day issues all rituals plus library quests', async () => {
  const day1 = new Date('2026-06-09T08:00:00').getTime()
  const store = await ready(day1)
  store.getState().addRitual({ title: 'Daily Pushups', description: '', stat: 'STR', difficulty: 'medium', durationMinutes: 600 })
  store.getState().__setClock(clock(new Date('2026-06-10T08:00:00').getTime()))
  await store.getState().hydrate()
  const ritualCount = store.getState().save.quests.filter(q => q.source === 'ritual').length
  const libraryCount = store.getState().save.quests.filter(q => q.source === 'library').length
  expect(ritualCount).toBe(1)
  expect(libraryCount).toBeGreaterThan(0)
})

test('a missed ritual is detected as missable (enters penalty)', async () => {
  const t0 = new Date('2026-06-09T08:00:00').getTime()
  const store = await ready(t0)
  store.getState().addRitual({ title: 'Sleep early', description: '', stat: 'VIT', difficulty: 'easy', durationMinutes: 60 })
  store.getState().__setClock(clock(t0 + 1000 * 60 * 60 * 3))
  store.getState().checkPenalty()
  expect(store.getState().save.penalty.active).toBe(true)
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Modify `useSystemStore.ts`**
- Imports: `import { issueRitualQuests } from '../domain/rituals'` and `import type { RitualTemplate, RitualDifficulty, StatType } from '../domain/types'` (StatType/RitualDifficulty may already be importable; add what's missing).
- Extend `SystemState`:
```ts
  addRitual: (input: { title: string; description: string; stat: StatType; difficulty: RitualDifficulty; durationMinutes: number }) => void
  updateRitual: (id: string, patch: Partial<Omit<RitualTemplate, 'id'>>) => void
  deleteRitual: (id: string) => void
```
- In `rolloverIfNeeded`, change the quests line to prepend rituals:
```ts
      const quests = [
        ...issueRitualQuests(save.rituals, now),
        ...issueDailyQuests({ library: questLibrary, count: balanceConfig.dailyQuestCount, now, durationOverrideMs: null, seed: hashDay(today) }),
      ]
```
- Add the three actions near the others:
```ts
      addRitual: (input) => {
        const save = get().save
        if (!input.title.trim()) return
        if (save.rituals.length >= balanceConfig.rituals.maxRituals) return
        const ritual: RitualTemplate = {
          id: `ritual-${clock.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: input.title.trim(), description: input.description,
          stat: input.stat, difficulty: input.difficulty, durationMinutes: input.durationMinutes,
        }
        const todayInstances = save.quests.some(q => q.templateId === ritual.id)
        const quests = todayInstances ? save.quests : [...save.quests, ...issueRitualQuests([ritual], clock.now())]
        const next: SaveState = { ...save, rituals: [...save.rituals, ritual], quests }
        persist(next)
        set({ save: next })
      },

      updateRitual: (id, patch) => {
        const save = get().save
        if (!save.rituals.some(r => r.id === id)) return
        const rituals = save.rituals.map(r => r.id === id ? { ...r, ...patch } : r)
        const next: SaveState = { ...save, rituals }
        persist(next)
        set({ save: next })
      },

      deleteRitual: (id) => {
        const save = get().save
        if (!save.rituals.some(r => r.id === id)) return
        const next: SaveState = { ...save, rituals: save.rituals.filter(r => r.id !== id) }
        persist(next)
        set({ save: next })
      },
```
(Note: `addRitual` issues only the ONE new ritual via `issueRitualQuests([ritual], ...)`, appended — never re-issuing all rituals. `update`/`delete` deliberately leave today's already-issued instance untouched, per the spec.)

- [ ] **Step 4: Run → PASS.** Full suite + build.

- [ ] **Step 5: Commit**
```bash
git add src/store/useSystemStore.ts src/store/rituals.test.ts
git commit -m "feat(solo-system): rollover issues rituals + library; add/update/delete ritual actions"
```

---

## Task 5: UI — QuestCard badge, Rituals screen, nav, route

**Files:** modify `src/components/QuestCard.tsx`, `src/components/NavDrawer.tsx`, `src/App.tsx`; create `src/screens/RitualsScreen.tsx`, `src/components/QuestCard.test.tsx` (if not present).

- [ ] **Step 1: QuestCard RITUAL badge (TDD)** — add a test `src/components/QuestCard.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { QuestCard } from './QuestCard'
import type { QuestInstance } from '../domain/types'

const q = (over: Partial<QuestInstance>): QuestInstance => ({ instanceId: 'i', templateId: 't', title: 'Meditate', description: 'sit', stat: 'PER', baseEXP: 25, baseStatXP: 12, issuedAt: 0, deadline: Date.now() + 99999, completed: false, completedAt: null, isRedemption: false, source: 'ritual', ...over })

test('shows a RITUAL badge for ritual quests', () => {
  render(<QuestCard quest={q({})} onComplete={() => {}} />)
  expect(screen.getByText(/RITUAL/i)).toBeInTheDocument()
})

test('library quest shows no RITUAL badge', () => {
  render(<QuestCard quest={q({ source: 'library' })} onComplete={() => {}} />)
  expect(screen.queryByText(/RITUAL/i)).toBeNull()
})
```
Then in `QuestCard.tsx`, add a cyan **RITUAL** badge block (mirroring the existing PENALTY QUEST badge) shown when `quest.source === 'ritual'` (and not a redemption quest). Keep all existing behavior.

- [ ] **Step 2: RitualsScreen** (`src/screens/RitualsScreen.tsx`)
- Read `save.rituals` + actions `addRitual`, `updateRitual`, `deleteRitual` from the store; import `balanceConfig` for `maxRituals` + difficulty labels.
- **List:** each ritual in a `SystemWindow` — title, stat tag, difficulty, duration — with **Edit** and **Delete** buttons.
- **Add/Edit form:** local `useState` for title, description, stat (STR/VIT/AGI/INT/PER picker), difficulty (Easy/Med/Hard), durationMinutes (a few presets, e.g. 2h/8h/all-day → minutes; default `balanceConfig.rituals.defaultDurationMinutes`). An **+ Add Ritual** button calls `addRitual(...)` and clears the form; **Edit** loads a ritual into the form and Save calls `updateRitual(id, ...)`. Disable Add when `save.rituals.length >= balanceConfig.rituals.maxRituals` (show a note). System-window aesthetic; `pb-8`.
- Empty state: "No rituals yet. Add a daily habit you must do every day."

- [ ] **Step 3: NavDrawer** — import an icon (e.g. `Repeat` from lucide-react) and add `{ to: '/rituals', label: 'RITUALS', Icon: Repeat }` to the `links` array (e.g. after HOME or STATUS).

- [ ] **Step 4: App.tsx** — import `RitualsScreen`, add `<Route path="/rituals" element={<RitualsScreen />} />`.

- [ ] **Step 5: Verify** — `npx vitest run` (all green incl. the new QuestCard tests) + `npm run build` clean. Optionally `npm run dev`: add a ritual, see it tagged RITUAL on Home.

- [ ] **Step 6: Commit**
```bash
git add src/components/QuestCard.tsx src/components/QuestCard.test.tsx src/screens/RitualsScreen.tsx src/components/NavDrawer.tsx src/App.tsx
git commit -m "feat(solo-system): rituals screen, RITUAL quest badge, nav + route"
```

---

## Task 6: README + final verification

**Files:** modify `README.md`

- [ ] **Step 1:** Add a "Rituals (fixed daily quests)" section: define your own quests that appear every day (tagged RITUAL) on top of the rotating library quests; pick a stat + difficulty; missing a ritual sends you to the Penalty Zone; managed on the Rituals screen. Note AI-generated quests are a later slice. Constants in `balanceConfig.rituals`.

- [ ] **Step 2: Final verification** — `npx vitest run` and `npm run build`, both clean.

- [ ] **Step 3: Commit**
```bash
git add README.md
git commit -m "docs(solo-system): document Rituals (fixed daily quests)"
```

---

## Definition of done
- Add/edit/delete rituals on the Rituals screen; each appears in the daily list every day (and immediately on creation), tagged RITUAL.
- Library quests still rotate `dailyQuestCount` on top of rituals.
- Missing a ritual enters the Penalty Zone; completing one grants its difficulty's EXP/stat-XP and builds its streak (existing paths, unchanged).
- v4 saves migrate to v5 (rituals added, quest `source` backfilled); v1→v5 composes.
- Full test suite green; build clean; verified in-browser.

## Out of scope
- 3a-2: DeepSeek AI-generated quests (API key + proxy). Ritual scheduling (weekdays/times), reminders (3c), categories/reordering.
