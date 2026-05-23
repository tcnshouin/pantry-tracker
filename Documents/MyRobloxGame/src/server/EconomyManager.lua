--!strict
local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Constants = require(ReplicatedStorage:WaitForChild("Constants"))
local UpdateShardsEvent = ReplicatedStorage:WaitForChild(Constants.REMOTE_UPDATE_SHARDS) :: RemoteEvent

local ShardsDS = DataStoreService:GetDataStore(Constants.DS_SHARDS)
local CosmeticsDS = DataStoreService:GetDataStore(Constants.DS_COSMETICS)
local PersonalBestDS = DataStoreService:GetDataStore(Constants.DS_PERSONAL_BEST)

type PlayerData = {
	shards: number,
	cosmetics: { string },
	personalBest: number,
	passCache: { [string]: boolean },
}

local playerData: { [Player]: PlayerData } = {}

local EconomyManager = {}

local function loadPlayerData(player: Player)
	local userId = tostring(player.UserId)

	local shards = 0
	local cosmetics: { string } = {}
	local personalBest = 0

	local shardsOk, shardsResult = pcall(function()
		return ShardsDS:GetAsync(userId)
	end)
	if shardsOk and type(shardsResult) == "number" then
		shards = shardsResult
	end

	local cosmeticsOk, cosmeticsResult = pcall(function()
		return CosmeticsDS:GetAsync(userId)
	end)
	if cosmeticsOk and type(cosmeticsResult) == "table" then
		cosmetics = cosmeticsResult
	end

	local pbOk, pbResult = pcall(function()
		return PersonalBestDS:GetAsync(userId)
	end)
	if pbOk and type(pbResult) == "number" then
		personalBest = pbResult
	end

	playerData[player] = {
		shards = shards,
		cosmetics = cosmetics,
		personalBest = personalBest,
		passCache = {},
	}

	UpdateShardsEvent:FireClient(player, shards)
end

local function savePlayerData(player: Player)
	local data = playerData[player]
	if not data then
		return
	end

	local userId = tostring(player.UserId)

	pcall(function()
		ShardsDS:SetAsync(userId, data.shards)
	end)

	pcall(function()
		CosmeticsDS:SetAsync(userId, data.cosmetics)
	end)

	pcall(function()
		PersonalBestDS:SetAsync(userId, data.personalBest)
	end)
end

function EconomyManager.awardShards(player: Player, amount: number)
	local data = playerData[player]
	if not data then
		return
	end

	local multiplier = 1
	if data.passCache[tostring(Constants.PASS_DREAM_COLLECTOR)] then
		multiplier = 2
	end

	data.shards += amount * multiplier
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
	if not data then
		return
	end

	if score > data.personalBest then
		data.personalBest = score
		EconomyManager.awardShards(player, Constants.SHARDS_PERSONAL_BEST)
		pcall(function()
			PersonalBestDS:SetAsync(tostring(player.UserId), data.personalBest)
		end)
	end

	local ok, LeaderboardManager = pcall(function()
		return require(script.Parent.LeaderboardManager)
	end)
	if ok and LeaderboardManager then
		LeaderboardManager.submitScore(player, score)
	end
end

function EconomyManager.purchaseCosmetic(player: Player, cosmeticId: string, cost: number): (boolean, string)
	local data = playerData[player]
	if not data then
		return false, "Player data not loaded"
	end

	for _, owned in data.cosmetics do
		if owned == cosmeticId then
			return false, "Already owned"
		end
	end

	if data.shards < cost then
		return false, "Not enough shards"
	end

	data.shards -= cost
	table.insert(data.cosmetics, cosmeticId)

	local saveOk = pcall(function()
		local userId = tostring(player.UserId)
		ShardsDS:SetAsync(userId, data.shards)
		CosmeticsDS:SetAsync(userId, data.cosmetics)
	end)

	if not saveOk then
		data.shards += cost
		local idx = table.find(data.cosmetics, cosmeticId)
		if idx then
			table.remove(data.cosmetics, idx)
		end
		return false, "Save failed — please try again"
	end

	UpdateShardsEvent:FireClient(player, data.shards)
	return true, "Success"
end

function EconomyManager.getOwnedCosmetics(player: Player): { string }
	local data = playerData[player]
	if not data then
		return {}
	end
	return data.cosmetics
end

function EconomyManager.setPassCache(player: Player, passId: number, owned: boolean)
	local data = playerData[player]
	if not data then
		return
	end
	data.passCache[tostring(passId)] = owned
end

function EconomyManager.grantCosmetic(player: Player, cosmeticId: string)
	local data = playerData[player]
	if not data then
		return
	end

	for _, owned in data.cosmetics do
		if owned == cosmeticId then
			return
		end
	end

	table.insert(data.cosmetics, cosmeticId)

	pcall(function()
		CosmeticsDS:SetAsync(tostring(player.UserId), data.cosmetics)
	end)
end

function EconomyManager.start()
	local PurchaseCosmeticFn = ReplicatedStorage:WaitForChild(Constants.REMOTEFN_PURCHASE_COSMETIC) :: RemoteFunction
	local GetOwnedCosmeticsFn = ReplicatedStorage:WaitForChild(Constants.REMOTEFN_GET_OWNED_COSMETICS) :: RemoteFunction

	PurchaseCosmeticFn.OnServerInvoke = function(player: Player, cosmeticId: string, cost: number)
		return EconomyManager.purchaseCosmetic(player, cosmeticId, cost)
	end

	GetOwnedCosmeticsFn.OnServerInvoke = function(player: Player)
		return EconomyManager.getOwnedCosmetics(player)
	end

	Players.PlayerAdded:Connect(function(player: Player)
		task.spawn(function()
			loadPlayerData(player)

			while player.Parent do
				task.wait(Constants.SHARD_SAVE_INTERVAL)
				if player.Parent then
					savePlayerData(player)
				end
			end
		end)
	end)

	Players.PlayerRemoving:Connect(function(player: Player)
		savePlayerData(player)
		playerData[player] = nil
	end)

	for _, player in Players:GetPlayers() do
		task.spawn(function()
			loadPlayerData(player)
		end)
	end
end

return EconomyManager
