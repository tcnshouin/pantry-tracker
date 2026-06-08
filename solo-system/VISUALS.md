# Solo System — Visual Direction (VISUALS.md)

This document captures the **target art direction** for the game's characters and combat,
the **reference sprites** provided, how real sprite sheets would be **integrated**, and the
honest **constraints** around getting there. It is the source of truth for visual work
(supersedes the interim "holographic neon SVG" look once real sprites are wired in).

---

## 1. Vision

Move from the current **code-drawn holographic-neon SVG** fighters (Visual V1, shipped) to
**realistic anime pixel-art sprites** in the style of the reference sheets below — a
detailed humanoid hunter and enemies with multi-frame idle/attack/hit animations, weapon
trails, and slash FX. The UI chrome (System windows, cyan glow, dark theme) stays; only the
*characters* become sprite-based.

The two styles can co-exist during the transition: the battle renderer uses a real sprite
sheet for any character that has one, and **falls back to the existing SVG sprite** for any
that don't yet.

---

## 2. Reference assets (provided)

> These are external, fan-made sprite sheets. See **§7 Licensing** before using them.

### Ref A — Sung Jin-Woo (single standing sprite, transparent PNG)
Black spiky hair, blue jacket over a dark shirt, dark trousers, sneakers. A clean,
full-body **idle/stand** pose. Good as the base for the **Hunter**.

### Ref B — "Sung Jin-Woo From Solo Leveling" sprite sheet (by Soulfire, commissioned by Erwen1)
Green-screen (`#00b140`-ish chroma) sheet with labelled animation rows:
- **Stand** (~5 frames, + a shadow/monarch alt form)
- **Run** (~8 frames)
- **Jump** (~6 frames)
- **Get Hit / Fall** (~6 frames)
- **Attack 1** (~6), **Attack 2** (~6), **Attack 3** (~8), **Attack 4** (~8),
  **Attack 5** (~6), **Attack 6** (~8), **Attack 7** (~6) — dagger melee with red/white
  slash trails.
This is the **Hunter** animation set.

### Ref C — "Kasumi Mikan" sprite sheet (by Soulfire)
Grey-bg sheet, blue-haired character in a suit with a katana. Rows: Stand, Crouch, Run,
Dash, Air/Stand Guard, Power Charge, Jump, Drinking, Win 1/2, Attack 1–6, Air Attacks 1–4,
Super 1/2, Hurt. Note: **this character is from a different IP (not Solo Leveling)** — see
§6 about whether to use it as an enemy.

---

## 3. Style targets (for any new/derived sprites)

- **Resolution:** pixel-art, roughly **64–96 px tall** per character frame (the refs are in
  this range), integer-scaled up (`image-rendering: pixelated`) so they stay crisp.
- **Palette:** desaturated, high-contrast anime shading; the Hunter leans blue/black to
  match the System theme; enemies keep their kind tints (goblin green, imp purple, etc.).
- **FX:** weapon slash trails (white→red), impact flashes, after-images on dashes — these
  exist in the refs and should be preserved.
- **Silhouette first:** each character must read instantly at small size.

---

## 4. Sprite-sheet integration (engineering)

Real sprites are **transparent PNG sheets** of equal-size frames. Plan:

1. **Asset location:** `solo-system/public/sprites/<character>/<sheet>.png` plus a JSON
   descriptor `<character>.json` declaring frame size and per-animation frame ranges, e.g.
   ```json
   {
     "frameWidth": 96, "frameHeight": 96,
     "animations": {
       "idle":   { "row": 0, "frames": 5, "fps": 6,  "loop": true },
       "attack1":{ "row": 4, "frames": 6, "fps": 14, "loop": false },
       "hit":    { "row": 3, "frames": 6, "fps": 12, "loop": false },
       "run":    { "row": 1, "frames": 8, "fps": 12, "loop": true }
     }
   }
   ```
   (Green/grey backgrounds must be **chroma-keyed to transparency** first — a one-time
   preprocessing step, not done at runtime.)
2. **`AnimatedSprite` component:** renders one sheet, plays a named animation via CSS
   `steps()` background-position animation (cheap, GPU-friendly) or a small `requestAnimation
   Frame` loop. Props: `{ sheet, descriptor, animation, onComplete? }`.
3. **`spriteRegistry` upgrade:** map a character id → `{ kind: 'sheet', src, descriptor }`
   OR `{ kind: 'svg', component }`. `BattleStage` renders a sheet sprite when present, else
   the current SVG. This makes the migration incremental.
4. **Driving from combat (no engine change):** the existing `useCombatAnimations` event
   batch already tells us what happened. Map events → sprite animations:
   | Combat event | Hunter anim | Enemy anim |
   |---|---|---|
   | player attack / `playerSkill` | `attack1..N` (cycle/skill-specific) | — |
   | `playerHit` (player took damage) | `hit` | — |
   | enemy attack (`enemyHit`/`enemyHeavy`) | — | `attack1` (heavy = a bigger one) |
   | enemy took damage | — | `hit` |
   | `defend` | `guard` | — |
   | defeat (`won`/`lost`/`enemyAdvance`) | `fall` | `fall`/fade |
   | idle (default) | `idle` | `idle` |
   This stays a **pure presentation layer** — combat math is untouched, exactly like V1.
5. **Performance:** preload sheets on entering a gate; keep total sheet weight modest
   (a few hundred KB); pixel-art compresses well.

---

## 5. Character ↔ sprite mapping

| Game character | Source | Status |
|---|---|---|
| **Hunter** (player) | Ref A / Ref B (Jin-Woo) | sprite available (once files added) |
| Enemy `goblin`, `imp`, `wolf`, `orc` | — | **no sprite** → keep SVG / need assets |
| Boss `gate_e_boss` (Gatekeeper), `gate_d_boss` (Stone Golem) | — | **no sprite** → keep SVG / need assets |
| Shadows (deployed squad) | could derive from a darkened Hunter/enemy sheet | optional |
| Possible humanoid enemy/NPC | Ref C (Mikan) | available but off-IP (see §6) |

**Coverage gap:** the refs cover the **Hunter** well and one extra humanoid. The 6 bestiary
enemies have **no matching sprites**. Realistic enemies need either (a) sourced sprite packs
per creature, or (b) commissioned/AI-generated art. Until then, enemies stay on the SVG
renderer (the fallback path above) while the Hunter goes sprite-based.

---

## 6. Notes on the Mikan sprite (Ref C)

It's a polished sheet, but the character is **not from Solo Leveling** (different franchise).
Using it as a generic enemy would clash with the theme and compound the licensing concern
(§7). Recommendation: **don't** use it as-is; if we want a humanoid hunter-style enemy,
source/commission a thematically-fitting sprite instead.

---

## 7. Licensing & attribution (READ THIS)

These sheets are **fan-made, commissioned work** (Ref B: "Made by Soulfire, commissioned by
Erwen1"; Ref C: "By Soulfire"). That has real implications:

- **Solo Leveling** itself is copyrighted (D&C Media / Redice Studio / Chugong). Fan sprites
  of Jin-Woo are derivative works.
- Using someone's **commissioned** sprite sheet without permission isn't ours to grant —
  even with credit. For a **private, personal, non-distributed** build it's a low-risk gray
  area; for **anything public/shared/published** (App Store, a public URL, monetization)
  it is **not safe** without explicit permission/licensing.
- If we use them at all, we **credit the artists** in-app (a small "Sprites: Soulfire"
  credit) and keep it private.
- The safe long-term path for a shippable product is **original or properly-licensed
  (CC0/commissioned-for-us) art**.

I (the assistant) **cannot originate** pixel-art sprite sheets, and I **cannot pull the
images out of this chat into files**. To use them, the actual PNG files must be saved into
the repo by you (see §8).

---

## 8. What's needed to proceed (asset hand-off)

To wire real sprites in, drop the files here (then I can build the renderer around them):
```
solo-system/public/sprites/hunter/sheet.png      # the Jin-Woo sheet (chroma-keyed to transparent)
solo-system/public/sprites/hunter/hunter.json    # frame size + animation ranges (I can author this)
```
- If the sheet still has the green/grey background, note it — it must be made transparent
  first (I can describe the step; it's a quick edit in an image tool or a script).
- Tell me the **frame width/height** and how many frames per row, or I'll infer from the
  sheet once it's in the repo.

---

## 9. Suggested phased rollout

- **Visual V2-realistic — Hunter sprite:** add `AnimatedSprite` + the registry fallback;
  render the **Hunter** from the real sheet (idle + the attack/hit/defend/fall anims driven
  by combat events). Enemies stay SVG. Ship + verify.
- **Visual V3 — Enemy sprites:** as creature sprite assets are sourced, swap each enemy from
  SVG to sheet via the same registry — no engine changes.
- **Equipped-gear paper-doll (original Visual V2):** revisit after sprites; with full-body
  sprites, "equipped weapon on character" may come from the sheet's weapon rather than an
  overlay.

---

## 10. Honest summary

- The look you want = **real pixel-art sprite sheets**, and the refs are a perfect template
  for the **Hunter**.
- I can **build the whole sprite-rendering system** (slicing, animation, combat-event
  mapping, registry + SVG fallback) — that's squarely in scope.
- I **cannot draw** the sprites or extract them from chat. You provide the PNG files; the
  bestiary enemies will need their own sourced art before they can go realistic.
- **Licensing:** fine for a private personal build with credit; **not** safe for public
  release without permission. Plan for original/licensed art if this ever ships publicly.
