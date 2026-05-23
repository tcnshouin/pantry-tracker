--!strict
local Players           = game:GetService("Players")
local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace         = game:GetService("Workspace")

local Constants       = require(ReplicatedStorage:WaitForChild("Constants"))
local ApplyPowerEvent = ReplicatedStorage:WaitForChild(Constants.REMOTE_APPLY_POWERUP) :: RemoteEvent

local POWERUP_TYPES = { "Blaze", "TitanJump", "Ghost", "TimeFreeze", "Feather", "Shrink" }

local activePowerups: { [Player]: boolean } = {}

local PowerupManager = {}

function PowerupManager.spawnOrbOnPart(part: BasePart)
	local orb      = Instance.new("Part")
	orb.Shape      = Enum.PartType.Ball
	orb.Size       = Vector3.new(2, 2, 2)
	orb.Position   = part.Position + Vector3.new(0, 3, 0)
	orb.Anchored   = true
	orb.CanCollide = false
	orb.Material   = Enum.Material.Neon
	orb.Color      = Color3.fromRGB(255, 220, 50)
	orb.Name       = "PowerupOrb"

	local light      = Instance.new("PointLight")
	light.Brightness = 5
	light.Range      = 12
	light.Color      = Color3.fromRGB(255, 220, 50)
	light.Parent     = orb

	CollectionService:AddTag(orb, Constants.TAG_POWERUP_ORB)

	local powerupType = POWERUP_TYPES[math.random(1, #POWERUP_TYPES)]
	orb:SetAttribute("PowerupType", powerupType)
	orb.Parent = Workspace

	orb.Touched:Connect(function(hit)
		local char = hit.Parent
		if not char then return end
		local player = Players:GetPlayerFromCharacter(char)
		if not player then return end
		if activePowerups[player] then return end

		activePowerups[player] = true
		orb:Destroy()
		ApplyPowerEvent:FireClient(player, powerupType)

		task.delay(Constants.POWERUP_DURATION + 2, function()
			activePowerups[player] = nil
		end)
	end)
end

function PowerupManager.onChunkSpawned(chunkModel: Model)
	local parts: { BasePart } = {}
	for _, v in ipairs(chunkModel:GetDescendants()) do
		if v:IsA("BasePart") then
			table.insert(parts, v)
		end
	end
	if #parts == 0 then return end
	if math.random() > 0.6 then return end
	local target = parts[math.random(1, #parts)]
	PowerupManager.spawnOrbOnPart(target)
end

function PowerupManager.start()
	Players.PlayerRemoving:Connect(function(player)
		activePowerups[player] = nil
	end)
end

return PowerupManager
