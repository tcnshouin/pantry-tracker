--!strict
local Players           = game:GetService("Players")
local TweenService      = game:GetService("TweenService")
local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace         = game:GetService("Workspace")

local Constants          = require(ReplicatedStorage:WaitForChild("Constants"))
local ChunkEasy          = require(ReplicatedStorage:WaitForChild("Chunks"):WaitForChild("ChunkEasy"))
local ChunkMedium        = require(ReplicatedStorage:WaitForChild("Chunks"):WaitForChild("ChunkMedium"))
local ChunkHard          = require(ReplicatedStorage:WaitForChild("Chunks"):WaitForChild("ChunkHard"))

local ChunkSpawnedEvent  = ReplicatedStorage:WaitForChild(Constants.REMOTE_CHUNK_SPAWNED) :: RemoteEvent
local PowerupManager     = require(script.Parent.PowerupManager)
local EconomyManager     = require(script.Parent.EconomyManager)
local LeaderboardManager = require(script.Parent.LeaderboardManager)
local MonetizationManager = require(script.Parent.MonetizationManager)

type PlayerState = {
    chunksCleared:    number,
    nextChunkOffset:  Vector3,
    activeChunks:     { { model: Model, endX: number } },
    checkpoints:      { Part },
    checkpointCFrame: CFrame,
    invincible:       boolean,
    chaosWardUsed:    boolean,
    score:            number,
}

local playerStates: { [Player]: PlayerState } = {}

local MapGenerator = {}

local function getMutationSpeed(chunksCleared: number): number
    if chunksCleared <= 10 then return 1
    elseif chunksCleared <= 25 then return 2
    elseif chunksCleared <= 50 then return 3
    else return 4
    end
end

local function getChaosFrequency(chunksCleared: number): number
    if chunksCleared < Constants.DIFF_MEDIUM_START then return math.huge
    elseif chunksCleared < Constants.DIFF_HARD_START then return Constants.CHAOS_FREQ_MEDIUM
    elseif chunksCleared < Constants.DIFF_MAX_START then return Constants.CHAOS_FREQ_HARD
    else return Constants.CHAOS_FREQ_MAX
    end
end

local function pickChunk(chunksCleared: number)
    local hardWeight = if chunksCleared > 50 then 80
        elseif chunksCleared > 25 then 50
        elseif chunksCleared > 10 then 20
        else 0
    local medWeight = if chunksCleared > 10 then 50 else 0
    local total = 100 + medWeight + hardWeight
    local roll = math.random(1, total)

    if roll <= 100 and #ChunkEasy > 0 then
        return ChunkEasy[math.random(1, #ChunkEasy)]
    elseif roll <= 100 + medWeight and #ChunkMedium > 0 then
        return ChunkMedium[math.random(1, #ChunkMedium)]
    elseif #ChunkHard > 0 then
        return ChunkHard[math.random(1, #ChunkHard)]
    else
        return ChunkEasy[1]
    end
end

local function applyServerMutation(part: BasePart, mutation: string, speed: number)
    local tweenInfo = TweenInfo.new(1 / speed, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true)

    if mutation == "rising" then
        local origin = part.Position
        TweenService:Create(part, tweenInfo, { Position = origin + Vector3.new(0, 4, 0) }):Play()

    elseif mutation == "rotating" then
        task.spawn(function()
            while part and part.Parent do
                local goal = part.CFrame * CFrame.Angles(0, math.pi * 2, 0)
                local t = TweenService:Create(part, TweenInfo.new(4 / speed, Enum.EasingStyle.Linear), { CFrame = goal })
                t:Play()
                pcall(function() t.Completed:Wait() end)
                if not (part and part.Parent) then break end
            end
        end)

    elseif mutation == "shrinking" then
        local originalSize = part.Size
        local smallSize = Vector3.new(originalSize.X * 0.4, originalSize.Y, originalSize.Z * 0.4)
        TweenService:Create(part, tweenInfo, { Size = smallSize }):Play()

    elseif mutation == "teleporting" then
        task.spawn(function()
            while part and part.Parent do
                task.wait(math.random(2, 4))
                part.Transparency = 1
                part.CanCollide = false
                task.wait(1.5)
                part.Transparency = 0
                part.CanCollide = true
            end
        end)
    end
end

local chunkIdCounter = 0

local function spawnChunk(offset: Vector3, chunksCleared: number): { model: Model, endOffset: Vector3 }
    local data = pickChunk(chunksCleared)
    chunkIdCounter += 1
    local chunkId = chunkIdCounter
    local speed = getMutationSpeed(chunksCleared)

    local chunkModel = Instance.new("Model")
    chunkModel.Name = "Chunk_" .. chunkId
    chunkModel.Parent = Workspace

    for _, platData in ipairs(data.platforms) do
        local part = Instance.new("Part")
        part.Size = platData.size
        part.Material = platData.material
        part.CFrame = CFrame.new(offset + platData.pos)
        part.Anchored = true
        part.CanCollide = true
        part.Color = Color3.fromHSV(math.random(), 0.6, 1)
        part.Parent = chunkModel
        CollectionService:AddTag(part, Constants.TAG_CHUNK_PART)

        for _, mutation in ipairs(data.mutations) do
            if mutation ~= "colorshift" then
                applyServerMutation(part, mutation, speed)
            end
        end
    end

    PowerupManager.onChunkSpawned(chunkModel)
    ChunkSpawnedEvent:FireAllClients(chunkId, data.mutations, chunkModel)

    local endOffset = offset + Vector3.new(data.length, 0, 0)
    return { model = chunkModel, endOffset = endOffset }
end

local function placeCheckpoint(position: Vector3, player: Player): Part
    local cp = Instance.new("Part")
    cp.Name = "Checkpoint"
    cp.Size = Vector3.new(8, 10, 1)
    cp.Anchored = true
    cp.CanCollide = false
    cp.Transparency = 1
    cp.CFrame = CFrame.new(position)
    cp.Parent = Workspace

    local conn: RBXScriptConnection
    conn = cp.Touched:Connect(function(hit)
        local char = hit.Parent
        if not char then return end
        local p = Players:GetPlayerFromCharacter(char)
        if p == player and playerStates[p] then
            playerStates[p].checkpointCFrame = cp.CFrame
            conn:Disconnect()
        end
    end)

    local state = playerStates[player]
    if state then
        table.insert(state.checkpoints, cp)
    end

    return cp
end

local function triggerChaosEvent(player: Player)
    local state = playerStates[player]
    if not state then return end

    if not state.chaosWardUsed and MonetizationManager.playerOwnsPass(player, Constants.PASS_CHAOS_WARD) then
        state.chaosWardUsed = true
        return
    end

    for _, chunkEntry in ipairs(state.activeChunks) do
        for _, part in ipairs(chunkEntry.model:GetDescendants()) do
            if part:IsA("BasePart") then
                local chaosRoll = math.random(1, 3)
                if chaosRoll == 1 then
                    TweenService:Create(part, TweenInfo.new(0.2), {
                        CFrame = part.CFrame * CFrame.Angles(math.pi, 0, 0)
                    }):Play()
                elseif chaosRoll == 2 then
                    TweenService:Create(part, TweenInfo.new(0.2), {
                        Size = part.Size * 2
                    }):Play()
                else
                    part.Transparency = 1
                    part.CanCollide = false
                    task.delay(Constants.CHAOS_DURATION, function()
                        if part and part.Parent then
                            part.Transparency = 0
                            part.CanCollide = true
                        end
                    end)
                end
            end
        end
    end

    EconomyManager.awardShards(player, Constants.SHARDS_CHAOS_SURVIVED)
end

local function advanceChunks(player: Player)
    local state = playerStates[player]
    if not state then return end

    local result = spawnChunk(state.nextChunkOffset, state.chunksCleared)
    state.nextChunkOffset = result.endOffset
    table.insert(state.activeChunks, { model = result.model, endX = result.endOffset.X })

    state.chunksCleared += 1
    state.score += 1

    EconomyManager.onChunkCleared(player, state.chunksCleared)
    LeaderboardManager.updateSessionScore(player, state.score)

    local interval = if MonetizationManager.playerOwnsPass(player, Constants.PASS_VIP_CHECKPOINT) then Constants.CHECKPOINT_INTERVAL_VIP else Constants.CHECKPOINT_INTERVAL
    if state.chunksCleared % interval == 0 then
        placeCheckpoint(state.nextChunkOffset - Vector3.new(4, 0, 0), player)
    end

    local freq = getChaosFrequency(state.chunksCleared)
    if freq ~= math.huge and state.chunksCleared % freq == 0 then
        triggerChaosEvent(player)
    end

    if #state.activeChunks > Constants.CHUNK_BUFFER + 2 then
        local oldest = state.activeChunks[1]
        local safe = false
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

local function createKillZone()
    local kz = Instance.new("Part")
    kz.Name = "KillZone"
    kz.Size = Vector3.new(10000, 1, 10000)
    kz.Position = Vector3.new(0, -100, 0)
    kz.Anchored = true
    kz.CanCollide = false
    kz.Transparency = 1
    kz.Parent = Workspace

    kz.Touched:Connect(function(hit)
        local char = hit.Parent
        if not char then return end
        local player = Players:GetPlayerFromCharacter(char)
        if not player then return end
        local state = playerStates[player]
        if not state or state.invincible then return end

        EconomyManager.onPlayerDeath(player, state.score)

        state.score = 0

        local humanoid = char:FindFirstChildOfClass("Humanoid")
        if humanoid then
            humanoid.Health = 0
        end
    end)
end

function MapGenerator.initPlayer(player: Player)
    local spawnPos = Vector3.new(0, 5, 0)

    playerStates[player] = {
        chunksCleared    = 0,
        nextChunkOffset  = spawnPos,
        activeChunks     = {},
        checkpoints      = {},
        checkpointCFrame = CFrame.new(spawnPos),
        invincible       = false,
        chaosWardUsed    = false,
        score            = 0,
    }

    for _ = 1, Constants.CHUNK_BUFFER do
        advanceChunks(player)
    end

    local generation = 0

    player.CharacterAdded:Connect(function(char)
        generation += 1
        local myGen = generation

        local state = playerStates[player]
        if state then
            state.invincible = true
            task.delay(Constants.INVINCIBILITY_DURATION, function()
                if playerStates[player] then
                    playerStates[player].invincible = false
                end
            end)

            local root = char:WaitForChild("HumanoidRootPart") :: BasePart
            root.CFrame = state.checkpointCFrame + Vector3.new(0, 3, 0)
        end

        task.spawn(function()
            while player and player.Parent and generation == myGen do
                local c = player.Character
                local state2 = playerStates[player]
                if c and state2 then
                    local root = c:FindFirstChild("HumanoidRootPart") :: BasePart?
                    if root and root.Position.X > state2.nextChunkOffset.X - 40 then
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
        for _, cp in ipairs(state.checkpoints) do
            cp:Destroy()
        end
    end
    playerStates[player] = nil
end

function MapGenerator.getPlayerState(player: Player): PlayerState?
    return playerStates[player]
end

function MapGenerator.start()
    createKillZone()

    Players.PlayerAdded:Connect(function(player)
        local _ = player.Character or player.CharacterAdded:Wait()
        MapGenerator.initPlayer(player)
    end)

    Players.PlayerRemoving:Connect(MapGenerator.cleanupPlayer)
end

return MapGenerator
