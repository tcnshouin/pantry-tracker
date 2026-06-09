SOLO SYSTEM — SPRITE GENERATION PROMPTS
========================================
Sequential one-at-a-time prompts. Copy each block, paste into Gemini, generate, save.
Say CONTINUE (in your Claude session) to receive the next prompt.

HOW TO USE
──────────
1. Start with BASE MODEL for a character. Generate it. Save the image.
2. For every frame after: ATTACH the base model image in Gemini, then paste the frame prompt.
3. One frame = one Gemini generation. Save each as the filename shown.
4. Always attach the LATEST generated frame + the base model when continuing a series.

WEAPON RULE (Option B — applies to ALL hunter prompts)
────────────────────────────────────────────────────────
The hunter's right hand is a closed weapon-grip fist — fingers curled as if gripping a
sword handle, thumb resting on top. NO weapon is visible. The hand is empty. The weapon
will be added in the game engine separately. Do not draw any blade, sword, or weapon.

CAMERA ANGLE (same for every sprite in this project)
──────────────────────────────────────────────────────
2D side-scrolling game sprite. Camera is at the character's eye level, positioned directly
to the side. Character is at a slight 3/4 turn — 70% side profile, 30% facing toward the
camera — so the near side of the face and chest are partially visible. Full body in frame
from top of head to bottom of feet. No perspective distortion (flat orthographic). The
character is centered on a fully transparent background. Feet sit at 88% down the canvas.
The character occupies roughly 80% of the canvas height.

STYLE RULES (same for every sprite)
─────────────────────────────────────
Art style: clean 2D anime mobile-RPG battler sprite. Bold readable silhouette. Soft cel
shading with 2–3 tone levels. Rim light from upper-left. Strong contrast between character
and background. No outlines that disappear on dark backgrounds — use colored outlines
matching the character's palette. No text, no watermark, no ground shadow blob, no scenery,
no UI elements.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHARACTER 1 — HUNTER NOVICE  |  256×256  |  Faces RIGHT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASE MODEL  ←  generate this first. Save as: hunter/novice/BASE_MODEL.png
──────────────────────────────────────────────────────────────────────────
2D anime mobile-RPG character reference sheet. A young male hunter in his late teens,
rookie rank. Body: athletic lean build, average height (not bulky). Face: sharp angular
jaw, slightly pointed nose, thin eyebrows, determined dark eyes. Hair: black, spiky,
irregular — medium length, spikes pointing upward and outward naturally, with a few
loose strands framing the face. No shine streak.

Clothing: dark charcoal-grey hooded jacket (hood down, resting on shoulders), zip
partially open at the collar revealing a dark grey crew-neck shirt underneath. Jacket
has a small worn patch on the left shoulder. Dark slim-fit pants, slightly tapered at
the ankle. Worn dark leather boots with simple lacing. No armor, no accessories, no glow.
The overall look is civilian-grade, practical but rough.

RIGHT HAND: closed weapon-grip fist — fingers curled tightly as if gripping a sword
handle, thumb resting on top of the fingers. No weapon visible. Left hand relaxed, slightly
open, hanging at his side.

Pose: neutral standing. Weight centered on both feet, shoulder-width apart. Arms hanging
naturally at sides, right fist at hip, left hand loose. Slight natural slouch — not
fully upright, a bit unsure of himself. Head level, looking slightly ahead.

Camera: 2D side-scrolling sprite. Eye-level camera. 3/4 angle — 70% right-side profile,
30% facing toward camera. Full body head to feet visible. Transparent background PNG.
Character centered, feet at 88% down the canvas, figure fills ~80% canvas height. 256×256.

Style: clean anime cel-shading, 2–3 tone shading, rim light from upper-left. Dark colored
outlines. No text, no background, no shadow blob.

Save this image. You will attach it to every frame prompt below.

────────────────────────────────────────────────────────
CONSISTENCY ANCHOR — paste this line at the top of every
frame prompt below before the pose description:
────────────────────────────────────────────────────────
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.

────────────────────────────────────────────────────────
IDLE ANIMATION  —  6 frames  —  gentle breathing loop
────────────────────────────────────────────────────────

idle_00.png  (neutral — the rest pose, same as base model)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — IDLE FRAME 0 of 6. Neutral rest. Both feet flat on ground shoulder-width apart.
Arms hanging at sides — right fist at hip level, left hand relaxed. Torso upright with a
slight natural slouch. Head level, eyes forward. Weight distributed evenly. This is the
loop's base frame. Transparent background PNG, 256×256. Same camera angle as base model.

idle_01.png  (inhale begins)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — IDLE FRAME 1 of 6. Inhale beginning. Chest very slightly expanded — ribcage rising
1–2mm. Shoulders fractionally raised. Body 2% taller than frame 0. Arms stay at sides,
right fist slightly lifting with the shoulder rise. Expression unchanged. Transparent
background PNG, 256×256. Same camera angle as base model.

idle_02.png  (peak inhale)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — IDLE FRAME 2 of 6. Peak inhale. Chest at its fullest — jacket slightly taut across
the front. Shoulders at their highest point, raised about 3mm from neutral. Chin lifts
very slightly upward. Right fist still at hip. Left hand still loose at side. Body at its
tallest. Transparent background PNG, 256×256. Same camera angle as base model.

idle_03.png  (exhale begins)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — IDLE FRAME 3 of 6. Exhale starting. Chest relaxing from full expansion back toward
neutral. Shoulders beginning to drop. Body returning to normal height from the peak. Arms
at sides, same as frame 0 level. Transparent background PNG, 256×256. Same camera angle
as base model.

idle_04.png  (full exhale)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — IDLE FRAME 4 of 6. Full exhale. Chest at its most relaxed — jacket slightly looser.
Shoulders at their lowest, about 2mm below neutral. Slight additional slouch in the upper
back. Body at its most compact height. Right fist and left hand at their lowest position
from the shoulder drop. Transparent background PNG, 256×256. Same camera angle as base model.

idle_05.png  (return to neutral — loops back to idle_00)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — IDLE FRAME 5 of 6. Returning to neutral. Pose is IDENTICAL to idle_00 — both feet
flat, arms at sides, right fist at hip, left hand loose, natural slight slouch. This frame
loops seamlessly back to frame 0. Transparent background PNG, 256×256. Same camera angle
as base model.

────────────────────────────────────────────────────────
ATTACK ANIMATION  —  8 frames  —  overhand sword swing (no weapon)
────────────────────────────────────────────────────────

attack_00.png  (ready — weight loads)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — ATTACK FRAME 0 of 8. Pre-attack load. Weight shifts back onto the left (rear) foot
— left knee bends slightly, right leg nearly straight. Right shoulder rotates backward
about 15°, right weapon-grip fist pulls back to right hip level. Left hand rises slightly
for balance. Upper body leans fractionally back. Eyes narrow, jaw sets. Transparent
background PNG, 256×256. Same camera angle as base model.

attack_01.png  (wind-up — arm raises)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — ATTACK FRAME 1 of 8. Wind-up. Right arm swings upward and back — elbow rising to
shoulder height, right weapon-grip fist pulling back past the right ear. Torso rotates
rightward about 20° away from camera direction. Left arm swings forward and down as
counterbalance. Both knees bend, body lowering slightly. Head turns to face the target
direction (right). Transparent background PNG, 256×256. Same camera angle as base model.

attack_02.png  (peak wind-up — maximum coil)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — ATTACK FRAME 2 of 8. Maximum coil. Right arm fully pulled back — elbow above
shoulder height, weapon-grip fist behind the right side of the head. Torso rotated ~30°
rightward, jacket stretching across the chest. Left arm extended forward-down for balance.
Knees bent, weight loaded entirely on back (left) foot. Chin tucked, intense focused
expression. Transparent background PNG, 256×256. Same camera angle as base model.

attack_03.png  (release — body uncoils)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — ATTACK FRAME 3 of 8. Uncoil begins. Torso snapping forward — rotating back to
face direction (leftward rotation) as power releases. Right arm beginning its forward arc,
elbow still bent, fist dropping from behind head toward forward. Weight transferring from
back foot to front (right) foot, right foot stepping forward. Left arm sweeping back.
Mouth opens slightly in effort. Transparent background PNG, 256×256. Same camera angle as
base model.

attack_04.png  (mid-swing — arm extends)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — ATTACK FRAME 4 of 8. Mid-swing. Right arm sweeping forward in a horizontal arc —
elbow mostly extended, weapon-grip fist at chest height, pointed forward-right (toward the
enemy at his right). Body fully facing forward, lunging — right foot planted forward, left
leg extended back. Left arm swept fully back for balance. Jacket pulled taut by the motion.
Transparent background PNG, 256×256. Same camera angle as base model.

attack_05.png  (IMPACT — most extended, peak power)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — ATTACK FRAME 5 of 8. IMPACT. Most dynamic frame. Right arm FULLY extended to the
right — elbow locked out, weapon-grip fist at chest height, pushed as far right as the arm
reaches. Body in a deep lunge — right knee bent 90°, right foot planted wide to the right,
left leg extended straight behind. Torso leaning forward over the front knee. Left arm
flung back and up for balance. Jaw clenched, eyes intense, slight lean of the head toward
the strike. This is the kill frame — maximum reach, maximum commitment.
Transparent background PNG, 256×256. Same camera angle as base model.

attack_06.png  (follow-through — momentum carries)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — ATTACK FRAME 6 of 8. Follow-through. Right arm continues past the impact point,
swinging downward-right — fist now below hip height, still in weapon-grip. Body momentum
still forward, slightly off-balance. Left arm swings forward to rebalance. Right knee
still forward, weight beginning to shift back. Expression releasing tension. Transparent
background PNG, 256×256. Same camera angle as base model.

attack_07.png  (recovery — returning to guard)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — ATTACK FRAME 7 of 8. Recovery. Body returning upright from the lunge. Feet stepping
back toward shoulder-width stance. Right arm pulling back to hip level, weapon-grip fist at
hip. Left arm returning to side. Weight re-centering, knees straightening. Breathing heavily
— mouth slightly open, brow relaxed from the effort. Near-neutral stance, guard position.
Transparent background PNG, 256×256. Same camera angle as base model.

────────────────────────────────────────────────────────
HIT ANIMATION  —  4 frames  —  taking damage
────────────────────────────────────────────────────────

hit_00.png  (impact moment)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — HIT FRAME 0 of 4. Impact. Body struck from the right side. Head snaps sharply to
the LEFT — chin forced left, neck tensing. Eyes slam shut. Mouth opens in a grunt — teeth
clenched. Body stiffens involuntarily, torso rigidly straight. Right weapon-grip fist
clenches tighter. Left arm flares slightly outward from the jolt. Feet stay planted but
shift weight toward the right. Hair spikes jolt to the left from momentum.
Transparent background PNG, 256×256. Same camera angle as base model.

hit_01.png  (full recoil)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — HIT FRAME 1 of 4. Recoil. Body thrown leftward and backward by the blow. Torso
leaning back at 20° from vertical, upper body pulled left. Right foot stumbles a half-step
left, left foot dragging. Both knees slightly bent absorbing the movement. Arms flail
slightly — right fist up near the chest defensively, left arm out for balance. Head still
snapped left, eyes still shut or wincing. Jacket pulled by the motion.
Transparent background PNG, 256×256. Same camera angle as base model.

hit_02.png  (absorbing — crouched guard)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — HIT FRAME 2 of 4. Absorbing the hit. Body crouched — knees bent, torso hunched
forward slightly. Right arm (weapon-grip fist) tucked across the midsection where the blow
landed, arm guarding. Left arm raised, elbow out, guarding the head. Eyes open but narrow
— pained, gritty expression. Teeth gritted. Feet replanted, recovering balance.
Transparent background PNG, 256×256. Same camera angle as base model.

hit_03.png  (recovery — rising)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — HIT FRAME 3 of 4. Rising from the guard crouch. Knees straightening, torso coming
back upright. Right weapon-grip fist lowering back to hip. Left arm lowering to side.
Head coming level. Still slightly winded — lips parted, breathing hard — but composure
returning. Returning toward idle stance. Transparent background PNG, 256×256. Same camera
angle as base model.

────────────────────────────────────────────────────────
DEFEAT ANIMATION  —  6 frames  —  falling
────────────────────────────────────────────────────────

defeat_00.png  (first stagger)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — DEFEAT FRAME 0 of 6. First stagger. Fatal blow received. Body lurching forward and
to the right, knees suddenly buckling inward. Right weapon-grip fist losing tension,
fingers beginning to loosen from grip. Left arm swinging limply. Head drooping forward,
chin toward chest. Eyes wide with shock, mouth slightly open. Weight falling forward onto
the right foot. Transparent background PNG, 256×256. Same camera angle as base model.

defeat_01.png  (grip released)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — DEFEAT FRAME 1 of 6. Power leaving. Right hand fully opening — fingers uncurling,
grip lost, fist gone. Both arms hanging weakly at sides, no strength left to hold guard.
Upper body hunching forward, spine curving. Knees bent deeper, body sinking. Eyes glassy
and unfocused. Mouth open, exhaling. Transparent background PNG, 256×256. Same camera
angle as base model.

defeat_02.png  (one knee)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — DEFEAT FRAME 2 of 6. Dropping to one knee. Right knee dropping to the ground —
right knee on floor, right lower-leg horizontal. Left foot still planted flat. Right hand
hitting the ground, palm flat, bracing the fall. Left arm dangling. Head bowed, face
hidden, hair hanging down. Body at a 45° forward angle, cannot stand.
Transparent background PNG, 256×256, feet/knee at bottom of canvas.

defeat_03.png  (falling — tipping)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — DEFEAT FRAME 3 of 6. Falling. Body tipping sideways to the LEFT (away from camera
direction), rotating about 45° from the one-knee position. The bracing arm (right hand)
giving out, sliding on the ground. Left foot lifting as the body tips. Arms limp, no
controlled motion. Hair falling sideways. Jacket hem lifting from the fall motion.
Transparent background PNG, 256×256.

defeat_04.png  (hitting the ground)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — DEFEAT FRAME 4 of 6. Impact with ground. Body fully horizontal on its LEFT side,
lying perpendicular to camera. Face toward camera side, eyes closed. Right arm flopped
across the torso, open hand palm-up on the ground. Left arm underneath the body or
extended above head. Legs loosely stacked, knees slightly bent. Jacket bunched up slightly.
Transparent background PNG, 256×256.

defeat_05.png  (final — still)
Reference the attached base model image exactly. Match the character's face, hair, clothing,
colors, art style, body proportions, and canvas size (256×256) precisely. Do not alter any
feature. Only the pose changes.
Pose — DEFEAT FRAME 5 of 6. Final still. IDENTICAL to defeat_04 but fully settled — no
motion tension in any limb. Everything fully at rest. This frame holds indefinitely.
Transparent background PNG, 256×256.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHARACTER 2 — HUNTER HUNTER TIER  |  256×256  |  Faces RIGHT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASE MODEL  ←  generate this first. Save as: hunter/hunter/BASE_MODEL.png
──────────────────────────────────────────────────────────────────────────
2D anime mobile-RPG character reference sheet. Same young male hunter as Novice tier —
IDENTICAL face (sharp jaw, dark eyes, black spiky irregular hair with loose strands) and
body proportions. He has leveled up. Same person, upgraded gear.

Clothing: fitted blue-black combat jacket — structured, form-fitting, with light matte
armor plating on both shoulders and the upper chest. Jacket collar stands up slightly.
Underneath: a dark navy crew-neck compression shirt. Dark tactical pants with a subtle
side seam detail. Black combat boots with reinforced toe caps and simple buckle at the
ankle. Dark fingerless tactical gloves on both hands.

RIGHT HAND: closed weapon-grip fist — fingers curled tightly as if gripping a sword
handle, thumb resting on top. Glove visible on the fist. NO weapon visible. Empty hand.

Pose: confident neutral standing. Both feet flat, shoulder-width apart. Arms hanging at
sides — right gloved fist at hip, left hand relaxed. Back fully straight, shoulders back.
Chin level, looking slightly ahead. Calm, assured expression. No slouch — this version
of the character stands taller and more composed than Novice.

A faint cyan edge-light runs along the right shoulder and right arm (very subtle — just
a thin rim highlight, not a glow).

Camera: 2D side-scrolling sprite. Eye-level camera. 3/4 angle — 70% right-side profile,
30% facing toward camera. Full body head to feet visible. Transparent background PNG.
256×256.

Style: clean anime cel-shading, 2–3 tones, rim light from upper-left plus subtle cyan
edge on right side. Dark colored outlines. No text, no background, no shadow blob.

Save this image. Attach it to every frame prompt in this section.

CONSISTENCY ANCHOR for every frame in this section:
Reference the attached base model image exactly. Match face, hair, clothing (blue-black
jacket, armor plating, tactical gloves), colors, art style, body proportions, and canvas
256×256. Do not alter any feature. Only the pose changes.

[All 24 frame poses are IDENTICAL to Hunter Novice above — copy the same pose descriptions
for idle_00–05, attack_00–07, hit_00–03, defeat_00–05. Only the consistency anchor
character description changes to match this tier's look.]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHARACTER 3 — HUNTER MONARCH TIER  |  256×256  |  Faces RIGHT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASE MODEL  ←  generate this first. Save as: hunter/monarch/BASE_MODEL.png
──────────────────────────────────────────────────────────────────────────
2D anime mobile-RPG character reference sheet. Same young male hunter — IDENTICAL face
and hair (black spiky hair, dark sharp eyes, same face structure). Maximum power form.

Clothing: long black armored coat reaching to mid-thigh — structured, with overlapping
dark plate segments on the chest, shoulders, and upper arms. Coat has subtle cyan-violet
energy trim along the edges (glowing faintly). Underneath: black high-collar bodysuit.
Dark armored gauntlets on both hands (full glove, not fingerless). Tall black armored
combat boots with slight heel. A faint violet-cyan aura radiates from the whole body —
thin energy wisps drifting upward from the coat hem and shoulders.

RIGHT HAND: closed weapon-grip fist — armored gauntlet, fingers curled as if gripping a
sword, thumb on top. NO weapon visible. Empty fist. Faint energy crackling around the
knuckles.

Eyes: normal dark eyes but with a very faint violet glow in the iris — subtle, not
cartoonishly glowing.

Pose: commanding neutral standing. Both feet flat, slightly wider than shoulder-width.
Arms at sides — right gauntlet fist at hip, left hand relaxed. Spine perfectly straight,
shoulders fully back and square. Head level, chin slightly raised — regal and imposing.
Expression cold, composed, absolutely certain. The coat hangs with weight, hem just above
the knees.

Camera: 2D side-scrolling sprite. Eye-level camera. 3/4 angle — 70% right-side profile,
30% facing toward camera. Full body head to feet. Transparent background PNG. 256×256.

Style: clean anime cel-shading, dramatic 2–3 tone shading, rim light from upper-left,
cyan-violet edge aura. Dark colored outlines. No text, no background, no shadow blob.

Save this image. Attach it to every frame prompt in this section.

CONSISTENCY ANCHOR for every frame in this section:
Reference the attached base model image exactly. Match face, hair, clothing (long black
armored coat, cyan-violet trim, armored gauntlets, energy aura), colors, art style, body
proportions, and canvas 256×256. Do not alter any feature. Only the pose changes.

[All 24 frame poses are IDENTICAL to Hunter Novice above — copy the same pose descriptions.
Only the consistency anchor changes to match this tier's look.]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHARACTER 4 — GOBLIN  |  256×256  |  Faces LEFT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASE MODEL  ←  generate this first. Save as: enemies/goblin/BASE_MODEL.png
──────────────────────────────────────────────────────────────────────────
2D anime mobile-RPG enemy reference sheet. A small goblin. Body: short — roughly 60% the
height of the hunter. Wiry, scrappy build. Limbs slightly too long for the body. Large
head relative to body.

Face: wide flat nose, beady round orange eyes close together, big jagged lower teeth
visible in a sneer, large pointy ears sticking outward. Green skin — medium saturated
green, slightly mottled. No hair.

Clothing: ragged dark brown loincloth held by a frayed rope belt. No shoes, bare feet
with clawed toes. Small rusty iron dagger gripped in the RIGHT hand — short blade, crude
wooden handle wrapped in leather strips, visibly corroded. Left hand open, clawed fingers.

Pose: typical goblin hunch — back rounded forward, knees bent and splayed outward, weight
on the balls of the feet. Not standing upright — always in a crouched ready state. Right
hand holding the dagger loosely at the side, blade pointing downward. Left arm out slightly
for balance. Head pushed forward on the neck, sneer expression.

Facing LEFT. The right side (dagger hand) is the far side, the left side (open hand) is
the near side toward camera.

Camera: 2D side-scrolling sprite. Eye-level camera. 3/4 angle — 70% LEFT-side profile,
30% facing toward camera. Full body head to feet visible. Transparent background PNG.
Character centered, feet at 88% down canvas, fills ~75% canvas height. 256×256.

Style: clean anime cel-shading, 2–3 tones, rim light from upper-left. Strong dark outlines.
No text, no background, no shadow blob.

Save this image. Attach it to every frame prompt in this section.

CONSISTENCY ANCHOR for every frame in this section:
Reference the attached base model image exactly. Match goblin's face, skin color, clothing
(brown loincloth, bare feet), dagger, colors, art style, body proportions, and canvas
256×256. Do not alter any feature. Only the pose changes.

────────────────────────────────────────────────────────
IDLE  —  4 frames  —  restless goblin sway
────────────────────────────────────────────────────────

idle_00.png  (neutral hunched)
Reference the attached base model image exactly. Match goblin's face, skin color, clothing (brown loincloth, bare feet), dagger, colors, art style, body proportions, and canvas 256×256. Do not alter any feature. Only the pose changes.
Pose — GOBLIN IDLE FRAME 0 of 4. Neutral hunched stance. Knees bent and splayed outward,
back rounded forward, weight on the balls of the bare feet. Dagger held loosely at right
side, blade pointing down. Left arm out slightly. Head pushed forward on neck. Eyes
narrow and wary, sneer. This is the loop base. Transparent PNG, 256×256. Same camera angle
as base model.

idle_01.png  (sway toward camera)
Reference the attached base model image exactly. Match goblin's face, skin color, clothing (brown loincloth, bare feet), dagger, colors, art style, body proportions, and canvas 256×256. Do not alter any feature. Only the pose changes.
Pose — GOBLIN IDLE FRAME 1 of 4. Swaying weight toward the near side (left, toward camera).
Left shoulder dips down, right shoulder rises. Left knee bends deeper, right knee
straightens fractionally. Head tilts left, following the sway. Dagger arm hangs slightly
looser. The restless shifting of a creature that can't stay still.
Transparent PNG, 256×256. Same camera angle as base model.

idle_02.png  (sway away from camera)
Reference the attached base model image exactly. Match goblin's face, skin color, clothing (brown loincloth, bare feet), dagger, colors, art style, body proportions, and canvas 256×256. Do not alter any feature. Only the pose changes.
Pose — GOBLIN IDLE FRAME 2 of 4. Swaying weight away from camera (right side). Right
shoulder dips, left shoulder rises. Right knee bends deeper. Head tilts right. Dagger
(right hand) pulls slightly closer to the body. Left claw hand rises slightly. The
opposite end of the sway from frame 1.
Transparent PNG, 256×256. Same camera angle as base model.

idle_03.png  (return to neutral — loops)
Reference the attached base model image exactly. Match goblin's face, skin color, clothing (brown loincloth, bare feet), dagger, colors, art style, body proportions, and canvas 256×256. Do not alter any feature. Only the pose changes.
Pose — GOBLIN IDLE FRAME 3 of 4. IDENTICAL to idle_00. Neutral hunched stance, weight
centered, dagger at side, head forward. This loops back to frame 0 seamlessly.
Transparent PNG, 256×256. Same camera angle as base model.

────────────────────────────────────────────────────────
ATTACK  —  6 frames  —  dagger lunge
────────────────────────────────────────────────────────

attack_00.png  (crouch and load)
Reference the attached base model image exactly. Match goblin's face, skin color, clothing (brown loincloth, bare feet), dagger, colors, art style, body proportions, and canvas 256×256. Do not alter any feature. Only the pose changes.
Pose — GOBLIN ATTACK FRAME 0 of 6. Pre-lunge crouch. Body drops VERY LOW — knees bent
deeply, thighs almost parallel to ground. Back hunches further forward. Dagger arm (right)
pulls back behind the hip, blade angling backward-up, ready to thrust. Left claw hand
presses to the ground in front for balance. Head close to the ground, eyes locked on target
to the left. Weight coiled entirely in the bent legs. Mouth open in a hiss.
Transparent PNG, 256×256. Same camera angle as base model.

attack_01.png  (launch off ground)
Reference the attached base model image exactly. Match goblin's face, skin color, clothing (brown loincloth, bare feet), dagger, colors, art style, body proportions, and canvas 256×256. Do not alter any feature. Only the pose changes.
Pose — GOBLIN ATTACK FRAME 1 of 6. Launching. Legs exploding upward and to the LEFT —
both feet leaving the ground. Body rises and angles toward the left (enemy direction).
Right arm (dagger) extending forward, starting the thrust. Left claw reaching forward.
Body at roughly 30° incline toward the target. Mouth screaming.
Transparent PNG, 256×256. Same camera angle as base model.

attack_02.png  (mid-air)
Reference the attached base model image exactly. Match goblin's face, skin color, clothing (brown loincloth, bare feet), dagger, colors, art style, body proportions, and canvas 256×256. Do not alter any feature. Only the pose changes.
Pose — GOBLIN ATTACK FRAME 2 of 6. Mid-air lunge. Both feet fully off ground. Body fully
extended in the air, angled toward the left target. Right arm thrusting the dagger forward
— elbow extending, blade pointing left-forward. Left arm spread for aerodynamics. Legs
trailing behind, slightly splayed. Peak of the jump arc. Mouth wide open in a screech.
Transparent PNG, 256×256, character floating in upper portion of canvas.

attack_03.png  (STRIKE — dagger extended)
Reference the attached base model image exactly. Match goblin's face, skin color, clothing (brown loincloth, bare feet), dagger, colors, art style, body proportions, and canvas 256×256. Do not alter any feature. Only the pose changes.
Pose — GOBLIN ATTACK FRAME 3 of 6. STRIKE. Most dynamic frame. Dagger FULLY thrust to the
LEFT — right arm completely extended, dagger blade pointing left at full reach. Body at
its most forward/leftward lean in the air, shoulder driving behind the thrust. Left claw
also reaching left. Legs splayed behind. Face contorted in a fierce attacking expression.
This is the impact frame. Transparent PNG, 256×256.

attack_04.png  (landing — absorbing)
Reference the attached base model image exactly. Match goblin's face, skin color, clothing (brown loincloth, bare feet), dagger, colors, art style, body proportions, and canvas 256×256. Do not alter any feature. Only the pose changes.
Pose — GOBLIN ATTACK FRAME 4 of 6. Landing. Both feet hitting the ground, bent knees
absorbing the impact — low crouch on landing, body jarred downward. Dagger arm pulling
back, post-thrust. Left hand hitting ground to stabilize. Body weight compressed by the
landing, back rounded. Transparent PNG, 256×256. Same camera angle as base model.

attack_05.png  (recover — back to stance)
Reference the attached base model image exactly. Match goblin's face, skin color, clothing (brown loincloth, bare feet), dagger, colors, art style, body proportions, and canvas 256×256. Do not alter any feature. Only the pose changes.
Pose — GOBLIN ATTACK FRAME 5 of 6. Recovery. Rising from landing crouch back to the idle
hunched stance — knees straightening to normal bent position, dagger returning to side,
left hand lifting off ground. Returning to idle_00 position. Licking lips or sneering.
Transparent PNG, 256×256. Same camera angle as base model.

────────────────────────────────────────────────────────
HIT  —  3 frames  —  struck
────────────────────────────────────────────────────────

hit_00.png
Reference the attached base model image exactly. Match goblin's face, skin color, clothing (brown loincloth, bare feet), dagger, colors, art style, body proportions, and canvas 256×256. Do not alter any feature. Only the pose changes.
Pose — GOBLIN HIT FRAME 0 of 3. Impact. Struck from the left side. Head snapping sharply
RIGHT (away from the hit). Eyes wide, mouth forced open in a screech of pain. Body
stiffening — back straightening involuntarily from the blow, which is unusual for a goblin.
Dagger clenched tighter in the shock. Feet stumbling, weight jarred right.
Transparent PNG, 256×256. Same camera angle as base model.

hit_01.png
Reference the attached base model image exactly. Match goblin's face, skin color, clothing (brown loincloth, bare feet), dagger, colors, art style, body proportions, and canvas 256×256. Do not alter any feature. Only the pose changes.
Pose — GOBLIN HIT FRAME 1 of 3. Thrown right. Body stumbling rightward — right foot
stepping back-right, left foot dragging. Upper body leaning right and back. Dagger arm
flailing, dagger pointing loosely. Left arm flailing out. Face twisted in pain and rage.
Still in a low hunched position. Transparent PNG, 256×256. Same camera angle as base model.

hit_02.png
Reference the attached base model image exactly. Match goblin's face, skin color, clothing (brown loincloth, bare feet), dagger, colors, art style, body proportions, and canvas 256×256. Do not alter any feature. Only the pose changes.
Pose — GOBLIN HIT FRAME 2 of 3. Staggered recovery. Feet replanted, crouching lower,
dagger raised defensively. Left claw arm extended toward the enemy (left) in a warding
gesture. Body low, eyes re-locking onto the enemy, expression of fury replacing pain.
Transparent PNG, 256×256. Same camera angle as base model.

────────────────────────────────────────────────────────
DEFEAT  —  5 frames
────────────────────────────────────────────────────────

defeat_00.png
Reference the attached base model image exactly. Match goblin's face, skin color, clothing (brown loincloth, bare feet), colors, art style, body proportions, and canvas 256×256. Do not alter any feature. Only the pose changes.
Pose — GOBLIN DEFEAT FRAME 0 of 5. Stagger. Knocked hard. Knees giving out, body lurching
rightward and forward. Dagger slipping from the fingers — hand opening. Mouth open in a
surprised squeal. Eyes wide with shock. Transparent PNG, 256×256.

defeat_01.png
Reference the attached base model image exactly. Match goblin's face, skin color, clothing, colors, art style, and canvas 256×256. Only pose changes.
Pose — GOBLIN DEFEAT FRAME 1 of 5. Dropping. Both knees hitting the ground, body crumpling
forward. Dagger fallen, hand empty. Head drooping toward the ground. Arms limp.
Transparent PNG, 256×256.

defeat_02.png
Reference the attached base model image exactly. Match goblin's face, skin color, clothing, colors, art style, and canvas 256×256. Only pose changes.
Pose — GOBLIN DEFEAT FRAME 2 of 5. Falling forward. Body toppling face-first toward the
ground, arms unable to catch. Legs trailing. Transparent PNG, 256×256.

defeat_03.png
Reference the attached base model image exactly. Match goblin's face, skin color, clothing, colors, art style, and canvas 256×256. Only pose changes.
Pose — GOBLIN DEFEAT FRAME 3 of 5. On the ground. Sprawled on its left side, small body
in a heap. Face to the side, eyes closed. Limbs loose and awkward. Loincloth bunched.
Transparent PNG, 256×256.

defeat_04.png
Reference the attached base model image exactly. Match goblin's face, skin color, clothing, colors, art style, and canvas 256×256. Only pose changes.
Pose — GOBLIN DEFEAT FRAME 4 of 5. Final still. IDENTICAL to defeat_03 but fully settled,
no motion. This frame holds. Transparent PNG, 256×256.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHARACTER 5 — IMP  |  256×256  |  Faces LEFT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASE MODEL  ←  generate this first. Save as: enemies/imp/BASE_MODEL.png
──────────────────────────────────────────────────────────────────────
2D anime mobile-RPG enemy reference sheet. A small flying imp demon. Body: tiny — even
shorter than the goblin. Very thin and bony — elongated limbs, narrow torso. Hovering about
20% of its body height above the ground line.

Face: small round head, two small curved horns on top pointing slightly outward, large
bright yellow glowing eyes (irises fill most of the eye), tiny pointed nose, wide thin
mouth in a sinister grin showing small sharp teeth. Muted purple-violet skin.

Body: thin angular torso, long thin arms ending in three-fingered clawed hands, long thin
legs ending in two-toed clawed feet. Two large leathery bat wings extending from the upper
back — wingspan roughly 1.5× the body width. Wings are semi-translucent at the tips,
darkening to deep purple at the base.

No clothing. Small pointed tail curling behind.

Pose: mid-hover. Both wings spread at mid-flap — roughly horizontal, slight downward angle
at the tips. Body level, arms hanging at sides with claws loosely curled. Legs dangling
below, slightly bent. Head facing left-forward (same 3/4 angle as others). Hovering grin.

Facing LEFT. Camera: eye-level, 3/4 left-side profile. Transparent PNG. 256×256.

Style: anime cel-shading, 2–3 tones, rim from upper-left. Strong outlines. No text,
no background. Save and attach to all imp frames.

CONSISTENCY ANCHOR for every frame in this section:
Reference the attached base model image exactly. Match imp's face, skin color, wings, body
proportions, colors, art style, and canvas 256×256. Do not alter any feature. Only pose changes.

[Idle 4 frames, Attack 6 frames, Hit 3 frames, Defeat 5 frames — available via CONTINUE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHARACTER 6 — WOLF (Shadow Wolf)  |  256×256  |  Faces LEFT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASE MODEL  ←  generate this first. Save as: enemies/wolf/BASE_MODEL.png
──────────────────────────────────────────────────────────────────────
2D anime mobile-RPG enemy reference sheet. A four-legged shadow wolf. Body: medium-large —
roughly the body height of a crouched human, wider than tall. Heavily muscled, low-slung
predatory build. All four legs planted.

Fur: dark grey-black shaggy fur, slightly matted and uneven in length. Longer fur around
the neck/chest (mane-like). Tail: thick, medium length, held stiffly behind.

Face: large lupine head, elongated snout, bared fangs (upper and lower), icy blue glowing
eyes (narrow, predatory), black nose, pointed ears flat and angled back. Slightly scarred
across the muzzle.

Legs: four muscular legs, large paws with visible dark claws. Front legs slightly longer
than hind legs, giving a natural forward-lean predatory posture.

Pose: predatory low stance — all four paws planted on the ground, spine roughly parallel
to ground, weight slightly forward over the front legs, head lowered to shoulder level,
eyes locked forward (left). Tail straight behind. Not sitting, not standing tall — hunting
crouch.

Facing LEFT. Camera: eye-level, 3/4 left-side profile. Full body head to tail visible.
Transparent PNG. 256×256.

Style: anime cel-shading, 2–3 tones, rim from upper-left. Strong outlines. Save and attach.

CONSISTENCY ANCHOR for every frame in this section:
Reference the attached base model image exactly. Match wolf's face, fur, body proportions,
colors, art style, and canvas 256×256. Do not alter any feature. Only pose changes.

[Idle 4 frames, Attack 6 frames, Hit 3 frames, Defeat 5 frames — available via CONTINUE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHARACTER 7 — ORC  |  256×256  |  Faces LEFT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASE MODEL  ←  generate this first. Save as: enemies/orc/BASE_MODEL.png
──────────────────────────────────────────────────────────────────────
2D anime mobile-RPG enemy reference sheet. A large orc brute. Body: big and wide —
significantly taller and broader than the hunter. Massively muscled, barrel chest, thick
neck, heavy limbs. Moves slowly but hits extremely hard.

Skin: green-grey, slightly mottled, with visible muscle definition through the skin.

Face: broad flat face, wide flat nose, small deep-set red eyes, prominent lower jaw with
two thick tusks curving upward from the lower lip. Heavy brow ridge. No hair or bald head
with a few scars.

Clothing: scrap metal shoulder armor — mismatched plates bolted to leather straps on both
shoulders. Ragged dark brown pants cut off at the knee, held by a thick leather belt.
Bare feet with thick clawed toenails. No shirt — bare muscled torso. Crude iron buckle
on the belt.

Weapon: a large heavy iron club/maul — thick cylindrical handle, large flat heavy iron
head, visibly dented from use. Held in BOTH hands, currently resting on the right shoulder
or at the side.

Pose: wide threatening stance — feet wider than shoulder-width, toes slightly out. Knees
slightly bent, weight low and stable. Club resting across both hands held in front or on
shoulder. Head slightly forward, red eyes glaring left. Mouth in a contemptuous sneer
showing tusks.

Facing LEFT. Camera: eye-level, 3/4 left-side profile. Full body visible. Transparent PNG. 256×256.

Style: anime cel-shading, 2–3 tones, rim from upper-left. Save and attach.

CONSISTENCY ANCHOR for every frame in this section:
Reference the attached base model image exactly. Match orc's face, skin color, clothing,
club, body proportions, colors, art style, and canvas 256×256. Do not alter any feature.
Only pose changes.

[Idle 4, Attack 6, Hit 3, Defeat 5 frames — available via CONTINUE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHARACTER 8 — GATEKEEPER (Boss)  |  384×384  |  Faces LEFT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASE MODEL  ←  generate this first. Save as: enemies/gate_e_boss/BASE_MODEL.png
──────────────────────────────────────────────────────────────────────────────
2D anime mobile-RPG boss enemy reference sheet. The Gatekeeper — a massive armored demon
warrior. Body: towering — nearly twice the height of the hunter. Powerfully built,
shoulders extremely broad.

Skin: dark crimson-red, visible on the face and hands.

Armor: FULL heavy plate armor covering the entire body — dark gunmetal grey with red-brown
rust staining at the seams. Chest plate has a large angular design. Shoulder plates are
wide and jutting, with short downward spikes. Greaves on the shins. Gauntlets on both
hands. The armor looks ancient and battle-worn — dented, scratched, chipped edges.

Helmet: large full-face visor helmet with two curved ram-style horns curving upward from
the sides. The visor is a narrow horizontal slit showing the orange-red glow of the eyes
inside — eyes are not fully visible, just the glow through the visor.

Weapon: a massive two-handed greatsword — blade is as long as the hunter is tall, wide
and thick, dark steel with an angular crossguard. Currently held in the right hand with
the blade tip resting on the ground beside the right foot.

Pose: imposing neutral. Standing tall and wide, feet shoulder-width apart on flat ground.
Greatsword in right hand, tip touching the ground to the right. Left hand at side. Back
straight. Head level. Absolutely still — radiating menace. Not aggressive yet, just
present and overwhelming.

Facing LEFT. Camera: eye-level, 3/4 left-side profile. Full body visible. CANVAS 384×384.
Character fills ~85% of canvas height. Feet at 90% down canvas. Transparent PNG.

Style: anime cel-shading, 2–3 tones, dramatic lighting from upper-left. Strong dark
outlines. Save and attach to all boss frames.

CONSISTENCY ANCHOR for every frame in this section:
Reference the attached base model image exactly. Match Gatekeeper's armor design, helmet,
greatsword, red skin, colors, art style, body proportions, and canvas 384×384. Do not
alter any feature. Only pose changes.

[Idle 6, Attack 8, Hit 4, Defeat 6 frames — available via CONTINUE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHARACTER 9 — STONE GOLEM (Boss)  |  384×384  |  Faces LEFT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASE MODEL  ←  generate this first. Save as: enemies/gate_d_boss/BASE_MODEL.png
──────────────────────────────────────────────────────────────────────────────
2D anime mobile-RPG boss enemy reference sheet. The Stone Golem — a colossal humanoid
constructed entirely of living rock. Body: extremely massive — the largest enemy in the
game. Wide, blocky, slow.

Material: grey cracked rock throughout. The cracks between rock segments are filled with
dark green moss and faint golden-amber dirt. The rock surface is rough and textured —
not smooth. Chunks of varying sizes make up the arms, torso, and legs. No clothing.

Core: in the center of the chest, where the heart would be, there is a perfectly circular
magical energy core — glowing cyan-blue, smooth and bright, embedded in the rock. It pulses
with light. This is the only luminous element on the whole body.

Face: crude and rough — two recessed eye sockets with small cyan glowing points of light
deep inside (the eyes). No nose, no mouth. The head is a large irregular boulder sitting
directly on the shoulders with no neck.

Arms: massive — each arm as wide as the hunter's torso. Blocky forearms, huge cuboid fists.
Legs: thick pillars. No feet per se — the legs end in flat platforms of rock.

Pose: dormant stand. Both rock-pillar legs flat on ground, wide stance. Both massive fists
hanging at sides. Core glowing at rest. Head angled very slightly downward as if looking
at something small. Immense sense of weight and gravity.

Facing LEFT. Camera: eye-level, 3/4 left-side profile. Full body. CANVAS 384×384.
Character fills ~90% canvas height. Transparent PNG.

Style: anime cel-shading with rocky texture, 2–3 tones, rim from upper-left, cyan glow
from core illuminating the chest area. Strong dark outlines. Save and attach.

CONSISTENCY ANCHOR for every frame in this section:
Reference the attached base model image exactly. Match Stone Golem's rock texture, moss,
cyan core, face, body proportions, colors, art style, and canvas 384×384. Only pose changes.

[Idle 6, Attack 8, Hit 4, Defeat 6 frames — available via CONTINUE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHARACTER 10 — SHADOW SOLDIER  |  256×256  |  Faces RIGHT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASE MODEL  ←  generate this first. Save as: shadow/BASE_MODEL.png
──────────────────────────────────────────────────────────────────
2D anime mobile-RPG ally reference sheet. A shadow soldier — a raised undead knight made
of living dark energy.

Material: the entire body is composed of dense black-and-deep-violet shadow matter.
Not solid — semi-transparent at the edges, with wisps of dark energy drifting upward from
the shoulder lines, the hem, and the feet. The body has a humanoid soldier silhouette but
no physical substance — it is made of darkness given form.

Face: no facial features visible. Where the face would be inside the hood — complete
darkness, except for two small bright cyan pinpoints of light where the eyes would be.
These are cold, sharp, and slightly glowing.

Form/clothing: reads as a humanoid soldier in light armor and a hooded cloak — but all
these shapes are made of shadow, not fabric or metal. A hood covers the head. Shoulder
plates implied by the shape. A spectral dark sword in the RIGHT hand — a blade of
compressed shadow energy, no physical material, just a dark form with a faint violet edge.

LEFT HAND: open, slightly curled, no weapon.

Pose: at-attention stance. Standing upright, feet together. Right arm at side with spectral
sword pointing down. Left arm at side, relaxed. Head level. The shadow wisps drift upward
slowly from the body outline. An eerie stillness.

Facing RIGHT. Camera: eye-level, 3/4 right-side profile. Full body visible. Transparent
PNG. 256×256.

Style: anime cel-shading with the character being dark/shadowy — use deep blacks, purple-
violet mid-tones, and only the cyan eyes and faint sword-edge as light sources. Outline
should be a very dark blue-purple (not black) so the character reads on dark backgrounds.
No text, no background. Save and attach.

CONSISTENCY ANCHOR for every frame in this section:
Reference the attached base model image exactly. Match shadow soldier's form, shadow
material, cyan eyes, spectral sword, colors, art style, body proportions, and canvas
256×256. Do not alter any feature. Only pose changes.

[Idle 4, Attack 6 frames — available via CONTINUE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WEAPON SPRITES (Option B — separate overlays)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
These are small standalone weapon images — no character attached. The game overlays these
on the hunter's empty fist in the correct angle and position per frame.

Each weapon: 96×128 PNG. Transparent background. Blade pointed to the RIGHT and slightly
upward (approximately 2 o'clock angle) — this is the "held ready" orientation. Weapon
centered in the canvas.

weapons/rusted-blade.png
2D anime game item sprite. A short one-handed iron sword in a held-ready position. Blade
pointed to the RIGHT at a slight upward angle (2 o'clock). The blade is visibly corroded
and pitted — rust patches, chipped edge, dull grey-brown metal. The handle is wrapped in
worn brown leather strips with a small circular pommel. A simple iron crossguard. A
beginner's weapon that has seen rough use. Transparent PNG, 96×128. No background, no
shadow, no text. Clean anime style, soft cel shading.

weapons/hunters-dagger.png
2D anime game item sprite. A sleek one-handed dagger in held-ready position. Blade pointed
RIGHT at slight upward angle (2 o'clock). The blade is clean polished blue-grey steel,
narrow and tapered to a sharp point, with a subtle blue sheen along the edge. The handle
is wrapped in dark blue cord over a metal grip, with a small angular crossguard and
teardrop pommel. Clean, purpose-built, hunter-grade. Transparent PNG, 96×128. No
background, no shadow, no text. Clean anime style, soft cel shading.

weapons/shadow-edge.png
2D anime game item sprite. A one-handed short sword made of compressed shadow energy in
held-ready position. Blade pointed RIGHT at slight upward angle (2 o'clock). The blade
itself appears to be made of dense black shadow matter — non-reflective, dark, with a
faint violet-cyan energy edge running along both sides of the blade. A thin line of
bright cyan traces the very tip. The handle is solid black with a simple dark crossguard.
No physical material — just darkness shaped into a blade. Transparent PNG, 96×128. No
background. Clean anime style, cel shading. The dark blade must be visible against a
transparent background — use the violet edge glow to define it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BACKGROUND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

backgrounds/stage.png
2D anime RPG painted battle background. 1280×800 pixels, landscape. A Solo Leveling–style
dungeon gate interior. Setting: a vast underground stone cavern — high arched ceiling of
dark cracked rock, massive stone columns flanking the sides, broken stone floor. The
dominant light source is a magical rift in the background center — a vertical crack in
reality emanating cool blue-teal light that spreads across the floor in a wide cone. Wall
cracks also emit faint cyan glow. The overall mood is dark blue, cold, and otherworldly.

The LOWER THIRD of the image is the floor — flat polished dark stone, slightly reflective
of the rift light. THIS IS WHERE CHARACTERS STAND. Keep the floor area CLEAR and
UNCLUTTERED — no rocks, no debris in the center floor zone.

The UPPER TWO-THIRDS is the background scenery — stone walls, columns, the rift light in
the distance, a sense of great depth. Fine to have visual interest here (cracks, faint
runes, stalactites) as long as it doesn't compete with characters placed in front.

Fully opaque (no transparency). High detail. Painterly anime style. No characters, no
people, no UI, no text, no watermark.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUICK REFERENCE — FILES PER CHARACTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hunter Novice    hunter/novice/       BASE_MODEL + idle×6 + attack×8 + hit×4 + defeat×6  = 25
Hunter Hunter    hunter/hunter/       BASE_MODEL + idle×6 + attack×8 + hit×4 + defeat×6  = 25
Hunter Monarch   hunter/monarch/      BASE_MODEL + idle×6 + attack×8 + hit×4 + defeat×6  = 25
Goblin           enemies/goblin/      BASE_MODEL + idle×4 + attack×6 + hit×3 + defeat×5  = 19
Imp              enemies/imp/         BASE_MODEL + idle×4 + attack×6 + hit×3 + defeat×5  = 19
Wolf             enemies/wolf/        BASE_MODEL + idle×4 + attack×6 + hit×3 + defeat×5  = 19
Orc              enemies/orc/         BASE_MODEL + idle×4 + attack×6 + hit×3 + defeat×5  = 19
Gatekeeper       enemies/gate_e_boss/ BASE_MODEL + idle×6 + attack×8 + hit×4 + defeat×6  = 25
Stone Golem      enemies/gate_d_boss/ BASE_MODEL + idle×6 + attack×8 + hit×4 + defeat×6  = 25
Shadow Soldier   shadow/              BASE_MODEL + idle×4 + attack×6                      = 11
Weapons          weapons/             rusted-blade + hunters-dagger + shadow-edge          = 3
Background       backgrounds/         stage.png                                            = 1
                                                                               TOTAL = 216
