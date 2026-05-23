--!strict
type Platform = { pos: Vector3, size: Vector3, material: Enum.Material }
type Hazard   = { type: string, speed: number? }
type Chunk    = {
    platforms:  { Platform },
    hazards:    { Hazard },
    mutations:  { string },
    difficulty: number,
    length:     number,
}

local ChunkHard: { Chunk } = {
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(7,  4, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(14, 0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(21, 4, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
        },
        hazards    = { { type = "rotating", speed = 3 }, { type = "rising", speed = 3 } },
        mutations  = { "rotating", "rising", "shrinking", "colorshift" },
        difficulty = 3,
        length     = 24,
    },
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(6,  0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(12, 0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(18, 0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(24, 0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "teleporting", "shrinking", "colorshift" },
        difficulty = 3,
        length     = 27,
    },
    {
        platforms = {
            { pos = Vector3.new(0,  0,  0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(5,  3,  5), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(10, 6,  0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(15, 9, -5), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(20, 12, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
        },
        hazards    = { { type = "rotating", speed = 3 } },
        mutations  = { "rotating", "colorshift" },
        difficulty = 3,
        length     = 23,
    },
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(16, 0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(32, 0, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "rising", "colorshift" },
        difficulty = 3,
        length     = 35,
    },
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
            { pos = Vector3.new(9,  0, 0), size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
            { pos = Vector3.new(18, 0, 0), size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
        },
        hazards    = { { type = "rotating", speed = 3 }, { type = "rising", speed = 3 } },
        mutations  = { "rotating", "rising", "shrinking", "teleporting", "colorshift" },
        difficulty = 3,
        length     = 22,
    },
    {
        platforms = {
            { pos = Vector3.new(0, 0, 0), size = Vector3.new(20, 1, 2), material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "shrinking", "rotating", "colorshift" },
        difficulty = 3,
        length     = 20,
    },
    {
        platforms = {
            { pos = Vector3.new(0,  0,  3), size = Vector3.new(2, 1, 2), material = Enum.Material.Neon },
            { pos = Vector3.new(5,  4, -3), size = Vector3.new(2, 1, 2), material = Enum.Material.Neon },
            { pos = Vector3.new(10, 0,  3), size = Vector3.new(2, 1, 2), material = Enum.Material.Neon },
            { pos = Vector3.new(15, 4, -3), size = Vector3.new(2, 1, 2), material = Enum.Material.Neon },
            { pos = Vector3.new(20, 0,  0), size = Vector3.new(2, 1, 2), material = Enum.Material.Neon },
        },
        hazards    = { { type = "rising", speed = 4 } },
        mutations  = { "rising", "teleporting", "colorshift" },
        difficulty = 3,
        length     = 22,
    },
    {
        platforms = {
            { pos = Vector3.new(0,  0,  0), size = Vector3.new(3, 1, 8), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(10, 0,  0), size = Vector3.new(3, 1, 8), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(20, 0,  0), size = Vector3.new(3, 1, 8), material = Enum.Material.SmoothPlastic },
        },
        hazards    = { { type = "rotating", speed = 5 } },
        mutations  = { "rotating", "colorshift" },
        difficulty = 3,
        length     = 23,
    },
    {
        platforms = {
            { pos = Vector3.new(0,  0,  0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(6,  3,  0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(12, 6,  0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(18, 9,  0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
            { pos = Vector3.new(24, 12, 0), size = Vector3.new(3, 1, 3), material = Enum.Material.Neon },
        },
        hazards    = {},
        mutations  = { "teleporting", "shrinking", "colorshift" },
        difficulty = 3,
        length     = 27,
    },
    {
        platforms = {
            { pos = Vector3.new(0,  0,  0), size = Vector3.new(6, 1, 6), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(8,  0,  0), size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
            { pos = Vector3.new(15, 0,  0), size = Vector3.new(6, 1, 6), material = Enum.Material.SmoothPlastic },
        },
        hazards    = { { type = "rotating", speed = 4 }, { type = "rising", speed = 4 } },
        mutations  = { "rotating", "rising", "shrinking", "teleporting", "colorshift" },
        difficulty = 3,
        length     = 21,
    },
}

return ChunkHard
