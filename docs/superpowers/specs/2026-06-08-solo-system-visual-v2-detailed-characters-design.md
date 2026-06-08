# Solo System — Visual V2 (Detailed Vector Characters) Design Spec

**Date:** 2026-06-08
**Status:** Approved (pending implementation plan)
**Builds on:** Visual V1 (battle stage + holographic SVG sprites), merged.

## 1. Summary

Upgrade the battle characters from glowing **outline** SVGs to **detailed, filled, shaded,
colored anime-style** vector characters — a Sung Jin-Woo-inspired hunter and richer versions
of all six enemies — plus a blue **sword-slash FX** on the hunter's attacks. Inspired by the
provided fan sprite references, but drawn entirely in code (vector, not pixel-art).

This is a **drop-in art upgrade**: the existing sprite components keep their exact props and
interfaces, so the `BattleStage`, `spriteRegistry`, and all V1 animation wiring (attack
lunges, hit-shake/flash, floating damage, shadow strike, defeat) continue to work unchanged.

### Hard constraint
Pure presentation. NO change to `domain/`, `store/`, `persistence/`, engine, balance, or
schema. The full existing test suite stays green. The only new behavior is visual.

## 2. Non-goals
- No pixel-art / bitmap sprites, no external image assets, no sprite-sheet pipeline (that's
  the separate, asset-dependent path in `VISUALS.md` — not this slice).
- No change to component prop signatures (`HunterSprite`, `EnemySprite`, `WeaponSprite`,
  `ShadowSprite` keep their current props).
- No gameplay, combat-math, or data changes.
- No equipped armor/accessory paper-doll (future).

## 3. Visual style
- **Filled + shaded vectors:** layered SVG shapes with flat fills plus 1–2 shade tones
  (darker shapes / linearGradients) for depth; clean outlines; a subtle rim-glow retained
  so characters still fit the dark "System" UI.
- **Readable at battle size** (~96px) and crisp at any scale (vector).
- Hunter palette leans blue/black (Jin-Woo); enemies keep kind-tints but now as full
  shaded bodies, not just colored outlines.

## 4. The hunter (`HunterSprite`)
Jin-Woo-inspired: **black spiky hair**, **blue jacket** over a dark shirt, dark trousers,
boots, a determined face (eyes/brow). Holds the equipped `WeaponSprite` in-hand. Keeps the
idle breathing float and the existing attack lunge. Same props: `{ size, weaponBaseId?, className? }`.

## 5. The six enemies (`EnemySprite`, switch by id)
Each a distinct, shaded, colored body (same prop `{ enemyId, size, className? }`):
- **goblin** — green skin, hunched, ragged loincloth, big ears, crude dagger.
- **imp** — purple body, bat-wings, horns, glowing eyes.
- **wolf** — grey furred quadruped, bristled back, fangs, tail.
- **orc** — bulky olive body, tusks, shoulder armor, club/fist.
- **gate_e_boss** (Gatekeeper) — tall red-armored knight, helm, greatsword.
- **gate_d_boss** (Stone Golem) — massive cracked-rock body with a glowing core; use a
  distinct **stone/grey** tint (not the Gatekeeper's red) so the two bosses read apart —
  update its `enemyTint` accordingly.
- `default` fallback — a shaded red wraith.

## 6. Weapons (`WeaponSprite`)
Redraw the three weapons with more detail (blade + guard + grip shading): `rusted-blade`
(worn straight sword), `hunters-dagger` (short leaf blade), `shadow-edge` (curved glowing
blade); `null`/unknown → unarmed. Same prop `{ baseId, size, className? }`.

## 7. Slash FX (`SlashFx`, new)
A lightweight overlay component that draws a **blue crescent arc** sweeping across a target,
animated with Framer Motion (quick scale/opacity/rotate sweep, ~300ms). `BattleStage` mounts
it over the **current enemy** when the player attacks **or uses a damage skill** — i.e. on
the same condition that already sets `triggerHunterAnim` in BattleStage's per-batch effect
(`enemyHit` / `playerSkill` events; no new combat data). Enemies keep their brief impact
flash (already present from V1). A faint slash on heavy enemy hits is explicitly **optional
and NOT part of the definition of done** — skip unless trivial.

## 8. Integration points (minimal)
- `HunterSprite.tsx`, `EnemySprite.tsx`, `WeaponSprite.tsx` — internals redrawn; **interfaces
  unchanged**.
- `ShadowSprite.tsx` — optionally given a touch more shape (still a dark hooded silhouette);
  interface unchanged.
- `spriteRegistry.ts` — tints may be tweaked for the shaded look; exported API unchanged.
- `SlashFx.tsx` — new component.
- `BattleStage.tsx` — mount `SlashFx` on the enemy when a player-attack event fires (reuse
  the existing per-batch effect; add a transient `slash` state cleared via the existing timer
  cleanup pattern). No prop changes to BattleStage.
- No other files change. `BattleScreen` untouched.

## 9. Testing
- Existing sprite tests (every enemy id + weapon baseId renders an `<svg>`; unknown →
  fallback) MUST stay green — the redraw keeps the same render contract.
- Add `SlashFx.test.tsx`: it renders (an SVG/motion element) given its props.
- Add (or extend) a `BattleStage` test asserting a slash overlay appears after a
  player-attack batch (or keep it light if hard to assert; the static-render tests must
  still pass).
- Full suite green; production build clean; **in-browser verification** of the new
  characters + slash FX at mobile width (enter a gate, attack, watch the hunter slash and
  enemies react).

## 10. Definition of done
- Hunter and all six enemies render as detailed, shaded, colored anime-style vectors with
  the hunter holding its weapon; weapons redrawn.
- A blue slash arc sweeps the enemy on the hunter's attack; hit/defeat/shadow-strike/float-
  damage animations from V1 still play.
- No interface/prop changes broke `BattleStage`/registry; no domain/store/persistence change.
- Full test suite green; build clean; verified in-browser on a ~375px viewport.

## 11. Out of scope / later
- Real pixel-art sprite sheets (see `VISUALS.md` — needs user-supplied assets).
- Equipped armor/accessory drawn on the hunter; per-skill distinct FX; backgrounds; sound.
