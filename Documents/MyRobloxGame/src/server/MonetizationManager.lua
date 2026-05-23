--!strict
local Players            = game:GetService("Players")
local MarketplaceService = game:GetService("MarketplaceService")
local ReplicatedStorage  = game:GetService("ReplicatedStorage")

local Constants      = require(ReplicatedStorage:WaitForChild("Constants"))
local EconomyManager = require(script.Parent.EconomyManager)

local ALL_PASSES: { number } = {
    Constants.PASS_DREAM_COLLECTOR,
    Constants.PASS_VIP_CHECKPOINT,
    Constants.PASS_POWERUP_PRO,
    Constants.PASS_CHAOS_WARD,
    Constants.PASS_VOID_TRAIL,
    Constants.PASS_CELESTIAL_AURA,
    Constants.PASS_SHATTER_INTO_GOLD,
    Constants.PASS_GLITCH_SKIN,
}

local PASS_TO_COSMETIC: { [number]: string } = {
    [Constants.PASS_VOID_TRAIL]        = "VoidTrail",
    [Constants.PASS_CELESTIAL_AURA]    = "CelestialAura",
    [Constants.PASS_SHATTER_INTO_GOLD] = "ShatterIntoGold",
    [Constants.PASS_GLITCH_SKIN]       = "GlitchSkin",
}

local passCache: { [Player]: { [number]: boolean } } = {}

local MonetizationManager = {}

function MonetizationManager.playerOwnsPass(player: Player, passId: number): boolean
    if passId == 0 then return false end
    local cache = passCache[player]
    return if cache then (cache[passId] == true) else false
end

local function cacheAndApplyPasses(player: Player)
    passCache[player] = {}
    for _, passId in ipairs(ALL_PASSES) do
        if passId == 0 then continue end
        local ok, owned = pcall(function()
            return MarketplaceService:UserOwnsGamePassAsync(player.UserId, passId)
        end)
        if ok and owned then
            passCache[player][passId] = true
            EconomyManager.setPassCache(player, passId, true)
            local cosmeticId = PASS_TO_COSMETIC[passId]
            if cosmeticId then
                EconomyManager.grantCosmetic(player, cosmeticId)
            end
        end
    end
end

local function onPassPurchased(player: Player, passId: number)
    if not passCache[player] then
        passCache[player] = {}
    end
    passCache[player][passId] = true
    EconomyManager.setPassCache(player, passId, true)
    local cosmeticId = PASS_TO_COSMETIC[passId]
    if cosmeticId then
        EconomyManager.grantCosmetic(player, cosmeticId)
    end
end

function MonetizationManager.start()
    Players.PlayerAdded:Connect(function(player)
        player.CharacterAdded:Wait()
        cacheAndApplyPasses(player)
    end)

    Players.PlayerRemoving:Connect(function(player)
        passCache[player] = nil
    end)

    MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, passId, purchased)
        if purchased then
            onPassPurchased(player, passId)
        end
    end)

    local PromptEvent = ReplicatedStorage:WaitForChild(Constants.REMOTE_PROMPT_PASS) :: RemoteEvent
    PromptEvent.OnServerEvent:Connect(function(player, passId: number)
        if passId == 0 then return end
        MarketplaceService:PromptGamePassPurchase(player, passId)
    end)
end

return MonetizationManager
