--!strict
local Players           = game:GetService("Players")
local DataStoreService  = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Constants             = require(ReplicatedStorage:WaitForChild("Constants"))
local SessionLeaderboardEvent = ReplicatedStorage:WaitForChild(Constants.REMOTE_SESSION_LEADERBOARD) :: RemoteEvent

local ODS = DataStoreService:GetOrderedDataStore(Constants.ODS_LEADERBOARD)

local sessionScores: { [number]: { name: string, score: number } } = {}

local LeaderboardManager = {}

function LeaderboardManager.submitScore(player: Player, score: number)
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
			return Players:GetNameFromUserIdAsync(tonumber(entry.key))
		end)
		if ok2 then name = playerName end
		table.insert(results, { name = name, score = entry.value })
	end
	return results
end

function LeaderboardManager.updateSessionScore(player: Player, score: number)
	sessionScores[player.UserId] = { name = player.Name, score = score }
end

function LeaderboardManager.start()
	Players.PlayerRemoving:Connect(function(player)
		sessionScores[player.UserId] = nil
	end)
	task.spawn(function()
		while true do
			task.wait(Constants.LEADERBOARD_UPDATE_INTERVAL)
			local list: { { name: string, score: number } } = {}
			for _, entry in pairs(sessionScores) do
				table.insert(list, entry)
			end
			table.sort(list, function(a, b) return a.score > b.score end)
			local top5: { { name: string, score: number } } = {}
			for i = 1, math.min(5, #list) do
				table.insert(top5, list[i])
			end
			SessionLeaderboardEvent:FireAllClients(top5)
		end
	end)
end

return LeaderboardManager
