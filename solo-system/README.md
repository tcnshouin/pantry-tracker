# The System — Solo Leveling Self-Improvement App

A free, installable iPhone app (PWA) that gamifies real-life self-improvement using the
"System" from the *Solo Leveling* webtoon. You receive daily real-world quests with a
checkbox and a countdown timer. Completing them — **consistently** — earns EXP, levels
you up, and grows your five stats. Miss a quest and you enter the Penalty Zone.

This repository contains **Phase 1: the honest core.** Combat, AI-generated quests,
cloud sync, and push notifications are planned for later phases (see below).

## Core principle

Completing a real-life quest is the **only** way to gain EXP and stat progress. There is
no other path to power. The game layer (coming in Phase 2) will be a reward for real
effort, never a substitute for it.

## How it works

- **Daily quests** are issued automatically each day, each with a live countdown.
- Completing a quest grants **EXP** (toward your level) and **stat-XP** (toward the one
  stat it maps to: STR / VIT / AGI / INT / PER), plus gold and gate keys.
- **Consistency multiplies stat growth.** A streak raises a multiplier, so a habit done
  daily upgrades its stat far faster than sporadic bursts.
- **Leveling up** bumps every stat by 1 and grants free points you allocate yourself.
- **Class rank** climbs E → D → C → B → A → S → National → Monarch as you level.
- **Penalty Zone:** miss a quest's deadline and your streak resets, you get an EXP
  debuff, and a redemption Penalty Quest appears. Clear it to escape the zone.
- All progress is stored **on-device** (IndexedDB) and survives reloads.

## Run it

```bash
npm install
npm run dev       # local dev server
npm run build     # production build (emits the PWA service worker + manifest)
npm run preview   # preview the production build
npm test          # run the Vitest suite
```

## Install on your iPhone

1. Host the production build (any static host: Vercel, Netlify, GitHub Pages) or open
   the dev/preview URL on your phone.
2. Open the URL in **Safari**.
3. Tap the **Share** button → **Add to Home Screen**.
4. It installs as "System" with its own icon and opens full-screen like a native app,
   working offline after the first load.

## Project structure

- `src/domain/` — pure, fully unit-tested game logic (leveling, stats, streaks, quests,
  penalty, issuance, clock). No React or I/O here.
- `src/data/questLibrary.ts` — the built-in starter quests.
- `src/persistence/` — Dexie (IndexedDB) save/load.
- `src/store/useSystemStore.ts` — the single integration point (engine + persistence).
- `src/components/` and `src/screens/` — the UI.
- **`src/domain/balanceConfig.ts` — all tunable constants** (EXP curve, multipliers, rank
  thresholds, daily quest count, penalty/redemption values). Tune pacing here.

## Difficulty / pacing

The EXP curve (`100 × level^1.6`) is intentionally steep so reaching max rank takes
around 1–2 years of consistent effort. These are placeholder defaults in `balanceConfig.ts`
to be tuned with real-world use.

## Not in Phase 1 (planned later)

- **Phase 2:** Gates, turn-based combat powered by your real stats, loot, inventory,
  shadow army.
- **Phase 3:** AI-generated personalized quests (DeepSeek), Supabase cloud sync + login,
  push notifications.
- **Phase 4:** Class tier-up boss dungeons, titles, endless/prestige mode, full polish.
