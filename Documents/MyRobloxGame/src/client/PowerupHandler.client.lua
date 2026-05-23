--!strict
local Players           = game:GetService("Players")
local TweenService      = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService  = game:GetService("UserInputService")

local Constants       = require(ReplicatedStorage:WaitForChild("Constants"))
local ApplyPowerEvent = ReplicatedStorage:WaitForChild(Constants.REMOTE_APPLY_POWERUP) :: RemoteEvent

local player = Players.LocalPlayer
local camera = workspace.CurrentCamera

local function hasPowerupPro(): boolean
	return player:GetAttribute("PowerupPro") == true
end

local function getDrawbackDuration(base: number): number
	if hasPowerupPro() then
		return math.ceil(base * (1 - Constants.POWERUP_PRO_REDUCTION))
	end
	return base
end

local function applyBlaze()
	local character = player.Character
	if not character then return end
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid then return end

	local origSpeed = humanoid.WalkSpeed
	humanoid.WalkSpeed = origSpeed * 2

	local conn: RBXScriptConnection
	conn = humanoid:GetPropertyChangedSignal("WalkSpeed"):Connect(function()
		if humanoid.WalkSpeed < origSpeed * 2 then
			humanoid.WalkSpeed = origSpeed * 2
		end
	end)

	task.wait(Constants.POWERUP_DURATION)
	conn:Disconnect()
	humanoid.WalkSpeed = origSpeed
end

local function applyTitanJump()
	local character = player.Character
	if not character then return end
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid then return end
	local root = character:FindFirstChild("HumanoidRootPart") :: BasePart
	if not root then return end

	local origJump = humanoid.JumpPower
	humanoid.JumpPower = origJump * 3

	local conn: RBXScriptConnection
	conn = humanoid.Jumping:Connect(function(isActive: boolean)
		if isActive then
			task.defer(function()
				root.Velocity = Vector3.new(
					math.random(-30, 30),
					root.Velocity.Y,
					math.random(-30, 30)
				)
			end)
		end
	end)

	task.wait(Constants.POWERUP_DURATION)
	conn:Disconnect()
	humanoid.JumpPower = origJump
end

local function applyGhost()
	local character = player.Character
	if not character then return end
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid then return end

	local gui = Instance.new("ScreenGui")
	gui.Name = "GhostEffect"
	gui.ResetOnSpawn = false
	gui.Parent = player.PlayerGui

	local frame = Instance.new("Frame")
	frame.Size = UDim2.fromScale(1, 1)
	frame.BackgroundColor3 = Color3.new(0, 0, 0)
	frame.BackgroundTransparency = 0.05
	frame.BorderSizePixel = 0
	frame.Parent = gui

	local parts: { BasePart } = {}
	for _, desc in character:GetDescendants() do
		if desc:IsA("BasePart") then
			parts[#parts + 1] = desc
			desc.CanCollide = false
		end
	end

	task.wait(0.5)

	for _, part in parts do
		if part.Parent then
			part.CanCollide = true
		end
	end

	task.wait(math.max(0, getDrawbackDuration(Constants.POWERUP_GHOST_DRAWBACK) - 0.5))
	gui:Destroy()
end

local function applyTimeFreeze()
	local character = player.Character
	if not character then return end
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid then return end

	local conn: RBXScriptConnection
	conn = UserInputService.InputChanged:Connect(function(_input: InputObject, _gameProcessed: boolean)
		local root = character:FindFirstChild("HumanoidRootPart") :: BasePart
		if root and humanoid.MoveDirection ~= Vector3.zero then
			humanoid:MoveTo(root.Position - humanoid.MoveDirection * 2)
		end
	end)

	task.wait(getDrawbackDuration(Constants.POWERUP_TIMEFREEZE_DURATION))
	conn:Disconnect()
end

local function applyFeather()
	local character = player.Character
	if not character then return end
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid then return end

	local origSpeed = humanoid.WalkSpeed
	humanoid.WalkSpeed = 8
	player:SetAttribute("FeatherActive", true)

	task.wait(Constants.POWERUP_DURATION)
	humanoid.WalkSpeed = origSpeed
	player:SetAttribute("FeatherActive", nil)
end

local function applyShrink()
	local character = player.Character
	if not character then return end
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid then return end

	local bodyDepth  = humanoid:FindFirstChild("BodyDepthScale")  :: NumberValue
	local bodyHeight = humanoid:FindFirstChild("BodyHeightScale") :: NumberValue
	local bodyWidth  = humanoid:FindFirstChild("BodyWidthScale")  :: NumberValue

	local origDepth  = bodyDepth  and bodyDepth.Value  or 1
	local origHeight = bodyHeight and bodyHeight.Value or 1
	local origWidth  = bodyWidth  and bodyWidth.Value  or 1

	if bodyDepth  then bodyDepth.Value  = 0.5 end
	if bodyHeight then bodyHeight.Value = 0.5 end
	if bodyWidth  then bodyWidth.Value  = 0.5 end

	local origFov = camera.FieldOfView
	local tweenIn = TweenService:Create(
		camera,
		TweenInfo.new(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
		{ FieldOfView = 15 }
	)
	tweenIn:Play()

	task.wait(getDrawbackDuration(Constants.POWERUP_DURATION))

	if bodyDepth  then bodyDepth.Value  = origDepth  end
	if bodyHeight then bodyHeight.Value = origHeight end
	if bodyWidth  then bodyWidth.Value  = origWidth  end

	local tweenOut = TweenService:Create(
		camera,
		TweenInfo.new(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
		{ FieldOfView = origFov }
	)
	tweenOut:Play()
end

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
	if handler then task.spawn(handler) end
end)
