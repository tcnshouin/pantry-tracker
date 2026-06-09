# SOLO SYSTEM — SPRITE GENERATION GUIDE
### Instructions for ChatGPT — Read this entire file before responding

---

## HOW TO RUN THIS SESSION

You are guiding the user through generating game sprites for a mobile RPG called Solo System, one image at a time. Follow these rules exactly:

1. When the user pastes this file, respond only with: "Ready. Here is your first prompt:" then deliver the BASE MODEL prompt for Hunter Novice.
2. After every prompt you deliver, stop and wait. Do not deliver the next prompt until the user says **CONTINUE**.
3. If the user says **REDO** or **RETRY**, re-deliver the same prompt again.
4. If the user says **SKIP**, move to the next prompt in the sequence.
5. Track your position. Always tell the user: Character name | Animation | Frame number | Total frames in that animation.
6. For every frame prompt AFTER the base model, remind the user: "Attach your BASE MODEL image for this character before generating."
7. When a character's BASE MODEL is being generated, remind the user: "Approve this look before continuing — all frames for this character will match it."
8. Deliver prompts exactly as written in this file. Do not summarize or shorten them.
9. When all prompts for a character are done, say "Character complete. Say CONTINUE for the next character."
10. When everything is done, say "All sprites complete."

---

## PROJECT OVERVIEW

Game: Solo System — a Solo Leveling–inspired mobile RPG PWA.
Battle screen: 2D side-scrolling. Hunter (player) on the left side facing right. Enemies on the right side facing left.
Sprites are standalone transparent PNGs placed in the game engine. The engine handles all positioning.

---

## GLOBAL RULES — APPLY TO EVERY SINGLE IMAGE

These rules never change. Every prompt below already includes them, but read them so you understand the system.

**CANVAS:** PNG with fully transparent background. No white fill, no colored background, no checkerboard.
**SIZE:** 256×256 for all regular characters. 384×384 for bosses (Gatekeeper, Stone Golem).
**GROUND LINE:** Feet sit at 88% down the canvas. Character centered horizontally. Figure fills ~80% of canvas height.
**FACING:** Hunter and Shadow Soldier face RIGHT. All enemies face LEFT.
**CAMERA:** Eye-level. Slight 3/4 turn (70% side profile, 30% toward camera). Full body head-to-feet visible. Flat orthographic perspective — no fisheye, no depth distortion.
**STYLE:** Clean 2D anime mobile-RPG cel-shading. 2–3 shading tones. Rim light from upper-left. Dark colored outlines (not pure black — use dark navy or matching dark color so outlines are visible on dark game backgrounds).
**NO:** No text. No watermark. No ground shadow blob. No background scenery. No UI elements.

**OPTION B WEAPON RULE — HUNTER ONLY:**
The hunter's right hand is always a closed weapon-grip fist — fingers curled as if gripping a sword handle, thumb resting on top. There is NO weapon in the hand. The hand is empty. The game engine overlays the weapon separately. Never draw a sword, blade, or any weapon in the hunter's hand.

**CONSISTENCY RULE:**
After approving the BASE MODEL for a character, attach that image in every subsequent generation for that character. The character's face, hair, skin, clothing, colors, and proportions must match exactly in every frame. Only the pose changes.

---

## GENERATION QUEUE — CHARACTER ORDER

1. Hunter Novice — 25 images (BASE MODEL + 24 frames)
2. Hunter Hunter Tier — 25 images
3. Hunter Monarch Tier — 25 images
4. Goblin — 19 images (BASE MODEL + 18 frames)
5. Imp — 19 images
6. Wolf — 19 images
7. Orc — 19 images
8. Gatekeeper Boss — 25 images (BASE MODEL + 24 frames, 384×384)
9. Stone Golem Boss — 25 images (384×384)
10. Shadow Soldier — 11 images (BASE MODEL + 10 frames)
11. Weapon Icons — 3 images
12. Background — 1 image

TOTAL: 216 images

---
---

# CHARACTER 1 — HUNTER NOVICE
Folder: `hunter/novice/` | Canvas: 256×256 | Faces: RIGHT

---

## Step 1 — BASE MODEL
Save as: `hunter/novice/BASE_MODEL.png`
> Approve this look before continuing. All 24 frames for Hunter Novice will reference this image.

2D anime mobile-RPG character sprite. Full body reference model. SUBJECT: Young male hunter, late teens. Athletic lean build, average height, not bulky. Face: sharp angular jaw, slightly pointed nose, thin eyebrows, dark determined eyes. Hair: black, spiky, irregular — medium length, spikes pointing upward and outward naturally, a few loose strands framing the face, no shine streak. CLOTHING: Dark charcoal-grey hooded jacket, hood down resting on shoulders, zip partially open at the collar. Dark grey crew-neck shirt visible underneath. Small worn patch on the left shoulder of the jacket. Dark slim-fit pants tapered at the ankle. Worn dark leather boots with simple lacing. No armor, no glow, no accessories. Civilian practical — rough and budget. HANDS: RIGHT hand is a closed weapon-grip fist, fingers curled tightly as if gripping a sword handle, thumb resting on top. NO weapon visible, hand is empty. LEFT hand relaxed and slightly open at his side. POSE: Neutral standing. Both feet flat, shoulder-width apart. Arms hang naturally at sides, right fist at hip, left hand loose. Slight natural slouch in the upper back — not fully upright, a bit unsure of himself. Head level, eyes looking slightly ahead. CAMERA: Eye-level, slight 3/4 turn, 70% right-side profile 30% toward camera, full body head to feet, flat orthographic. CANVAS: 256×256, transparent background, feet at 88% down, figure ~80% canvas height. STYLE: Clean anime cel-shading, 2–3 tones, rim light from upper-left, dark colored outlines. No text, no watermark, no ground shadow, no background.

---

## Step 2 — idle_00
Save as: `hunter/novice/idle_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — IDLE FRAME 1 of 6: Neutral rest stance. Both feet flat on ground, shoulder-width apart. Arms hanging at sides, right weapon-grip fist at hip level, left hand relaxed open. Torso upright with a slight natural slouch. Head level, eyes forward, neutral relaxed expression. Weight distributed evenly between both feet. This is the loop base frame — the most still and neutral the character gets. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 3 — idle_01
Save as: `hunter/novice/idle_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — IDLE FRAME 2 of 6: Inhale beginning. Chest very slightly expanded, ribcage rising fractionally. Shoulders raised about 2mm from neutral. Body is approximately 2% taller than idle_00. Arms stay at sides, the shoulder rise slightly lifts the right fist. Expression unchanged. The difference from frame 1 is subtle — just the beginning of a breath. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 4 — idle_02
Save as: `hunter/novice/idle_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — IDLE FRAME 3 of 6: Peak inhale. Chest at its fullest — jacket slightly taut across the front. Shoulders at their highest point, raised about 3–4mm from neutral. Chin tilts very slightly upward. Right fist still at hip. Left hand loose at side. Body at its tallest point in the cycle. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 5 — idle_03
Save as: `hunter/novice/idle_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — IDLE FRAME 4 of 6: Exhale begins. Chest relaxing from full expansion back toward neutral. Shoulders beginning to drop from their peak. Body returning to normal height. Arms at sides returning to idle_00 level. Expression unchanged. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 6 — idle_04
Save as: `hunter/novice/idle_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — IDLE FRAME 5 of 6: Full exhale. Chest at its most relaxed — jacket slightly looser across the front. Shoulders at their lowest point, about 2mm below neutral. Slight additional slouch in the upper back. Body at its most compact. Right fist and left hand at their lowest position from the shoulder drop. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 7 — idle_05
Save as: `hunter/novice/idle_05.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — IDLE FRAME 6 of 6: Return to neutral. Pose is IDENTICAL to idle_00 — both feet flat, arms at sides, right fist at hip, left hand loose, natural slight slouch. This frame must loop seamlessly back to idle_00. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 8 — attack_00
Save as: `hunter/novice/attack_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — ATTACK FRAME 1 of 8: Pre-attack weight load. Weight shifts back onto the left rear foot — left knee bends slightly, right leg nearly straight. Right shoulder rotates backward about 15 degrees, right weapon-grip fist pulls back to right hip level. Left hand rises slightly for balance. Upper body leans fractionally backward. Eyes narrow, jaw sets — focused and ready. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 9 — attack_01
Save as: `hunter/novice/attack_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — ATTACK FRAME 2 of 8: Wind-up. Right arm swings upward and backward — elbow rising to shoulder height, weapon-grip fist pulling back past the right ear. Torso rotates rightward about 20 degrees away from camera. Left arm swings forward and down as counterbalance. Both knees bend, body lowering slightly. Head turns to face the target direction (right). Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 10 — attack_02
Save as: `hunter/novice/attack_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — ATTACK FRAME 3 of 8: Maximum wind-up. Right arm fully pulled back — elbow above shoulder height, weapon-grip fist behind the right side of the head. Torso rotated about 30 degrees rightward, jacket stretching across the chest. Left arm extended forward and downward for balance. Knees bent, weight loaded entirely on back left foot. Chin tucked, intensely focused expression. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 11 — attack_03
Save as: `hunter/novice/attack_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — ATTACK FRAME 4 of 8: Uncoil begins. Torso snapping forward — rotating back to face forward as power releases. Right arm beginning its forward arc, elbow still bent, fist dropping from behind head toward forward. Weight transferring from back foot to front right foot, right foot stepping forward. Left arm sweeping back. Mouth opens slightly in effort. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 12 — attack_04
Save as: `hunter/novice/attack_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — ATTACK FRAME 5 of 8: Mid-swing. Right arm sweeping forward in a horizontal arc — elbow mostly extended, weapon-grip fist at chest height pointed forward-right toward the enemy. Body fully facing forward, lunging — right foot planted forward, left leg extended back. Left arm swept fully back for balance. Jacket pulled taut by the motion. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 13 — attack_05
Save as: `hunter/novice/attack_05.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — ATTACK FRAME 6 of 8: IMPACT — most dynamic frame. Right arm FULLY extended to the right, elbow locked out, weapon-grip fist at chest height pushed as far right as the arm reaches. Body in a deep lunge — right knee bent 90 degrees, right foot planted wide to the right, left leg extended straight behind. Torso leaning forward over the front knee. Left arm flung back and upward for balance. Jaw clenched, eyes intense. Maximum reach, maximum commitment — this is the kill frame. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 14 — attack_06
Save as: `hunter/novice/attack_06.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — ATTACK FRAME 7 of 8: Follow-through. Right arm continues past impact, swinging downward-right — fist now below hip height, still in weapon-grip. Body momentum still forward, slightly off-balance. Left arm swings forward to begin rebalancing. Right knee still forward, weight beginning to shift back. Expression releasing tension. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 15 — attack_07
Save as: `hunter/novice/attack_07.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — ATTACK FRAME 8 of 8: Recovery. Body returning upright from the lunge. Feet stepping back toward shoulder-width stance. Right arm pulling back to hip level, weapon-grip fist at hip. Left arm returning to side. Weight re-centering, knees straightening. Breathing heavily — mouth slightly open, brow relaxed from effort. Near-neutral guard stance. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 16 — hit_00
Save as: `hunter/novice/hit_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — HIT FRAME 1 of 4: Impact moment. Struck from the right side. Head snaps sharply to the LEFT — chin forced left, neck tensing. Eyes slam shut. Mouth opens in a grunt, teeth clenched. Body stiffens involuntarily, torso rigidly straight from the shock. Right weapon-grip fist clenches tighter. Left arm flares slightly outward from the jolt. Hair spikes jolt leftward from momentum. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 17 — hit_01
Save as: `hunter/novice/hit_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — HIT FRAME 2 of 4: Full recoil. Body thrown leftward and backward by the blow. Torso leaning back at 20 degrees from vertical, upper body displaced left. Right foot stumbles a half-step left, left foot dragging. Both knees slightly bent absorbing the movement. Right fist raised near the chest defensively, left arm out for balance. Head still snapped left, eyes still wincing shut. Jacket pulled by the motion. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 18 — hit_02
Save as: `hunter/novice/hit_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — HIT FRAME 3 of 4: Absorbing. Body crouched — knees bent, torso hunched forward. Right arm with weapon-grip fist tucked across the midsection where the blow landed, arm guarding. Left arm raised with elbow out, guarding the head. Eyes open but narrow — pained, gritty expression. Teeth gritted. Feet replanted, recovering balance. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 19 — hit_03
Save as: `hunter/novice/hit_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — HIT FRAME 4 of 4: Recovery. Rising from the guard crouch. Knees straightening, torso coming back upright. Right weapon-grip fist lowering to hip. Left arm lowering to side. Head coming level. Still slightly winded — lips parted, breathing hard — but composure returning. Returning toward idle stance. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 20 — defeat_00
Save as: `hunter/novice/defeat_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — DEFEAT FRAME 1 of 6: First stagger. Fatal blow received. Body lurching forward and rightward, knees suddenly buckling inward. Right weapon-grip fist losing tension — fingers beginning to loosen from grip. Left arm swinging limply. Head drooping forward, chin toward chest. Eyes wide with shock, mouth slightly open. Weight falling forward onto right foot. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 21 — defeat_01
Save as: `hunter/novice/defeat_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — DEFEAT FRAME 2 of 6: Power leaving. Right hand fully opening — fingers uncurling, grip released, fist gone. Both arms hanging weakly at sides, no strength left to hold guard. Upper body hunching further forward, spine curving. Knees bent deeper, body sinking downward. Eyes glassy and unfocused. Mouth open, exhaling. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 22 — defeat_02
Save as: `hunter/novice/defeat_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — DEFEAT FRAME 3 of 6: One knee. Right knee dropping to the ground — right knee on floor, right lower-leg flat. Left foot still planted. Right palm hitting the ground flat, bracing the fall. Left arm dangling. Head bowed, face angled down, hair hanging forward. Body at a 45 degree forward angle. Cannot stand. Transparent PNG 256×256, character positioned so knee and hand meet near bottom of canvas.

---

## Step 23 — defeat_03
Save as: `hunter/novice/defeat_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — DEFEAT FRAME 4 of 6: Falling. Body tipping sideways to the LEFT, rotating from the one-knee position. Bracing arm giving out, sliding on the ground. Left foot lifting as body tips over. Arms limp, no controlled motion. Hair falling sideways. Jacket hem lifting from the fall motion. Body at roughly 45 degrees between one-knee and fully flat. Transparent PNG 256×256.

---

## Step 24 — defeat_04
Save as: `hunter/novice/defeat_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — DEFEAT FRAME 5 of 6: Hitting the ground. Body fully horizontal on its left side, lying lengthwise. Face toward the camera side, eyes closed. Right arm flopped across the torso, open hand palm-up. Left arm extended or underneath the body. Legs loosely stacked, knees slightly bent. Jacket bunched slightly. Transparent PNG 256×256, body laid along horizontal center of canvas.

---

## Step 25 — defeat_05
Save as: `hunter/novice/defeat_05.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, hair, clothing, colors, proportions, canvas size 256×256. Only the pose changes. POSE — DEFEAT FRAME 6 of 6: Final still. IDENTICAL to defeat_04 — body on its side, eyes closed, fully at rest. Every limb completely settled with no motion tension. This frame holds indefinitely. Transparent PNG 256×256.

---
---

# CHARACTER 2 — HUNTER HUNTER TIER
Folder: `hunter/hunter/` | Canvas: 256×256 | Faces: RIGHT
> Same character as Novice. Same face, same hair. Upgraded gear only. All 24 frame poses are IDENTICAL to Hunter Novice — only the character appearance changes.

---

## Step 1 — BASE MODEL
Save as: `hunter/hunter/BASE_MODEL.png`
> Approve this look before continuing. All 24 frames for this tier will reference this image.

2D anime mobile-RPG character sprite. Full body reference model. SUBJECT: Same young male hunter from Hunter Novice — IDENTICAL face (sharp angular jaw, dark eyes) and IDENTICAL black spiky irregular hair with loose strands. Same body proportions. He has leveled up. Only the gear has changed. CLOTHING: Fitted blue-and-black combat jacket — structured, form-fitting, with light matte armor shoulder plating on both shoulders and upper chest. Jacket collar stands up slightly. Dark navy crew-neck compression shirt underneath. Dark tactical pants with a subtle side seam detail. Black combat boots with reinforced toe caps and an ankle buckle. Dark fingerless tactical gloves on both hands. HANDS: RIGHT hand is a closed weapon-grip fist — fingers curled tightly as if gripping a sword handle, thumb on top, fingerless glove visible. NO weapon visible, hand is empty. LEFT hand relaxed open, glove visible. POSE: Confident neutral standing. Both feet flat, shoulder-width apart. Back fully straight, shoulders back and squared. Chin level, looking slightly ahead. Calm assured expression — no slouch, stands taller and more composed than the Novice. A faint cyan edge-light runs along the right shoulder and right arm — very subtle, just a thin rim highlight, not a glow. CAMERA: Eye-level, 3/4 turn 70% right-side profile 30% toward camera, full body head to feet, flat orthographic. CANVAS: 256×256 transparent, feet at 88% down, figure ~80% canvas height. STYLE: Clean anime cel-shading, 2–3 tones, rim light from upper-left plus faint cyan edge highlight on right side. Dark colored outlines. No text, no watermark, no ground shadow, no background.

---

> All 24 frame prompts for Hunter Hunter Tier use the same poses as Hunter Novice Steps 2–25.
> For each frame, replace the consistency line with:
> "Using the attached base model as exact reference — same face, hair, blue-black combat jacket with armor plating, tactical gloves, colors, proportions, canvas 256×256. Only the pose changes."
> Then use the identical pose description from the matching Hunter Novice step.

---
---

# CHARACTER 3 — HUNTER MONARCH TIER
Folder: `hunter/monarch/` | Canvas: 256×256 | Faces: RIGHT
> Same character. Maximum power form. Same face and hair. All 24 frame poses identical to Novice.

---

## Step 1 — BASE MODEL
Save as: `hunter/monarch/BASE_MODEL.png`
> Approve this look before continuing. All 24 frames will reference this image.

2D anime mobile-RPG character sprite. Full body reference model. SUBJECT: Same young male hunter — IDENTICAL face and IDENTICAL black spiky hair. Maximum power form. CLOTHING: Long black armored coat reaching to mid-thigh — structured with overlapping dark plate segments on the chest, shoulders, and upper arms. Coat has cyan-violet energy trim along all edges, glowing faintly. Underneath: black high-collar bodysuit. Dark armored gauntlets on both hands — full coverage gloves, not fingerless. Tall black armored combat boots with slight heel. A faint violet-cyan aura radiates from the whole body — thin energy wisps drifting upward from the coat hem and shoulders. EYES: Normal dark eyes with a very faint violet glow in the iris — subtle, not cartoonishly bright. HANDS: RIGHT hand is a closed weapon-grip fist — armored gauntlet, fingers curled as if gripping a sword handle, thumb on top. NO weapon visible. Faint energy crackling around the knuckles. LEFT hand relaxed, gauntlet visible. POSE: Commanding neutral standing. Feet slightly wider than shoulder-width. Back perfectly straight, shoulders fully back and square. Head level, chin slightly raised — regal and imposing. Expression cold, composed, absolutely certain. Coat hangs with weight, hem at mid-thigh. CAMERA: Eye-level, 3/4 turn 70% right-side profile 30% toward camera, full body head to feet. CANVAS: 256×256 transparent, feet at 88% down. STYLE: Anime cel-shading, dramatic 2–3 tones, rim light from upper-left, cyan-violet edge aura. Dark colored outlines. No text, no watermark, no ground shadow, no background.

---

> All 24 frame prompts for Hunter Monarch use the same poses as Hunter Novice Steps 2–25.
> For each frame, replace the consistency line with:
> "Using the attached base model as exact reference — same face, hair, long black armored coat with cyan-violet trim, armored gauntlets, energy aura, colors, proportions, canvas 256×256. Only the pose changes."
> Then use the identical pose description from the matching Hunter Novice step.

---
---

# CHARACTER 4 — GOBLIN
Folder: `enemies/goblin/` | Canvas: 256×256 | Faces: LEFT

---

## Step 1 — BASE MODEL
Save as: `enemies/goblin/BASE_MODEL.png`
> Approve this look before continuing. All 18 frames will reference this image.

2D anime mobile-RPG enemy character sprite. Full body reference model. SUBJECT: A small goblin. Body: short — roughly 60% the height of a human. Wiry scrappy build. Limbs slightly too long for the body. Large head relative to body size. FACE: Wide flat nose, beady round orange eyes set close together, big jagged lower teeth visible in a permanent sneer, large pointy ears sticking outward. Medium saturated green skin, slightly mottled. No hair. CLOTHING: Ragged dark brown loincloth held by a frayed rope belt. No shoes — bare feet with short clawed toes. WEAPON: Rusty iron dagger in the RIGHT hand — short blade, crude wooden handle wrapped in worn leather strips, visibly corroded and pitted. Left hand open with clawed fingers. POSE: Classic goblin hunch — back rounded forward, knees bent and splayed outward, weight on the balls of the feet. Not standing upright, always in a crouched ready state. Right hand holding the dagger loosely at the side, blade pointing downward. Left arm slightly out for balance. Head pushed forward on the neck, permanent sneer, wary darting eyes. FACING: LEFT. The dagger hand (right) is on the far side, the open hand (left) is the near side toward camera. CAMERA: Eye-level, 3/4 turn — 70% left-side profile 30% toward camera. Full body head to feet. Flat orthographic. CANVAS: 256×256 transparent, feet at 88% down, figure fills ~75% canvas height (shorter than hunter). STYLE: Clean anime cel-shading, 2–3 tones, rim from upper-left. Strong dark outlines. No text, no background, no shadow blob.

---

## Step 2 — idle_00
Save as: `enemies/goblin/idle_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, dagger, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN IDLE FRAME 1 of 4: Neutral hunched stance. Knees bent and splayed outward, back rounded forward, weight on the balls of bare feet. Dagger held loosely at right side, blade pointing down. Left arm slightly out. Head pushed forward on neck. Eyes narrow and wary, sneer on face. This is the loop base frame. Transparent PNG 256×256, feet at 88% down canvas.

---

## Step 3 — idle_01
Save as: `enemies/goblin/idle_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, dagger, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN IDLE FRAME 2 of 4: Sway toward camera (left). Left shoulder dips down, right shoulder rises. Left knee bends deeper, right knee fractionally straightens. Head tilts left following the sway. Dagger arm hangs slightly looser. The restless shifting of a creature that cannot stay still. Transparent PNG 256×256.

---

## Step 4 — idle_02
Save as: `enemies/goblin/idle_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, dagger, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN IDLE FRAME 3 of 4: Sway away from camera (right). Right shoulder dips, left shoulder rises. Right knee bends deeper. Head tilts right. Dagger hand pulls slightly closer to body. Left claw rises slightly. Opposite end of the sway from frame 2. Transparent PNG 256×256.

---

## Step 5 — idle_03
Save as: `enemies/goblin/idle_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, dagger, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN IDLE FRAME 4 of 4: IDENTICAL to idle_00. Neutral hunched stance, weight centered, dagger at side, head pushed forward. This frame loops back to idle_00 seamlessly. Transparent PNG 256×256.

---

## Step 6 — attack_00
Save as: `enemies/goblin/attack_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, dagger, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN ATTACK FRAME 1 of 6: Pre-lunge crouch. Body drops VERY LOW — knees bent deeply, thighs nearly parallel to ground. Back hunches further forward. Dagger arm (right) pulls back behind the hip, blade angling backward and upward, ready to thrust. Left claw hand presses to the ground in front for balance. Head close to ground, eyes locked on target to the left. Weight coiled entirely in the bent legs. Mouth open in a hiss. Transparent PNG 256×256.

---

## Step 7 — attack_01
Save as: `enemies/goblin/attack_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, dagger, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN ATTACK FRAME 2 of 6: Launching. Legs exploding upward and leftward — both feet leaving the ground. Body rises and angles toward the left (enemy direction). Right arm with dagger extending forward, starting the thrust. Left claw reaching forward. Body at roughly 30 degree incline toward target. Mouth open screaming. Transparent PNG 256×256.

---

## Step 8 — attack_02
Save as: `enemies/goblin/attack_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, dagger, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN ATTACK FRAME 3 of 6: Mid-air. Both feet fully off ground. Body fully extended in the air angled toward the left target. Right arm thrusting dagger forward — elbow extending, blade pointing left-forward. Left arm spread for aerodynamics. Legs trailing behind, slightly splayed. Peak of the jump arc. Mouth wide open in a screech. Transparent PNG 256×256, character floating in upper portion of canvas.

---

## Step 9 — attack_03
Save as: `enemies/goblin/attack_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, dagger, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN ATTACK FRAME 4 of 6: STRIKE — most dynamic frame. Dagger FULLY thrust to the LEFT, right arm completely extended, blade pointing left at full reach. Body at its most forward leftward lean in the air, shoulder driving behind the thrust. Left claw also reaching left. Legs splayed behind. Face contorted in a fierce attacking expression. This is the impact frame. Transparent PNG 256×256.

---

## Step 10 — attack_04
Save as: `enemies/goblin/attack_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, dagger, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN ATTACK FRAME 5 of 6: Landing. Both feet hitting the ground, bent knees absorbing impact — low crouch on landing, body jarred downward. Dagger arm pulling back post-thrust. Left hand hitting ground to stabilize. Body weight compressed by the landing, back rounded. Transparent PNG 256×256.

---

## Step 11 — attack_05
Save as: `enemies/goblin/attack_05.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, dagger, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN ATTACK FRAME 6 of 6: Recovery. Rising from landing crouch back to idle hunched stance. Knees returning to normal bent position, dagger back at side, left hand lifting off ground. Returning to idle_00 position. Sneering expression. Transparent PNG 256×256.

---

## Step 12 — hit_00
Save as: `enemies/goblin/hit_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, dagger, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN HIT FRAME 1 of 3: Impact. Struck from the left. Head snapping sharply RIGHT, away from the hit. Eyes wide, mouth forced open in a screech of pain. Body stiffening from the blow, back involuntarily straightening. Dagger clenched tighter in the shock. Feet stumbling, weight jarred right. Transparent PNG 256×256.

---

## Step 13 — hit_01
Save as: `enemies/goblin/hit_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, dagger, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN HIT FRAME 2 of 3: Thrown right. Body stumbling rightward — right foot stepping back-right, left foot dragging. Upper body leaning right and back. Dagger arm flailing, dagger pointing loosely. Left arm flailing out. Face twisted in pain and rage. Still in a low hunched position. Transparent PNG 256×256.

---

## Step 14 — hit_02
Save as: `enemies/goblin/hit_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, dagger, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN HIT FRAME 3 of 3: Recovery. Feet replanted, crouching lower, dagger raised defensively. Left claw arm extended toward the enemy (left) in a warding off gesture. Body low, eyes re-locking onto the enemy, expression of fury replacing pain. Transparent PNG 256×256.

---

## Step 15 — defeat_00
Save as: `enemies/goblin/defeat_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN DEFEAT FRAME 1 of 5: Stagger. Knocked hard. Knees giving out, body lurching rightward and forward. Dagger slipping from fingers — hand opening. Mouth open in a surprised squeal. Eyes wide with shock. Transparent PNG 256×256.

---

## Step 16 — defeat_01
Save as: `enemies/goblin/defeat_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN DEFEAT FRAME 2 of 5: Dropping. Both knees hitting the ground, body crumpling forward. Dagger fallen, hand empty and limp. Head drooping toward the ground. Arms limp at sides. Transparent PNG 256×256.

---

## Step 17 — defeat_02
Save as: `enemies/goblin/defeat_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN DEFEAT FRAME 3 of 5: Falling forward. Body toppling face-first toward the ground, arms unable to catch the fall. Legs trailing. Transparent PNG 256×256.

---

## Step 18 — defeat_03
Save as: `enemies/goblin/defeat_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN DEFEAT FRAME 4 of 5: On the ground. Sprawled on its left side, small body in a heap. Face to the side, eyes closed. Limbs loose and awkward. Transparent PNG 256×256.

---

## Step 19 — defeat_04
Save as: `enemies/goblin/defeat_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green skin, brown loincloth, bare feet, colors, proportions, canvas 256×256. Only the pose changes. POSE — GOBLIN DEFEAT FRAME 5 of 5: Final still. IDENTICAL to defeat_03 but fully settled, no motion tension in any limb. This frame holds. Transparent PNG 256×256.

---
---

# CHARACTER 5 — IMP
Folder: `enemies/imp/` | Canvas: 256×256 | Faces: LEFT

---

## Step 1 — BASE MODEL
Save as: `enemies/imp/BASE_MODEL.png`
> Approve this look before continuing. All 18 frames will reference this image.

2D anime mobile-RPG enemy character sprite. Full body reference model. SUBJECT: A small flying imp demon. Body: tiny — even shorter than the goblin. Very thin and bony — elongated limbs, narrow torso. Hovering about 20% of its body height above the ground line. FACE: Small round head, two small curved horns on top pointing slightly outward, large bright yellow glowing eyes filling most of the eye socket, tiny pointed nose, wide thin mouth in a sinister grin showing small sharp teeth. Muted purple-violet skin throughout. BODY: Thin angular torso, long thin arms ending in three-fingered clawed hands, long thin legs ending in two-toed clawed feet. Two large leathery bat wings extending from upper back — wingspan roughly 1.5 times the body width. Wings are semi-translucent purple at the tips, darkening to deep purple at the base. Small pointed tail curling behind. No clothing. POSE: Mid-hover. Both wings spread at mid-flap, roughly horizontal with slight downward angle at tips. Body level, arms hanging at sides with claws loosely curled. Legs dangling below, slightly bent. Hovering sinister grin. FACING: LEFT. CAMERA: Eye-level, 3/4 turn — 70% left-side profile 30% toward camera. Full body visible. Flat orthographic. CANVAS: 256×256 transparent, bottom of feet at 88% down canvas. STYLE: Anime cel-shading, 2–3 tones, rim from upper-left. Strong dark outlines. No text, no background.

---

## Step 2 — idle_00
Save as: `enemies/imp/idle_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, body proportions, colors, canvas 256×256. Only the pose changes. POSE — IMP IDLE FRAME 1 of 4: Hover neutral. Wings at mid-flap position — roughly horizontal, tips slightly angled down. Body level in the air. Arms at sides, claws loosely curled. Legs dangling slightly bent below. Head level, grinning. This is the loop base. Transparent PNG 256×256.

---

## Step 3 — idle_01
Save as: `enemies/imp/idle_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP IDLE FRAME 2 of 4: Wings up. Wings raised to their highest point in the flap cycle — angled upward at about 30 degrees above horizontal. Body dips very slightly lower as the wings push up. Arms stay at sides. Transparent PNG 256×256.

---

## Step 4 — idle_02
Save as: `enemies/imp/idle_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP IDLE FRAME 3 of 4: Wings down. Wings at their lowest point in the flap cycle — angled downward at about 30 degrees below horizontal. Body rises very slightly higher as the wings push down. Arms stay at sides. Transparent PNG 256×256.

---

## Step 5 — idle_03
Save as: `enemies/imp/idle_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP IDLE FRAME 4 of 4: IDENTICAL to idle_00. Wings at mid-flap, body level, hovering. Loops seamlessly back to frame 1. Transparent PNG 256×256.

---

## Step 6 — attack_00
Save as: `enemies/imp/attack_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP ATTACK FRAME 1 of 6: Dive prep. Body tilting nose-down toward the left target — body angled about 30 degrees nose-down. Wings folding back slightly. Claws on both hands extending forward and downward. Eyes narrowing, grin widening. Building dive momentum. Transparent PNG 256×256.

---

## Step 7 — attack_01
Save as: `enemies/imp/attack_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP ATTACK FRAME 2 of 6: Dive launched. Wings fully folded back along the body like an arrow. Body angled steeply downward-left at about 50 degrees. Claws leading the dive, extended forward. Mouth open screaming. Shooting toward the left. Transparent PNG 256×256.

---

## Step 8 — attack_02
Save as: `enemies/imp/attack_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP ATTACK FRAME 3 of 6: Full dive speed. Body nearly horizontal, pointing left. Wings completely folded back flat against the body. Claws fully outstretched to the left leading the attack. Legs trailing behind. Mouth wide open in a screech. Transparent PNG 256×256.

---

## Step 9 — attack_03
Save as: `enemies/imp/attack_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP ATTACK FRAME 4 of 6: STRIKE — most dynamic frame. Claws at point of impact, fully extended to the left at maximum reach. Body at its most horizontal and leftward. Wings still folded. Most aggressive and extended attack frame. Transparent PNG 256×256.

---

## Step 10 — attack_04
Save as: `enemies/imp/attack_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP ATTACK FRAME 5 of 6: Pull-up. Body arcing upward after the strike — nose tilting up, wings snapping open to catch air and pull the body upward. Claws retracting. Body transitioning from horizontal to angled upward. Transparent PNG 256×256.

---

## Step 11 — attack_05
Save as: `enemies/imp/attack_05.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP ATTACK FRAME 6 of 6: Return hover. Back to hovering position — wings spread at mid-flap, body level, returning to idle stance. Transparent PNG 256×256.

---

## Step 12 — hit_00
Save as: `enemies/imp/hit_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP HIT FRAME 1 of 3: Struck. Body snapping rightward from impact — hit from the left. Wings flaring wide open in shock. Claws splaying. Eyes wide, mouth open in a shriek. Transparent PNG 256×256.

---

## Step 13 — hit_01
Save as: `enemies/imp/hit_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP HIT FRAME 2 of 3: Thrown right. Body hurtling rightward through the air — wings struggling to stabilize, flapping chaotically. Arms flailing. Pained expression. Transparent PNG 256×256.

---

## Step 14 — hit_02
Save as: `enemies/imp/hit_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP HIT FRAME 3 of 3: Regaining hover. Wings catching air and stabilizing, body leveling out from the thrown position. Grimacing but recovering. Returning toward hover. Transparent PNG 256×256.

---

## Step 15 — defeat_00
Save as: `enemies/imp/defeat_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP DEFEAT FRAME 1 of 5: Wings failing. Wings losing their rhythm — one wing dropping, the other at wrong angle. Body starting to drop from the hover, tilting. Eyes wide with panic, grin gone. Transparent PNG 256×256.

---

## Step 16 — defeat_01
Save as: `enemies/imp/defeat_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP DEFEAT FRAME 2 of 5: Dropping. Body falling downward, wings limp and dragging, unable to generate lift. Claws loose. Eyes dim. Transparent PNG 256×256.

---

## Step 17 — defeat_02
Save as: `enemies/imp/defeat_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP DEFEAT FRAME 3 of 5: Hitting ground. Small body crumpled on the ground, wings splayed lifelessly outward around the body. Eyes closed. Transparent PNG 256×256.

---

## Step 18 — defeat_03
Save as: `enemies/imp/defeat_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP DEFEAT FRAME 4 of 5: Fading. Body becoming translucent at the edges — dissolving into dark purple mist. Wings fading. Still on the ground. Transparent PNG 256×256.

---

## Step 19 — defeat_04
Save as: `enemies/imp/defeat_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, purple skin, bat wings, proportions, canvas 256×256. Only the pose changes. POSE — IMP DEFEAT FRAME 5 of 5: Final — almost fully dissolved. Just a faint purple mist outline remaining where the body was. Nearly fully transparent. Holds. Transparent PNG 256×256.

---
---

# CHARACTER 6 — WOLF
Folder: `enemies/wolf/` | Canvas: 256×256 | Faces: LEFT

---

## Step 1 — BASE MODEL
Save as: `enemies/wolf/BASE_MODEL.png`
> Approve this look before continuing. All 18 frames will reference this image.

2D anime mobile-RPG enemy character sprite. Full body reference model. SUBJECT: A four-legged shadow wolf. Large predatory beast — body roughly as wide as a crouched human, low-slung powerful build. All four legs planted. FUR: Dark grey-black shaggy fur, slightly matted and uneven. Longer fur around the neck and chest forming a rough mane. Thick tail held stiffly behind. FACE: Large lupine head, elongated snout, bared upper and lower fangs, icy blue glowing eyes — narrow and predatory — black nose, pointed ears flattened back. Slight scarring across the muzzle. BODY: Thick muscular legs with large paws, visible dark claws on all four feet. Front legs slightly longer than hind legs giving a natural forward-lean. POSE: Predatory low stance — all four paws planted on the ground, spine roughly parallel to the ground, weight slightly forward over front legs, head lowered to shoulder level. Eyes locked left. Tail straight out behind. Not sitting — active hunting crouch. FACING: LEFT. CAMERA: Eye-level, 3/4 turn — 70% left-side profile 30% toward camera. Full body visible head to tail. Flat orthographic. CANVAS: 256×256 transparent, paws at 88% down canvas. STYLE: Anime cel-shading, 2–3 tones, rim from upper-left, icy blue eye glow. Strong outlines. No text, no background.

---

## Step 2 — idle_00
Save as: `enemies/wolf/idle_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark grey-black fur, body proportions, colors, canvas 256×256. Only the pose changes. POSE — WOLF IDLE FRAME 1 of 4: Neutral predatory stance. All four paws planted, weight slightly forward, head at shoulder level, eyes locked left. Tail straight out behind. Lips slightly parted, low growl implied. This is the loop base. Transparent PNG 256×256, paws at 88% down canvas.

---

## Step 3 — idle_01
Save as: `enemies/wolf/idle_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark fur, proportions, canvas 256×256. Only the pose changes. POSE — WOLF IDLE FRAME 2 of 4: Weight shifts forward. Weight shifting onto the front paws — front legs straightening slightly, haunches rising fractionally, head lowering further. Intensifying growl — lips pulling back slightly more. Transparent PNG 256×256.

---

## Step 4 — idle_02
Save as: `enemies/wolf/idle_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark fur, proportions, canvas 256×256. Only the pose changes. POSE — WOLF IDLE FRAME 3 of 4: Weight shifts back. Rocking weight onto rear paws — haunches lowering slightly, loading power in the back legs. Front legs slightly relieved. Tail rises fractionally. Transparent PNG 256×256.

---

## Step 5 — idle_03
Save as: `enemies/wolf/idle_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark fur, proportions, canvas 256×256. Only the pose changes. POSE — WOLF IDLE FRAME 4 of 4: IDENTICAL to idle_00. Return to neutral predatory stance. Loops seamlessly. Transparent PNG 256×256.

---

## Step 6 — attack_00
Save as: `enemies/wolf/attack_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark fur, proportions, canvas 256×256. Only the pose changes. POSE — WOLF ATTACK FRAME 1 of 6: Pre-pounce crouch. Haunches coiling VERY deep — rear legs bent low, thighs nearly parallel to ground. Body crouched extremely low, head almost at ground level. Front paws raised slightly. Eyes blazing at target. Weight loaded entirely in rear legs. Transparent PNG 256×256.

---

## Step 7 — attack_01
Save as: `enemies/wolf/attack_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark fur, proportions, canvas 256×256. Only the pose changes. POSE — WOLF ATTACK FRAME 2 of 6: Launch. Rear legs exploding — all four paws leaving the ground, body launching upward-left. Front paws reaching forward toward the left target. Body at roughly 30 degree upward angle. Mouth opening. Transparent PNG 256×256.

---

## Step 8 — attack_02
Save as: `enemies/wolf/attack_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark fur, proportions, canvas 256×256. Only the pose changes. POSE — WOLF ATTACK FRAME 3 of 6: Mid-air pounce. Fully airborne. Body fully extended in the leap — front legs fully stretched left, rear legs extended right behind. Spine nearly straight. Jaws wide open. Peak of the jump arc. Transparent PNG 256×256.

---

## Step 9 — attack_03
Save as: `enemies/wolf/attack_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark fur, proportions, canvas 256×256. Only the pose changes. POSE — WOLF ATTACK FRAME 4 of 6: BITE STRIKE — most dynamic frame. Jaws snapping shut at the point of impact to the left. Body at its most leftward and extended. Front paws reaching contact point. Rear legs still trailing. Most ferocious frame. Transparent PNG 256×256.

---

## Step 10 — attack_04
Save as: `enemies/wolf/attack_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark fur, proportions, canvas 256×256. Only the pose changes. POSE — WOLF ATTACK FRAME 5 of 6: Landing. Front paws hitting the ground — body jarring down, front legs absorbing the impact with deep bend. Haunches still in the air, catching up. Head snapping up from the contact. Transparent PNG 256×256.

---

## Step 11 — attack_05
Save as: `enemies/wolf/attack_05.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark fur, proportions, canvas 256×256. Only the pose changes. POSE — WOLF ATTACK FRAME 6 of 6: Recovery. All four paws settling back onto ground. Body returning to low predatory stance. Returning to idle_00 position. Transparent PNG 256×256.

---

## Step 12 — hit_00
Save as: `enemies/wolf/hit_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark fur, proportions, canvas 256×256. Only the pose changes. POSE — WOLF HIT FRAME 1 of 3: Impact. Body snapping rightward from a blow from the left. Head whipping sideways to the right. A pained yelp expression — mouth open, eyes wide. All four legs stumbling. Transparent PNG 256×256.

---

## Step 13 — hit_01
Save as: `enemies/wolf/hit_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark fur, proportions, canvas 256×256. Only the pose changes. POSE — WOLF HIT FRAME 2 of 3: Stumbling. Body lurching rightward — legs scrambling on the ground, off-balance. Hurt expression. Weight tipping right. Transparent PNG 256×256.

---

## Step 14 — hit_02
Save as: `enemies/wolf/hit_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark fur, proportions, canvas 256×256. Only the pose changes. POSE — WOLF HIT FRAME 3 of 3: Recovery snarl. All four paws replanting firmly. Body steadying. Head turning back to face left at the enemy. Growling with renewed aggression despite the pain. Returning to low stance. Transparent PNG 256×256.

---

## Step 15 — defeat_00
Save as: `enemies/wolf/defeat_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark fur, proportions, canvas 256×256. Only the pose changes. POSE — WOLF DEFEAT FRAME 1 of 5: Stagger. Front legs buckling from a fatal blow. Body lurching forward and down. Head dropping low toward the ground. Eyes dimming. Transparent PNG 256×256.

---

## Step 16 — defeat_01
Save as: `enemies/wolf/defeat_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark fur, proportions, canvas 256×256. Only the pose changes. POSE — WOLF DEFEAT FRAME 2 of 5: Collapsing. All four legs giving out simultaneously. Body sinking to the ground. Eyes nearly closed. Transparent PNG 256×256.

---

## Step 17 — defeat_02
Save as: `enemies/wolf/defeat_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark fur, proportions, canvas 256×256. Only the pose changes. POSE — WOLF DEFEAT FRAME 3 of 5: On its side. Collapsed completely on its left side on the ground. Legs limp and loose. Head resting on the ground, eyes closed. Tail flat. Transparent PNG 256×256.

---

## Step 18 — defeat_03
Save as: `enemies/wolf/defeat_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, dark fur, proportions, canvas 256×256. Only the pose changes. POSE — WOLF DEFEAT FRAME 4 of 5: Dissolving. Body beginning to turn into dark shadow particles — edges dissolving into black-grey mist, form losing definition. Still in the on-its-side pose but fading. Transparent PNG 256×256.

---

## Step 19 — defeat_04
Save as: `enemies/wolf/defeat_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same dark wolf silhouette, canvas 256×256. Only the pose changes. POSE — WOLF DEFEAT FRAME 5 of 5: Final — nearly fully dissolved. Just a faint dark mist cloud where the wolf was. Barely visible. Holds. Transparent PNG 256×256.

---
---

# CHARACTER 7 — ORC
Folder: `enemies/orc/` | Canvas: 256×256 | Faces: LEFT

---

## Step 1 — BASE MODEL
Save as: `enemies/orc/BASE_MODEL.png`
> Approve this look before continuing. All 18 frames will reference this image.

2D anime mobile-RPG enemy character sprite. Full body reference model. SUBJECT: A large orc brute. Body: significantly taller and wider than the hunter — big and powerful. Massively muscled, barrel chest, thick neck, heavy limbs. Slow but devastating. SKIN: Green-grey, slightly mottled, visible muscle definition. FACE: Broad flat face, wide flat nose, small deep-set red eyes, prominent lower jaw with two thick tusks curving upward from lower lip. Heavy brow ridge. Bald head with a few scars. CLOTHING: Scrap metal shoulder armor — mismatched plates bolted to leather straps on both shoulders, leaving the chest and arms bare. Ragged dark brown pants cut off at the knee held by a thick leather belt with a crude iron buckle. Bare feet with thick clawed toenails. No shirt, bare muscled torso. WEAPON: Large heavy iron club-maul — thick cylindrical handle, large flat heavy iron head, visibly dented from use. Currently held in BOTH hands resting on the right shoulder. POSE: Wide threatening neutral. Feet wider than shoulder-width, toes slightly out. Knees slightly bent, weight low and stable. Club resting on right shoulder held in both hands. Head slightly forward, red eyes glaring left. Contemptuous sneer showing tusks. FACING: LEFT. CAMERA: Eye-level, 3/4 turn — 70% left-side profile 30% toward camera. Full body visible. Flat orthographic. CANVAS: 256×256 transparent, feet at 88% down, character fills ~85% canvas height (taller than goblin). STYLE: Anime cel-shading, 2–3 tones, rim from upper-left. Strong outlines. No text, no background.

---

## Step 2 — idle_00
Save as: `enemies/orc/idle_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, iron club, body proportions, colors, canvas 256×256. Only the pose changes. POSE — ORC IDLE FRAME 1 of 4: Neutral threatening stance. Feet wide, knees slightly bent, weight low. Club resting on right shoulder. Head forward, eyes glaring left. Contemptuous sneer. Breathing heavily. This is the loop base. Transparent PNG 256×256.

---

## Step 3 — idle_01
Save as: `enemies/orc/idle_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, iron club, proportions, canvas 256×256. Only the pose changes. POSE — ORC IDLE FRAME 2 of 4: Sway left. Bulk shifting left — left shoulder dropping, right shoulder rising. Club tilting with the shoulder shift. Slight weight rock to the left foot. Transparent PNG 256×256.

---

## Step 4 — idle_02
Save as: `enemies/orc/idle_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, iron club, proportions, canvas 256×256. Only the pose changes. POSE — ORC IDLE FRAME 3 of 4: Sway right. Bulk shifting right — right shoulder dropping, left rising. Club tilting opposite way. Low grunt-face expression. Transparent PNG 256×256.

---

## Step 5 — idle_03
Save as: `enemies/orc/idle_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, iron club, proportions, canvas 256×256. Only the pose changes. POSE — ORC IDLE FRAME 4 of 4: IDENTICAL to idle_00. Return to neutral threatening stance. Loops. Transparent PNG 256×256.

---

## Step 6 — attack_00
Save as: `enemies/orc/attack_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, iron club, proportions, canvas 256×256. Only the pose changes. POSE — ORC ATTACK FRAME 1 of 6: Lift. Heaving the club off the shoulder upward — both arms pulling the heavy weapon overhead. Back straightening. Mouth opening to roar. Eyes blazing. Transparent PNG 256×256.

---

## Step 7 — attack_01
Save as: `enemies/orc/attack_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, iron club, proportions, canvas 256×256. Only the pose changes. POSE — ORC ATTACK FRAME 2 of 6: Full overhead. Club raised fully above the head, both arms extended upward, the club at maximum height. Body coiled, roaring with mouth wide open. Transparent PNG 256×256.

---

## Step 8 — attack_02
Save as: `enemies/orc/attack_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, iron club, proportions, canvas 256×256. Only the pose changes. POSE — ORC ATTACK FRAME 3 of 6: Slam begins. Club swinging down-left in a massive arc. Both arms driving it forward and down. Body leaning hard into the swing, immense momentum building. Weight transferring forward. Transparent PNG 256×256.

---

## Step 9 — attack_03
Save as: `enemies/orc/attack_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, iron club, proportions, canvas 256×256. Only the pose changes. POSE — ORC ATTACK FRAME 4 of 6: IMPACT — most dynamic frame. Club fully extended to the lower-left at the point of impact. Body hunched completely forward over the swing, both arms fully committed. Most powerful frame — maximum commitment and reach. Transparent PNG 256×256.

---

## Step 10 — attack_04
Save as: `enemies/orc/attack_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, iron club, proportions, canvas 256×256. Only the pose changes. POSE — ORC ATTACK FRAME 5 of 6: Follow-through. Club bouncing past the impact point, swinging to lower left. Body still hunched forward from momentum. Arms beginning to decelerate. Transparent PNG 256×256.

---

## Step 11 — attack_05
Save as: `enemies/orc/attack_05.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, iron club, proportions, canvas 256×256. Only the pose changes. POSE — ORC ATTACK FRAME 6 of 6: Recovery. Heaving the heavy club back upright and onto the shoulder. Body straightening from the hunched swing. Returning to idle stance. Satisfied grunt expression. Transparent PNG 256×256.

---

## Step 12 — hit_00
Save as: `enemies/orc/hit_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, proportions, canvas 256×256. Only the pose changes. POSE — ORC HIT FRAME 1 of 3: Impact. Hit from the left. Head snapping right. Body barely moving — too massive — but visibly absorbing the blow. Armor denting at impact point. Expression of pure rage, not pain. Jaw clenching, eyes burning. Transparent PNG 256×256.

---

## Step 13 — hit_01
Save as: `enemies/orc/hit_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, proportions, canvas 256×256. Only the pose changes. POSE — ORC HIT FRAME 2 of 3: Forced back. The impact pushing the massive bulk one heavy step rightward — right foot stepping back-right. Club swinging loose. Furious expression. Still upright — this is barely enough to move him. Transparent PNG 256×256.

---

## Step 14 — hit_02
Save as: `enemies/orc/hit_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, proportions, canvas 256×256. Only the pose changes. POSE — ORC HIT FRAME 3 of 3: Rage recovery. Planting feet wide again, digging in. Rising back to full height. Club raised in defiance. Pure fury — tusks bared, eyes burning. Ready to retaliate. Transparent PNG 256×256.

---

## Step 15 — defeat_00
Save as: `enemies/orc/defeat_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, proportions, canvas 256×256. Only the pose changes. POSE — ORC DEFEAT FRAME 1 of 5: Disbelief. Enormous body lurching from a fatal blow. Club dropping from loosening grip. Eyes wide with shock for the first time — this creature has never fallen before. Transparent PNG 256×256.

---

## Step 16 — defeat_01
Save as: `enemies/orc/defeat_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, proportions, canvas 256×256. Only the pose changes. POSE — ORC DEFEAT FRAME 2 of 5: Knees buckling. Massive legs giving out — knees bending inward and collapsing. Body toppling forward. Arms unable to hold the weight. Transparent PNG 256×256.

---

## Step 17 — defeat_02
Save as: `enemies/orc/defeat_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, proportions, canvas 256×256. Only the pose changes. POSE — ORC DEFEAT FRAME 3 of 5: Crashing down. Enormous body hitting the ground on its knees first — the impact implied by the body's jarring downward motion. Arms limp. Transparent PNG 256×256.

---

## Step 18 — defeat_03
Save as: `enemies/orc/defeat_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, scrap armor, proportions, canvas 256×256. Only the pose changes. POSE — ORC DEFEAT FRAME 4 of 5: Face down. Massive body fully collapsed face-forward on the ground. Arms limp at sides. Scrap armor pieces displaced. Transparent PNG 256×256.

---

## Step 19 — defeat_04
Save as: `enemies/orc/defeat_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same face, green-grey skin, proportions, canvas 256×256. Only the pose changes. POSE — ORC DEFEAT FRAME 5 of 5: Final still. IDENTICAL to defeat_03, fully at rest. Holds. Transparent PNG 256×256.

---
---

# CHARACTER 8 — GATEKEEPER (BOSS)
Folder: `enemies/gate_e_boss/` | Canvas: 384×384 | Faces: LEFT

---

## Step 1 — BASE MODEL
Save as: `enemies/gate_e_boss/BASE_MODEL.png`
> Approve this look before continuing. All 24 frames will reference this image. Canvas is 384×384.

2D anime mobile-RPG boss enemy sprite. Full body reference model. SUBJECT: The Gatekeeper — a massive armored demon warrior. Body: towering — nearly twice the height of a human. Powerfully built, extremely broad shoulders. SKIN: Dark crimson-red, visible on the face and exposed hands. ARMOR: Full heavy plate armor covering the entire body — dark gunmetal grey with red-brown rust staining at seams. Chest plate has a large angular design. Shoulder plates are wide and jutting with short downward spikes. Greaves on shins. Gauntlets on both hands. The armor looks ancient and battle-worn — dented, scratched, chipped edges. HELMET: Large full-face visor helmet with two curved ram-style horns curving upward from the sides. The visor is a narrow horizontal slit with orange-red light glowing from inside — the eyes are not fully visible, just a menacing glow through the visor. WEAPON: A massive two-handed greatsword — blade as long as a human is tall, wide and thick dark steel, angular crossguard. Currently held in the right hand with blade tip resting on ground. POSE: Imposing neutral stand. Feet shoulder-width apart, perfectly flat on ground. Greatsword in right hand, tip on ground to the right. Left hand at side. Back straight, standing at absolute full height. Head level. Completely still — radiating pure menace. FACING: LEFT. CAMERA: Eye-level, 3/4 turn — 70% left-side profile 30% toward camera. Full body. CANVAS: 384×384 transparent, feet at 90% down canvas, character fills ~88% canvas height. STYLE: Anime cel-shading, dramatic 2–3 tones, strong rim from upper-left. Heavy dark outlines. No text, no background.

---

## Step 2 — idle_00
Save as: `enemies/gate_e_boss/idle_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER IDLE FRAME 1 of 6: Menacing still. Standing at full height, sword tip on ground at right side. Chest plate expanding and contracting minimally. Orange glow of eyes through visor slit steady. Absolute stillness — the kind that is more threatening than motion. Loop base frame. Transparent PNG 384×384.

---

## Step 3 — idle_01
Save as: `enemies/gate_e_boss/idle_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER IDLE FRAME 2 of 6: Sword lifts slightly. The greatsword raises a few inches off the ground — a slow deliberate motion, a subtle threat. Body unchanged. Eye glow steady. Transparent PNG 384×384.

---

## Step 4 — idle_02
Save as: `enemies/gate_e_boss/idle_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER IDLE FRAME 3 of 6: Deep inhale. Chest plate expanding outward — the armor audibly creaking from the breath. Shoulders broadening. Body at its most imposing height. Eye glow brightens very slightly. Transparent PNG 384×384.

---

## Step 5 — idle_03
Save as: `enemies/gate_e_boss/idle_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER IDLE FRAME 4 of 6: Exhale. Chest plate relaxing back. Shoulders settling. Sword returning toward ground. Eye glow returns to steady orange. Transparent PNG 384×384.

---

## Step 6 — idle_04
Save as: `enemies/gate_e_boss/idle_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER IDLE FRAME 5 of 6: Head tilt. Head slowly tilting toward the left — a deliberate slow motion, looking down at the enemy with contempt. Visor slit now angled downward-left. Sword still at rest. Transparent PNG 384×384.

---

## Step 7 — idle_05
Save as: `enemies/gate_e_boss/idle_05.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER IDLE FRAME 6 of 6: IDENTICAL to idle_00. Full height, sword tip on ground, absolute stillness. Loops. Transparent PNG 384×384.

---

## Step 8 — attack_00
Save as: `enemies/gate_e_boss/attack_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER ATTACK FRAME 1 of 8: Grip tightens. Both gauntleted hands gripping the greatsword — the right hand already on it, left hand now joining. Stance widening, feet spreading further apart. Weight lowering. Eye glow intensifying to bright orange. Transparent PNG 384×384.

---

## Step 9 — attack_01
Save as: `enemies/gate_e_boss/attack_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER ATTACK FRAME 2 of 8: Sword rises. Both hands lifting the massive greatsword from the ground — sword now raised to shoulder height at the right side, both arms beginning to coil for the swing. Body rotating slightly rightward. Transparent PNG 384×384.

---

## Step 10 — attack_02
Save as: `enemies/gate_e_boss/attack_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER ATTACK FRAME 3 of 8: Full overhead. Greatsword raised fully above the head — both arms extended upward, the enormous blade at maximum height. Body fully coiled. Roaring — visor glow blazing. Transparent PNG 384×384.

---

## Step 11 — attack_03
Save as: `enemies/gate_e_boss/attack_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER ATTACK FRAME 4 of 8: Swing begins. Greatsword swinging down-left in a massive horizontal arc, both arms driving it. Body rotating hard to face left, shoulders turning. Immense weight of the blade building momentum. Transparent PNG 384×384.

---

## Step 12 — attack_04
Save as: `enemies/gate_e_boss/attack_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER ATTACK FRAME 5 of 8: Mid-swing. Greatsword at 45 degrees on its way down and across — a devastating horizontal sweep at chest height, blade reaching outward-left. Body fully committed to the swing. Transparent PNG 384×384.

---

## Step 13 — attack_05
Save as: `enemies/gate_e_boss/attack_05.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER ATTACK FRAME 6 of 8: IMPACT — most dynamic frame. Greatsword fully extended to the left at full swing — both arms at maximum left reach, the enormous blade at chest height. Body fully twisted into the swing. Most devastating frame. Transparent PNG 384×384.

---

## Step 14 — attack_06
Save as: `enemies/gate_e_boss/attack_06.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER ATTACK FRAME 7 of 8: Follow-through. Greatsword past impact, continuing its arc downward-left, blade end dropping. Body still rotating from the swing's momentum. Arms following through. Transparent PNG 384×384.

---

## Step 15 — attack_07
Save as: `enemies/gate_e_boss/attack_07.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER ATTACK FRAME 8 of 8: Reset. Heaving the greatsword back toward the resting position — body straightening, sword lowering toward the ground at right side. Eye glow returning to steady orange. Fixed on the target. Transparent PNG 384×384.

---

## Step 16 — hit_00
Save as: `enemies/gate_e_boss/hit_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER HIT FRAME 1 of 4: Armor dents. Struck from the left. A visible new dent appearing on the left shoulder plate at impact. Head barely snaps — this creature is too massive to be easily moved — but the visor glow flashes brighter orange with rage. Body stiffens. Transparent PNG 384×384.

---

## Step 17 — hit_01
Save as: `enemies/gate_e_boss/hit_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER HIT FRAME 2 of 4: Pushed back one step. The immense force of the blow sliding one massive foot one step rightward — reluctantly, as if the mountain itself was pushed. Armor scraping. Greatsword swinging loose. Expression of fury beneath the visor. Transparent PNG 384×384.

---

## Step 18 — hit_02
Save as: `enemies/gate_e_boss/hit_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER HIT FRAME 3 of 4: Digging in. Planting both feet wide and deep, leaning into the blow, refusing to be moved further. Cracked armor visible where hit. Visor glow blazing. Left hand raising in a guard position. Transparent PNG 384×384.

---

## Step 19 — hit_03
Save as: `enemies/gate_e_boss/hit_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor, helmet, greatsword, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER HIT FRAME 4 of 4: Full recovery. Rising back to absolute full height. Greatsword raised in defiance. Visor glow blazing maximum intensity. Pure unstoppable rage. Transparent PNG 384×384.

---

## Step 20 — defeat_00
Save as: `enemies/gate_e_boss/defeat_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor (now cracking), helmet, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER DEFEAT FRAME 1 of 6: Disbelief. For the first time, the fatal blow has landed. Body lurching backward — the immense frame actually stumbling. Greatsword dropping from one hand. Visor glow flickering. Transparent PNG 384×384.

---

## Step 21 — defeat_01
Save as: `enemies/gate_e_boss/defeat_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same armor (now shattering), helmet cracked, red skin, proportions, canvas 384×384. Only the pose changes. POSE — GATEKEEPER DEFEAT FRAME 2 of 6: Armor shattering. Large plates of dark armor cracking and falling away from the body — chest plate splitting, shoulder pieces falling. Body destabilizing. Visor glow dimming. Greatsword dropped. Transparent PNG 384×384.

---

## Step 22 — defeat_02
Save as: `enemies/gate_e_boss/defeat_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same broken armor, cracked helmet, red skin, canvas 384×384. Only the pose changes. POSE — GATEKEEPER DEFEAT FRAME 3 of 6: To one knee. The massive being crashing to one knee — the impact enormous, body hunched. Arms at sides, unable to lift. Head bowing. Visor glow very faint. Transparent PNG 384×384.

---

## Step 23 — defeat_03
Save as: `enemies/gate_e_boss/defeat_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same broken armor, red skin, canvas 384×384. Only the pose changes. POSE — GATEKEEPER DEFEAT FRAME 4 of 6: Falling forward. The giant body toppling forward from the kneeling position — falling face-down toward the ground, arms limp and unable to brace. Transparent PNG 384×384.

---

## Step 24 — defeat_04
Save as: `enemies/gate_e_boss/defeat_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same broken armor, red skin, canvas 384×384. Only the pose changes. POSE — GATEKEEPER DEFEAT FRAME 5 of 6: Collapsed. Enormous body sprawled face-down on the ground. Broken armor pieces scattered. Arms at sides. Completely fallen. Transparent PNG 384×384.

---

## Step 25 — defeat_05
Save as: `enemies/gate_e_boss/defeat_05.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same broken armor, red skin, canvas 384×384. Only the pose changes. POSE — GATEKEEPER DEFEAT FRAME 6 of 6: Final still. IDENTICAL to defeat_04 but fully settled. The fallen giant, motionless. Holds indefinitely. Transparent PNG 384×384.

---
---

# CHARACTER 9 — STONE GOLEM (BOSS)
Folder: `enemies/gate_d_boss/` | Canvas: 384×384 | Faces: LEFT

---

## Step 1 — BASE MODEL
Save as: `enemies/gate_d_boss/BASE_MODEL.png`
> Approve this look before continuing. All 24 frames will reference this image. Canvas is 384×384.

2D anime mobile-RPG boss enemy sprite. Full body reference model. SUBJECT: The Stone Golem — a colossal humanoid of living rock. The largest enemy in the game — extremely wide and massive. MATERIAL: Entire body is grey cracked rock throughout. Cracks between rock segments are filled with dark green moss and amber-tinged dirt. Rock surface is rough and textured, not smooth. Large and small chunks form the arms, torso, and legs. No clothing, no armor — only rock. CORE: In the center of the chest, a perfectly circular magical energy core — glowing cyan-blue, smooth, bright, embedded in the rock. Pulses with light. The only luminous element on the body. FACE: Two recessed eye sockets with tiny cyan glowing pinpoints deep inside. No nose, no mouth. The head is a large irregular boulder sitting directly on the shoulders with no neck. ARMS: Massive — each arm as wide as a human torso. Blocky forearms. Huge cuboid fists. LEGS: Thick rock pillars. Feet are flat platforms of rock. POSE: Dormant stand. Both rock-pillar feet flat on ground, very wide stance. Both massive fists hanging at sides. Core glowing at rest. Head angled slightly downward — looking at something far below its eye level. The sense of enormous weight and gravity. FACING: LEFT. CAMERA: Eye-level, 3/4 turn — 70% left-side profile 30% toward camera. Full body visible. CANVAS: 384×384 transparent, feet at 90% down canvas, character fills ~90% canvas height. STYLE: Anime cel-shading with rocky texture, 2–3 tones, strong rim from upper-left, cyan glow from core illuminating the chest area. Strong dark outlines. No text, no background.

---

## Step 2 — idle_00
Save as: `enemies/gate_d_boss/idle_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same rock texture, moss in cracks, cyan core, face, body proportions, canvas 384×384. Only the pose changes. POSE — GOLEM IDLE FRAME 1 of 6: Dormant still. Both rock feet flat, wide stance. Fists at sides. Cyan core pulsing slowly at resting brightness. Head fractionally angled down. Ancient, patient weight. Loop base. Transparent PNG 384×384.

---

## Step 3 — idle_01
Save as: `enemies/gate_d_boss/idle_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same rock, moss, cyan core, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM IDLE FRAME 2 of 6: Core pulses bright. Cyan core brightening to peak — a ripple of cyan light spreading slightly across the chest rock surface from the core. Body unchanged. Transparent PNG 384×384.

---

## Step 4 — idle_02
Save as: `enemies/gate_d_boss/idle_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same rock, moss, cyan core, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM IDLE FRAME 3 of 6: Weight shifts left. The entire rock body slowly shifting weight left — a ponderous lumbering sway, the whole mass leaning very fractionally left. Left foot pressing down harder. Transparent PNG 384×384.

---

## Step 5 — idle_03
Save as: `enemies/gate_d_boss/idle_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same rock, moss, cyan core, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM IDLE FRAME 4 of 6: Core dims. Cyan core at its dimmest point in the pulse cycle. Body settled back level from the sway. Transparent PNG 384×384.

---

## Step 6 — idle_04
Save as: `enemies/gate_d_boss/idle_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same rock, moss, cyan core, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM IDLE FRAME 5 of 6: Weight shifts right. Same slow ponderous sway but to the right. Mass leaning fractionally right. Right foot pressing down harder. Transparent PNG 384×384.

---

## Step 7 — idle_05
Save as: `enemies/gate_d_boss/idle_05.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same rock, moss, cyan core, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM IDLE FRAME 6 of 6: IDENTICAL to idle_00. Dormant still, core at rest, body level. Loops. Transparent PNG 384×384.

---

## Step 8 — attack_00
Save as: `enemies/gate_d_boss/attack_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same rock, moss, cyan core, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM ATTACK FRAME 1 of 8: Core charges. Cyan core flaring intensely bright — charging up. Both massive fists tightening. Body tensing, rock segments shifting and grinding. Transparent PNG 384×384.

---

## Step 9 — attack_01
Save as: `enemies/gate_d_boss/attack_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same rock, moss, cyan core, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM ATTACK FRAME 2 of 8: Fist raises. Right massive fist rising slowly — enormous weight being lifted, arm rising to shoulder height. Body twisting very slightly right. Core blazing. Transparent PNG 384×384.

---

## Step 10 — attack_02
Save as: `enemies/gate_d_boss/attack_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same rock, moss, cyan core, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM ATTACK FRAME 3 of 8: Full raise. Right fist at its highest point — raised fully above the right shoulder, the massive cuboid fist overhead. Core at maximum brightness. Other arm counterbalancing outward. Transparent PNG 384×384.

---

## Step 11 — attack_03
Save as: `enemies/gate_d_boss/attack_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same rock, moss, cyan core, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM ATTACK FRAME 4 of 8: Slam begins. Right fist crashing downward with enormous force — arm driving down-left, the immense mass of the rock fist creating unstoppable momentum. Body dropping slightly at the knees. Transparent PNG 384×384.

---

## Step 12 — attack_04
Save as: `enemies/gate_d_boss/attack_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same rock, moss, cyan core, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM ATTACK FRAME 5 of 8: Mid-slam. Fist at mid-point on the way down — sweeping toward the lower-left, full commitment, unstoppable. Transparent PNG 384×384.

---

## Step 13 — attack_05
Save as: `enemies/gate_d_boss/attack_05.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same rock, moss, cyan core, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM ATTACK FRAME 6 of 8: GROUND SLAM — most dynamic frame. Right fist fully extended to the lower-left at point of impact — arm completely extended, fist at ground level to the left. Body hunched completely over the slam, both rock legs bent from the force. Most powerful frame. Transparent PNG 384×384.

---

## Step 14 — attack_06
Save as: `enemies/gate_d_boss/attack_06.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same rock, moss, cyan core, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM ATTACK FRAME 7 of 8: Rebound. Right fist bouncing slightly off the impact point — the enormous mass rebounding from the ground. Body still hunched. Core dimming from the energy release. Transparent PNG 384×384.

---

## Step 15 — attack_07
Save as: `enemies/gate_d_boss/attack_07.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same rock, moss, cyan core, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM ATTACK FRAME 8 of 8: Reset. Slowly raising the massive fist back up, body straightening to full height. The immense weight returning to the dormant stance. Core returning to resting pulse. Transparent PNG 384×384.

---

## Step 16 — hit_00
Save as: `enemies/gate_d_boss/hit_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same rock, moss, cyan core, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM HIT FRAME 1 of 4: Rock cracks. A new crack appearing on the golem's surface at the impact point — the rock visibly fracturing from the hit. A brief flash from the cyan core. The body barely moves — too massive — but the damage is visible. Transparent PNG 384×384.

---

## Step 17 — hit_01
Save as: `enemies/gate_d_boss/hit_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same rock (more cracked now), moss, cyan core flickering, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM HIT FRAME 2 of 4: Pushed. The impact sliding the entire mass one heavy step rightward — feet grinding on the ground. A small chunk of rock flying off the impact point. Core flickering. Transparent PNG 384×384.

---

## Step 18 — hit_02
Save as: `enemies/gate_d_boss/hit_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same cracked rock, moss, cyan core, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM HIT FRAME 3 of 4: Steadying. Both feet planting firmly, body rocking back level from the pushed position. New cracks visible. Core pulsing in response to the damage. Transparent PNG 384×384.

---

## Step 19 — hit_03
Save as: `enemies/gate_d_boss/hit_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same cracked rock, moss, cyan core, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM HIT FRAME 4 of 4: Recovered. Back to full imposing stance, more damaged than before with visible new cracks. Core blazing brighter as if angered. Fists tightening. Transparent PNG 384×384.

---

## Step 20 — defeat_00
Save as: `enemies/gate_d_boss/defeat_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same heavily cracked rock, moss, cyan core fading, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM DEFEAT FRAME 1 of 6: Core shatters. The cyan core in the chest fracturing — cracking apart, flickering violently. Cracks spreading rapidly across the whole body from the core outward. Body staggering from the internal destruction. Transparent PNG 384×384.

---

## Step 21 — defeat_01
Save as: `enemies/gate_d_boss/defeat_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same crumbling rock, dying cyan light, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM DEFEAT FRAME 2 of 6: Chunks falling. Large pieces of rock falling off the arms and torso — the body beginning to crumble apart. Core nearly dark. Arms partially collapsed. Transparent PNG 384×384.

---

## Step 22 — defeat_02
Save as: `enemies/gate_d_boss/defeat_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same crumbling rock, no core light, proportions, canvas 384×384. Only the pose changes. POSE — GOLEM DEFEAT FRAME 3 of 6: Structure failing. Upper body crumbling inward — torso losing its form as rocks fall away. Legs still standing but weakening. Core completely dark. Transparent PNG 384×384.

---

## Step 23 — defeat_03
Save as: `enemies/gate_d_boss/defeat_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — rubble and rock, no glow, canvas 384×384. Only the pose changes. POSE — GOLEM DEFEAT FRAME 4 of 6: Full collapse. The entire structure falling apart — legs giving out, the whole massive form crashing down into a pile of rocks and dust. Transparent PNG 384×384.

---

## Step 24 — defeat_04
Save as: `enemies/gate_d_boss/defeat_04.png`
> Attach BASE_MODEL.png before generating. Canvas 384×384.
POSE — GOLEM DEFEAT FRAME 5 of 6: Settling rubble. A large pile of grey rock and moss chunks on the ground, still shifting as gravity settles the last pieces. Transparent PNG 384×384.

---

## Step 25 — defeat_05
Save as: `enemies/gate_d_boss/defeat_05.png`
> Canvas 384×384.
POSE — GOLEM DEFEAT FRAME 6 of 6: Final rubble pile. A motionless heap of grey rock and green moss where the golem stood. No light, no movement. Holds. Transparent PNG 384×384.

---
---

# CHARACTER 10 — SHADOW SOLDIER
Folder: `shadow/` | Canvas: 256×256 | Faces: RIGHT

---

## Step 1 — BASE MODEL
Save as: `shadow/BASE_MODEL.png`
> Approve this look before continuing. All 10 frames will reference this image.

2D anime mobile-RPG ally character sprite. Full body reference model. SUBJECT: A shadow soldier — a raised undead knight made of living dark energy. MATERIAL: Entire body is composed of dense black-and-deep-violet shadow matter. Not solid — semi-transparent at the edges, with wisps of dark energy drifting upward from the shoulders, hem, and feet. Has a humanoid soldier silhouette but no physical substance — darkness given form. FACE: No facial features visible inside the hood — complete darkness within, except for two small bright cyan pinpoints of light where eyes would be. Cold, sharp, faintly glowing. FORM: Reads as a humanoid soldier in light armor and hooded cloak — but all shapes are shadow matter, not real fabric or metal. A hood covers the head. Shoulder plates implied by the shape. A spectral dark sword in the RIGHT hand — a blade of compressed shadow energy with a faint violet-cyan edge, no physical material. LEFT HAND: open, slightly curled, no weapon. POSE: At-attention standing. Both feet together. Right arm at side with spectral sword pointing straight down. Left arm at side, relaxed. Head level. Shadow wisps drift upward slowly. Eerie stillness. FACING: RIGHT. CAMERA: Eye-level, 3/4 turn — 70% right-side profile 30% toward camera. Full body. CANVAS: 256×256 transparent, feet at 88% down. STYLE: Anime cel-shading — character is dark/shadowy. Deep blacks and purple-violet mid-tones. Only the cyan pinpoint eyes and faint violet sword edge are light sources. Outline is very dark blue-purple so the character reads on dark game backgrounds. No text, no background.

---

## Step 2 — idle_00
Save as: `shadow/idle_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same shadow form, hood, cyan pinpoint eyes, spectral sword, colors, proportions, canvas 256×256. Only the pose changes. POSE — SHADOW IDLE FRAME 1 of 4: Eerie still. Both feet together, sword pointing straight down at right side, left arm at side. Shadow wisps drifting upward from shoulders and hem at a slow steady rate. Cyan eye pinpoints glowing steadily. Absolute stillness otherwise. Loop base. Transparent PNG 256×256.

---

## Step 3 — idle_01
Save as: `shadow/idle_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same shadow form, hood, cyan eyes, spectral sword, proportions, canvas 256×256. Only the pose changes. POSE — SHADOW IDLE FRAME 2 of 4: Shadow swells. Shadow matter briefly thickening — body becoming slightly more solid and opaque, wisps becoming denser and more numerous. Cyan eyes brighten slightly. Body unchanged in pose. Transparent PNG 256×256.

---

## Step 4 — idle_02
Save as: `shadow/idle_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same shadow form, hood, cyan eyes, spectral sword, proportions, canvas 256×256. Only the pose changes. POSE — SHADOW IDLE FRAME 3 of 4: Shadow thins. Shadow matter thinning — body becoming slightly more translucent, wisps stretching longer and thinner. Cyan eyes dimming very slightly. Body unchanged in pose. Transparent PNG 256×256.

---

## Step 5 — idle_03
Save as: `shadow/idle_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same shadow form, hood, cyan eyes, spectral sword, proportions, canvas 256×256. Only the pose changes. POSE — SHADOW IDLE FRAME 4 of 4: IDENTICAL to idle_00. Eerie still, shadow wisps at normal rate, eyes steady. Loops. Transparent PNG 256×256.

---

## Step 6 — attack_00
Save as: `shadow/attack_00.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same shadow form, hood, cyan eyes, spectral sword, proportions, canvas 256×256. Only the pose changes. POSE — SHADOW ATTACK FRAME 1 of 6: Blur begins. Body becoming a dark blur — the solid shadow form dissolving into speed-wisps at the edges. Cyan eyes leaving a trailing streak. Body leaning forward to the right, beginning to phase into dash. Transparent PNG 256×256.

---

## Step 7 — attack_01
Save as: `shadow/attack_01.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same shadow form, hood, cyan eyes, spectral sword, proportions, canvas 256×256. Only the pose changes. POSE — SHADOW ATTACK FRAME 2 of 6: Full dash. Body fully blurred — nearly horizontal, shooting to the right. Spectral sword arm extended forward-right. Shadow matter streaming behind as a long dark trail. Cyan eye streaks. Body shape barely readable. Transparent PNG 256×256.

---

## Step 8 — attack_02
Save as: `shadow/attack_02.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same shadow form, hood, cyan eyes, spectral sword, proportions, canvas 256×256. Only the pose changes. POSE — SHADOW ATTACK FRAME 3 of 6: STRIKE — most dynamic frame. Spectral sword FULLY thrust to the right — right arm completely extended, dark blade pointing right at full reach. Shadow energy erupting from the blade tip on impact. Cyan eyes blazing. Body at full lunge. Transparent PNG 256×256.

---

## Step 9 — attack_03
Save as: `shadow/attack_03.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same shadow form, hood, cyan eyes, spectral sword, proportions, canvas 256×256. Only the pose changes. POSE — SHADOW ATTACK FRAME 4 of 6: Phase through. Body partially intangible — semi-dissolved, becoming partially transparent and dispersed as if passing through matter. Sword withdrawn. Transparent PNG 256×256.

---

## Step 10 — attack_04
Save as: `shadow/attack_04.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same shadow form, hood, cyan eyes, spectral sword, proportions, canvas 256×256. Only the pose changes. POSE — SHADOW ATTACK FRAME 5 of 6: Reappear. Shadow matter reassembling — re-solidifying into the soldier form, wisps being drawn back in. Body reforming from dispersed state back toward solid. Cyan eyes reappearing. Transparent PNG 256×256.

---

## Step 11 — attack_05
Save as: `shadow/attack_05.png`
> Attach BASE_MODEL.png before generating.

Using the attached base model as exact reference — same shadow form, hood, cyan eyes, spectral sword, proportions, canvas 256×256. Only the pose changes. POSE — SHADOW ATTACK FRAME 6 of 6: Return still. Back to the at-attention standing position — sword at side pointing down, both feet together, wisps drifting upward, eyes steady. Returning to idle_00. Transparent PNG 256×256.

---
---

# WEAPON ICONS
Folder: `weapons/` | Canvas: 96×128 each | No character, item only

---

## Weapon 1
Save as: `weapons/rusted-blade.png`

2D anime RPG item icon. A short one-handed sword. Blade pointed to the RIGHT at a slight upward angle, approximately 2 o'clock position. The blade is visibly corroded and pitted — rust patches covering 40% of the surface, chipped edge, dull grey-brown metal with no shine. Handle: wrapped in worn dark brown leather strips tied with rough cord, a simple small circular iron pommel, a plain flat iron crossguard. The whole weapon looks like it's been used and neglected. Transparent PNG 96×128. Weapon centered in the canvas. Clean anime cel-shading, soft shading. No background, no text, no shadow blob.

---

## Weapon 2
Save as: `weapons/hunters-dagger.png`

2D anime RPG item icon. A sleek one-handed dagger. Blade pointed to the RIGHT at a slight upward angle, approximately 2 o'clock position. The blade is clean polished blue-grey steel, narrow and tapered to a sharp point, with a subtle blue-silver sheen along the edge. Handle: dark blue paracord wrap over a metal grip, a small angular crossguard with slight upward curve, a teardrop-shaped pommel. Clean, purpose-built, hunter-grade — well maintained. Transparent PNG 96×128. Weapon centered. Clean anime cel-shading. No background, no text, no shadow.

---

## Weapon 3
Save as: `weapons/shadow-edge.png`

2D anime RPG item icon. A one-handed short sword made of shadow energy. Blade pointed to the RIGHT at a slight upward angle, approximately 2 o'clock position. The blade is composed of dense black shadow matter — non-reflective, dark and void-like. A faint violet-cyan energy line runs along both edges of the blade, defining its shape. A bright thin cyan line traces the very tip. The handle is solid matte black with a simple angular dark crossguard. The blade must be clearly visible despite being dark — use the violet-cyan edge glow to define it against the transparent background. Transparent PNG 96×128. Weapon centered. Anime cel-shading with energy glow. No background, no text, no shadow.

---
---

# BACKGROUND
Save as: `backgrounds/stage.png`

---

2D anime RPG battle background. 1280×800 pixels, landscape, fully opaque. A Solo Leveling-style dungeon gate interior. Setting: a vast underground stone cavern. High arched ceiling of dark cracked rock above. Massive stone columns flanking the left and right sides, partially visible. The dominant light source: a vertical magical rift crack in the background center-back wall — a tear in reality emitting cool blue-teal light that fans outward and downward onto the floor. Additional faint cyan glows emanate from cracks in the walls. The overall color temperature is cool — deep blue-grey shadows, teal-lit highlights.

THE FLOOR (lower third of image): Flat dark stone floor running the full width. Slightly reflective — the rift light creating a soft teal reflection on the stone. This area must be CLEAR and UNCLUTTERED — no rocks, no debris in the center floor zone. Characters will stand here. Keep it open.

THE BACKGROUND (upper two thirds): Stone walls with cracks, the glowing rift in the center distance, columns on the sides, a sense of great depth and height. Fine to add atmospheric details — faint runes on walls, stalactites at ceiling, wisps of rift energy. Must not compete with characters placed in the foreground.

Painterly anime style. High detail. Atmospheric and moody. No characters, no people, no UI, no text, no watermark. Fully opaque, 1280×800.

---

# END OF GUIDE
Total: 216 images across 12 characters + weapons + background.
Recommended order: Hunter Novice → Goblin → Background → then remaining characters.
