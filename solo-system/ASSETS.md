# Solo System — Sprite Asset Checklist (ASSETS.md)

This is the complete list of art assets the game can use, with exact technical requirements
so the files drop straight into the sprite system. You supply the PNGs; the app wires them
in and animates them, with the current code-drawn vector art as an automatic fallback for
anything not yet supplied (so you can fill these in gradually).

> Use **your own / commissioned / properly-licensed (e.g. CC0)** art. Don't ship someone
> else's commissioned sprites publicly without permission.

---

## 1. Technical requirements (apply to every sprite)

- **Format:** PNG with a **transparent background** (no green/grey screen).
- **Consistent size:** pick ONE frame size for a character and use it for all of that
  character's frames. A good target is **128–256 px tall** (e.g. 192×192). Keep the
  character roughly centered with **feet near the bottom** of the frame (consistent
  "ground line") so everyone stands on the same floor.
- **Facing:** draw the **hunter facing RIGHT** and **enemies facing LEFT** (so they oppose
  each other). If that's inconvenient, draw all facing one way and tell me — I can mirror
  enemies in code.
- **Style/scale consistency:** keep all characters the same art style and relative scale
  (a goblin shorter than the hunter, bosses bigger).

## 2. Delivery format — pick ONE (tell me which)

- **(A) Sprite sheet per animation** — one PNG containing all frames of an animation in a
  single horizontal row (or a grid). If you do this, tell me: **frame width, frame height,
  and number of frames** per sheet. Example: `hunter-attack.png` = 6 frames of 192×192 in a
  row (1152×192).
- **(B) Individual frames** — one PNG per frame, numbered: `idle_00.png, idle_01.png, …`.
  Simpler to make, slightly more files.

Either works. (A) is fewer files; (B) is easier if you're exporting frame-by-frame.

## 3. Animations needed per character

For each character, in priority order. **You don't need all of them** — we can ship with
just **idle** and add the rest later. Recommended set:

| Animation | Frames (suggested) | Loop? | Used when |
|---|---|---|---|
| **idle** (required) | 4–8 | yes | standing in battle |
| **attack** | 4–8 | no | this character strikes |
| **hit** | 2–4 | no | this character takes damage |
| **defeat** | 3–6 | no | this character dies/falls |

Optional extras for the **hunter only**: **defend** (guard pose) and **cast** (skill use).

**Minimum viable to look great:** `idle` + `attack` + `hit` for the hunter and each enemy.

## 4. The roster — every character the game references

### Hunter (the player) — most important
The game has class ranks **E → D → C → B → A → S → National → Monarch**. You mentioned a
"weak" vs "levelled-up" look — so the hunter can have multiple **appearance tiers** that
swap as you rank up. Decide how many tiers you want (each tier = its own full set of
animations):

- **1 tier** — one hunter look for the whole game (simplest).
- **3 tiers (recommended)** — e.g. **Novice** (E–D, scrappy), **Hunter** (C–A, geared up),
  **Monarch** (S+, powerful/dark aura).
- **More** — up to one per rank (8) if you're ambitious.

Each hunter tier needs: idle, attack, hit, defeat (+ optional defend/cast).

### Enemies — 6 creatures (each needs idle/attack/hit/defeat)
1. **goblin** — small green humanoid, crude weapon
2. **imp** — small winged purple demon
3. **wolf** ("Shadow Wolf") — grey four-legged beast
4. **orc** — big bulky brute, tusks
5. **gate_e_boss** ("Gatekeeper") — large armored boss
6. **gate_d_boss** ("Stone Golem") — massive rock boss

### Shadow soldier (your raised army)
- **shadow** — one dark/ghostly humanoid (idle, optional attack). Can be a recolored/
  silhouette version of a hunter or enemy. Shown in your squad beside the hunter and in the
  "ARISE" overlay.

## 5. Weapons (optional in battle)

The hunter currently "holds" a weapon. Two approaches:
- **Easiest:** bake the weapon into the hunter sprite (the hunter art just includes a
  sword). Then weapon *variety* is shown only on the Inventory cards, not on the battle
  sprite. (No separate weapon files needed for battle.)
- **Advanced (optional):** separate weapon PNGs overlaid at the hunter's hand — needs a
  defined hand position and is fiddly with full character art. Skip unless you specifically
  want the equipped weapon to change the battle sprite.

If you want weapon **icons** for the Inventory/Items screen (nice upgrade), provide small
square PNGs (e.g. 96×96) for: `rusted-blade`, `hunters-dagger`, `shadow-edge`.

## 6. Map / battle background

- **1 battle-stage background** (required for the "map" look): a wide image, roughly
  **1200×800** (it gets contained/cropped to the stage area; portrait-friendly is fine).
  Transparent or opaque both OK.
- **Optional per-tier backgrounds:** different stages for E-rank vs D-rank gates, named by
  rank. Start with one generic stage; add more later.

## 7. Folder + naming layout (where to put files)

Drop files under `solo-system/public/sprites/`:

```
public/sprites/
  hunter/
    novice/   idle.png  attack.png  hit.png  defeat.png        (sheet form, format A)
    hunter/   idle.png  attack.png  hit.png  defeat.png
    monarch/  idle.png  attack.png  hit.png  defeat.png
  enemies/
    goblin/        idle.png attack.png hit.png defeat.png
    imp/           ...
    wolf/          ...
    orc/           ...
    gate_e_boss/   ...
    gate_d_boss/   ...
  shadow/   idle.png  attack.png
  backgrounds/  stage.png   (optional: stage-e.png, stage-d.png)
  weapons/  rusted-blade.png  hunters-dagger.png  shadow-edge.png   (optional icons)
```
(For individual-frames format B, replace each `idle.png` with an `idle/` folder of numbered
frames.)

## 8. What I do once files arrive

- I build an `AnimatedSprite` component + a JSON descriptor per character (I author the
  JSON from the frame size/counts you give me) and a registry that renders a real sprite
  when present, **falling back to the existing vector art otherwise**.
- I map combat events to animations: idle by default, `attack` when this fighter strikes,
  `hit` on taking damage, `defeat` on death — no gameplay change (pure presentation).
- We can ship **incrementally**: drop in the hunter first, then enemies, then the
  background. Nothing breaks while assets are partial.

## 9. The absolute minimum to start (if you want the fastest win)

1. **Hunter:** `idle` + `attack` + `hit` (one tier).
2. **Goblin:** `idle` + `attack` + `hit`.
3. One **background**.

That alone makes the first gate look like a real game. Everything else can follow.
