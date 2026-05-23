--!strict
local Constants = {}

-- Chunk generation
Constants.CHUNK_BUFFER = 3
Constants.CHUNKS_PER_DIFFICULTY_STEP = 5
Constants.CHECKPOINT_INTERVAL = 3
Constants.CHECKPOINT_INTERVAL_VIP = 2

-- Difficulty thresholds
Constants.DIFF_MEDIUM_START = 11
Constants.DIFF_HARD_START = 26
Constants.DIFF_MAX_START = 51

-- Chaos event frequency (chunks between events)
Constants.CHAOS_FREQ_MEDIUM = 15
Constants.CHAOS_FREQ_HARD = 10
Constants.CHAOS_FREQ_MAX = 7
Constants.CHAOS_DURATION = 3

-- Power-up durations (seconds)
Constants.POWERUP_DURATION = 8
Constants.POWERUP_GHOST_DRAWBACK = 3
Constants.POWERUP_TIMEFREEZE_DURATION = 5
Constants.POWERUP_PRO_REDUCTION = 0.4

-- Economy
Constants.SHARDS_PER_CHUNK = 5
Constants.SHARDS_BONUS_10_CHUNKS = 25
Constants.SHARDS_PERSONAL_BEST = 50
Constants.SHARDS_CHAOS_SURVIVED = 15
Constants.SHARD_SAVE_INTERVAL = 60

-- Respawn
Constants.INVINCIBILITY_DURATION = 1
Constants.DEATH_TWEEN_TIME = 0.5

-- Leaderboard
Constants.LEADERBOARD_UPDATE_INTERVAL = 5
Constants.LEADERBOARD_TOP_N = 10

-- Game Pass IDs (placeholder 0 until created in Roblox Creator Hub)
Constants.PASS_DREAM_COLLECTOR = 0
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
