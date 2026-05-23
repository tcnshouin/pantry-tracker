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

type CosmeticItem = { id: string, label: string, cost: number, category: string, passId: number? }

local CATALOG: { CosmeticItem } = {
	{ id = "NeonTrail",          label = "Neon Streak Trail",         cost = 150, category = "Trail" },
	{ id = "FloatingShardsTrail",label = "Floating Shards Trail",     cost = 200, category = "Trail" },
	{ id = "RainbowMistTrail",   label = "Rainbow Mist Trail",        cost = 250, category = "Trail" },
	{ id = "GlowingAura",        label = "Glowing Ring Aura",         cost = 200, category = "Aura" },
	{ id = "StaticAura",         label = "Static Electricity Aura",   cost = 300, category = "Aura" },
	{ id = "DreamCloudAura",     label = "Dream Cloud Aura",          cost = 400, category = "Aura" },
	{ id = "ExplodeIntoStars",   label = "Explode Into Stars",        cost = 250, category = "DeathFX" },
	{ id = "DissolveIntoPixels", label = "Dissolve Into Pixels",      cost = 350, category = "DeathFX" },
	{ id = "ShatterLikeGlass",   label = "Shatter Like Glass",        cost = 500, category = "DeathFX" },
	{ id = "VoidTrail",          label = "Void Trail",                cost = 0,   category = "Trail",   passId = Constants.PASS_VOID_TRAIL },
	{ id = "CelestialAura",      label = "Celestial Aura",            cost = 0,   category = "Aura",    passId = Constants.PASS_CELESTIAL_AURA },
	{ id = "ShatterIntoGold",    label = "Shatter Into Gold",         cost = 0,   category = "DeathFX", passId = Constants.PASS_SHATTER_INTO_GOLD },
	{ id = "GlitchSkin",         label = "Glitch Skin",               cost = 0,   category = "Skin",    passId = Constants.PASS_GLITCH_SKIN },
}

local shopGui = Instance.new("ScreenGui")
shopGui.Name = "ShopGui"
shopGui.ResetOnSpawn = false
shopGui.Enabled = false
shopGui.Parent = playerGui

local mainFrame = Instance.new("Frame")
mainFrame.Name = "MainFrame"
mainFrame.AnchorPoint = Vector2.new(0.5, 0.5)
mainFrame.Position = UDim2.new(0.5, 0, 0.5, 0)
mainFrame.Size = UDim2.new(0, 420, 0, 520)
mainFrame.BackgroundColor3 = Color3.fromRGB(10, 10, 25)
mainFrame.BorderSizePixel = 0
mainFrame.Parent = shopGui

local titleLabel = Instance.new("TextLabel")
titleLabel.Name = "Title"
titleLabel.Position = UDim2.new(0, 0, 0, 0)
titleLabel.Size = UDim2.new(1, -40, 0, 48)
titleLabel.BackgroundTransparency = 1
titleLabel.Text = "✦ Dream Shop"
titleLabel.TextColor3 = Color3.fromRGB(255, 215, 0)
titleLabel.Font = Enum.Font.GothamBold
titleLabel.TextSize = 22
titleLabel.Parent = mainFrame

local closeButton = Instance.new("TextButton")
closeButton.Name = "CloseButton"
closeButton.Position = UDim2.new(1, -36, 0, 6)
closeButton.Size = UDim2.new(0, 32, 0, 32)
closeButton.BackgroundColor3 = Color3.fromRGB(60, 20, 20)
closeButton.BorderSizePixel = 0
closeButton.Text = "✕"
closeButton.TextColor3 = Color3.fromRGB(255, 255, 255)
closeButton.Font = Enum.Font.GothamBold
closeButton.TextSize = 18
closeButton.Parent = mainFrame

local scrollFrame = Instance.new("ScrollingFrame")
scrollFrame.Name = "ItemScroll"
scrollFrame.Position = UDim2.new(0, 8, 0, 56)
scrollFrame.Size = UDim2.new(1, -16, 1, -64)
scrollFrame.BackgroundTransparency = 1
scrollFrame.BorderSizePixel = 0
scrollFrame.ScrollBarThickness = 6
scrollFrame.CanvasSize = UDim2.new(0, 0, 0, 0)
scrollFrame.AutomaticCanvasSize = Enum.AutomaticSize.Y
scrollFrame.Parent = mainFrame

local listLayout = Instance.new("UIListLayout")
listLayout.Padding = UDim.new(0, 6)
listLayout.SortOrder = Enum.SortOrder.LayoutOrder
listLayout.Parent = scrollFrame

local function buildItems()
	for _, child in ipairs(scrollFrame:GetChildren()) do
		if child:IsA("Frame") or child:IsA("TextButton") then
			child:Destroy()
		end
	end

	local owned: { string } = GetOwnedFn:InvokeServer()
	local ownedSet: { [string]: boolean } = {}
	for _, id in ipairs(owned) do
		ownedSet[id] = true
	end

	for i, item in ipairs(CATALOG) do
		local row = Instance.new("Frame")
		row.Name = "Item_" .. item.id
		row.Size = UDim2.new(1, 0, 0, 48)
		row.BackgroundColor3 = Color3.fromRGB(20, 20, 40)
		row.BorderSizePixel = 0
		row.LayoutOrder = i
		row.Parent = scrollFrame

		local itemLabel = Instance.new("TextLabel")
		itemLabel.Position = UDim2.new(0, 8, 0, 0)
		itemLabel.Size = UDim2.new(1, -120, 1, 0)
		itemLabel.BackgroundTransparency = 1
		itemLabel.Text = "[" .. item.category .. "] " .. item.label
		itemLabel.TextColor3 = Color3.fromRGB(220, 220, 255)
		itemLabel.Font = Enum.Font.Gotham
		itemLabel.TextSize = 13
		itemLabel.TextXAlignment = Enum.TextXAlignment.Left
		itemLabel.Parent = row

		local actionBtn = Instance.new("TextButton")
		actionBtn.Name = "ActionBtn"
		actionBtn.AnchorPoint = Vector2.new(1, 0.5)
		actionBtn.Position = UDim2.new(1, -8, 0.5, 0)
		actionBtn.Size = UDim2.new(0, 104, 0, 32)
		actionBtn.BorderSizePixel = 0
		actionBtn.Font = Enum.Font.GothamBold
		actionBtn.TextSize = 13
		actionBtn.Parent = row

		local errorLabel = Instance.new("TextLabel")
		errorLabel.Name = "ErrorLabel"
		errorLabel.Position = UDim2.new(0, 0, 1, 0)
		errorLabel.Size = UDim2.new(1, 0, 0, 18)
		errorLabel.BackgroundTransparency = 1
		errorLabel.Text = ""
		errorLabel.TextColor3 = Color3.fromRGB(255, 80, 80)
		errorLabel.Font = Enum.Font.Gotham
		errorLabel.TextSize = 11
		errorLabel.Parent = row

		local isPassItem = item.passId ~= nil and item.passId ~= 0

		if ownedSet[item.id] then
			actionBtn.Text = "Equip"
			actionBtn.BackgroundColor3 = Color3.fromRGB(30, 140, 60)
			actionBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
			actionBtn.MouseButton1Click:Connect(function()
				EquipFn:InvokeServer(item.id)
			end)
		elseif isPassItem then
			actionBtn.Text = "Buy (R$)"
			actionBtn.BackgroundColor3 = Color3.fromRGB(30, 80, 180)
			actionBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
			actionBtn.MouseButton1Click:Connect(function()
				PromptPassEvent:FireServer(item.passId)
			end)
		else
			actionBtn.Text = "Buy ✦" .. item.cost
			actionBtn.BackgroundColor3 = Color3.fromRGB(90, 30, 160)
			actionBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
			actionBtn.MouseButton1Click:Connect(function()
				local success: boolean = PurchaseFn:InvokeServer(item.id)
				if success then
					actionBtn.Text = "Equip"
					actionBtn.BackgroundColor3 = Color3.fromRGB(30, 140, 60)
				else
					errorLabel.Text = "Not enough shards!"
					task.delay(2, function()
						errorLabel.Text = ""
					end)
				end
			end)
		end
	end
end

closeButton.MouseButton1Click:Connect(function()
	shopGui.Enabled = false
end)

local shopButtonGui = Instance.new("ScreenGui")
shopButtonGui.Name = "ShopButtonGui"
shopButtonGui.ResetOnSpawn = false
shopButtonGui.Parent = playerGui

local openBtn = Instance.new("TextButton")
openBtn.Name = "OpenShopBtn"
openBtn.AnchorPoint = Vector2.new(0, 1)
openBtn.Position = UDim2.new(0, 10, 1, -10)
openBtn.Size = UDim2.new(0, 120, 0, 40)
openBtn.BackgroundColor3 = Color3.fromRGB(60, 30, 120)
openBtn.BorderSizePixel = 0
openBtn.Text = "✦ Shop"
openBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
openBtn.Font = Enum.Font.GothamBold
openBtn.TextSize = 16
openBtn.Parent = shopButtonGui

openBtn.MouseButton1Click:Connect(function()
	buildItems()
	shopGui.Enabled = true
end)
