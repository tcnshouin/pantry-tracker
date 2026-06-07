# The System — Solo Leveling Self-Improvement App

A free, installable iPhone app (PWA) that gamifies real-life self-improvement using the
"System" from the *Solo Leveling* webtoon. You receive daily real-world quests with a
checkbox and a countdown timer. Completing them — **consistently** — earns EXP, levels
you up, and grows your five stats. Miss a quest and you enter the Penalty Zone.

This repository contains **Phase 1 (the honest core)** and **Phase 2a (combat & gates)**.
Loot/inventory, the shadow army, AI quests, cloud sync, and push notifications are planned
for later phases (see below).

## Core principle

Completing a real-life quest is the **only** way to gain EXP and stat progress. There is
no other path to power. The combat layer is a reward for real effort, never a substitute
for it — fighting in Gates yields gold and clears, but **never** EXP or stat-XP.

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

## Combat & Gates (Phase 2a)

Your hunter's combat power derives **entirely from your real stats**: STR → attack,
VIT → HP, AGI → turn order, INT → skill power (MP + skill scaling), PER → crit & dodge.

- **Gates** are dungeons: a wave of enemies, then a boss. HP/MP carry across the whole
  run — no free heals — so it's a war of attrition.
- **Entering costs 1 Gate Key** (earned only from completing real quests). Clearing a
  gate grants **gold** and unlocks the next gate. Losing or fleeing grants nothing, and
  there is **no real-life penalty** — the key was simply spent on entry.
- **Turn-based actions:** Attack, Defend (halve the next hit, restore some MP), and MP
  **skills** that unlock as you level: Power Strike (Lv1), Mend (Lv3), Focus (Lv5),
  Weaken (Lv8).
- A level-1 hunter with no allocated stats will lose early gates — that's the point.
  Build real habits, allocate stat points, and come back stronger.
- All combat constants live in **`src/domain/balanceConfig.ts` → `combat`** (formulas,
  crit/dodge caps, skill costs, enemy heavy-move cadence). Enemies and gates are data in
  `src/data/enemyLibrary.ts` and `src/data/gateLibrary.ts`.

## Loot & Inventory (Phase 2b)

Clearing a Gate drops gear, which you manage on the **Items** screen.

- **Drops:** the boss always drops one item on a win, plus a chance for a bonus drop;
  rarity (Common → Uncommon → Rare → Epic → Legendary) is weighted by the gate's tier.
  Items use templated bases with rarity-scaled rolled values and extra affixes at higher
  rarities. Losing a gate drops nothing.
- **Equipment (3 slots — Weapon / Armor / Accessory):** equipped gear does two things —
  it raises your hunter's combat stats (ATK/HP/DEF/crit/skill power) in the next gate,
  AND it multiplies the **EXP/stat-XP you earn from completing real quests**. Those
  reward multipliers fire ONLY on a real quest completion — combat never grants real
  progression.
- **Enhancement:** spend gold (from gate clears) to enhance an item (+1, +2, …), growing
  its bonuses at a rising cost — a long-term sink.
- Loot constants live in **`src/domain/balanceConfig.ts` → `loot`** (rarity weights, bonus
  ranges, affix counts, drop chance, enhance costs). Base items are in
  `src/data/itemLibrary.ts`.

## Shadow Army (Phase 2c)

ARISE — raise the fallen to fight beside you. Managed on the **Shadows** screen.

- **ARISE:** on a gate win, each defeated enemy has a chance to be raised as a shadow
  (the boss is more likely); raised shadows appear in the win overlay ("ARISE!") and join
  your army. Losing or fleeing raises nothing. A shadow's power derives from its source
  enemy (bosses make far stronger shadows).
- **Shadow Strike:** you deploy a capped squad (the cap rises with your level). Deployed
  shadows deal a combined Shadow Strike to the enemy each combat round — it shows in the
  combat log and can finish enemies. Only deployed shadows contribute.
- Like everything in the game layer, shadows **never** grant real EXP/stat-XP — they only
  help you win gates. Shadow constants live in **`src/domain/balanceConfig.ts` → `shadows`**.

## Navigation

The app uses a **top bar with a hamburger (☰)** that opens a slide-in **sidebar drawer**
listing every destination (Home, Status, Gates, Items, Shadows, Log). It closes when you
pick one.

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

## Done so far

- **Phase 1:** the honest core — daily quests, leveling, 5 stats, streaks, Penalty Zone,
  local persistence, PWA.
- **Phase 2a:** turn-based combat + Gates.
- **Phase 2b:** loot drops, item rarities, inventory, equipment buffs, enhancement.
- **Phase 2c:** ARISE shadow army + sidebar navigation (this slice). **Phase 2 complete.**

## Planned later

- **Phase 3:** AI-generated personalized quests (DeepSeek), Supabase cloud sync + login,
  push notifications.
- **Phase 4:** class tier-up boss dungeons, titles, endless/prestige mode, full polish.
