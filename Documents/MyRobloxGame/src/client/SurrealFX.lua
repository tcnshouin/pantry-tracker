--!strict
local TweenService      = game:GetService("TweenService")
local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Lighting          = game:GetService("Lighting")

local Constants       = require(ReplicatedStorage:WaitForChild("Constants"))
local ChunkSpawnedEvt = ReplicatedStorage:WaitForChild(Constants.REMOTE_CHUNK_SPAWNED) :: RemoteEvent

local SURREAL_COLORS: { Color3 } = {
	Color3.fromRGB(180,  60, 255),
	Color3.fromRGB( 60, 220, 255),
	Color3.fromRGB(255,  60, 180),
	Color3.fromRGB( 60, 255, 120),
	Color3.fromRGB(255, 200,  40),
}

local glitchEffect: ColorCorrectionEffect? = nil

local SurrealFX = {}

local function startColorCycle(part: BasePart)
	task.spawn(function()
		while part.Parent do
			local color = SURREAL_COLORS[math.random(1, #SURREAL_COLORS)]
			local tween = TweenService:Create(
				part,
				TweenInfo.new(0.6, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut),
				{ Color = color }
			)
			tween:Play()
			tween.Completed:Wait()
		end
	end)
end

local function startStretch(part: BasePart)
	local origSize = part.Size
	local tween = TweenService:Create(
		part,
		TweenInfo.new(0.8, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true),
		{ Size = Vector3.new(origSize.X * 1.3, origSize.Y, origSize.Z * 1.3) }
	)
	tween:Play()
end

local function applyOrbPulse(part: Instance)
	if not part:IsA("BasePart") then return end
	local basePart = part :: BasePart
	local light = basePart:FindFirstChildOfClass("PointLight")
	if light then
		local tween = TweenService:Create(
			light,
			TweenInfo.new(0.5, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true),
			{ Brightness = 12 }
		)
		tween:Play()
	end
	startColorCycle(basePart)
end

function SurrealFX.applyGlitchSkin(active: boolean)
	if active then
		if glitchEffect then
			glitchEffect:Destroy()
			glitchEffect = nil
		end

		local effect = Instance.new("ColorCorrectionEffect")
		effect.Saturation = -0.4
		effect.TintColor = Color3.fromRGB(180, 60, 255)
		effect.Parent = Lighting
		glitchEffect = effect

		task.spawn(function()
			while glitchEffect == effect and effect.Parent do
				local tweenA = TweenService:Create(
					effect,
					TweenInfo.new(0.4, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut),
					{ Saturation = -0.4, TintColor = Color3.fromRGB(180, 60, 255) }
				)
				tweenA:Play()
				tweenA.Completed:Wait()
				if glitchEffect ~= effect or not effect.Parent then break end

				local tweenB = TweenService:Create(
					effect,
					TweenInfo.new(0.4, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut),
					{ Saturation = 0.4, TintColor = Color3.fromRGB(60, 220, 255) }
				)
				tweenB:Play()
				tweenB.Completed:Wait()
			end
		end)
	else
		if glitchEffect then
			glitchEffect:Destroy()
			glitchEffect = nil
		end
	end
end

ChunkSpawnedEvt.OnClientEvent:Connect(function(chunkModel: Model, mutations: { string })
	for _, desc in chunkModel:GetDescendants() do
		if desc:IsA("BasePart") then
			for _, mutation in mutations do
				if mutation == "colorshift" then
					startColorCycle(desc)
					startStretch(desc)
					break
				end
			end
		end
	end
end)

CollectionService:GetInstanceAddedSignal(Constants.TAG_POWERUP_ORB):Connect(applyOrbPulse)

for _, orb in CollectionService:GetTagged(Constants.TAG_POWERUP_ORB) do
	applyOrbPulse(orb)
end

return SurrealFX
