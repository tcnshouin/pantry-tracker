# Solo Leveling Self-Improvement App — Design Spec

**Date:** 2026-06-04
**Status:** Approved (pending implementation plan)
**Working title:** "The System" (Solo Leveling-inspired self-improvement RPG)

## 1. Summary

A free, installable iPhone app (PWA) that gamifies real-life self-improvement using
the "System" from the *Solo Leveling* webtoon as its model. The user receives daily
real-world quests (workouts, study, mindfulness, etc.) with checkboxes and countdown
timers. Completing them is the **only** source of EXP, stat growth, and dungeon
energy. Real-life consistency powers an in-game hunter who fights monsters in
turn-based combat, collects loot, builds a shadow army, and climbs hunter ranks
(E → Monarch) over an intended **1–2 years of consistent effort**, with an endless
post-max mode for longevity.

### Core design principle (non-negotiable)

**Real-life tasks are the only true source of power.** Combat, loot, and the game
layer are *rewards and fantasy*. The user cannot grind the game to get stronger —
they get stronger by doing real habits, and that strength is expressed in the game.
Any feature that lets in-game activity directly produce real stat-XP/level progress
violates this principle and must be rejected.

## 2. Goals & non-goals

### Goals
- Free forever, installable to the iPhone home screen, works offline.
- Faithful Solo Leveling "full fan recreation" aesthetic (blue glowing System
  windows, "ARISE", Penalty Zone, hunter ranks, Job Change milestones).
- Honest habit engine where **consistency** (not one-off bursts) drives stat growth.
- A genuinely engaging turn-based RPG game layer fed by real progress.
- Long horizon: ~1–2 years to max; endless mode afterward.

### Non-goals (v1)
- App Store / native iOS distribution (PWA only; native is a possible later graduation).
- Multiplayer, social feeds, leaderboards against other people.
- Monetization of any kind.

## 3. Delivery & platform

- **Progressive Web App (PWA)** installed via Safari "Add to Home Screen".
- Full-screen standalone display, custom app icon, offline support via service worker.
- iOS 16.4+ web-app push notifications.
- Hosted free on Vercel or Netlify.

## 4. Tech stack

| Concern | Choice |
|---|---|
| Framework | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion (glowing windows, level-up, ARISE) |
| Local storage (source of truth) | IndexedDB via Dexie |
| Cloud sync + auth | Supabase (Postgres + Auth) |
| AI quest generation | DeepSeek API, proxied via a Supabase Edge Function (key server-side only) |
| Hosting | Vercel / Netlify free tier |

**Security note:** The DeepSeek API key must never ship in client code. All AI calls
go through the Supabase Edge Function proxy.

## 5. Progression model (the engine)

### 5.1 Player & stats
- **Player:** `level` (starts 1), `currentEXP`, `expToNextLevel`, `classRank`,
  `freeStatPoints`, active titles, active buffs/debuffs.
- **5 stats:** STR, VIT, AGI, INT, PER. Each has its own sub-level and `statXP`.
  Stats start near-zero and climb slowly.

### 5.2 How progress is earned
- Completing a daily quest grants: **EXP** (toward player level), **stat-XP** (toward
  the one stat the quest maps to), **Gate Keys** (dungeon energy), and **currency**.
- **Consistency multiplier:** each completion gives a *small* base stat-XP. A streak
  multiplier scales it: e.g. day 1 = ×1, day 7 = ×1.5, day 14+ = ×2. Consistent
  habits upgrade their stat far faster than sporadic bursts.
- **Streak scope:** streaks are tracked **per-quest** (drives the per-quest
  consistency multiplier) and aggregated **globally** (drives streak-based titles in
  §5.6). Per-stat streaks are derived as the max active streak among that stat's
  quests. The data model in §10 holds the per-quest counters; global and per-stat
  are computed views.
- **Level up:** all 5 stats +1, plus `freeStatPoints` to manually allocate (faithful
  to the System). Triggers a glowing level-up animation.

### 5.3 Stat → real-life mapping (editable in-app)
- **STR** → workouts, lifting, physical training
- **VIT** → health habits: sleep, hydration, diet, steps/cardio
- **AGI** → discipline & consistency: waking early, chores, anti-procrastination
- **INT** → study, reading, learning, skill-building, deep work
- **PER** → mindfulness: meditation, journaling, no-doomscroll, reflection

The category→stat assignment is editable so the user can tune it over time.

### 5.4 Difficulty curve (intended ~1–2 years to max)
- Exponential curve: `expToNext = round(100 × level^1.6)`.
- Fast early levels (momentum), deliberately grindy late game.
- With realistic daily EXP (~60–100/day from a full quest set), maxing lands around
  1.5–2 years of consistent effort.
- **The curve, consistency multiplier, and daily-EXP figures are interdependent
  placeholders to validate, not fixed requirements.** Phase 1 ships them as defaults
  and the ~1–2 year horizon is the target to tune toward — not a guaranteed constant.
- **All balance constants live in one `balanceConfig` file** so pacing is tunable
  after real-world feel.

### 5.5 Class ranks (Job Change milestones)
- 8 ranks, faithful to Solo Leveling hunter ranks:
  **E → D → C → B → A → S → National-Level → Monarch.**
- A rank-up is a **Boss Gate / Job Change milestone quest** roughly every ~12–15
  levels (months apart). Beating the boss advances the rank.
- Higher ranks boost EXP gains and unlock harder/more rewarding quest & gate tiers.

### 5.6 Titles
- Achievements (e.g. "30-day streak", "1000 push-ups total") grant titles with small
  passive buffs.

### 5.7 Endless mode (post-max, future-proof)
Triggered at max level / Monarch ("Awakening"). Two complementary layers:
- **Prestige / Monarch's Domain:** optional reset restarting levels with a permanent
  EXP/aesthetic buff and a prestige ★ count.
- **Endless Monarch Levels (M1, M2, …):** uncapped accumulation with monthly/seasonal
  AI-generated personal challenges — long-term maintenance mode.

Core curve ships first; endless layer is a clean add-on.

## 6. Daily quests (the honest core)

- Quests are presented on the **System Home** screen with a **checkbox + live
  countdown timer** each.
- **Sources (hybrid):**
  - **Built-in library** — curated, realistic self-improvement tasks scaled by level
    and rank. This is the offline / fallback source and always available.
  - **AI-generated (DeepSeek)** — personalized daily quests from the user's goals and
    history, fetched via the Edge Function proxy. Falls back to the library if
    offline or the API fails.
- Each quest maps to exactly one stat and carries a deadline (its countdown).
- **Daily reset** at a configurable time (default ~4 AM): new quest set issued.

### 6.1 Penalty Zone (missed quest)
- Missing a quest's timer → **streak resets** + a **temporary debuff** (reduced EXP
  gains).
- Debuff persists until the user clears a harder **redemption Penalty Quest** to
  "escape the zone."
- Presented via a dramatic full-screen red "YOU HAVE ENTERED THE PENALTY ZONE"
  takeover with a countdown (full-immersion presentation; underlying mechanic is the
  streak reset + debuff + redemption quest).
- **Interaction with daily reset:** an unresolved Penalty Zone carries across the
  daily reset. New daily quests are still issued, but the EXP-reduction debuff stays
  active until the redemption quest is cleared. The redemption quest does **not**
  block completing normal quests; it only lifts the debuff. Only one Penalty Zone is
  active at a time — additional misses while in the zone refresh/extend it rather
  than stacking multiple debuffs.

## 7. Game layer

### 7.1 Two layers
- **Real-life layer (input):** daily quests → EXP, stat-XP, Gate Keys, currency.
  The only source of power.
- **Game layer (reward):** the user's real stats power an in-game hunter.

### 7.2 Stat → combat mapping
- **STR** = attack, **VIT** = max HP, **AGI** = speed / turn order, **INT** = skill
  power, **PER** = crit chance & dodge.

### 7.3 Gates (dungeons)
- Spend a **Gate Key** (earned only from completing daily quests) to enter a dungeon
  scaled to the user's rank (E-Gate, D-Gate, …).
- Clear waves of monsters.
- **Boss Gates** are the rank-up / Job Change milestone dungeons.

### 7.4 Turn-based combat
- Each turn the user chooses **Attack / Skill / Defend / Item**.
- Damage and turn order derive from real stats + equipped gear.
- Skills unlock by class rank and cost MP. Monsters telegraph attacks so
  defend/timing matters.
- Battles target ~5–10 turns to avoid the game overshadowing real habits.
- Win → loot + currency + chance to ARISE the monster.
- **Combat never grants real stat-XP or player-level EXP** (preserves the core
  principle). It grants loot, currency, and shadows only.

### 7.5 ARISE / Shadow Army
- Defeated monsters can be raised as shadow soldiers (collection) that add passive
  combat power. Faithful Solo Leveling mechanic and a long-term collection hook.

### 7.6 Loot & inventory
- **Drops:** weapons, armor, accessories with color-coded rarities
  (Common → … → Legendary).
- **Inventory:** equip/unequip; equipped gear grants combat-stat buffs and
  **EXP/stat-XP multipliers** that make the *real* grind more rewarding (closing the
  loop back to real life).
- **Core-principle boundary:** gear multipliers only *amplify the reward of a real
  task completion* — they never generate EXP/stat-XP on their own and are never
  applied to combat outcomes. Multipliers fire exclusively at the moment a real quest
  is completed. This keeps real tasks the sole source of progress (§1).
- **Enhancement:** spend in-game currency (from quests) to upgrade gear — a money
  sink and long-term goal.

## 8. Screens

1. **System Home** — today's quests (checkbox + countdown), level/EXP bar, rank,
   active buffs/debuffs.
2. **Status Window** — iconic blue stat sheet: 5 stats, level, class, titles, point
   allocation.
3. **Gates** — available dungeons, spend Gate Keys, enter combat.
4. **Battle** — turn-based combat screen.
5. **Inventory / Equipment** — gear, weapons, enhancement.
6. **Shadow Army** — collected shadows.
7. **Quest Log / History** — streaks, calendar heatmap, stats over time.

## 9. Notifications & daily cycle

- PWA push notifications for: new daily quests issued, **quest timer running out**,
  Penalty Zone warnings, daily reset.
- Each daily quest carries its own countdown; expiry triggers the Penalty Zone.
- Daily reset time is user-configurable.

## 10. Data model (core entities)

- **Player** — level, EXP, classRank, freeStatPoints, currency, prestige, buffs/debuffs.
- **Stat** — type (STR/VIT/AGI/INT/PER), subLevel, statXP.
- **QuestTemplate** — library/AI quest definition: title, description, statType,
  baseEXP, baseStatXP, difficulty, durationSeconds.
- **QuestInstance** — a quest issued for a given day: template ref, deadline,
  completed flag, completedAt.
- **Streak** — per-quest/per-stat streak counts driving the consistency multiplier.
- **Item** — weapon/armor/accessory: rarity, combat stats, buffs, enhancement level.
- **InventorySlot / Equipment** — owned items and equipped set.
- **Shadow** — raised monster: name, power, source.
- **CombatSession** — dungeon run state, turn log, rewards.
- **Title** — earned achievements and their buffs.
- **BalanceConfig** — single source of all tunable constants (EXP curve, multipliers,
  rank thresholds, drop rates).

## 11. Build phases

1. **Phase 1 — The honest core:** PWA shell, Status Window, daily quests
   (checkbox + timer), EXP/level/stat engine, streaks/consistency multiplier,
   Penalty Zone, local storage (Dexie). *Usable app on its own.*
2. **Phase 2 — Game layer:** Gates, turn-based combat, loot, inventory, shadow army.
3. **Phase 3 — Intelligence & sync:** DeepSeek AI quests via Edge Function, Supabase
   sync/login, push notifications.
4. **Phase 4 — Endgame & polish:** class tier-ups, titles, endless/prestige mode,
   animations and full Solo Leveling aesthetic polish.

## 12. Open questions / future

- Exact balance constants need real-world tuning after Phase 1 use.
- HealthKit / step-count auto-tracking is native-only; out of scope for the PWA v1
  (manual logging instead).
- Possible later "graduation" to a native iOS wrapper reusing the same UI.
