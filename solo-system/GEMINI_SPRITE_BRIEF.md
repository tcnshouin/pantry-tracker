# Sprite Generation Brief — "Solo System" (READ FULLY BEFORE GENERATING)

You are generating 2D game character sprites for a mobile RPG called **Solo System** — a
Solo Leveling–inspired self-improvement game with a turn-based battle screen. Follow every
rule below exactly. When in doubt, prioritize **consistency** (size, style, ground line,
facing) over detail. Output transparent PNGs only.

---

## 0. The single most important rules (do not violate)

1. **Transparent background.** PNG with a real alpha channel. No white box, no checkerboard
   baked in, no colored screen.
2. **One canvas size per character, reused for EVERY frame of that character.** The character
   moves *inside* a fixed-size canvas; the canvas never changes size between frames. This is
   what keeps the animation from jittering.
3. **Feet on a fixed ground line.** In every frame, the character's feet sit at the same
   height — about **90% down the canvas** (leave a small gap below the feet). The character is
   **horizontally centered**. So when frames are stacked, the character stays planted and only
   the body animates.
4. **Facing direction is fixed per side:**
   - **Hunter (player) faces RIGHT.**
   - **All enemies and bosses face LEFT.**
   - The **shadow soldier faces RIGHT** (it fights on the hunter's side).
5. **Consistent art style across the whole set** — same line weight, same shading, same
   proportions, same palette logic. All characters must look like they belong in one game.

---

## 1. Art style

- **Style:** clean anime / "modern mobile RPG" look. Bold readable silhouette, soft cel
  shading, a subtle rim light. Think gacha-RPG battler sprites, not realistic, not pixel-art.
- **Lighting:** light from upper-left, soft shadow on the lower-right of forms.
- **Readability:** the character must read instantly at small size (it's shown ~100–200px on a
  phone). Strong silhouette first, detail second.
- **Theme palette:** the game UI is dark with **cyan/blue glowing "System" windows**. Heroes
  lean blue/black/silver. Enemies keep their natural creature colors (see roster). Avoid pure
  black outlines on black areas — keep edges readable on a dark background.
- **No text, no UI, no logos, no watermark, no ground shadow blob, no background scenery** in
  the character PNGs. Just the character on transparency.

---

## 2. Canvas sizes (use these exactly)

| Asset type | Canvas size (px) |
|---|---|
| Hunter (all 3 tiers) | **256 × 256** |
| Regular enemies (goblin, imp, wolf, orc) | **256 × 256** |
| Bosses (gate_e_boss, gate_d_boss) | **384 × 384** |
| Shadow soldier | **256 × 256** |
| Weapon icons (optional) | **96 × 96** |
| Background | **1280 × 800** |

Relative scale within those canvases: goblin/imp are **smaller** than the hunter; wolf is
low and wide; orc is **bigger/bulkier** than the hunter; bosses fill most of their larger
canvas.

---

## 3. Delivery format (preferred)

Deliver **individual numbered frames**, one PNG per frame:

```
<animation>_<NN>.png      e.g.  idle_00.png, idle_01.png, idle_02.png ...
```

- Numbering starts at **00**, zero-padded to 2 digits.
- All frames of one character are the **same canvas size**.
- Group each character's files in its own folder (see §7).

> A single horizontal **sprite strip** per animation (all frames in one row, equal cells) is
> also acceptable — if you do that, state the **frame width, frame height, and frame count**
> for each strip. Individual frames are preferred because they're foolproof.

---

## 4. Animations — what each one means

Every character uses the same animation vocabulary. Frame counts are specified per character
in §5/§6. Animation timing/notes:

- **idle** — loops forever. Gentle breathing / weapon ready / hover. Frame 0 must blend back
  into the last frame (seamless loop). This is the **only required animation** — a character
  with just `idle` already works in-game.
- **attack** — plays once when this character strikes. Arc: **anticipation → wind-up →
  strike (the big impact frame) → recovery**. The impact frame should be the most extended,
  highest-energy pose.
- **hit** — plays once when this character takes damage. A short recoil/flinch away from the
  enemy (hunter flinches left, enemies flinch right). 3–4 frames.
- **defeat** — plays once when this character dies. Stagger → collapse → on the ground (or
  fading for ghostly enemies). Ends on a "downed" frame that can hold.
- **defend** (hunter only, optional) — raise guard and hold. Last frame holds.
- **cast** (hunter only, optional) — channel energy → release a skill (blue/cyan glow ok).

The hero's attack ends and snaps back to `idle`; the impact aligns with damage numbers, so
make the strike pose unmistakable.

---

## 5. Hunter — the player (3 appearance tiers)

The hunter has **3 tiers** that swap as the player ranks up. **Same character/face across
tiers** — only gear, color, and aura escalate. Each tier is a full, independent animation set.

| Tier folder | Rank range | Look |
|---|---|---|
| `novice` | E–D | Scrappy rookie. Plain dark clothes, a simple short sword/dagger, no aura. Slightly hunched, unsure stance. |
| `hunter` | C–A | Geared up. Blue/black combat jacket, better sword, confident stance, faint cyan edge light. |
| `monarch` | S+ | Powerful. Dark armored coat, glowing cyan/violet aura, commanding pose, dark-energy weapon. |

**Character base (all tiers):** young male hunter, **black spiky hair**, athletic build,
faces **RIGHT**, holds a one-handed blade in the right hand. Keep the face/hair consistent
across tiers.

**Frames per tier (each tier needs all of these):**

| Animation | Frames | Loop |
|---|---|---|
| idle | 6 | yes |
| attack | 8 | no |
| hit | 4 | no |
| defeat | 6 | no |
| defend *(optional)* | 4 | hold last |
| cast *(optional)* | 6 | no |

Required = 24 frames per tier (idle+attack+hit+defeat) × 3 tiers = **72 frames**.
Optional defend+cast add 10 frames/tier.

---

## 6. Enemies & shadow

All enemies face **LEFT**. Keep each creature's color identity below.

| Folder | Creature | Description | idle | attack | hit | defeat |
|---|---|---|---|---|---|---|
| `goblin` | Goblin | Small green humanoid, ragged loincloth, crude rusty dagger. Shorter than hunter. | 4 | 6 | 3 | 5 |
| `imp` | Imp | Small purple winged demon, little horns, claws. Hovers; idle = wing flap; attack = quick dive. | 4 | 6 | 3 | 5 |
| `wolf` | Shadow Wolf | Grey/black four-legged beast, glowing eyes. Low wide stance; attack = lunge/pounce. | 4 | 6 | 3 | 5 |
| `orc` | Orc | Big bulky brute, green-grey skin, tusks, heavy club/axe. Bigger than hunter; attack = heavy overhead swing. | 4 | 6 | 3 | 5 |
| `gate_e_boss` | Gatekeeper | Large armored red-skinned warrior boss, horned helm, big blade. **384×384.** | 6 | 8 | 4 | 6 |
| `gate_d_boss` | Stone Golem | Massive grey rock-and-moss golem, glowing core in chest, slow heavy slam attack. **384×384.** | 6 | 8 | 4 | 6 |

**Shadow soldier** (`shadow/`): one generic **dark, semi-transparent ghost-knight** —
silhouette of an armored soldier made of black/violet shadow with faint cyan eyes. This is
the player's raised undead ally; it faces **RIGHT** and stands in the hunter's squad. Frames:
**idle 4 (required), attack 6 (optional).** A simple recolorable silhouette is fine.

Enemy required total ≈ **120 frames**; shadow ≈ 4 (+6 optional).

---

## 7. Folder & file layout (deliver in this structure)

```
sprites/
  hunter/
    novice/    idle_00.png ... attack_00.png ... hit_00.png ... defeat_00.png
    hunter/    (same set)
    monarch/   (same set)
  enemies/
    goblin/        idle_00.png ... attack_00.png ... hit_00.png ... defeat_00.png
    imp/           (same set)
    wolf/          (same set)
    orc/           (same set)
    gate_e_boss/   (same set)
    gate_d_boss/   (same set)
  shadow/      idle_00.png ... (attack_00.png ...)
  backgrounds/ stage.png
  weapons/     rusted-blade.png  hunters-dagger.png  shadow-edge.png   (optional, 96×96)
```

---

## 8. Background / "the map"

- Deliver **one battle-stage background**: `backgrounds/stage.png`, **1280×800**, fully
  painted (opaque is fine), **with a flat ground/floor across the lower third** so characters
  look like they're standing on it.
- Mood: a Solo Leveling "Gate" dungeon — dim stone cavern or rift interior, cool blue/teal
  ambient light, faint magical glow. **No characters in the background.** Leave the middle
  open so fighters placed on top are readable.
- Optional later: `backgrounds/stage-e.png` (E-rank gate, mossy cave) and
  `backgrounds/stage-d.png` (D-rank gate, stone quarry). Not required for the first batch.

You do **not** need to design where characters stand — the game positions them in code
(hunter front-left, enemy front-right, allies/waves behind). Just paint a stage with an open
floor.

---

## 9. Weapons (optional icons only)

Weapons are **drawn into the hunter sprite** (the hunter already holds a blade), so no
separate in-battle weapon files are needed. Optionally provide 3 **inventory icons**
(96×96, transparent, item centered): `rusted-blade` (worn short sword), `hunters-dagger`
(sleek blue dagger), `shadow-edge` (dark-energy blade with violet glow).

---

## 10. First batch (do this first if generating incrementally)

To get the game looking real fast, generate just this set first, then the rest later:

1. **Hunter `novice`:** idle (6) + attack (8) + hit (4)
2. **Goblin:** idle (4) + attack (6) + hit (3)
3. **`backgrounds/stage.png`**

That's ~31 frames + 1 background and the first battle already works. Everything else can be
added in the same style afterward.

---

## 11. Final checklist before you deliver

- [ ] Every PNG has a **real transparent** background.
- [ ] Every frame of a character is the **exact same canvas size**.
- [ ] Feet on the **same ground line** (~90% down), character horizontally centered, in
      every frame.
- [ ] Hunter & shadow face **RIGHT**; all enemies/bosses face **LEFT**.
- [ ] Consistent style, proportions, and palette across the entire set.
- [ ] Files named `<animation>_<NN>.png` starting at `00`, in the folder layout above.
- [ ] If using sprite strips instead, frame width/height/count is stated per strip.
