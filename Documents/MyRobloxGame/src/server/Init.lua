--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Remotes = require(ReplicatedStorage:WaitForChild("Remotes"))
Remotes.init()

local MapGenerator = require(script.Parent.MapGenerator)
MapGenerator.start()

local EconomyManager = require(script.Parent.EconomyManager)
EconomyManager.start()
