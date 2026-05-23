--!strict
local Players           = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Constants               = require(ReplicatedStorage:WaitForChild("Constants"))
local UpdateShardsEvent       = ReplicatedStorage:WaitForChild(Constants.REMOTE_UPDATE_SHARDS) :: RemoteEvent
local SessionLeaderboardEvent = ReplicatedStorage:WaitForChild(Constants.REMOTE_SESSION_LEADERBOARD) :: RemoteEvent

local player    = Players.LocalPlayer
local playerGui = player.PlayerGui

local hudGui = Instance.new("ScreenGui")
hudGui.Name = "HudGui"
hudGui.ResetOnSpawn = false
hudGui.Parent = playerGui

local shardsLabel = Instance.new("TextLabel")
shardsLabel.Name = "ShardsLabel"
shardsLabel.Position = UDim2.new(0, 10, 0, 10)
shardsLabel.Size = UDim2.new(0, 200, 0, 40)
shardsLabel.BackgroundTransparency = 1
shardsLabel.Text = "✦ 0 Shards"
shardsLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
shardsLabel.Font = Enum.Font.GothamBold
shardsLabel.TextSize = 22
shardsLabel.TextXAlignment = Enum.TextXAlignment.Left
shardsLabel.Parent = hudGui

local lbFrame = Instance.new("Frame")
lbFrame.Name = "SessionLeaderboard"
lbFrame.Position = UDim2.new(1, -210, 0, 10)
lbFrame.Size = UDim2.new(0, 200, 0, 160)
lbFrame.BackgroundColor3 = Color3.fromRGB(10, 10, 20)
lbFrame.BackgroundTransparency = 0.4
lbFrame.BorderSizePixel = 0
lbFrame.Parent = hudGui

local lbTitle = Instance.new("TextLabel")
lbTitle.Name = "Title"
lbTitle.Position = UDim2.new(0, 0, 0, 0)
lbTitle.Size = UDim2.new(1, 0, 0, 24)
lbTitle.BackgroundTransparency = 1
lbTitle.Text = "TOP RUNNERS"
lbTitle.TextColor3 = Color3.fromRGB(255, 220, 50)
lbTitle.Font = Enum.Font.GothamBold
lbTitle.TextSize = 14
lbTitle.Parent = lbFrame

local lbList = Instance.new("Frame")
lbList.Name = "List"
lbList.Position = UDim2.new(0, 0, 0, 24)
lbList.Size = UDim2.new(1, 0, 1, -24)
lbList.BackgroundTransparency = 1
lbList.Parent = lbFrame

UpdateShardsEvent.OnClientEvent:Connect(function(shards: number)
	shardsLabel.Text = "✦ " .. shards .. " Shards"
end)

SessionLeaderboardEvent.OnClientEvent:Connect(function(entries: { { name: string, score: number } })
	for _, child in ipairs(lbList:GetChildren()) do
		child:Destroy()
	end
	for i, entry in ipairs(entries) do
		local row = Instance.new("TextLabel")
		row.Name = "Row_" .. i
		row.Position = UDim2.new(0, 4, 0, (i - 1) * 24)
		row.Size = UDim2.new(1, -8, 0, 22)
		row.BackgroundTransparency = 1
		row.Text = "#" .. i .. " " .. entry.name .. " — " .. entry.score
		row.TextColor3 = Color3.fromRGB(255, 255, 255)
		row.Font = Enum.Font.Gotham
		row.TextSize = 12
		row.TextXAlignment = Enum.TextXAlignment.Left
		row.Parent = lbList
	end
end)
