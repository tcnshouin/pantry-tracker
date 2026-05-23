# Roblox Surreal Obby — Design Spec
**Date:** 2026-05-23
**Project:** MyRobloxGame

---

## Overview

An infinite procedurally generated Roblox obby set in a dreamlike/surreal world with impossible geometry and shifting visuals. The map mutates live as you play — platforms rotate, shrink, teleport, and periodically go chaotic all at once. Players collect risky power-ups that give a strong benefit paired with a punishing drawback. Progression is tracked via a distance-based leaderboard, and players earn Dream Shards to spend in a cosmetics shop. Monetization uses Game Passes for permanent perks and permanent exclusive cosmetics (enforced via DataStore receipt log).

---

## Architecture

Four core systems:

1. **Chunk Library** (`src/shared/Chunks/`) — ModuleScripts defining hand-crafted platform sections (minimum 10 unique chunks per difficulty tier at launch)
2. **Map Generator** (`src/server/MapGenerator.lua`) — Stitches chunks procedurally, applies mutations, scales difficulty
3. **Power-up System** (`src/server/PowerupManager.lua` + `src/client/PowerupHandler.lua`) — Spawns orbs, validates pickup, applies risky effects
4. **Surreal FX** (`src/client/SurrealFX.lua`) — Client-side visual mutations, color shifts, geometry animations

Supporting systems:
- **Economy** (`src/server/EconomyManager.lua`) — Dream Shards earning, persistence, pass multiplier enforcement
- **Shop** (`src/client/ShopGui.lua`) — Cosmetics store UI and loadout
- **Monetization** (`src/server/MonetizationManager.lua`) — Robux game passes and developer products with receipt log

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
2. An invisible `Part` named `Checkpoint` is placed at the end of every 3rd chunk (every 2nd for VIP pass holders). Its `Touched` event fires server-side to record the player's checkpoint `CFrame`
3. As the player crosses a chunk boundary trigger, the next chunk is placed and the oldest is queued for destruction
4. Before destroying an old chunk, the server checks whether any player's `HumanoidRootPart` is within its bounds. If so, destruction is deferred until the chunk is clear
5. Difficulty scalar increases every 5 chunks — harder chunks weighted higher, mutations faster

### Client/Server Mutation Handshake
When the server spawns a chunk, it fires a `RemoteEvent` (`ChunkSpawned`) to all clients with `{ chunkId, mutations[] }`. `SurrealFX` on the client listens for this event and applies client-side mutations (e.g. `colorshift`) to the matching chunk parts. Server-side mutations (rotating, rising, shrinking, teleporting) are driven directly by `TweenService` on the server.

Power-up orbs are tagged with `CollectionService` tag `PowerupOrb` when spawned server-side. `SurrealFX` listens for this tag via `CollectionService:GetInstanceAddedSignal("PowerupOrb")` and applies pulsing color effects on the client.

### Live Mutations
Applied after chunk spawn:

| Mutation | Side | Behavior |
|---|---|---|
| `rotating` | Server | Platform rotates continuously on Y axis via looping Tween |
| `rising` | Server | Platform bobs up and down via looping Tween |
| `shrinking` | Server | Platform slowly shrinks then snaps back via looping Tween |
| `colorshift` | Client | Platform `Color3` cycles through surreal hues via looping Tween |
| `teleporting` | Server | Platform `Transparency` flips 0→1→0 on a timer |

### Chaos Events
Every N chunks (based on difficulty), all current chunk platforms mutate simultaneously — flip upside down, scale 2x, or go invisible for 3 seconds. Chaos Events cannot be paused by Time Freeze mid-event; if Time Freeze is activated during a chaos event, it only suppresses mutations after the chaos window ends.

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
Risky by design — every benefit has a simultaneous drawback. Power-up Pro pass reduces **only the drawback portion** by 40% (rounded up to nearest second); benefit duration is unchanged.

| Name | Benefit | Drawback | Benefit Duration | Drawback Duration |
|---|---|---|---|---|
| **Blaze** | 2x speed | Can't slow down | 8s | 8s (5s w/ Pro) |
| **Titan Jump** | 3x jump height | Random horizontal direction per jump | 8s | 8s (5s w/ Pro) |
| **Ghost** | Phase through one obstacle | Screen nearly black | 1 use | 3s (1.8s w/ Pro) |
| **Time Freeze** | Pauses all mutations (not active chaos) | Controls reversed | 5s | 5s (3s w/ Pro) |
| **Feather** | No death on landing from high drops | Walk-speed only, no running | 8s | 8s (5s w/ Pro) |
| **Shrink** | Hitbox halves — easier to fit gaps | Camera zooms uncomfortably close | 8s | 8s (5s w/ Pro) |

### Implementation
- Server places power-up orbs on platforms at chunk spawn; orbs tagged `PowerupOrb` via `CollectionService`
- Player touches orb → `RemoteEvent` fires to server for validation → server fires back power-up type to client
- `PowerupHandler` (client) applies effect + drawback simultaneously
- No stacking — picking up a new orb while one is active is ignored
- Power-up Pro pass ownership is cached on join and checked in `PowerupHandler` when computing drawback duration

---

## Section 3: Progression & Game Loop

### Core Loop
1. Player spawns at Start
2. Runs through infinite procedurally generated chunks
3. Distance Score increments per chunk cleared (tracked in-memory per session)
4. On death: personal best is evaluated and shards awarded **before** score is reset
5. Score resets → player respawns at last checkpoint with 1-second invincibility

### Checkpoints
- An invisible `Part` named `Checkpoint` at the end of every 3rd chunk
- VIP Checkpoint pass holders: checkpoint every 2 chunks
- `Touched` event on server records the player's checkpoint `CFrame`
- On respawn, character is teleported to stored `CFrame`

### Respawn Invincibility
On respawn, the server sets an `invincible = true` flag for the player for 1 second. All kill zone `Touched` scripts check this flag before applying the death effect. After 1 second, `invincible` is set to `false`.

### Death & Respawn
- Kill zone `Part` beneath map detects fall via `Touched` event; checks `invincible` flag first
- Death animation: tween all character `BasePart.Transparency` from 0 to 1 over 0.5 seconds, screen flashes red
- Character respawns at last checkpoint `CFrame`

### Leaderboard

**All-time (top 10):** Uses `OrderedDataStore:GetSortedAsync(false, 10)` for descending sort. Scores are written with `OrderedDataStore:SetAsync` at session end and on personal best. Updates are throttled — not written on every chunk cleared.

**Live session:** In-memory table of current players and their chunk counts, synced to clients via `RemoteEvent` every 5 seconds. Displayed as a `SurfaceGui` on a `Part` near spawn, showing top 5 active players.

### Chaos Ward Pass
Chaos Ward skips the **first chaos event per server session** (i.e., per join). Dying and respawning does not reset Chaos Ward usage. The skip is tracked in-memory on the server, not persisted.

---

## Section 4: Economy — Dream Shards

### Earning
Shards are earned automatically based on progression:

| Event | Shards |
|---|---|
| Each chunk cleared | +5 |
| Every 10 chunks | +25 bonus |
| Personal best beaten | +50 bonus — awarded only when current run score exceeds stored personal best; stored best is updated at the same time. Evaluated before score reset on death. |
| Survived a chaos event | +15 bonus |

On each shard award, `EconomyManager` checks cached Dream Collector pass ownership (loaded on join) and doubles the amount before saving if the pass is owned.

### Persistence
- Shard balance stored per player via `DataStoreService`
- Loaded on join, saved on leave and every 60 seconds during session
- All `DataStoreService` calls wrapped in `pcall`
- If a DataStore save fails after a shop purchase, the cosmetic is **not granted** and the player receives an error notification; shards are not deducted

### Pass Ownership Caching
On player join, the server calls `UserOwnsGamePassAsync` for all 4 game passes once and caches results in a server-side table. All subsequent checks during the session use the cache, not live API calls, to avoid throttling.

---

## Section 5: Shop — Cosmetics

Accessed via on-screen GUI button. Cosmetics are purely visual, no gameplay advantage. Purchased once, owned forever, stored in `DataStoreService`.

### Shard Cosmetics

| Category | Examples | Cost |
|---|---|---|
| **Trails** | Neon streak, floating shards, rainbow mist | 150–300 shards |
| **Auras** | Glowing ring, static electricity, dream cloud | 200–400 shards |
| **Death Effects** | Explode into stars, dissolve into pixels, shatter like glass | 250–500 shards |

### Implementation
- `ShopGui` (client) sends purchase request via `RemoteFunction` to server
- Server validates shard balance, deducts shards, saves cosmetic ownership, then responds
- If DataStore save fails: shards not deducted, cosmetic not granted, error shown to player
- **Trails and Auras:** `ParticleEmitter` instances attached to character, cleaned up on death/respawn
- **Death Effects:** Triggered as a one-shot effect at the character's last `CFrame` using a temporary `Model` parented to `Workspace`, independent of character cleanup. Destroyed after the effect completes

---

## Section 6: Robux Monetization

### Premium Exclusive Cosmetics (Game Passes, one-time permanent)
Exclusive cosmetics are sold as **Game Passes** (not Developer Products) to guarantee one-time purchase semantics. A DataStore receipt log additionally prevents any double-grant edge cases.

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
| **Power-up Pro** | Drawback duration reduced 40% (benefit unchanged) | 249 R$ |
| **Chaos Ward** | Skip first chaos event per session | 99 R$ |

### Implementation
- `MarketplaceService:PromptGamePassPurchase(player, passId)` for all Game Pass purchase prompts (both perk passes and exclusive cosmetic passes)
- `MarketplaceService.PromptProductPurchase` is **not used** — all monetized items are Game Passes
- `MarketplaceService.ProcessReceipt` is **not needed** for Game Passes (Game Passes are handled differently — ownership is checked via `UserOwnsGamePassAsync`)
- On join: server calls `UserOwnsGamePassAsync` for all passes, caches results, grants owned cosmetics and activates perks
- `MarketplaceService.PromptPurchaseFinished` event used to detect in-session purchases and update the cache without requiring a rejoin

---

## Section 7: SurrealFX — Visual Effects

`SurrealFX.lua` is responsible for all client-side surreal aesthetics. Concrete effects at launch:

| Effect | Implementation |
|---|---|
| **Platform color cycle** | Looping `TweenService` Tween on `BasePart.Color` cycling through 4–5 surreal `Color3` values |
| **Neon glow pulse** | `BasePart.Material = Enum.Material.Neon` + looping Tween on `BasePart.Color` brightness |
| **Orb pulse** | `PointLight.Brightness` tween on `PowerupOrb` tagged parts |
| **Geometry stretch** | Looping Tween on `BasePart.Size` X or Z axis — platforms appear to breathe |
| **Impossible spin** | `TweenService` with `RepeatCount = -1, Reverses = false` rotating platform on an axis that defies gravity |
| **Screen distortion on Glitch Skin** | `ColorCorrectionEffect` in `Lighting` with animated `Saturation` and `TintColor` shifts. Removed when effect expires or on character death/respawn. |

SurrealFX listens for:
- `ChunkSpawned` RemoteEvent → applies `colorshift` and other client mutations to chunk parts
- `CollectionService:GetInstanceAddedSignal("PowerupOrb")` → applies orb pulse

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
    │   ├── ChunkEasy.lua       -- min 10 unique chunks
    │   ├── ChunkMedium.lua     -- min 10 unique chunks
    │   └── ChunkHard.lua       -- min 10 unique chunks
    └── Constants.lua
```

---

## Key Constraints & Notes

- All economy/purchase mutations happen server-side — client is display only
- `DataStoreService` calls always wrapped in `pcall`
- `task.wait()` and `task.spawn()` used throughout (never deprecated `wait()`/`spawn()`)
- `--!strict` on all scripts
- Pass ownership loaded once on join and cached in-memory — never polled mid-session
- Trails and Auras: `ParticleEmitter` on character, cleaned up on death/respawn
- Death Effects: one-shot temporary `Model` in `Workspace`, independent of character
- Chunk destruction deferred if any player is within chunk bounds
- All-time leaderboard uses `OrderedDataStore`, not `DataStore`
- Personal best evaluated and shards awarded before score reset on death
- `invincible` flag set for 1 second on respawn; kill zones check flag before applying death
