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
