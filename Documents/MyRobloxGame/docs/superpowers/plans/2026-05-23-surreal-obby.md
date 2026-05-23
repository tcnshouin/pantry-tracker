# Surreal Obby Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete infinite procedurally generated surreal Roblox obby with risky power-ups, Dream Shards economy, cosmetics shop, and Robux Game Pass monetization.

**Architecture:** Chunk-based procedural generation stitches hand-crafted platform sections at runtime with live mutations (rotating, shrinking, teleporting) and periodic chaos events. Server owns all game state and economy; client handles visuals and UI. All monetization uses Game Passes via `MarketplaceService`.

**Tech Stack:** Luau (`--!strict`), Roblox APIs (`TweenService`, `CollectionService`, `DataStoreService`, `OrderedDataStore`, `MarketplaceService`), Rojo for file sync, Studio playtest for verification.

---

## File Map

| File | Type | Responsibility |
|---|---|---|
| `src/shared/Constants.lua` | ModuleScript | All tunable numbers and string keys in one place |
| `src/shared/Remotes.lua` | ModuleScript | Declares all RemoteEvent/RemoteFunction names |
| `src/shared/Chunks/ChunkEasy.lua` | ModuleScript | 10 easy chunk definitions |
| `src/shared/Chunks/ChunkMedium.lua` | ModuleScript | 10 medium chunk definitions |
| `src/shared/Chunks/ChunkHard.lua` | ModuleScript | 10 hard chunk definitions |
| `src/server/Init.lua` | Script | Creates RemoteEvents in ReplicatedStorage on startup |
| `src/server/MapGenerator.lua` | Script | Chunk spawning, mutations, chaos events, checkpoints, kill zone |
| `src/server/PowerupManager.lua` | Script | Orb spawning and pickup validation |
| `src/server/EconomyManager.lua` | Script | Dream Shards earning, DataStore persistence, pass multiplier |
| `src/server/MonetizationManager.lua` | Script | Pass ownership caching, in-session purchase detection |
| `src/server/LeaderboardManager.lua` | Script | OrderedDataStore top-10, live session sync |
| `src/client/SurrealFX.lua` | LocalScript | Client-side mutations, orb pulse, color shifts |
| `src/client/PowerupHandler.lua` | LocalScript | Applies power-up effects and drawbacks to local player |
| `src/client/ShopGui.lua` | LocalScript | Cosmetics shop UI, purchase requests via RemoteFunction |
| `src/client/HudController.lua` | LocalScript | Live score display, shard count, active power-up timer |

---

## Task 1: Constants & Remotes Foundation

**Files:**
- Create: `src/shared/Constants.lua`
- Create: `src/shared/Remotes.lua`
- Create: `src/server/Init.lua`

- [ ] **Step 1: Create Constants.lua**

```lua
--!strict
local Constants = {}

-- Chunk generation
Constants.CHUNK_BUFFER = 3
Constants.CHUNKS_PER_DIFFICULTY_STEP = 5
Constants.CHECKPOINT_INTERVAL = 3          -- chunks between checkpoints
Constants.CHECKPOINT_INTERVAL_VIP = 2

-- Difficulty thresholds
Constants.DIFF_MEDIUM_START = 11
Constants.DIFF_HARD_START = 26
Constants.DIFF_MAX_START = 51

-- Chaos event frequency (chunks between events)
Constants.CHAOS_FREQ_MEDIUM = 15
Constants.CHAOS_FREQ_HARD = 10
Constants.CHAOS_FREQ_MAX = 7
Constants.CHAOS_DURATION = 3               -- seconds

-- Power-up durations (seconds)
Constants.POWERUP_DURATION = 8
Constants.POWERUP_GHOST_DRAWBACK = 3
Constants.POWERUP_TIMEFREEZE_DURATION = 5
Constants.POWERUP_PRO_REDUCTION = 0.4     -- 40% drawback reduction, rounded up

-- Economy
Constants.SHARDS_PER_CHUNK = 5
Constants.SHARDS_BONUS_10_CHUNKS = 25
Constants.SHARDS_PERSONAL_BEST = 50
Constants.SHARDS_CHAOS_SURVIVED = 15
Constants.SHARD_SAVE_INTERVAL = 60        -- seconds

-- Respawn
Constants.INVINCIBILITY_DURATION = 1      -- seconds
Constants.DEATH_TWEEN_TIME = 0.5

-- Leaderboard
Constants.LEADERBOARD_UPDATE_INTERVAL = 5  -- seconds (live session)
Constants.LEADERBOARD_TOP_N = 10

-- Game Pass IDs (fill in after creating passes in Roblox Creator Hub)
Constants.PASS_DREAM_COLLECTOR = 0         -- replace with real ID
Constants.PASS_VIP_CHECKPOINT = 0
Constants.PASS_POWERUP_PRO = 0
Constants.PASS_CHAOS_WARD = 0
Constants.PASS_VOID_TRAIL = 0
Constants.PASS_CELESTIAL_AURA = 0
Constants.PASS_SHATTER_INTO_GOLD = 0
Constants.PASS_GLITCH_SKIN = 0

-- CollectionService tags
Constants.TAG_POWERUP_ORB = "PowerupOrb"
Constants.TAG_CHUNK_PART = "ChunkPart"

-- DataStore keys
Constants.DS_SHARDS = "PlayerShards_v1"
Constants.DS_COSMETICS = "PlayerCosmetics_v1"
Constants.DS_PERSONAL_BEST = "PlayerPB_v1"
Constants.ODS_LEADERBOARD = "AllTimeLeaderboard_v1"

-- Remote names
Constants.REMOTE_CHUNK_SPAWNED = "ChunkSpawned"
Constants.REMOTE_PICKUP_ORB = "PickupOrb"
Constants.REMOTE_APPLY_POWERUP = "ApplyPowerup"
Constants.REMOTE_UPDATE_SHARDS = "UpdateShards"
Constants.REMOTE_SESSION_LEADERBOARD = "SessionLeaderboard"
Constants.REMOTEFN_PURCHASE_COSMETIC = "PurchaseCosmetic"
Constants.REMOTEFN_GET_OWNED_COSMETICS = "GetOwnedCosmetics"
Constants.REMOTEFN_EQUIP_COSMETIC = "EquipCosmetic"
Constants.REMOTE_PROMPT_PASS = "PromptPass"

return Constants
```

- [ ] **Step 2: Create Remotes.lua**

```lua
--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Constants = require(script.Parent.Constants)

local Remotes = {}

local function getOrCreate(className: string, name: string): Instance
    local existing = ReplicatedStorage:FindFirstChild(name)
    if existing then return existing end
    local obj = Instance.new(className)
    obj.Name = name
    obj.Parent = ReplicatedStorage
    return obj
end

function Remotes.init()
    getOrCreate("RemoteEvent",    Constants.REMOTE_CHUNK_SPAWNED)
    getOrCreate("RemoteEvent",    Constants.REMOTE_PICKUP_ORB)
    getOrCreate("RemoteEvent",    Constants.REMOTE_APPLY_POWERUP)
    getOrCreate("RemoteEvent",    Constants.REMOTE_UPDATE_SHARDS)
    getOrCreate("RemoteEvent",    Constants.REMOTE_SESSION_LEADERBOARD)
    getOrCreate("RemoteEvent",    Constants.REMOTE_PROMPT_PASS)
    getOrCreate("RemoteFunction", Constants.REMOTEFN_PURCHASE_COSMETIC)
    getOrCreate("RemoteFunction", Constants.REMOTEFN_GET_OWNED_COSMETICS)
    getOrCreate("RemoteFunction", Constants.REMOTEFN_EQUIP_COSMETIC)
end

function Remotes.get(name: string): Instance
    return ReplicatedStorage:WaitForChild(name, 10)
end

return Remotes
```

- [ ] **Step 3: Create Init.lua (server bootstrap)**

```lua
--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Remotes = require(ReplicatedStorage:WaitForChild("Remotes"))
Remotes.init()
```

- [ ] **Step 4: Verify in Studio**
  - `rojo serve` already running; connect Studio via Rojo plugin
  - Press Play
  - Open Explorer → ReplicatedStorage — confirm all RemoteEvents and RemoteFunctions appear
  - Check Output window for errors

- [ ] **Step 5: Commit**
```bash
git add src/shared/Constants.lua src/shared/Remotes.lua src/server/Init.lua
git commit -m "feat: add Constants, Remotes, and server Init bootstrap"
```

---

## Task 2: Chunk Data Library

**Files:**
- Create: `src/shared/Chunks/ChunkEasy.lua`
- Create: `src/shared/Chunks/ChunkMedium.lua`
- Create: `src/shared/Chunks/ChunkHard.lua`

Each chunk definition is a table with `platforms`, `hazards`, `mutations`, and `difficulty`. Platforms use **relative positions** — the generator offsets them to stitch chunks end-to-end.

- [ ] **Step 1: Create ChunkEasy.lua (10 chunks)**

```lua
--!strict
type Platform = { pos: Vector3, size: Vector3, material: Enum.Material }
type Hazard   = { type: string, speed: number? }
type Chunk    = {
    platforms:  { Platform },
    hazards:    { Hazard },
    mutations:  { string },
    difficulty: number,
    length:     number,   -- how far this chunk extends along X axis
}

local ChunkEasy: { Chunk } = {
    -- Chunk 1: straight path, no mutations
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0),  size = Vector3.new(6, 1, 6),  material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(8,  0, 0),  size = Vector3.new(6, 1, 6),  material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(16, 0, 0),  size = Vector3.new(6, 1, 6),  material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "colorshift" },
        difficulty = 1,
        length     = 22,
    },
    -- Chunk 2: gentle staircase up
    {
        platforms = {
            { pos = Vector3.new(0,  0,  0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(7,  2,  0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(14, 4,  0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(21, 6,  0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
        },
        hazards    = {},
        mutations  = { "colorshift" },
        difficulty = 1,
        length     = 26,
    },
    -- Chunk 3: wide platform with gentle rising mutation
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(10, 1, 8), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(14, 0, 0), size = Vector3.new(6,  1, 6), material = Enum.Material.SmoothPlastic },
        },
        hazards    = { { type = "rising", speed = 1 } },
        mutations  = { "rising", "colorshift" },
        difficulty = 1,
        length     = 20,
    },
    -- Chunk 4: zigzag platforms
    {
        platforms = {
            { pos = Vector3.new(0,  0,  3),  size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(7,  0, -3),  size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(14, 0,  3),  size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(21, 0, -3),  size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
        },
        hazards    = {},
        mutations  = { "colorshift" },
        difficulty = 1,
        length     = 26,
    },
    -- Chunk 5: wide open platform, easy breather
    {
        platforms = {
            { pos = Vector3.new(0, 0, 0), size = Vector3.new(20, 1, 10), material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "colorshift" },
        difficulty = 1,
        length     = 20,
    },
    -- Chunk 6: descending steps
    {
        platforms = {
            { pos = Vector3.new(0,  6, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(7,  4, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(14, 2, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(21, 0, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "colorshift" },
        difficulty = 1,
        length     = 26,
    },
    -- Chunk 7: slow rotating platform in the middle
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(6, 1, 6), material = Enum.Material.Neon },
            { pos = Vector3.new(9,  0, 0), size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
            { pos = Vector3.new(17, 0, 0), size = Vector3.new(6, 1, 6), material = Enum.Material.Neon },
        },
        hazards    = { { type = "rotating", speed = 0.5 } },
        mutations  = { "rotating", "colorshift" },
        difficulty = 1,
        length     = 23,
    },
    -- Chunk 8: side-by-side narrow planks
    {
        platforms = {
            { pos = Vector3.new(0,  0,  2), size = Vector3.new(14, 1, 2), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(0,  0, -2), size = Vector3.new(14, 1, 2), material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "colorshift" },
        difficulty = 1,
        length     = 14,
    },
    -- Chunk 9: three floating islands in a line
    {
        platforms = {
            { pos = Vector3.new(0,  0,  0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(9,  2,  0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(18, 0,  0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
        },
        hazards    = {},
        mutations  = { "rising", "colorshift" },
        difficulty = 1,
        length     = 23,
    },
    -- Chunk 10: long single bridge
    {
        platforms = {
            { pos = Vector3.new(0, 0, 0), size = Vector3.new(30, 1, 4), material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "colorshift" },
        difficulty = 1,
        length     = 30,
    },
}

return ChunkEasy
```

- [ ] **Step 2: Create ChunkMedium.lua (10 chunks)**

```lua
--!strict
type Platform = { pos: Vector3, size: Vector3, material: Enum.Material }
type Hazard   = { type: string, speed: number? }
type Chunk    = {
    platforms:  { Platform },
    hazards:    { Hazard },
    mutations:  { string },
    difficulty: number,
    length:     number,
}

local ChunkMedium: { Chunk } = {
    -- Chunk 1: shrinking platforms
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(8,  0, 0), size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
            { pos = Vector3.new(15, 0, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
        },
        hazards    = {},
        mutations  = { "shrinking", "colorshift" },
        difficulty = 2,
        length     = 20,
    },
    -- Chunk 2: platforms that teleport in and out
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(8,  0, 0), size = Vector3.new(4, 1, 4), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(15, 0, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "teleporting", "colorshift" },
        difficulty = 2,
        length     = 20,
    },
    -- Chunk 3: rotating platforms at different heights
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(8,  4, 0), size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
            { pos = Vector3.new(16, 0, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
        },
        hazards    = { { type = "rotating", speed = 1.5 } },
        mutations  = { "rotating", "colorshift" },
        difficulty = 2,
        length     = 21,
    },
    -- Chunk 4: narrow corridor with rising platforms
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(4, 1, 3), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(6,  0, 0), size = Vector3.new(4, 1, 3), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(12, 0, 0), size = Vector3.new(4, 1, 3), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(18, 0, 0), size = Vector3.new(4, 1, 3), material = Enum.Material.SmoothPlastic },
        },
        hazards    = { { type = "rising", speed = 2 } },
        mutations  = { "rising", "colorshift" },
        difficulty = 2,
        length     = 22,
    },
    -- Chunk 5: large gap islands
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0),  size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(12, 3, 0),  size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
            { pos = Vector3.new(24, 0, 0),  size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
        },
        hazards    = {},
        mutations  = { "rising", "colorshift" },
        difficulty = 2,
        length     = 29,
    },
    -- Chunk 6: spinning cross platforms
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(6, 1, 2), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(9,  0, 0), size = Vector3.new(2, 1, 6), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(18, 0, 0), size = Vector3.new(6, 1, 2), material = Enum.Material.SmoothPlastic },
        },
        hazards    = { { type = "rotating", speed = 2 } },
        mutations  = { "rotating", "colorshift" },
        difficulty = 2,
        length     = 24,
    },
    -- Chunk 7: mixed mutations — rising and shrinking
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(8,  0, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(16, 0, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
        },
        hazards    = {},
        mutations  = { "rising", "shrinking", "colorshift" },
        difficulty = 2,
        length     = 21,
    },
    -- Chunk 8: tilted plank gauntlet
    {
        platforms = {
            { pos = Vector3.new(0,  0,  2), size = Vector3.new(10, 1, 2), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(12, 2, -2), size = Vector3.new(10, 1, 2), material = Enum.Material.SmoothPlastic },
        },
        hazards    = { { type = "rotating", speed = 1 } },
        mutations  = { "rotating", "colorshift" },
        difficulty = 2,
        length     = 22,
    },
    -- Chunk 9: teleporting step sequence
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
            { pos = Vector3.new(7,  2, 0), size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
            { pos = Vector3.new(14, 4, 0), size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
            { pos = Vector3.new(21, 2, 0), size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
        },
        hazards    = {},
        mutations  = { "teleporting", "colorshift" },
        difficulty = 2,
        length     = 25,
    },
    -- Chunk 10: rotating ring of platforms
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0),  size = Vector3.new(4, 1, 4), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(8,  0, 4),  size = Vector3.new(4, 1, 4), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(16, 0, 0),  size = Vector3.new(4, 1, 4), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(8,  0, -4), size = Vector3.new(4, 1, 4), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(24, 0, 0),  size = Vector3.new(4, 1, 4), material = Enum.Material.SmoothPlastic },
        },
        hazards    = { { type = "rotating", speed = 2 } },
        mutations  = { "rotating", "colorshift" },
        difficulty = 2,
        length     = 28,
    },
}

return ChunkMedium
```

- [ ] **Step 3: Create ChunkHard.lua (10 chunks)**

```lua
--!strict
type Platform = { pos: Vector3, size: Vector3, material: Enum.Material }
type Hazard   = { type: string, speed: number? }
type Chunk    = {
    platforms:  { Platform },
    hazards:    { Hazard },
    mutations:  { string },
    difficulty: number,
    length:     number,
}

local ChunkHard: { Chunk } = {
    -- Chunk 1: tiny platforms, all mutations
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(7,  4, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(14, 0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(21, 4, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
        },
        hazards    = { { type = "rotating", speed = 3 }, { type = "rising", speed = 3 } },
        mutations  = { "rotating", "rising", "shrinking", "colorshift" },
        difficulty = 3,
        length     = 24,
    },
    -- Chunk 2: teleporting + shrinking gauntlet
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(6,  0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(12, 0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(18, 0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(24, 0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "teleporting", "shrinking", "colorshift" },
        difficulty = 3,
        length     = 27,
    },
    -- Chunk 3: spiral ascent
    {
        platforms = {
            { pos = Vector3.new(0,  0,  0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(5,  3,  5), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(10, 6,  0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(15, 9, -5), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(20, 12, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
        },
        hazards    = { { type = "rotating", speed = 3 } },
        mutations  = { "rotating", "colorshift" },
        difficulty = 3,
        length     = 23,
    },
    -- Chunk 4: huge gap single platform
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(16, 0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(32, 0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "rising", "colorshift" },
        difficulty = 3,
        length     = 35,
    },
    -- Chunk 5: all four mutations simultaneously
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
            { pos = Vector3.new(9,  0, 0), size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
            { pos = Vector3.new(18, 0, 0), size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
        },
        hazards    = { { type = "rotating", speed = 3 }, { type = "rising", speed = 3 } },
        mutations  = { "rotating", "rising", "shrinking", "teleporting", "colorshift" },
        difficulty = 3,
        length     = 22,
    },
    -- Chunk 6: narrow plank over void, all shrinking
    {
        platforms = {
            { pos = Vector3.new(0, 0, 0), size = Vector3.new(20, 1, 2), material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "shrinking", "rotating", "colorshift" },
        difficulty = 3,
        length     = 20,
    },
    -- Chunk 7: floating micro-islands
    {
        platforms = {
            { pos = Vector3.new(0,  0,  3), size = Vector3.new(2, 1, 2), material = Enum.Material.Neon },
            { pos = Vector3.new(5,  4, -3), size = Vector3.new(2, 1, 2), material = Enum.Material.Neon },
            { pos = Vector3.new(10, 0,  3), size = Vector3.new(2, 1, 2), material = Enum.Material.Neon },
            { pos = Vector3.new(15, 4, -3), size = Vector3.new(2, 1, 2), material = Enum.Material.Neon },
            { pos = Vector3.new(20, 0,  0), size = Vector3.new(2, 1, 2), material = Enum.Material.Neon },
        },
        hazards    = { { type = "rising", speed = 4 } },
        mutations  = { "rising", "teleporting", "colorshift" },
        difficulty = 3,
        length     = 22,
    },
    -- Chunk 8: high-speed rotating arm platforms
    {
        platforms = {
            { pos = Vector3.new(0,  0,  0), size = Vector3.new(3, 1, 8), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(10, 0,  0), size = Vector3.new(3, 1, 8), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(20, 0,  0), size = Vector3.new(3, 1, 8), material = Enum.Material.SmoothPlastic },
        },
        hazards    = { { type = "rotating", speed = 5 } },
        mutations  = { "rotating", "colorshift" },
        difficulty = 3,
        length     = 23,
    },
    -- Chunk 9: vanishing staircase
    {
        platforms = {
            { pos = Vector3.new(0,  0,  0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(6,  3,  0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(12, 6,  0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(18, 9,  0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(24, 12, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
        },
        hazards    = {},
        mutations  = { "teleporting", "shrinking", "colorshift" },
        difficulty = 3,
        length     = 27,
    },
    -- Chunk 10: chaos arena (wide, all mutations, no gaps — chaos event stage)
    {
        platforms = {
            { pos = Vector3.new(0,  0,  0), size = Vector3.new(6, 1, 6), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(8,  0,  0), size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
            { pos = Vector3.new(15, 0,  0), size = Vector3.new(6, 1, 6), material = Enum.Material.SmoothPlastic },
        },
        hazards    = { { type = "rotating", speed = 4 }, { type = "rising", speed = 4 } },
        mutations  = { "rotating", "rising", "shrinking", "teleporting", "colorshift" },
        difficulty = 3,
        length     = 21,
    },
}

return ChunkHard
```

- [ ] **Step 4: Verify in Studio**
  - In Studio Output, run `require(game.ReplicatedStorage.Chunks.ChunkEasy)` in the Command Bar
  - Confirm it returns a table with 10 entries, no errors

- [ ] **Step 5: Commit**
```bash
git add src/shared/Chunks/
git commit -m "feat: add 30 chunk definitions (10 easy, 10 medium, 10 hard)"
```

---

## Task 3: Map Generator

**Files:**
- Create: `src/server/MapGenerator.lua`

The generator runs entirely on the server. It places chunks ahead of the player, applies server-side mutations via `TweenService`, fires `ChunkSpawned` RemoteEvent to clients, places checkpoints, runs chaos events, and cleans up old chunks safely.

- [ ] **Step 1: Create MapGenerator.lua**

```lua
--!strict
local Players           = game:GetService("Players")
local TweenService      = game:GetService("TweenService")
local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace         = game:GetService("Workspace")

local Constants   = require(ReplicatedStorage:WaitForChild("Constants"))
local ChunkEasy   = require(ReplicatedStorage:WaitForChild("Chunks"):WaitForChild("ChunkEasy"))
local ChunkMedium = require(ReplicatedStorage:WaitForChild("Chunks"):WaitForChild("ChunkMedium"))
local ChunkHard   = require(ReplicatedStorage:WaitForChild("Chunks"):WaitForChild("ChunkHard"))

local ChunkSpawnedEvent = ReplicatedStorage:WaitForChild(Constants.REMOTE_CHUNK_SPAWNED) :: RemoteEvent

-- Per-player state
type PlayerState = {
    chunksCleared:  number,
    nextChunkOffset: Vector3,
    activeChunks:   { { model: Model, endX: number } },
    checkpointCFrame: CFrame,
    invincible:     boolean,
    chaosWardUsed:  boolean,
    score:          number,
}

local playerStates: { [Player]: PlayerState } = {}

local MapGenerator = {}

-- ── Difficulty helpers ──────────────────────────────────────────────────────

local function getDifficultyTier(chunksCleared: number): number
    if chunksCleared < Constants.DIFF_MEDIUM_START then return 1
    elseif chunksCleared < Constants.DIFF_HARD_START  then return 2
    else                                                    return 3
    end
end

local function getMutationSpeed(chunksCleared: number): number
    if chunksCleared <= 10      then return 1
    elseif chunksCleared <= 25  then return 2
    elseif chunksCleared <= 50  then return 3
    else                             return 4
    end
end

local function getChaosFrequency(chunksCleared: number): number
    if chunksCleared < Constants.DIFF_MEDIUM_START then return math.huge
    elseif chunksCleared < Constants.DIFF_HARD_START  then return Constants.CHAOS_FREQ_MEDIUM
    elseif chunksCleared < Constants.DIFF_MAX_START   then return Constants.CHAOS_FREQ_HARD
    else                                                   return Constants.CHAOS_FREQ_MAX
    end
end

local function pickChunk(chunksCleared: number)
    local tier = getDifficultyTier(chunksCleared)
    local hardWeight = if chunksCleared > 50 then 80
        elseif chunksCleared > 25 then 50
        elseif chunksCleared > 10 then 20
        else 0
    local medWeight  = if chunksCleared > 10 then 50 else 0
    local total      = 100 + medWeight + hardWeight
    local roll       = math.random(1, total)

    if roll <= 100 and #ChunkEasy > 0 then
        return ChunkEasy[math.random(1, #ChunkEasy)]
    elseif roll <= 100 + medWeight and #ChunkMedium > 0 then
        return ChunkMedium[math.random(1, #ChunkMedium)]
    else
        return ChunkHard[math.random(1, #ChunkHard)]
    end
end

-- ── Mutation application ────────────────────────────────────────────────────

local function applyServerMutation(part: BasePart, mutation: string, speed: number)
    local tweenInfo = TweenInfo.new(1 / speed, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true)

    if mutation == "rising" then
        local origin = part.Position
        TweenService:Create(part, tweenInfo, { Position = origin + Vector3.new(0, 4, 0) }):Play()

    elseif mutation == "rotating" then
        local rotInfo = TweenInfo.new(4 / speed, Enum.EasingStyle.Linear, Enum.EasingDirection.In, -1, false)
        -- Rotation via CFrame loop (TweenService doesn't tween Orientation looped natively)
        task.spawn(function()
            while part and part.Parent do
                local goal = part.CFrame * CFrame.Angles(0, math.pi * 2, 0)
                local t = TweenService:Create(part, TweenInfo.new(4 / speed, Enum.EasingStyle.Linear), { CFrame = goal })
                t:Play()
                t.Completed:Wait()
            end
        end)

    elseif mutation == "shrinking" then
        local originalSize = part.Size
        local smallSize    = Vector3.new(originalSize.X * 0.4, originalSize.Y, originalSize.Z * 0.4)
        TweenService:Create(part, tweenInfo, { Size = smallSize }):Play()

    elseif mutation == "teleporting" then
        task.spawn(function()
            while part and part.Parent do
                task.wait(math.random(2, 4))
                part.Transparency = 1
                part.CanCollide   = false
                task.wait(1.5)
                part.Transparency = 0
                part.CanCollide   = true
            end
        end)
    end
end

-- ── Chunk spawning ──────────────────────────────────────────────────────────

local chunkIdCounter = 0

local function spawnChunk(offset: Vector3, chunksCleared: number): { model: Model, endOffset: Vector3 }
    local data = pickChunk(chunksCleared)
    chunkIdCounter += 1
    local chunkId = chunkIdCounter
    local speed   = getMutationSpeed(chunksCleared)

    local chunkModel = Instance.new("Model")
    chunkModel.Name  = "Chunk_" .. chunkId
    chunkModel.Parent = Workspace

    for _, platData in ipairs(data.platforms) do
        local part          = Instance.new("Part")
        part.Size           = platData.size
        part.Material       = platData.material
        part.CFrame         = CFrame.new(offset + platData.pos)
        part.Anchored       = true
        part.CanCollide     = true
        part.Color          = Color3.fromHSV(math.random(), 0.6, 1)
        part.Parent         = chunkModel
        CollectionService:AddTag(part, Constants.TAG_CHUNK_PART)

        for _, mutation in ipairs(data.mutations) do
            if mutation ~= "colorshift" then
                applyServerMutation(part, mutation, speed)
            end
        end
    end

    -- Notify clients for client-side mutations
    ChunkSpawnedEvent:FireAllClients(chunkId, data.mutations, chunkModel)

    local endOffset = offset + Vector3.new(data.length, 0, 0)
    return { model = chunkModel, endOffset = endOffset }
end

-- ── Checkpoint placement ────────────────────────────────────────────────────

local function placeCheckpoint(position: Vector3, player: Player): Part
    local state    = playerStates[player]
    local interval = if state then
        (state.chaosWardUsed and Constants.CHECKPOINT_INTERVAL_VIP or Constants.CHECKPOINT_INTERVAL)
        else Constants.CHECKPOINT_INTERVAL

    local cp          = Instance.new("Part")
    cp.Name           = "Checkpoint"
    cp.Size           = Vector3.new(8, 10, 1)
    cp.Anchored       = true
    cp.CanCollide     = false
    cp.Transparency   = 1
    cp.CFrame         = CFrame.new(position)
    cp.Parent         = Workspace

    cp.Touched:Connect(function(hit)
        local char = hit.Parent
        if not char then return end
        local p = Players:GetPlayerFromCharacter(char)
        if p and playerStates[p] then
            playerStates[p].checkpointCFrame = cp.CFrame
        end
    end)

    return cp
end

-- ── Chaos event ─────────────────────────────────────────────────────────────

local function triggerChaosEvent(player: Player)
    local state = playerStates[player]
    if not state then return end

    -- Check Chaos Ward: only skip if player owns the pass AND hasn't used the skip yet
    local MonetizationMgr = require(script.Parent.MonetizationManager)
    if not state.chaosWardUsed and MonetizationMgr.playerOwnsPass(player, Constants.PASS_CHAOS_WARD) then
        state.chaosWardUsed = true
        return  -- skip first chaos event this session
    end

    -- Apply chaos to all active chunk parts
    for _, chunkEntry in ipairs(state.activeChunks) do
        for _, part in ipairs(chunkEntry.model:GetDescendants()) do
            if part:IsA("BasePart") then
                local chaosRoll = math.random(1, 3)
                if chaosRoll == 1 then
                    -- flip
                    TweenService:Create(part, TweenInfo.new(0.2), {
                        CFrame = part.CFrame * CFrame.Angles(math.pi, 0, 0)
                    }):Play()
                elseif chaosRoll == 2 then
                    -- scale 2x
                    TweenService:Create(part, TweenInfo.new(0.2), {
                        Size = part.Size * 2
                    }):Play()
                else
                    -- go invisible for CHAOS_DURATION
                    part.Transparency = 1
                    part.CanCollide   = false
                    task.delay(Constants.CHAOS_DURATION, function()
                        if part and part.Parent then
                            part.Transparency = 0
                            part.CanCollide   = true
                        end
                    end)
                end
            end
        end
    end

    -- Award chaos survived shards via EconomyManager (fired via BindableEvent pattern or direct require)
    -- EconomyManager listens for this and awards shards
    local EconomyManager = require(script.Parent.EconomyManager)
    EconomyManager.awardShards(player, Constants.SHARDS_CHAOS_SURVIVED)
end

-- ── Chunk advance logic ─────────────────────────────────────────────────────

local function advanceChunks(player: Player)
    local state = playerStates[player]
    if not state then return end

    -- Spawn next chunk
    local result = spawnChunk(state.nextChunkOffset, state.chunksCleared)
    state.nextChunkOffset = result.endOffset
    table.insert(state.activeChunks, { model = result.model, endX = result.endOffset.X })

    state.chunksCleared += 1
    state.score         += 1

    -- Place checkpoint if interval reached (VIP pass shortens interval)
    local MonetizationMgr = require(script.Parent.MonetizationManager)
    local interval = if MonetizationMgr.playerOwnsPass(player, Constants.PASS_VIP_CHECKPOINT)
        then Constants.CHECKPOINT_INTERVAL_VIP
        else Constants.CHECKPOINT_INTERVAL
    if state.chunksCleared % interval == 0 then
        placeCheckpoint(state.nextChunkOffset - Vector3.new(4, 0, 0), player)
    end

    -- Chaos event check
    local freq = getChaosFrequency(state.chunksCleared)
    if state.chunksCleared % freq == 0 then
        triggerChaosEvent(player)
    end

    -- Clean up oldest chunk (only if no player is standing on it)
    if #state.activeChunks > Constants.CHUNK_BUFFER + 2 then
        local oldest = state.activeChunks[1]
        local safe   = false
        for _, p in ipairs(Players:GetPlayers()) do
            local char = p.Character
            if char then
                local root = char:FindFirstChild("HumanoidRootPart") :: BasePart?
                if root and math.abs(root.Position.X - oldest.endX) < 50 then
                    safe = true
                    break
                end
            end
        end
        if not safe then
            oldest.model:Destroy()
            table.remove(state.activeChunks, 1)
        end
    end
end

-- ── Kill zone ────────────────────────────────────────────────────────────────

local function createKillZone()
    local kz        = Instance.new("Part")
    kz.Name         = "KillZone"
    kz.Size         = Vector3.new(10000, 1, 10000)
    kz.Position     = Vector3.new(0, -100, 0)
    kz.Anchored     = true
    kz.CanCollide   = false
    kz.Transparency = 1
    kz.Parent       = Workspace

    kz.Touched:Connect(function(hit)
        local char = hit.Parent
        if not char then return end
        local player = Players:GetPlayerFromCharacter(char)
        if not player then return end
        local state = playerStates[player]
        if not state or state.invincible then return end

        -- Award personal best and shards before reset
        local EconomyManager = require(script.Parent.EconomyManager)
        EconomyManager.onPlayerDeath(player, state.score)

        -- Reset score
        state.score = 0

        -- Respawn at checkpoint
        local humanoid = char:FindFirstChildOfClass("Humanoid")
        if humanoid then
            humanoid.Health = 0
        end
    end)
end

-- ── Player init / cleanup ────────────────────────────────────────────────────

function MapGenerator.initPlayer(player: Player)
    local spawnPos = Vector3.new(0, 5, 0)

    playerStates[player] = {
        chunksCleared    = 0,
        nextChunkOffset  = spawnPos,
        activeChunks     = {},
        checkpointCFrame = CFrame.new(spawnPos),
        invincible       = false,
        chaosWardUsed    = false,
        score            = 0,
    }

    -- Pre-spawn buffer chunks
    for _ = 1, Constants.CHUNK_BUFFER do
        advanceChunks(player)
    end

    -- Watch character for boundary crossing
    player.CharacterAdded:Connect(function(char)
        -- Set invincibility on respawn
        local state = playerStates[player]
        if state then
            state.invincible = true
            task.delay(Constants.INVINCIBILITY_DURATION, function()
                if playerStates[player] then
                    playerStates[player].invincible = false
                end
            end)

            -- Teleport to checkpoint
            local root = char:WaitForChild("HumanoidRootPart") :: BasePart
            root.CFrame = state.checkpointCFrame + Vector3.new(0, 3, 0)
        end

        -- Advance chunks as player moves forward
        task.spawn(function()
            while player and player.Parent do
                local c = player.Character
                if c then
                    local root = c:FindFirstChild("HumanoidRootPart") :: BasePart?
                    if root and state and root.Position.X > state.nextChunkOffset.X - 40 then
                        advanceChunks(player)
                    end
                end
                task.wait(0.5)
            end
        end)
    end)
end

function MapGenerator.cleanupPlayer(player: Player)
    local state = playerStates[player]
    if state then
        for _, entry in ipairs(state.activeChunks) do
            entry.model:Destroy()
        end
    end
    playerStates[player] = nil
end

function MapGenerator.getPlayerState(player: Player): PlayerState?
    return playerStates[player]
end

-- ── Bootstrap ────────────────────────────────────────────────────────────────

function MapGenerator.start()
    createKillZone()

    Players.PlayerAdded:Connect(function(player)
        player.CharacterAdded:Wait()
        MapGenerator.initPlayer(player)
    end)

    Players.PlayerRemoving:Connect(MapGenerator.cleanupPlayer)
end

return MapGenerator
```

- [ ] **Step 2: Add server Script to call MapGenerator.start()**

Add to `src/server/Init.lua`:
```lua
local MapGenerator = require(script.Parent.MapGenerator)
MapGenerator.start()
```

- [ ] **Step 3: Playtest in Studio**
  - Press Play, join as player
  - Confirm 3 chunks appear ahead of the spawn point
  - Walk forward — new chunks should appear and old ones disappear
  - Fall off — character should respawn at last checkpoint

- [ ] **Step 4: Commit**
```bash
git add src/server/MapGenerator.lua src/server/Init.lua
git commit -m "feat: add MapGenerator with chunk spawning, mutations, chaos events, kill zone"
```

---

## Task 4: Economy Manager

**Files:**
- Create: `src/server/EconomyManager.lua`

- [ ] **Step 1: Create EconomyManager.lua**

```lua
--!strict
local Players            = game:GetService("Players")
local DataStoreService   = game:GetService("DataStoreService")
local ReplicatedStorage  = game:GetService("ReplicatedStorage")

local Constants          = require(ReplicatedStorage:WaitForChild("Constants"))
local UpdateShardsEvent  = ReplicatedStorage:WaitForChild(Constants.REMOTE_UPDATE_SHARDS) :: RemoteEvent

local ShardsDS     = DataStoreService:GetDataStore(Constants.DS_SHARDS)
local CosmeticsDS  = DataStoreService:GetDataStore(Constants.DS_COSMETICS)
local PersonalBestDS = DataStoreService:GetDataStore(Constants.DS_PERSONAL_BEST)

type PlayerData = {
    shards:       number,
    cosmetics:    { string },
    personalBest: number,
    passCache:    { [string]: boolean },
}

local playerData: { [Player]: PlayerData } = {}

local EconomyManager = {}

-- ── DataStore helpers ─────────────────────────────────────────────────────

local function loadPlayerData(player: Player)
    local userId = tostring(player.UserId)

    local shards, cosmetics, pb = 0, {}, 0

    local ok1, result1 = pcall(function() return ShardsDS:GetAsync(userId) end)
    if ok1 and result1 then shards = result1 end

    local ok2, result2 = pcall(function() return CosmeticsDS:GetAsync(userId) end)
    if ok2 and result2 then cosmetics = result2 end

    local ok3, result3 = pcall(function() return PersonalBestDS:GetAsync(userId) end)
    if ok3 and result3 then pb = result3 end

    playerData[player] = {
        shards       = shards,
        cosmetics    = cosmetics,
        personalBest = pb,
        passCache    = {},
    }

    UpdateShardsEvent:FireClient(player, shards)
end

local function savePlayerData(player: Player)
    local data = playerData[player]
    if not data then return end
    local userId = tostring(player.UserId)

    pcall(function() ShardsDS:SetAsync(userId, data.shards) end)
    pcall(function() CosmeticsDS:SetAsync(userId, data.cosmetics) end)
    pcall(function() PersonalBestDS:SetAsync(userId, data.personalBest) end)
end

-- ── Shard awarding ────────────────────────────────────────────────────────

function EconomyManager.awardShards(player: Player, amount: number)
    local data = playerData[player]
    if not data then return end

    local multiplier = if data.passCache[tostring(Constants.PASS_DREAM_COLLECTOR)] then 2 else 1
    local total      = amount * multiplier
    data.shards     += total

    UpdateShardsEvent:FireClient(player, data.shards)
end

function EconomyManager.onChunkCleared(player: Player, chunksCleared: number)
    EconomyManager.awardShards(player, Constants.SHARDS_PER_CHUNK)

    if chunksCleared % 10 == 0 then
        EconomyManager.awardShards(player, Constants.SHARDS_BONUS_10_CHUNKS)
    end
end

function EconomyManager.onPlayerDeath(player: Player, score: number)
    local data = playerData[player]
    if not data then return end

    if score > data.personalBest then
        data.personalBest = score
        EconomyManager.awardShards(player, Constants.SHARDS_PERSONAL_BEST)

        -- Update leaderboard
        local LeaderboardManager = require(script.Parent.LeaderboardManager)
        LeaderboardManager.submitScore(player, score)
    end
end

-- ── Shop purchase ────────────────────────────────────────────────────────

function EconomyManager.purchaseCosmetic(player: Player, cosmeticId: string, cost: number): (boolean, string)
    local data = playerData[player]
    if not data then return false, "Player data not loaded" end

    if table.find(data.cosmetics, cosmeticId) then
        return false, "Already owned"
    end

    if data.shards < cost then
        return false, "Not enough shards"
    end

    data.shards -= cost
    table.insert(data.cosmetics, cosmeticId)

    local ok, err = pcall(function()
        CosmeticsDS:SetAsync(tostring(player.UserId), data.cosmetics)
        ShardsDS:SetAsync(tostring(player.UserId), data.shards)
    end)

    if not ok then
        -- Roll back
        data.shards += cost
        table.remove(data.cosmetics, #data.cosmetics)
        return false, "Save failed — please try again"
    end

    UpdateShardsEvent:FireClient(player, data.shards)
    return true, "Success"
end

function EconomyManager.getOwnedCosmetics(player: Player): { string }
    local data = playerData[player]
    return if data then data.cosmetics else {}
end

function EconomyManager.setPassCache(player: Player, passId: number, owned: boolean)
    local data = playerData[player]
    if data then
        data.passCache[tostring(passId)] = owned
    end
end

-- ── Player lifecycle ────────────────────────────────────────────────────────

function EconomyManager.start()
    Players.PlayerAdded:Connect(function(player)
        loadPlayerData(player)

        -- Periodic save
        task.spawn(function()
            while player and player.Parent do
                task.wait(Constants.SHARD_SAVE_INTERVAL)
                savePlayerData(player)
            end
        end)
    end)

    Players.PlayerRemoving:Connect(function(player)
        savePlayerData(player)
        playerData[player] = nil
    end)

    -- RemoteFunction: purchase cosmetic
    local PurchaseFn = ReplicatedStorage:WaitForChild(Constants.REMOTEFN_PURCHASE_COSMETIC) :: RemoteFunction
    PurchaseFn.OnServerInvoke = function(player, cosmeticId: string, cost: number)
        return EconomyManager.purchaseCosmetic(player, cosmeticId, cost)
    end

    -- RemoteFunction: get owned cosmetics
    local GetOwnedFn = ReplicatedStorage:WaitForChild(Constants.REMOTEFN_GET_OWNED_COSMETICS) :: RemoteFunction
    GetOwnedFn.OnServerInvoke = function(player)
        return EconomyManager.getOwnedCosmetics(player)
    end
end

return EconomyManager
```

- [ ] **Step 2: Wire into Init.lua**
```lua
local EconomyManager = require(script.Parent.EconomyManager)
EconomyManager.start()
```

- [ ] **Step 3: Playtest in Studio**
  - Press Play
  - Open Studio Output; check no DataStore errors
  - Walk through 5 chunks — verify shard counter increments (HudController not yet built; use print statements)
  - Add temporary `print` in `awardShards` to confirm awards

- [ ] **Step 4: Commit**
```bash
git add src/server/EconomyManager.lua src/server/Init.lua
git commit -m "feat: add EconomyManager with shards, DataStore persistence, shop purchase"
```

---

## Task 5: Monetization Manager

**Files:**
- Create: `src/server/MonetizationManager.lua`

- [ ] **Step 1: Create MonetizationManager.lua**

```lua
--!strict
local Players            = game:GetService("Players")
local MarketplaceService = game:GetService("MarketplaceService")
local ReplicatedStorage  = game:GetService("ReplicatedStorage")

local Constants      = require(ReplicatedStorage:WaitForChild("Constants"))
local EconomyManager = require(script.Parent.EconomyManager)

local ALL_PASSES: { number } = {
    Constants.PASS_DREAM_COLLECTOR,
    Constants.PASS_VIP_CHECKPOINT,
    Constants.PASS_POWERUP_PRO,
    Constants.PASS_CHAOS_WARD,
    Constants.PASS_VOID_TRAIL,
    Constants.PASS_CELESTIAL_AURA,
    Constants.PASS_SHATTER_INTO_GOLD,
    Constants.PASS_GLITCH_SKIN,
}

local COSMETIC_PASSES: { number } = {
    Constants.PASS_VOID_TRAIL,
    Constants.PASS_CELESTIAL_AURA,
    Constants.PASS_SHATTER_INTO_GOLD,
    Constants.PASS_GLITCH_SKIN,
}

-- passId → cosmetic string ID mapping
local PASS_TO_COSMETIC: { [number]: string } = {
    [Constants.PASS_VOID_TRAIL]         = "VoidTrail",
    [Constants.PASS_CELESTIAL_AURA]     = "CelestialAura",
    [Constants.PASS_SHATTER_INTO_GOLD]  = "ShatterIntoGold",
    [Constants.PASS_GLITCH_SKIN]        = "GlitchSkin",
}

-- per-player pass ownership cache: [Player][passId] = bool
local passCache: { [Player]: { [number]: boolean } } = {}

local MonetizationManager = {}

function MonetizationManager.playerOwnsPass(player: Player, passId: number): boolean
    if passId == 0 then return false end  -- placeholder ID — not yet created in Creator Hub
    local cache = passCache[player]
    return if cache then (cache[passId] == true) else false
end

local function cacheAndApplyPasses(player: Player)
    passCache[player] = {}

    for _, passId in ipairs(ALL_PASSES) do
        if passId == 0 then continue end  -- skip placeholder IDs
        local ok, owned = pcall(function()
            return MarketplaceService:UserOwnsGamePassAsync(player.UserId, passId)
        end)
        if ok and owned then
            passCache[player][passId] = true
            EconomyManager.setPassCache(player, passId, true)

            -- Grant cosmetic if it's a cosmetic pass (grantCosmetic added in Task 5 Step 2)
            local cosmeticId = PASS_TO_COSMETIC[passId]
            if cosmeticId then
                EconomyManager.grantCosmetic(player, cosmeticId)
            end
        end
    end
end

local function onPassPurchased(player: Player, passId: number)
    if passCache[player] then
        passCache[player][passId] = true
        EconomyManager.setPassCache(player, passId, true)
    end

    local cosmeticId = PASS_TO_COSMETIC[passId]
    if cosmeticId then
        EconomyManager.grantCosmetic(player, cosmeticId)
    end
end

function MonetizationManager.start()
    Players.PlayerAdded:Connect(function(player)
        player.CharacterAdded:Wait()
        cacheAndApplyPasses(player)
    end)

    Players.PlayerRemoving:Connect(function(player)
        passCache[player] = nil
    end)

    MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, passId, purchased)
        if purchased then
            onPassPurchased(player, passId)
        end
    end)

    -- RemoteEvent: prompt a game pass purchase from client
    local PromptEvent = ReplicatedStorage:WaitForChild(Constants.REMOTE_PROMPT_PASS) :: RemoteEvent
    PromptEvent.OnServerEvent:Connect(function(player, passId: number)
        if passId == 0 then return end
        MarketplaceService:PromptGamePassPurchase(player, passId)
    end)
end

return MonetizationManager
```

- [ ] **Step 2: Add `grantCosmetic` to EconomyManager.lua** (needed by MonetizationManager)

Add to `EconomyManager.lua` before `return EconomyManager`:
```lua
function EconomyManager.grantCosmetic(player: Player, cosmeticId: string)
    local data = playerData[player]
    if not data then return end
    if table.find(data.cosmetics, cosmeticId) then return end
    table.insert(data.cosmetics, cosmeticId)
    pcall(function()
        CosmeticsDS:SetAsync(tostring(player.UserId), data.cosmetics)
    end)
end
```

- [ ] **Step 3: Wire into Init.lua**
```lua
local MonetizationManager = require(script.Parent.MonetizationManager)
MonetizationManager.start()
```

- [ ] **Step 4: Verify in Studio**
  - Press Play; check Output for errors
  - If you have real pass IDs set in Constants, use `MarketplaceService:UserOwnsGamePassAsync` in Command Bar to verify caching

- [ ] **Step 5: Commit**
```bash
git add src/server/MonetizationManager.lua src/server/EconomyManager.lua src/server/Init.lua
git commit -m "feat: add MonetizationManager with pass caching and in-session purchase detection"
```

---

## Task 6: Leaderboard Manager

**Files:**
- Create: `src/server/LeaderboardManager.lua`

- [ ] **Step 1: Create LeaderboardManager.lua**

```lua
--!strict
local Players           = game:GetService("Players")
local DataStoreService  = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Constants             = require(ReplicatedStorage:WaitForChild("Constants"))
local SessionLeaderboardEvent = ReplicatedStorage:WaitForChild(Constants.REMOTE_SESSION_LEADERBOARD) :: RemoteEvent

local ODS = DataStoreService:GetOrderedDataStore(Constants.ODS_LEADERBOARD)

-- In-memory session scores: { [userId]: { name: string, score: number } }
local sessionScores: { [number]: { name: string, score: number } } = {}

local LeaderboardManager = {}

function LeaderboardManager.submitScore(player: Player, score: number)
    -- Update OrderedDataStore
    local ok, err = pcall(function()
        ODS:SetAsync(tostring(player.UserId), score)
    end)
    if not ok then
        warn("LeaderboardManager: failed to save score for", player.Name, err)
    end
end

function LeaderboardManager.getTopScores(): { { name: string, score: number } }
    local results = {}
    local ok, pages = pcall(function()
        return ODS:GetSortedAsync(false, Constants.LEADERBOARD_TOP_N)
    end)
    if not ok then return results end

    local page = pages:GetCurrentPage()
    for _, entry in ipairs(page) do
        local name = "Unknown"
        local ok2, playerName = pcall(function()
            return game:GetService("Players"):GetNameFromUserIdAsync(tonumber(entry.key))
        end)
        if ok2 then name = playerName end
        table.insert(results, { name = name, score = entry.value })
    end
    return results
end

function LeaderboardManager.updateSessionScore(player: Player, score: number)
    sessionScores[player.UserId] = { name = player.Name, score = score }
end

local function broadcastSessionLeaderboard()
    -- Build sorted list
    local list: { { name: string, score: number } } = {}
    for _, entry in pairs(sessionScores) do
        table.insert(list, entry)
    end
    table.sort(list, function(a, b) return a.score > b.score end)

    -- Top 5 only
    local top5: { { name: string, score: number } } = {}
    for i = 1, math.min(5, #list) do
        table.insert(top5, list[i])
    end

    SessionLeaderboardEvent:FireAllClients(top5)
end

function LeaderboardManager.start()
    Players.PlayerRemoving:Connect(function(player)
        sessionScores[player.UserId] = nil
    end)

    -- Broadcast session leaderboard every N seconds
    task.spawn(function()
        while true do
            task.wait(Constants.LEADERBOARD_UPDATE_INTERVAL)
            broadcastSessionLeaderboard()
        end
    end)
end

return LeaderboardManager
```

- [ ] **Step 2: Wire into Init.lua**
```lua
local LeaderboardManager = require(script.Parent.LeaderboardManager)
LeaderboardManager.start()
```

- [ ] **Step 3: Add EquipCosmetic server handler to EconomyManager.lua**

Add inside `EconomyManager.start()`, after the `GetOwnedFn` handler:
```lua
-- Currently equipped cosmetics per player (in-memory only)
local equippedCosmetics: { [Player]: { [string]: string } } = {}

local EquipFn = ReplicatedStorage:WaitForChild(Constants.REMOTEFN_EQUIP_COSMETIC) :: RemoteFunction
EquipFn.OnServerInvoke = function(player: Player, cosmeticId: string): (boolean, string)
    local data = playerData[player]
    if not data then return false, "Not loaded" end
    if not table.find(data.cosmetics, cosmeticId) then return false, "Not owned" end

    if not equippedCosmetics[player] then equippedCosmetics[player] = {} end
    -- Determine category from cosmeticId prefix convention and store
    equippedCosmetics[player]["equipped"] = cosmeticId

    -- Clean up on leave
    Players.PlayerRemoving:Connect(function(p)
        equippedCosmetics[p] = nil
    end)

    return true, cosmeticId
end
```

- [ ] **Step 4: Commit**
```bash
git add src/server/LeaderboardManager.lua src/server/EconomyManager.lua src/server/Init.lua
git commit -m "feat: add LeaderboardManager, EquipCosmetic server handler"
```

---

## Task 7: Power-up Manager (Server)

**Files:**
- Create: `src/server/PowerupManager.lua`

- [ ] **Step 1: Create PowerupManager.lua**

```lua
--!strict
local Players           = game:GetService("Players")
local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace         = game:GetService("Workspace")

local Constants       = require(ReplicatedStorage:WaitForChild("Constants"))
local PickupOrbEvent  = ReplicatedStorage:WaitForChild(Constants.REMOTE_PICKUP_ORB) :: RemoteEvent
local ApplyPowerEvent = ReplicatedStorage:WaitForChild(Constants.REMOTE_APPLY_POWERUP) :: RemoteEvent

local POWERUP_TYPES = { "Blaze", "TitanJump", "Ghost", "TimeFreeze", "Feather", "Shrink" }

-- Players currently under a power-up effect
local activePowerups: { [Player]: boolean } = {}

local PowerupManager = {}

function PowerupManager.spawnOrbOnPart(part: BasePart)
    local orb      = Instance.new("Part")
    orb.Shape      = Enum.PartType.Ball
    orb.Size       = Vector3.new(2, 2, 2)
    orb.Position   = part.Position + Vector3.new(0, 3, 0)
    orb.Anchored   = true
    orb.CanCollide = false
    orb.Material   = Enum.Material.Neon
    orb.Color      = Color3.fromRGB(255, 220, 50)
    orb.Name       = "PowerupOrb"

    local light         = Instance.new("PointLight")
    light.Brightness    = 5
    light.Range         = 12
    light.Color         = Color3.fromRGB(255, 220, 50)
    light.Parent        = orb

    CollectionService:AddTag(orb, Constants.TAG_POWERUP_ORB)

    local powerupType = POWERUP_TYPES[math.random(1, #POWERUP_TYPES)]
    orb:SetAttribute("PowerupType", powerupType)
    orb.Parent = Workspace

    orb.Touched:Connect(function(hit)
        local char = hit.Parent
        if not char then return end
        local player = Players:GetPlayerFromCharacter(char)
        if not player then return end
        if activePowerups[player] then return end  -- already has one

        activePowerups[player] = true
        orb:Destroy()

        -- Fire to client to apply effect
        ApplyPowerEvent:FireClient(player, powerupType)

        -- Clear active flag after duration
        task.delay(Constants.POWERUP_DURATION + 2, function()
            activePowerups[player] = nil
        end)
    end)
end

-- Called by MapGenerator when a chunk is spawned
function PowerupManager.onChunkSpawned(chunkModel: Model)
    -- Pick one random platform in the chunk to place an orb on
    local parts: { BasePart } = {}
    for _, v in ipairs(chunkModel:GetDescendants()) do
        if v:IsA("BasePart") then
            table.insert(parts, v)
        end
    end

    if #parts == 0 then return end

    -- 60% chance to spawn an orb in this chunk
    if math.random() > 0.6 then return end

    local target = parts[math.random(1, #parts)]
    PowerupManager.spawnOrbOnPart(target)
end

function PowerupManager.start()
    -- Nothing to init at start; orb spawning is called by MapGenerator
end

return PowerupManager
```

- [ ] **Step 2: Update MapGenerator to call PowerupManager.onChunkSpawned**

In `MapGenerator.lua`, after `chunkModel.Parent = Workspace`:
```lua
local PowerupManager = require(script.Parent.PowerupManager)
PowerupManager.onChunkSpawned(chunkModel)
```

- [ ] **Step 3: Wire into Init.lua**
```lua
local PowerupManager = require(script.Parent.PowerupManager)
PowerupManager.start()
```

- [ ] **Step 4: Playtest in Studio**
  - Walk through chunks — glowing orbs should appear on some platforms
  - Touch an orb — confirm it disappears and `ApplyPowerup` RemoteEvent fires (check via a temporary print on the client)

- [ ] **Step 5: Commit**
```bash
git add src/server/PowerupManager.lua src/server/MapGenerator.lua src/server/Init.lua
git commit -m "feat: add PowerupManager with orb spawning and pickup validation"
```

---

## Task 8: Power-up Handler (Client)

**Files:**
- Create: `src/client/PowerupHandler.lua`

- [ ] **Step 1: Create PowerupHandler.lua**

```lua
--!strict
local Players           = game:GetService("Players")
local TweenService      = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService  = game:GetService("UserInputService")

local Constants       = require(ReplicatedStorage:WaitForChild("Constants"))
local ApplyPowerEvent = ReplicatedStorage:WaitForChild(Constants.REMOTE_APPLY_POWERUP) :: RemoteEvent

local player    = Players.LocalPlayer
local camera    = workspace.CurrentCamera

-- Checks if player owns Power-up Pro (set by MonetizationManager server → client attribute)
local function hasPowerupPro(): boolean
    return player:GetAttribute("PowerupPro") == true
end

local function getDrawbackDuration(base: number): number
    if hasPowerupPro() then
        return math.ceil(base * (1 - Constants.POWERUP_PRO_REDUCTION))
    end
    return base
end

-- ── Individual power-up implementations ────────────────────────────────────

local function applyBlaze()
    local char = player.Character
    if not char then return end
    local humanoid = char:FindFirstChildOfClass("Humanoid") :: Humanoid?
    if not humanoid then return end

    local origSpeed = humanoid.WalkSpeed
    humanoid.WalkSpeed = origSpeed * 2

    -- Drawback: lock speed (prevent slowing down — we clamp WalkSpeed min)
    local conn: RBXScriptConnection
    conn = humanoid:GetPropertyChangedSignal("WalkSpeed"):Connect(function()
        if humanoid.WalkSpeed < origSpeed * 2 then
            humanoid.WalkSpeed = origSpeed * 2
        end
    end)

    task.delay(Constants.POWERUP_DURATION, function()
        humanoid.WalkSpeed = origSpeed
        conn:Disconnect()
    end)
end

local function applyTitanJump()
    local char = player.Character
    if not char then return end
    local humanoid = char:FindFirstChildOfClass("Humanoid") :: Humanoid?
    if not humanoid then return end

    local origJump = humanoid.JumpPower
    humanoid.JumpPower = origJump * 3

    -- Drawback: randomise jump direction each jump
    local conn: RBXScriptConnection
    conn = humanoid.Jumping:Connect(function()
        local root = char:FindFirstChild("HumanoidRootPart") :: BasePart?
        if root then
            task.defer(function()
                root.Velocity = Vector3.new(
                    math.random(-30, 30),
                    root.Velocity.Y,
                    math.random(-30, 30)
                )
            end)
        end
    end)

    task.delay(Constants.POWERUP_DURATION, function()
        humanoid.JumpPower = origJump
        conn:Disconnect()
    end)
end

local function applyGhost()
    -- Benefit: skip one obstacle — handled by temporarily setting player CanCollide off on one touch
    -- Drawback: screen goes nearly black
    local playerGui = player.PlayerGui
    local screenGui = Instance.new("ScreenGui")
    screenGui.Name = "GhostEffect"
    screenGui.Parent = playerGui

    local frame         = Instance.new("Frame")
    frame.Size          = UDim2.fromScale(1, 1)
    frame.BackgroundColor3 = Color3.new(0, 0, 0)
    frame.BackgroundTransparency = 0.05
    frame.Parent        = screenGui

    task.delay(getDrawbackDuration(Constants.POWERUP_GHOST_DRAWBACK), function()
        screenGui:Destroy()
    end)

    -- Ghost: disable collisions for one hit (simplified: disable for 0.5s)
    local char = player.Character
    if char then
        for _, v in ipairs(char:GetDescendants()) do
            if v:IsA("BasePart") then
                v.CanCollide = false
            end
        end
        task.delay(0.5, function()
            if char and char.Parent then
                for _, v in ipairs(char:GetDescendants()) do
                    if v:IsA("BasePart") then
                        v.CanCollide = true
                    end
                end
            end
        end)
    end
end

local function applyTimeFreeze()
    -- Benefit: signal server to pause mutations (via RemoteEvent not yet implemented here;
    -- server-side Time Freeze is handled as a flag in MapGenerator)
    -- Drawback: reverse controls
    local drawbackDuration = getDrawbackDuration(Constants.POWERUP_TIMEFREEZE_DURATION)
    local controlsReversed = true

    local conn: RBXScriptConnection
    conn = UserInputService.InputChanged:Connect(function(input, gpe)
        if not controlsReversed then return end
        -- Invert thumbstick / WASD via humanoid MoveDirection override
        local char = player.Character
        if not char then return end
        local humanoid = char:FindFirstChildOfClass("Humanoid") :: Humanoid?
        if humanoid and humanoid.MoveDirection ~= Vector3.zero then
            humanoid:MoveTo(char.PrimaryPart and char.PrimaryPart.Position - humanoid.MoveDirection * 2 or Vector3.zero)
        end
    end)

    task.delay(drawbackDuration, function()
        controlsReversed = false
        conn:Disconnect()
    end)
end

local function applyFeather()
    local char = player.Character
    if not char then return end
    local humanoid = char:FindFirstChildOfClass("Humanoid") :: Humanoid?
    if not humanoid then return end

    local origSpeed = humanoid.WalkSpeed
    humanoid.WalkSpeed = 8  -- walk speed only, no running

    -- No fall death: temporarily set MaxHealth very high so fall damage (if custom) can't kill
    -- The kill zone invincibility handles this at the server level with a special flag we set
    player:SetAttribute("FeatherActive", true)

    task.delay(Constants.POWERUP_DURATION, function()
        if humanoid and humanoid.Parent then
            humanoid.WalkSpeed = origSpeed
        end
        player:SetAttribute("FeatherActive", false)
    end)
end

local function applyShrink()
    local char = player.Character
    if not char then return end
    local humanoid = char:FindFirstChildOfClass("Humanoid") :: Humanoid?
    if not humanoid then return end

    humanoid.BodyDepthScale.Value  = 0.5
    humanoid.BodyHeightScale.Value = 0.5
    humanoid.BodyWidthScale.Value  = 0.5

    -- Drawback: zoom camera in
    local origFov = camera.FieldOfView
    local fovTween = TweenService:Create(camera, TweenInfo.new(0.3), { FieldOfView = 15 })
    fovTween:Play()

    task.delay(getDrawbackDuration(Constants.POWERUP_DURATION), function()
        humanoid.BodyDepthScale.Value  = 1
        humanoid.BodyHeightScale.Value = 1
        humanoid.BodyWidthScale.Value  = 1
        TweenService:Create(camera, TweenInfo.new(0.3), { FieldOfView = origFov }):Play()
    end)
end

-- ── Dispatch table ──────────────────────────────────────────────────────────

local HANDLERS: { [string]: () -> () } = {
    Blaze      = applyBlaze,
    TitanJump  = applyTitanJump,
    Ghost      = applyGhost,
    TimeFreeze = applyTimeFreeze,
    Feather    = applyFeather,
    Shrink     = applyShrink,
}

ApplyPowerEvent.OnClientEvent:Connect(function(powerupType: string)
    local handler = HANDLERS[powerupType]
    if handler then
        handler()
    end
end)
```

- [ ] **Step 2: Playtest in Studio**
  - Touch an orb
  - Confirm the correct effect applies (speed boost for Blaze, camera zoom for Shrink, dark screen for Ghost, etc.)
  - Confirm effect wears off after the duration

- [ ] **Step 3: Commit**
```bash
git add src/client/PowerupHandler.lua
git commit -m "feat: add PowerupHandler with all 6 power-up effect implementations"
```

---

## Task 9: Surreal FX (Client)

**Files:**
- Create: `src/client/SurrealFX.lua`

- [ ] **Step 1: Create SurrealFX.lua**

```lua
--!strict
local TweenService      = game:GetService("TweenService")
local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Lighting          = game:GetService("Lighting")

local Constants       = require(ReplicatedStorage:WaitForChild("Constants"))
local ChunkSpawnedEvt = ReplicatedStorage:WaitForChild(Constants.REMOTE_CHUNK_SPAWNED) :: RemoteEvent

local SURREAL_COLORS: { Color3 } = {
    Color3.fromRGB(180,  60, 255),
    Color3.fromRGB( 60, 220, 255),
    Color3.fromRGB(255,  60, 180),
    Color3.fromRGB( 60, 255, 120),
    Color3.fromRGB(255, 200,  40),
}

local function randomSurrealColor(): Color3
    return SURREAL_COLORS[math.random(1, #SURREAL_COLORS)]
end

-- ── Color cycle on a part ───────────────────────────────────────────────────

local function startColorCycle(part: BasePart)
    local function cycleColor()
        while part and part.Parent do
            local targetColor = randomSurrealColor()
            local t = TweenService:Create(
                part,
                TweenInfo.new(math.random(2, 5), Enum.EasingStyle.Sine, Enum.EasingDirection.InOut),
                { Color = targetColor }
            )
            t:Play()
            t.Completed:Wait()
        end
    end
    task.spawn(cycleColor)
end

-- ── Geometry stretch (breathe) ──────────────────────────────────────────────

local function startStretch(part: BasePart)
    local origSize = part.Size
    local tweenInfo = TweenInfo.new(2, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true)
    TweenService:Create(part, tweenInfo, {
        Size = Vector3.new(origSize.X * 1.3, origSize.Y, origSize.Z * 1.3)
    }):Play()
end

-- ── Orb pulse ───────────────────────────────────────────────────────────────

local function applyOrbPulse(part: Instance)
    if not part:IsA("BasePart") then return end
    local light = part:FindFirstChildOfClass("PointLight")
    if not light then return end

    local tweenInfo = TweenInfo.new(0.8, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true)
    TweenService:Create(light, tweenInfo, { Brightness = 12 }):Play()
    startColorCycle(part)
end

-- ── Glitch Skin screen effect ───────────────────────────────────────────────
-- Called externally when Glitch Skin cosmetic is equipped

local glitchEffect: ColorCorrectionEffect? = nil

local SurrealFX = {}

function SurrealFX.applyGlitchSkin(active: boolean)
    if active then
        if glitchEffect then glitchEffect:Destroy() end
        local cc         = Instance.new("ColorCorrectionEffect")
        cc.Saturation    = -0.4
        cc.TintColor     = Color3.fromRGB(180, 60, 255)
        cc.Parent        = Lighting
        glitchEffect     = cc

        local info = TweenInfo.new(1.5, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true)
        TweenService:Create(cc, info, { Saturation = 0.4, TintColor = Color3.fromRGB(60, 220, 255) }):Play()
    else
        if glitchEffect then
            glitchEffect:Destroy()
            glitchEffect = nil
        end
    end
end

-- ── Chunk spawned handler ────────────────────────────────────────────────────

ChunkSpawnedEvt.OnClientEvent:Connect(function(_chunkId: number, mutations: { string }, chunkModel: Model)
    local hasColorshift = table.find(mutations, "colorshift") ~= nil

    for _, part in ipairs(chunkModel:GetDescendants()) do
        if part:IsA("BasePart") then
            if hasColorshift then
                startColorCycle(part)
                startStretch(part)
            end
        end
    end
end)

-- ── Orb tag listener ────────────────────────────────────────────────────────

CollectionService:GetInstanceAddedSignal(Constants.TAG_POWERUP_ORB):Connect(applyOrbPulse)

-- Apply to already-existing orbs (in case client joined after some were spawned)
for _, orb in ipairs(CollectionService:GetTagged(Constants.TAG_POWERUP_ORB)) do
    applyOrbPulse(orb)
end

return SurrealFX
```

- [ ] **Step 2: Playtest in Studio**
  - Run the game — platforms should cycle through surreal colors
  - Orbs should pulse with brightness and color shifts
  - No errors in Output

- [ ] **Step 3: Commit**
```bash
git add src/client/SurrealFX.lua
git commit -m "feat: add SurrealFX with color cycle, stretch, orb pulse, and Glitch Skin effect"
```

---

## Task 10: HUD Controller (Client)

**Files:**
- Create: `src/client/HudController.lua`

- [ ] **Step 1: Create HudController.lua**

```lua
--!strict
local Players           = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Constants              = require(ReplicatedStorage:WaitForChild("Constants"))
local UpdateShardsEvent      = ReplicatedStorage:WaitForChild(Constants.REMOTE_UPDATE_SHARDS) :: RemoteEvent
local SessionLeaderboardEvent = ReplicatedStorage:WaitForChild(Constants.REMOTE_SESSION_LEADERBOARD) :: RemoteEvent

local player    = Players.LocalPlayer
local playerGui = player.PlayerGui

-- Build HUD GUI
local screenGui      = Instance.new("ScreenGui")
screenGui.Name       = "HudGui"
screenGui.ResetOnSpawn = false
screenGui.Parent     = playerGui

-- Shard counter
local shardsLabel               = Instance.new("TextLabel")
shardsLabel.Name                = "ShardsLabel"
shardsLabel.Size                = UDim2.new(0, 200, 0, 40)
shardsLabel.Position            = UDim2.new(0, 10, 0, 10)
shardsLabel.BackgroundTransparency = 1
shardsLabel.TextColor3          = Color3.new(1, 1, 1)
shardsLabel.Font                = Enum.Font.GothamBold
shardsLabel.TextSize            = 22
shardsLabel.TextXAlignment      = Enum.TextXAlignment.Left
shardsLabel.Text                = "✦ 0 Shards"
shardsLabel.Parent              = screenGui

-- Session leaderboard display
local lbFrame               = Instance.new("Frame")
lbFrame.Name                = "SessionLeaderboard"
lbFrame.Size                = UDim2.new(0, 200, 0, 160)
lbFrame.Position            = UDim2.new(1, -210, 0, 10)
lbFrame.BackgroundColor3    = Color3.fromRGB(10, 10, 20)
lbFrame.BackgroundTransparency = 0.4
lbFrame.Parent              = screenGui

local lbTitle               = Instance.new("TextLabel")
lbTitle.Size                = UDim2.new(1, 0, 0, 30)
lbTitle.BackgroundTransparency = 1
lbTitle.Text                = "TOP RUNNERS"
lbTitle.Font                = Enum.Font.GothamBold
lbTitle.TextSize            = 14
lbTitle.TextColor3          = Color3.fromRGB(255, 220, 50)
lbTitle.Parent              = lbFrame

local lbList                = Instance.new("Frame")
lbList.Name                 = "List"
lbList.Size                 = UDim2.new(1, -8, 1, -34)
lbList.Position             = UDim2.new(0, 4, 0, 34)
lbList.BackgroundTransparency = 1
lbList.Parent               = lbFrame

-- ── Event listeners ──────────────────────────────────────────────────────────

UpdateShardsEvent.OnClientEvent:Connect(function(shards: number)
    shardsLabel.Text = "✦ " .. tostring(shards) .. " Shards"
end)

SessionLeaderboardEvent.OnClientEvent:Connect(function(top5: { { name: string, score: number } })
    -- Clear old entries
    for _, child in ipairs(lbList:GetChildren()) do
        child:Destroy()
    end

    for i, entry in ipairs(top5) do
        local row               = Instance.new("TextLabel")
        row.Size                = UDim2.new(1, 0, 0, 24)
        row.Position            = UDim2.new(0, 0, 0, (i - 1) * 24)
        row.BackgroundTransparency = 1
        row.Text                = string.format("#%d %s — %d", i, entry.name, entry.score)
        row.Font                = Enum.Font.Gotham
        row.TextSize            = 13
        row.TextColor3          = Color3.new(1, 1, 1)
        row.TextXAlignment      = Enum.TextXAlignment.Left
        row.Parent              = lbList
    end
end)
```

- [ ] **Step 2: Playtest in Studio**
  - HUD should show shard count (starts at 0, updates as chunks are cleared)
  - Session leaderboard panel visible in top-right
  - No errors in Output

- [ ] **Step 3: Commit**
```bash
git add src/client/HudController.lua
git commit -m "feat: add HudController with shard count and session leaderboard UI"
```

---

## Task 11: Shop GUI (Client)

**Files:**
- Create: `src/client/ShopGui.lua`

- [ ] **Step 1: Create ShopGui.lua**

```lua
--!strict
local Players           = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Constants       = require(ReplicatedStorage:WaitForChild("Constants"))
local PurchaseFn      = ReplicatedStorage:WaitForChild(Constants.REMOTEFN_PURCHASE_COSMETIC) :: RemoteFunction
local GetOwnedFn      = ReplicatedStorage:WaitForChild(Constants.REMOTEFN_GET_OWNED_COSMETICS) :: RemoteFunction
local EquipFn         = ReplicatedStorage:WaitForChild(Constants.REMOTEFN_EQUIP_COSMETIC) :: RemoteFunction
local PromptPassEvent = ReplicatedStorage:WaitForChild(Constants.REMOTE_PROMPT_PASS) :: RemoteEvent

local player    = Players.LocalPlayer
local playerGui = player.PlayerGui

type CosmeticItem = {
    id:       string,
    label:    string,
    cost:     number,
    category: string,
    passId:   number?,   -- if Robux item, passId is set; cost is 0
}

local CATALOG: { CosmeticItem } = {
    -- Trails (shards)
    { id = "NeonStreak",      label = "Neon Streak Trail",      cost = 150, category = "Trail" },
    { id = "FloatingShards",  label = "Floating Shards Trail",  cost = 200, category = "Trail" },
    { id = "RainbowMist",     label = "Rainbow Mist Trail",     cost = 300, category = "Trail" },
    -- Auras (shards)
    { id = "GlowingRing",     label = "Glowing Ring Aura",      cost = 200, category = "Aura" },
    { id = "StaticElec",      label = "Static Electricity Aura",cost = 300, category = "Aura" },
    { id = "DreamCloud",      label = "Dream Cloud Aura",       cost = 400, category = "Aura" },
    -- Death Effects (shards)
    { id = "ExplodeStars",    label = "Explode Into Stars",     cost = 250, category = "DeathFX" },
    { id = "DissolvePixels",  label = "Dissolve Into Pixels",   cost = 350, category = "DeathFX" },
    { id = "ShatterGlass",    label = "Shatter Like Glass",     cost = 500, category = "DeathFX" },
    -- Robux exclusives (passId → prompts game pass purchase; cost = 0)
    { id = "VoidTrail",       label = "Void Trail (Robux)",     cost = 0, category = "Trail",   passId = Constants.PASS_VOID_TRAIL },
    { id = "CelestialAura",   label = "Celestial Aura (Robux)", cost = 0, category = "Aura",    passId = Constants.PASS_CELESTIAL_AURA },
    { id = "ShatterIntoGold", label = "Shatter Into Gold (R$)", cost = 0, category = "DeathFX", passId = Constants.PASS_SHATTER_INTO_GOLD },
    { id = "GlitchSkin",      label = "Glitch Skin (Robux)",    cost = 0, category = "Skin",    passId = Constants.PASS_GLITCH_SKIN },
}

-- ── Build UI ─────────────────────────────────────────────────────────────────

local screenGui          = Instance.new("ScreenGui")
screenGui.Name           = "ShopGui"
screenGui.ResetOnSpawn   = false
screenGui.Enabled        = false
screenGui.Parent         = playerGui

local mainFrame              = Instance.new("Frame")
mainFrame.Size               = UDim2.new(0, 420, 0, 520)
mainFrame.Position           = UDim2.fromScale(0.5, 0.5)
mainFrame.AnchorPoint        = Vector2.new(0.5, 0.5)
mainFrame.BackgroundColor3   = Color3.fromRGB(10, 10, 25)
mainFrame.Parent             = screenGui

local title                  = Instance.new("TextLabel")
title.Size                   = UDim2.new(1, 0, 0, 44)
title.BackgroundTransparency = 1
title.Text                   = "✦ Dream Shop"
title.Font                   = Enum.Font.GothamBold
title.TextSize               = 22
title.TextColor3             = Color3.fromRGB(255, 220, 50)
title.Parent                 = mainFrame

local scrollFrame            = Instance.new("ScrollingFrame")
scrollFrame.Size             = UDim2.new(1, -16, 1, -60)
scrollFrame.Position         = UDim2.new(0, 8, 0, 50)
scrollFrame.BackgroundTransparency = 1
scrollFrame.ScrollBarThickness = 4
scrollFrame.Parent           = mainFrame

local layout                 = Instance.new("UIListLayout")
layout.Padding               = UDim.new(0, 6)
layout.Parent                = scrollFrame

local closeBtn               = Instance.new("TextButton")
closeBtn.Size                = UDim2.new(0, 30, 0, 30)
closeBtn.Position            = UDim2.new(1, -34, 0, 7)
closeBtn.Text                = "✕"
closeBtn.Font                = Enum.Font.GothamBold
closeBtn.TextSize            = 18
closeBtn.TextColor3          = Color3.new(1, 1, 1)
closeBtn.BackgroundColor3    = Color3.fromRGB(200, 50, 50)
closeBtn.Parent              = mainFrame
closeBtn.Activated:Connect(function()
    screenGui.Enabled = false
end)

local function buildItems()
    local owned = GetOwnedFn:InvokeServer()

    for _, item in ipairs(CATALOG) do
        local row                   = Instance.new("Frame")
        row.Size                    = UDim2.new(1, 0, 0, 54)
        row.BackgroundColor3        = Color3.fromRGB(20, 20, 40)
        row.Parent                  = scrollFrame

        local itemLabel             = Instance.new("TextLabel")
        itemLabel.Size              = UDim2.new(0.6, 0, 1, 0)
        itemLabel.Position          = UDim2.new(0, 8, 0, 0)
        itemLabel.BackgroundTransparency = 1
        itemLabel.Text              = item.label
        itemLabel.Font              = Enum.Font.Gotham
        itemLabel.TextSize          = 14
        itemLabel.TextColor3        = Color3.new(1, 1, 1)
        itemLabel.TextXAlignment    = Enum.TextXAlignment.Left
        itemLabel.Parent            = row

        local btn                   = Instance.new("TextButton")
        btn.Size                    = UDim2.new(0, 120, 0, 34)
        btn.Position                = UDim2.new(1, -128, 0.5, -17)
        btn.Font                    = Enum.Font.GothamBold
        btn.TextSize                = 13
        btn.Parent                  = row

        local isOwned = table.find(owned, item.id) ~= nil

        if isOwned then
            btn.Text            = "Equip"
            btn.BackgroundColor3 = Color3.fromRGB(40, 160, 40)
            btn.TextColor3      = Color3.new(1, 1, 1)
            btn.Activated:Connect(function()
                EquipFn:InvokeServer(item.id)
            end)
        elseif item.passId and item.passId ~= 0 then
            btn.Text            = "Buy (R$)"
            btn.BackgroundColor3 = Color3.fromRGB(0, 162, 255)
            btn.TextColor3      = Color3.new(1, 1, 1)
            btn.Activated:Connect(function()
                PromptPassEvent:FireServer(item.passId)
            end)
        else
            btn.Text            = "Buy ✦" .. tostring(item.cost)
            btn.BackgroundColor3 = Color3.fromRGB(100, 40, 200)
            btn.TextColor3      = Color3.new(1, 1, 1)
            btn.Activated:Connect(function()
                local ok, msg = PurchaseFn:InvokeServer(item.id, item.cost)
                if ok then
                    btn.Text            = "Equip"
                    btn.BackgroundColor3 = Color3.fromRGB(40, 160, 40)
                else
                    btn.Text = msg or "Error"
                    task.delay(2, function()
                        btn.Text = "Buy ✦" .. tostring(item.cost)
                    end)
                end
            end)
        end
    end
end

-- ── Shop open button ─────────────────────────────────────────────────────────

local openBtn              = Instance.new("ScreenGui")
openBtn.Name               = "ShopButtonGui"
openBtn.ResetOnSpawn       = false
openBtn.Parent             = playerGui

local openBtnFrame         = Instance.new("TextButton")
openBtnFrame.Size          = UDim2.new(0, 80, 0, 40)
openBtnFrame.Position      = UDim2.new(0, 10, 1, -54)
openBtnFrame.Text          = "✦ Shop"
openBtnFrame.Font          = Enum.Font.GothamBold
openBtnFrame.TextSize      = 16
openBtnFrame.TextColor3    = Color3.new(1, 1, 1)
openBtnFrame.BackgroundColor3 = Color3.fromRGB(100, 40, 200)
openBtnFrame.Parent        = openBtn

openBtnFrame.Activated:Connect(function()
    -- Rebuild items on open to reflect latest ownership
    for _, child in ipairs(scrollFrame:GetChildren()) do
        if child:IsA("Frame") then child:Destroy() end
    end
    buildItems()
    screenGui.Enabled = true
end)
```

- [ ] **Step 2: Playtest in Studio**
  - Click the Shop button — modal opens with catalog items
  - Items without enough shards show "Not enough shards" on buy attempt
  - Robux items show "Buy (R$)" (since pass IDs are 0 placeholders, confirm button appears)

- [ ] **Step 3: Commit**
```bash
git add src/client/ShopGui.lua
git commit -m "feat: add ShopGui with shard purchases, Robux pass prompts, and equip flow"
```

---

## Task 12: Wire EconomyManager into MapGenerator score flow

The MapGenerator currently tracks score internally. This task connects `EconomyManager.onChunkCleared` so shards are actually awarded.

- [ ] **Step 1: Update `advanceChunks` in MapGenerator.lua**

After `state.score += 1` add:
```lua
local EconomyMgr = require(script.Parent.EconomyManager)
EconomyMgr.onChunkCleared(player, state.chunksCleared)
```

Also update the live session leaderboard after each chunk:
```lua
local LeaderboardMgr = require(script.Parent.LeaderboardManager)
LeaderboardMgr.updateSessionScore(player, state.score)
```

- [ ] **Step 2: Playtest full loop in Studio**
  - Walk through 10 chunks — shard counter on HUD should increment
  - Chunk 10: +25 bonus shards fires
  - Die deliberately — personal best triggers if score > 0
  - Respawn at checkpoint with 1-second invincibility (fall on kill zone immediately — no death)

- [ ] **Step 3: Commit**
```bash
git add src/server/MapGenerator.lua
git commit -m "fix: wire EconomyManager and LeaderboardManager into MapGenerator chunk advance"
```

---

## Task 13: Final Polish & Game Pass ID Setup

- [ ] **Step 1: Create Game Passes in Roblox Creator Hub**
  - Go to [create.roblox.com](https://create.roblox.com) → your game → Monetization → Game Passes
  - Create all 8 passes: Dream Collector, VIP Checkpoint, Power-up Pro, Chaos Ward, Void Trail, Celestial Aura, Shatter Into Gold, Glitch Skin
  - Copy each pass ID into `Constants.lua` (replace the `0` placeholders)

- [ ] **Step 2: Update Constants.lua with real pass IDs**
```lua
Constants.PASS_DREAM_COLLECTOR = 123456789  -- replace with real IDs
-- ... etc
```

- [ ] **Step 3: Spawn point setup in Studio**
  - Place a `SpawnLocation` Part at `Vector3.new(0, 5, 0)` in Workspace via Studio
  - Confirm characters spawn at the correct position and MapGenerator picks them up

- [ ] **Step 4: Full end-to-end playtest**
  - [ ] 3+ chunks pre-spawn correctly
  - [ ] Chunks advance as player walks forward
  - [ ] Mutations apply (rotating, rising, shrinking, teleporting, colorshift)
  - [ ] Chaos event triggers after correct chunk count
  - [ ] Power-up orbs appear, can be picked up, effects apply and wear off
  - [ ] Shard HUD updates correctly
  - [ ] Shop opens, items can be purchased (with shards), Robux items prompt pass purchase
  - [ ] Session leaderboard updates every 5 seconds
  - [ ] Death respawns at last checkpoint with 1-second invincibility
  - [ ] All-time leaderboard saves on personal best

- [ ] **Step 5: Final commit**
```bash
git add src/shared/Constants.lua
git commit -m "feat: wire up real Roblox Game Pass IDs in Constants"
```

---

## Notes for Implementation

- **Pass IDs are 0 until Step 13** — Robux features will be dormant until real IDs are entered. All other systems work with placeholder IDs.
- **DataStore in Studio** — DataStore requires enabling Studio Access to API Services: `Game Settings → Security → Enable Studio Access to API Services`.
- **Rojo sync** — Keep `rojo serve default.project.json` running throughout development. After each file save, Rojo syncs to Studio automatically.
- **VIP checkpoint interval** — implemented in Task 3 via `MonetizationManager.playerOwnsPass` check in `advanceChunks`.
- **EquipCosmetic RemoteFunction** — server handler added in Task 6 Step 3. Character cosmetic visuals (ParticleEmitters) should be applied in a follow-up task once character setup is wired.
