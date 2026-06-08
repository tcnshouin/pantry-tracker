# Solo System — Phase 3a-1 (Rituals: Fixed Daily Quests) Design Spec

**Date:** 2026-06-09
**Status:** Approved (pending implementation plan)
**Builds on:** Phases 1–2c + Visual V1/V2, all merged. App at `solo-system/`.

## 1. Summary

Add **Rituals** — user-defined quests that auto-appear **every day** alongside the existing
rotating library quests. Rituals are the "must-do-daily" backbone: because they are real
quests, **missing one triggers the Penalty Zone**. Users create / edit / delete rituals on
a new Rituals screen, choosing a stat and a difficulty preset (no hand-tuned numbers).
Local-only — no external services (DeepSeek AI quests are the separate 3a-2 slice).

## 2. Goals / non-goals

### Goals
- Persistent, user-defined daily quests issued every day in addition to the N rotating
  library quests.
- Missing a ritual enters the Penalty Zone (same mechanic as any quest).
- A management UI (add / edit / delete) with stat + difficulty-preset + duration.
- Newly-created rituals also appear in **today's** quest list immediately (not only next reset).
- Schema migration v4 → v5.

### Non-goals
- AI-generated quests (3a-2, needs DeepSeek key + proxy).
- Per-ritual scheduling beyond a daily cadence (no "weekdays only", no times-of-day).
- Reordering/categories/tags; reminder notifications (Phase 3c).

## 3. Data model

- **RitualTemplate** (`src/domain/types.ts`):
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
- `SaveState` gains `rituals: RitualTemplate[]`.
- **QuestInstance** gains `source: 'ritual' | 'library' | 'redemption'`. The existing
  `isRedemption: boolean` is **kept** (so the engine/penalty/store code that reads it is
  untouched); `source` is the new display/classification field. A library quest has
  `source: 'library'`, a ritual `source: 'ritual'` (and `isRedemption: false`), a redemption
  quest `source: 'redemption'` (and `isRedemption: true`). Both fields are set consistently
  wherever instances are created.
- **schemaVersion 4 → 5**: migration adds `rituals: []` to old saves AND backfills
  `source` on any existing in-flight `quests`/instances (derive: `isRedemption ? 'redemption'
  : 'library'`) so older saved instances remain valid against the new required field.
  Composes after the v1→v2→v3→v4 chain. Unit-tested.

## 4. Difficulty presets (`balanceConfig.rituals`)

```ts
rituals: {
  difficulties: {
    easy:   { baseEXP: 25, baseStatXP: 12 },
    medium: { baseEXP: 45, baseStatXP: 22 },
    hard:   { baseEXP: 70, baseStatXP: 35 },
  },
  defaultDurationMinutes: 16 * 60,
  maxRituals: 12,
}
```
A ritual's `baseEXP`/`baseStatXP` come from its difficulty preset at issuance time (looked
up, not stored per-instance beyond the resulting numbers). `defaultDurationMinutes` is the
form default; `maxRituals` caps how many a user can create (keeps the daily list sane).

## 5. Issuance (`src/domain/rituals.ts` + issuance)

- Pure helper `issueRitualQuests(rituals, now, durationOverrideMs?) -> QuestInstance[]`:
  one `QuestInstance` per ritual, `source: 'ritual'`, `isRedemption: false`, deadline =
  `now + ritual.durationMinutes*60_000`, baseEXP/baseStatXP from
  `balanceConfig.rituals.difficulties[ritual.difficulty]`, `templateId = ritual.id`
  (so streaks key off the ritual id), unique `instanceId`.
- The existing `issueDailyQuests` is extended to stamp `source: 'library'` on its instances
  (and `buildRedemptionQuest` stamps `source: 'redemption'`).
- **Daily rollover** (store `rolloverIfNeeded`): `quests = [...issueRitualQuests(save.rituals,
  now), ...issueDailyQuests({library, count: dailyQuestCount, ...})]`. Rituals are additive;
  the library still rotates `dailyQuestCount` on top.

## 6. Store actions

- `addRitual(input)` — validate (non-empty title, under `maxRituals`), create a
  `RitualTemplate` with a generated id, append to `save.rituals`. **If today's quests don't
  already contain an instance with `templateId === ritual.id`, also issue one for today now**
  (so it appears immediately), with deadline relative to `clock.now()`.
- `updateRitual(id, patch)` — edit title/description/stat/difficulty/duration of an existing
  ritual. (Takes effect for future issuances; today's already-issued instance is left as-is
  to avoid mutating an in-progress quest — documented behavior.)
- `deleteRitual(id)` — remove from `save.rituals`. Today's already-issued instance of it
  stays in the list for the rest of the day (don't yank an active quest); it simply won't
  re-issue tomorrow.
- All persist via the existing `persist(next)` pattern. `completeQuest`, penalty detection,
  and streaks are **unchanged** — rituals are ordinary non-redemption quests, so missing one
  is already caught by `detectMissedQuests` → Penalty Zone, and completing one grants real
  EXP/stat-XP through the existing path (legitimate — they are real-life tasks).

## 7. UI

- **RitualsScreen** (`/rituals`, new sidebar-drawer entry, e.g. `Repeat`/`CalendarCheck`
  icon): lists current rituals (title, stat tag, difficulty, duration) with **Edit** and
  **Delete**; an **+ Add Ritual** form (title, description, stat picker STR/VIT/AGI/INT/PER,
  difficulty Easy/Med/Hard, duration). Disable Add at `maxRituals`. System-window aesthetic.
- **HomeScreen**: ritual quest cards show a cyan **RITUAL** tag (vs library quests) — read
  from `quest.source === 'ritual'`. `QuestCard` gains an optional source-based badge; its
  existing behavior is unchanged.
- Nav drawer + App route updated for `/rituals`.

## 8. Testing (TDD)

- `issueRitualQuests`: one instance per ritual, `source: 'ritual'`, deadline/rewards from
  difficulty, templateId = ritual id.
- rollover: daily quests = all rituals + N library; library still rotates.
- store: `addRitual` appends + issues-today-if-missing + caps at `maxRituals`;
  `updateRitual` edits; `deleteRitual` removes (today's instance preserved).
- penalty: a missed ritual instance (deadline passed, not completed, not redemption) enters
  the Penalty Zone via existing `detectMissedQuests` (guard test confirming rituals are
  treated as missable).
- `completeQuest` on a ritual grants EXP/stat-XP (unchanged path) and bumps its streak.
- migration v4 → v5 adds `rituals: []` and backfills `source` on existing instances; v1→v5
  composes.
- UI: light `RitualsScreen` test (renders list + add form) and `QuestCard` RITUAL badge.
- Full suite green; build clean; verified in-browser.

## 9. New / changed files
```
src/domain/types.ts            (modify) RitualTemplate, RitualDifficulty, SaveState.rituals, QuestInstance.source
src/domain/balanceConfig.ts    (modify) rituals block
src/domain/rituals.ts          (new) issueRitualQuests + difficulty lookup
src/domain/issuance.ts         (modify) stamp source:'library'
src/domain/penalty.ts          (modify) buildRedemptionQuest stamps source:'redemption'
src/persistence/repository.ts  (modify) SCHEMA_VERSION=5, freshSaveState.rituals, migrate v4->v5 (+source backfill)
src/store/useSystemStore.ts    (modify) rollover issues rituals; addRitual/updateRitual/deleteRitual
src/screens/RitualsScreen.tsx   (new)
src/components/RitualForm.tsx    (new, or inline in screen)
src/components/QuestCard.tsx     (modify) RITUAL badge from quest.source
src/components/NavDrawer.tsx     (modify) Rituals entry
src/App.tsx                      (modify) /rituals route
```
No combat/loot/shadow/domain-engine changes.

## 10. Definition of done
- A user can add/edit/delete rituals; each ritual appears in the daily quest list every day
  (and immediately on creation), tagged RITUAL.
- Missing a ritual enters the Penalty Zone; completing one grants its difficulty's EXP/stat-XP
  and builds its streak.
- Library quests still rotate `dailyQuestCount` on top of rituals.
- v4 saves migrate to v5 (rituals + source backfilled); v1→v5 composes.
- Full test suite green; build clean; verified in-browser.

## 11. Out of scope / next
- 3a-2: DeepSeek AI-generated quests (needs API key + Supabase Edge Function or proxy).
- Ritual scheduling (weekdays, times), reminders/notifications (3c), reordering/categories.
