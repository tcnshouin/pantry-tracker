# Solo System — Visual V2 (Detailed Vector Characters) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redraw the battle characters as detailed, shaded, colored anime-style vector art (Jin-Woo-inspired hunter + 6 enemies + richer weapons) and add a blue sword-slash FX on the hunter's attacks — keeping every component interface identical so it's a drop-in upgrade.

**Architecture:** Internal SVG redraws of the existing sprite components (same props), one new `SlashFx` overlay component, and a minimal `BattleStage` hook to mount the slash on player attacks. Pure presentation — no domain/store/persistence/engine change.

**Tech Stack:** Existing — React + TS + Tailwind + framer-motion + Vitest. No new deps.

**Hard constraint:** Pure presentation. Only files under `src/components/sprites/` and `src/components/battle/` change. Component props are UNCHANGED. The full existing test suite (141) stays green. NO code comments (repo rule).

**Working dir:** `solo-system/` in worktree `/Users/andreupaz/sololevelling/.claude/worktrees/solo-visual-v2`. Paths relative to `solo-system/`. **Run `npm install` first.** Tests `npx vitest run`; build `npm run build`; lint not required (pre-existing lint debt exists — just don't add NEW errors in changed files).

## Art direction (all sprites)
Each sprite stays a React component returning an `<svg>` (root inside the existing wrapping element) with the SAME props. Move from outline-only to **filled + shaded**: flat fills for base colors, 1–2 darker shapes or a `linearGradient` per region for shading, clean darker outlines, and a subtle outer glow (`filter: drop-shadow(0 0 4px <tint>66)`) so it still fits the dark System UI. Keep silhouettes readable at ~96px. Pixel-art is NOT the goal — clean detailed vector is.

---

## Task 1: Redraw the six enemies + golem tint

**Files:** modify `src/components/sprites/EnemySprite.tsx`, `src/components/sprites/spriteRegistry.ts`. (Existing test `src/components/sprites/spriteRegistry.test.tsx` must keep passing — do not change it.)

- [ ] **Step 1: Update the Stone Golem tint in BOTH places.** The golem color `#ef4444` appears (a) in the `ENEMY_TINTS` record for `gate_d_boss` in `spriteRegistry.ts` AND (b) hard-coded inside the `StoneGolem` sub-function in `EnemySprite.tsx`. Change BOTH to a stone grey (e.g. `#a8a29e`) so the golem reads apart from the red Gatekeeper (changing only the registry has no visual effect because the component hard-codes its color). Leave `HUNTER_TINT`, `SHADOW_TINT`, the other enemy tints, and all exported signatures unchanged. (When you redraw `StoneGolem` in Step 3, use this stone grey as its base.)

- [ ] **Step 2: Run the existing sprite test to confirm baseline still green**

Run: `npx vitest run src/components/sprites/spriteRegistry.test.tsx`
Expected: PASS (it only checks an `<svg>` renders per id + fallback). Keep it green throughout.

- [ ] **Step 3: Redraw each enemy in `EnemySprite.tsx`** — keep the `switch (enemyId)` structure and the `{ enemyId, size, className? }` props; replace each case's SVG with a detailed, shaded, colored version. Each must remain a distinct, recognizable creature and keep an `<svg>` root. Art direction per id:
  - **goblin** — green skin (base + darker shade), hunched posture, ragged brown loincloth, large pointed ears, beady eyes, a small crude dagger.
  - **imp** — purple body, membranous bat-wings, two horns, thin tail, glowing eyes.
  - **wolf** — grey furred quadruped (4 legs), bristled back, snout with fangs, ears, tail; darker fur shading.
  - **orc** — bulky olive-green torso, tusks, heavy brow, a shoulder pauldron, a club or big fist.
  - **gate_e_boss** (Gatekeeper) — tall red-armored knight silhouette, helm with a slit/crest, pauldrons, a greatsword.
  - **gate_d_boss** (Stone Golem) — massive blocky cracked-rock body (stone grey per the new tint), heavy limbs, a glowing core in the chest.
  - **default** — a shaded red wraith/cloaked figure (fallback).
  Use base + shade shapes (or `<linearGradient>` defs with unique ids per case to avoid collisions) and a subtle glow. Sizes scale by the `size` prop (use a fixed `viewBox`, scale via width/height).

- [ ] **Step 4: Verify** — `npx vitest run` (all 141 pass, including the sprite render test) and `npm run build` clean.

- [ ] **Step 5: Commit**
```bash
git add src/components/sprites/EnemySprite.tsx src/components/sprites/spriteRegistry.ts
git commit -m "feat(solo-system): detailed shaded enemy sprites + distinct golem tint"
```

---

## Task 2: Redraw the hunter, weapons, and shadow

**Files:** modify `src/components/sprites/HunterSprite.tsx`, `src/components/sprites/WeaponSprite.tsx`, `src/components/sprites/ShadowSprite.tsx`. (Keep all props and the `<svg>` render contract; the existing weapon test in `spriteRegistry.test.tsx` must stay green.)

- [ ] **Step 1: Redraw `HunterSprite`** — keep `{ size, weaponBaseId?, className? }` and keep rendering `<WeaponSprite baseId={weaponBaseId ?? null} ... />` positioned at the hand. New look (Jin-Woo-inspired): **black spiky hair** (layered jagged shapes), a face with eyes/brow, a **blue jacket** (base blue + darker shade panels + collar) over a dark shirt, dark trousers, boots; cyan rim-glow retained. Keep the idle breathing float if present.

- [ ] **Step 2: Redraw `WeaponSprite`** — keep `{ baseId, size, className? }` and the `switch (baseId)`. Add detail: `rusted-blade` (worn straight steel blade + crossguard + wrapped grip, slight rust tint), `hunters-dagger` (short leaf-shaped blade + small guard), `shadow-edge` (curved blade with a cyan glow/energy edge), `default`/`null` → unarmed (faint fist glyph). Keep an `<svg>` root for every case (the test renders each weapon baseId + null).

- [ ] **Step 3: Polish `ShadowSprite`** — keep `{ size, className? }`; a dark hooded humanoid silhouette with a faint violet glow and two glowing eye dots (slightly more shape than V1). Still clearly a "shadow soldier."

- [ ] **Step 4: Verify** — `npx vitest run` (all green; weapon/sprite render tests included) + `npm run build` clean.

- [ ] **Step 5: Commit**
```bash
git add src/components/sprites/HunterSprite.tsx src/components/sprites/WeaponSprite.tsx src/components/sprites/ShadowSprite.tsx
git commit -m "feat(solo-system): detailed hunter, weapons, and shadow sprites"
```

---

## Task 3: Slash FX + mount on player attack

**Files:** create `src/components/battle/SlashFx.tsx`, `src/components/battle/SlashFx.test.tsx`; modify `src/components/battle/BattleStage.tsx`.

- [ ] **Step 1: Failing test** `src/components/battle/SlashFx.test.tsx`:
```tsx
import { render } from '@testing-library/react'
import { SlashFx } from './SlashFx'

test('renders an svg slash arc', () => {
  const { container } = render(<SlashFx size={120} />)
  expect(container.querySelector('svg')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `SlashFx.tsx`** — props `{ size: number; className?: string }`. A framer-motion `motion.div` (absolute, `pointer-events-none`) containing an `<svg>` that draws a **blue crescent slash arc** (a thick curved `path` with a cyan→blue stroke + glow). Animate a quick sweep: `initial={{ rotate: -40, scale: 0.6, opacity: 0 }} animate={{ rotate: 25, scale: 1.1, opacity: [0, 1, 0] }} transition={{ duration: 0.35 }}`. Self-contained; no store imports.

- [ ] **Step 4: Run → PASS.**

- [ ] **Step 5: Mount in `BattleStage.tsx`.** In the existing per-batch `useEffect`, where `triggerHunterAnim` is set true for player-attack events (`enemyHit` / `playerSkill`), also set a new transient `slash` state to a fresh id (e.g. `setSlashId(n => n + 1)` plus `setShowSlash(true)`), and clear it with a `setTimeout(..., 400)` whose id is added to the SAME `timers` array used for cleanup (do not introduce an uncleared timer). Render `{showSlash && <SlashFx size={...} key={slashId} />}` positioned over the **current enemy** (inside the same wrapper that holds the enemy sprite / shadow overlay, mirroring the existing `shadowOverlay` placement). Keep the static render (batch.id 0) free of any slash. Do not change BattleStage's props or any other behavior.

- [ ] **Step 6: Verify** — `npx vitest run` (all green, incl. BattleStage's existing tests + the new SlashFx test) + `npm run build` clean.

- [ ] **Step 7: Commit**
```bash
git add src/components/battle/SlashFx.tsx src/components/battle/SlashFx.test.tsx src/components/battle/BattleStage.tsx
git commit -m "feat(solo-system): blue slash FX on hunter attacks"
```

---

## Task 4: README + final verification

**Files:** modify `README.md`

- [ ] **Step 1:** Update the "Battle visuals" section: characters are now **detailed shaded anime-style vectors** (Jin-Woo-inspired hunter + 6 distinct enemies) with a **blue slash FX** on attacks; still code-drawn (no assets) and pure presentation. (Leave the realistic-sprite-sheet path noted as the separate `VISUALS.md` direction.)

- [ ] **Step 2: Final verification** — `npx vitest run` and `npm run build`, both clean.

- [ ] **Step 3: Commit**
```bash
git add README.md
git commit -m "docs(solo-system): document detailed-character visuals (Visual V2)"
```

---

## Definition of done (Visual V2)
- Hunter and all six enemies render as detailed, shaded, colored anime-style vectors; hunter holds a redrawn weapon; Stone Golem reads as stone-grey (distinct from the red Gatekeeper).
- A blue slash arc sweeps the enemy on the hunter's attack/damage-skill; all V1 animations (hit/defeat/shadow-strike/floating damage) still play.
- No component prop changed; `BattleStage`/registry untouched structurally; no domain/store/persistence change.
- Full suite green; build clean; verified in-browser at ~375px (enter a gate, attack, watch the new art + slash).

## Out of scope
- Pixel-art sprite sheets (asset-dependent — see VISUALS.md), equipped armor/accessory paper-doll, backgrounds, sound.
