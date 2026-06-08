# Solo System — Visual Overhaul V1 (Battle Stage) Design Spec

**Date:** 2026-06-08
**Status:** Approved (pending implementation plan)
**Builds on:** Phases 1, 2a, 2b, 2c (all merged). App at `solo-system/`.

## 1. Summary

Bring the Battle screen to life with **code-drawn SVG "holographic neon" characters** and
**Framer Motion animations**: a battle stage with positioned spots, a distinct sprite and
attack animation for every enemy, the hunter holding their equipped weapon with a
per-weapon attack motion, deployed shadows fighting alongside, and hit/damage animations
with floating damage numbers in both directions. This is **V1** of a two-slice visual
overhaul; **V2** (full armor/accessory paper-doll on the hunter, on Status + battle) is a
later slice.

### Core principle (hard constraint)

This is a **pure presentation layer**. It reads the existing `combat` state the engine
already produces and the existing `save` (equipment, shadows) — and changes **no** combat
math, engine, store, domain, or persistence code. The tested gameplay (122 tests) must
stay green and untouched. No schema change.

## 2. Non-goals (V1)

- No armor/accessory paper-doll layering on the hunter (V2).
- No change to combat logic, balance, RNG, or stored data.
- No bitmap/pixel sprites or external art assets — everything is code-drawn SVG.
- No new enemies/weapons beyond those already in `enemyLibrary` / `itemLibrary`.

## 3. Art style

Holographic neon constructs: glowing vector figures with luminous outlines on the dark
background, matching the existing System UI. Hunter = cyan (`system.glow`); enemies tinted
by kind (goblin green, imp purple, wolf grey, orc green, bosses red/`system.danger`);
shadows = dark violet/black silhouettes with a faint glow. Each sprite is a self-contained
SVG React component sized via a `size` prop and animatable via Framer Motion.

## 4. Battle stage ("the map") + positioned spots

A `BattleStage` component renders the fight as a staged scene above the existing
HP bars / log / action buttons:

- **Backdrop:** a stylized ground line + horizon, tinted by the gate's `rankTier`.
- **Hunter zone (lower-left):** the **hunter** sprite (prominent) in its spot, with the
  **deployed shadow squad** ranked behind/beside it as smaller `ShadowSprite`s.
- **Enemy zone (upper-right):** the **current enemy** (`combat.enemies[currentEnemyIndex]`)
  large in the active spot; the **remaining wave** (enemies after the current index) shown
  as smaller, dimmed queued sprites behind it; already-defeated enemies are gone.
- Hunter and current enemy each keep their `CombatantBar` (HP/MP) anchored near their spot;
  small queued/shadow figures show a slim HP pip or none.

### 4.1 Designed for maximum capacity (responsive)

The stage must not break at the largest counts:
- **Enemy queue:** lay out for the active enemy + a queued wave; support up to **6** enemy
  figures total (current largest gate is 4; 6 gives headroom). Beyond that, the queue
  scales down / shows a "+N" marker.
- **Shadow squad:** the deploy cap is `3 + floor(level/10)` and **grows with level** (13+
  at high levels). The squad area is a **responsive ranked formation**: figure size scales
  down as the count rises, wraps into rows, and shows a **"+N" overflow badge** beyond a
  comfortable on-screen count (target: cleanly show up to ~8, overflow past that). No fixed
  slot count.
- Everything must fit the mobile viewport (≈375px wide) without horizontal overflow.

## 5. Sprites (code-drawn SVG)

- **HunterSprite** — cyan figure (head, torso, limbs) holding the equipped `WeaponSprite`;
  idle breathing float.
- **EnemySprite** — a `spriteRegistry` maps each `enemyLibrary` id to a distinct creature
  SVG: `goblin`, `imp`, `wolf`, `orc`, `gate_e_boss` (Gatekeeper), `gate_d_boss` (Stone
  Golem), each tinted/shaped to read as that creature; a **fallback** sprite for unknown
  ids.
- **WeaponSprite** — maps each weapon `baseId` (`rusted-blade`, `hunters-dagger`,
  `shadow-edge`, …) to a vector weapon shape; a default "unarmed" (no weapon equipped).
- **ShadowSprite** — a dark-violet silhouette used for the deployed squad and the ARISE
  overlay; can take a source-enemy hint for subtle shape variation (optional; a generic
  shadow is acceptable).

## 6. Animations (Framer Motion)

- **Idle:** gentle float/pulse on hunter and current enemy.
- **Per-enemy attack:** each enemy id has its own attack motion (e.g. goblin quick
  stab-lunge, wolf pounce, imp dive, orc heavy overhead, golem slam, gatekeeper
  guard-break), defined in an `enemyAttacks` map keyed by id (fallback = a generic lunge).
  The **heavy move** (engine logs "unleashes a heavy strike") plays a larger, red-tinted
  variant.
- **Per-weapon attack:** the hunter's basic Attack motion is chosen by equipped weapon
  `baseId` via a `weaponAttacks` map (e.g. blade arc-slash, dagger fast double-stab,
  shadow-edge phantom slash; unarmed = jab). Fallback for unknown ids.
- **Defend:** a shield-glow flares around the hunter.
- **Skill:** a cyan energy burst from the hunter (one shared effect in V1).
- **Hit / damage (both directions):** the struck fighter shakes + flashes red and a
  **floating damage number** rises off it. **Crit** = larger/gold number + stronger shake;
  **dodge/miss** = sidestep + "MISS". Applies whether the player hits the enemy or the
  player/enemy takes damage.
- **Shadow Strike:** spectral slashes / fleeting shadow figures streak across the current
  enemy.
- **Defeat:** the loser dissolves/fades out. The existing win/lose overlay (gold, loot,
  ARISE list) remains and sits above the stage.

## 7. How animations are driven (no domain change)

`BattleScreen` (or a `useCombatAnimations` hook) keeps the **previous `combat` snapshot**
in a `useRef` and, on each `combat` change, **diffs** to emit animation events:
- **HP decrease** on a fighter → that fighter plays the hit/flash/shake and floats the
  delta as a damage number (enemy delta and player delta computed separately each round).
- **New log lines** since the last snapshot are scanned for cues: contains `"(CRIT)"` →
  crit styling; `"dodged"` → MISS; `"shadows strike"` → Shadow Strike effect; `"unleashes
  a heavy strike"` → enemy heavy variant; `"used "` → skill burst; the acting side (player
  vs enemy) is inferred from the line / HP deltas to choose which attack motion to play.
- **`currentEnemyIndex` increases** → current enemy defeat-dissolve, then the next queued
  enemy advances into the active spot.
- **`phase` → 'won' / 'lost'** → final defeat animation + existing overlay.
- The action buttons remain disabled unless `phase === 'player'` (unchanged). Animations
  are non-blocking (fire-and-forget); gameplay state is never gated on animation timing.

This relies only on data already present: `combat.player`, `combat.enemies`,
`combat.currentEnemyIndex`, `combat.log`, `combat.phase`, `combat.shadowPower`, and from
the store `save.equipment.weapon`, `save.shadows`, `save.deployedShadowIds`.

## 8. New / changed files

```
src/components/sprites/HunterSprite.tsx     (new)
src/components/sprites/EnemySprite.tsx       (new, per-id variants)
src/components/sprites/WeaponSprite.tsx      (new, per-baseId variants)
src/components/sprites/ShadowSprite.tsx      (new)
src/components/sprites/spriteRegistry.ts     (new) enemy id -> sprite, weapon id -> sprite, fallbacks
src/components/battle/BattleStage.tsx        (new) the staged scene + spots + responsive squads
src/components/battle/FloatingDamage.tsx     (new) animated damage/MISS number
src/components/battle/animations.ts          (new) enemyAttacks + weaponAttacks motion maps, shared variants
src/components/battle/useCombatAnimations.ts (new) diffs combat snapshots -> animation events
src/screens/BattleScreen.tsx                 (modify) mount BattleStage above bars/log/actions; wire the hook
```
No changes to `domain/`, `store/`, `persistence/`, or any balance/config.

## 9. Testing

Animations are inherently visual — verified in the live preview, not unit tests. Automated
coverage focuses on the deterministic, logic-bearing pieces:
- `spriteRegistry`: every `enemyLibrary` id resolves to a sprite component; unknown id →
  fallback; every `itemLibrary` weapon `baseId` resolves to a weapon sprite; no weapon →
  unarmed.
- `FloatingDamage`: renders its numeric value; renders "MISS" / crit styling per props.
- `useCombatAnimations` (pure diff function extracted and tested): given a previous and
  next `combat` snapshot, returns the expected events (enemy hit for delta N, crit flag
  from a "(CRIT)" log line, shadow-strike flag, defeat on index advance, win/lose on
  phase). This is the one piece with real logic, so it gets thorough unit tests.
- `BattleStage`: renders the hunter + current enemy + the right number of queued/shadow
  figures (including the "+N" overflow at high counts) from a given combat/save state.
- Full existing suite stays green; production build clean; **in-browser verification** of
  the actual animations and the stage at low and high (many-shadow) counts.

## 10. Definition of done (V1)

- The Battle screen shows a staged scene: hunter (holding equipped weapon) + deployed
  shadow squad vs the current enemy with the remaining wave queued behind.
- Every enemy renders a distinct sprite and plays its own attack animation (heavy variant
  on heavy turns); the hunter's attack motion matches the equipped weapon (or unarmed).
- Hits shake/flash the target and float a damage number (crit/MISS variants) in both
  directions; Shadow Strike, skill, defend, and defeat animations play.
- The stage is responsive and intact at maximum capacity (full enemy wave + a large shadow
  squad with "+N" overflow) on a ~375px mobile viewport.
- No gameplay/domain/store change; full test suite green; build clean; verified in-browser.

## 11. Out of scope (V2 and later)

- V2: armor + accessory paper-doll layered on the hunter (Status + battle), rarity auras,
  equipped-look updates as you change gear.
- Later: parallax/particle backgrounds, idle ambient creatures, per-skill distinct effects,
  sound.
