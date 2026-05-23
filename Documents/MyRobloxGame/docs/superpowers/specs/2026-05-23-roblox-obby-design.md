# Roblox Surreal Obby — Design Spec
**Date:** 2026-05-23
**Project:** MyRobloxGame

---

## Overview

An infinite procedurally generated Roblox obby set in a dreamlike/surreal world with impossible geometry and shifting visuals. The map mutates live as you play — platforms rotate, shrink, teleport, and periodically go chaotic all at once. Players collect risky power-ups that give a strong benefit paired with a punishing drawback. Progression is tracked via a distance-based leaderboard, and players earn Dream Shards to spend in a cosmetics shop.

---

## Architecture

Four core systems:

1. **Chunk Library** (`src/shared/Chunks/`) — ModuleScripts defining hand-crafted platform sections
2. **Map Generator** (`src/server/MapGenerator.lua`) — Stitches chunks procedurally, applies mutations, scales difficulty
3. **Power-up System** (`src/server/PowerupManager.lua` + `src/client/PowerupHandler.lua`) — Spawns orbs, validates pickup, applies risky effects
4. **Surreal FX** (`src/client/SurrealFX.lua`) — Client-side visual mutations, color shifts, geometry animations

Supporting systems:
- **Economy** (`src/server/EconomyManager.lua`) — Dream Shards earning and persistence
- **Shop** (`src/client/ShopGui.lua`) — Cosmetics store UI and loadout
- **Monetization** (`src/server/MonetizationManager.lua`) — Robux game passes and developer products

---

## Section 1: Chunk System & Map Generation

### Chunk Structure
Each chunk is a ModuleScript returning:
```lua
{
  platforms  = { { pos, size, material }, ... },
  hazards    = { { type = "rotating", speed = 2 }, ... },
  mutations  = { "shrinking", "colorshift" },
  difficulty = 1  -- 1=easy, 2=medium, 3=hard
}
```

### Generation Flow
1. Player spawns → Generator pre-places 3 chunks as a buffer
2. Checkpoint trigger at end of each chunk fires → next chunk placed, oldest destroyed
3. Difficulty scalar increases every 5 chunks — harder chunks weighted higher, mutations faster

### Live Mutations
Applied to platforms via `TweenService` after chunk spawn:

| Mutation | Behavior |
|---|---|
| `rotating` | Platform rotates continuously on Y axis |
| `rising` | Platform bobs up and down |
| `shrinking` | Platform slowly shrinks then snaps back |
| `colorshift` | Platform color cycles through surreal hues (client-side) |
| `teleporting` | Platform briefly disappears and reappears |

### Chaos Events
Every N chunks (based on difficulty), all current platforms mutate simultaneously — flip, scale 2x, or go invisible for 3 seconds. This is the signature "living map" moment.

### Difficulty Curve

| Chunks Cleared | Mutation Speed | Chaos Frequency | Hard Chunks % |
|---|---|---|---|
| 0–10 | Slow | Never | 0% |
| 11–25 | Medium | Every 15 chunks | 20% |
| 26–50 | Fast | Every 10 chunks | 50% |
| 51+ | Very fast | Every 7 chunks | 80% |

---

## Section 2: Power-up System

### Power-ups
Risky by design — every benefit has a simultaneous drawback:

| Name | Benefit | Drawback | Duration |
|---|---|---|---|
| **Blaze** | 2x speed | Can't slow down | 8s |
| **Titan Jump** | 3x jump height | Random horizontal direction per jump | 8s |
| **Ghost** | Phase through one obstacle | Screen nearly black for 3s | 8s |
| **Time Freeze** | Pauses all mutations for 5s | Controls reversed for 5s | 8s |
| **Feather** | No fall damage, slow float | Walk-speed only, no running | 8s |
| **Shrink** | Hitbox halves — easier to fit gaps | Camera zooms uncomfortably close | 8s |

### Implementation
- Server places power-up orbs on platforms at chunk spawn
- Player touches orb → `RemoteEvent` fires to server for validation
- Server fires back power-up type to client → `PowerupHandler` applies effect + drawback
- No stacking — can't pick up while one is active
- Orbs pulse with `SurrealFX` color effects to stand out visually

---

## Section 3: Progression & Game Loop

### Core Loop
1. Player spawns at Start
2. Runs through infinite procedurally generated chunks
3. Distance Score increments per chunk cleared (leaderboard)
4. Death → respawn at last checkpoint, score resets
5. Infinite respawns, no lives system

### Checkpoints
- Placed every 3 chunks automatically
- VIP Game Pass holders get a checkpoint every 2 chunks

### Leaderboard
- Top 10 all-time high scores via `DataStoreService`
- Live session leaderboard (who's furthest right now)
- Displayed as a surfaced GUI billboard near spawn

### Death & Respawn
- Kill zone beneath map detects fall via `Touched` event
- Short death animation: screen goes red, character dissolves
- Respawn at last checkpoint with 1-second invincibility

---

## Section 4: Economy — Dream Shards

### Earning
Shards are earned automatically based on progression — no physical pickups:

| Event | Shards |
|---|---|
| Each chunk cleared | +5 |
| Every 10 chunks | +25 bonus |
| Personal best beaten | +50 bonus |
| Survived a chaos event | +15 bonus |

Dream Collector Game Pass holders earn 2x shards permanently.

### Persistence
- Shard balance stored per player via `DataStoreService`
- Loaded on join, saved on leave and periodically during session

---

## Section 5: Shop — Cosmetics

Accessed via on-screen GUI button. Cosmetics are purely visual, no gameplay advantage. Purchased once, owned forever.

### Shard Cosmetics

| Category | Examples | Cost |
|---|---|---|
| **Trails** | Neon streak, floating shards, rainbow mist | 150–300 shards |
| **Auras** | Glowing ring, static electricity, dream cloud | 200–400 shards |
| **Death Effects** | Explode into stars, dissolve into pixels, shatter like glass | 250–500 shards |

### Implementation
- Shop GUI (`src/client/ShopGui.lua`) communicates with server via `RemoteFunction`
- Server validates shard balance before deducting and granting ownership
- Owned cosmetics stored in `DataStoreService`
- Equipped cosmetic applied client-side via `ParticleEmitter` + `TweenService`

---

## Section 6: Robux Monetization

### Premium Exclusive Cosmetics (Developer Products)
One-time Robux purchases — never earnable with Dream Shards:

| Item | Type | Price |
|---|---|---|
| Void Trail | Trail | 80 R$ |
| Celestial Aura | Aura | 100 R$ |
| Shatter Into Gold | Death Effect | 80 R$ |
| Glitch Skin | Full character tint + distortion | 150 R$ |

### Game Passes (Permanent Perks)

| Pass | Perk | Price |
|---|---|---|
| **Dream Collector** | 2x Dream Shards earned forever | 199 R$ |
| **VIP Checkpoint** | Extra checkpoint every 2 chunks instead of 3 | 149 R$ |
| **Power-up Pro** | Drawback duration reduced 40% on all power-ups | 249 R$ |
| **Chaos Ward** | First chaos event per run is skipped | 99 R$ |

### Implementation
- `MarketplaceService:PromptProductPurchase()` for cosmetics
- `MarketplaceService:PromptGamePassPurchase()` for passes
- `MarketplaceService.ProcessReceipt` server callback grants items safely
- All purchases validated server-side — never trust client
- Pass ownership checked on join via `MarketplaceService:UserOwnsGamePassAsync()`

---

## File Structure

```
src/
├── server/
│   ├── MapGenerator.lua
│   ├── PowerupManager.lua
│   ├── EconomyManager.lua
│   └── MonetizationManager.lua
├── client/
│   ├── PowerupHandler.lua
│   ├── SurrealFX.lua
│   └── ShopGui.lua
└── shared/
    ├── Chunks/
    │   ├── ChunkEasy.lua
    │   ├── ChunkMedium.lua
    │   └── ChunkHard.lua
    └── Constants.lua
```

---

## Key Constraints & Notes

- All purchases and economy mutations happen server-side — client is display only
- `DataStoreService` calls always wrapped in `pcall`
- `task.wait()` and `task.spawn()` used throughout (never deprecated `wait()`/`spawn()`)
- `--!strict` on all scripts
- Cosmetics applied via `ParticleEmitter` instances parented to character — cleaned up on death/respawn
