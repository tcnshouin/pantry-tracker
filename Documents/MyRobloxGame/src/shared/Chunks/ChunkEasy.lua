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

local ChunkEasy: { Chunk } = {
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0),  size = Vector3.new(6, 1, 6),  material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(8,  0, 0),  size = Vector3.new(6, 1, 6),  material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(16, 0, 0),  size = Vector3.new(6, 1, 6),  material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "colorshift" },
        difficulty = 1,
        length     = 22,
    },
    {
        platforms = {
            { pos = Vector3.new(0,  0,  0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(7,  2,  0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(14, 4,  0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(21, 6,  0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
        },
        hazards    = {},
        mutations  = { "colorshift" },
        difficulty = 1,
        length     = 26,
    },
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(10, 1, 8), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(14, 0, 0), size = Vector3.new(6,  1, 6), material = Enum.Material.SmoothPlastic },
        },
        hazards    = { { type = "rising", speed = 1 } },
        mutations  = { "rising", "colorshift" },
        difficulty = 1,
        length     = 20,
    },
    {
        platforms = {
            { pos = Vector3.new(0,  0,  3),  size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(7,  0, -3),  size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(14, 0,  3),  size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(21, 0, -3),  size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
        },
        hazards    = {},
        mutations  = { "colorshift" },
        difficulty = 1,
        length     = 26,
    },
    {
        platforms = {
            { pos = Vector3.new(0, 0, 0), size = Vector3.new(20, 1, 10), material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "colorshift" },
        difficulty = 1,
        length     = 20,
    },
    {
        platforms = {
            { pos = Vector3.new(0,  6, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(7,  4, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(14, 2, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(21, 0, 0), size = Vector3.new(5, 1, 5), material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "colorshift" },
        difficulty = 1,
        length     = 26,
    },
    {
        platforms = {
            { pos = Vector3.new(0,  0, 0), size = Vector3.new(6, 1, 6), material = Enum.Material.Neon },
            { pos = Vector3.new(9,  0, 0), size = Vector3.new(4, 1, 4), material = Enum.Material.Neon },
            { pos = Vector3.new(17, 0, 0), size = Vector3.new(6, 1, 6), material = Enum.Material.Neon },
        },
        hazards    = { { type = "rotating", speed = 0.5 } },
        mutations  = { "rotating", "colorshift" },
        difficulty = 1,
        length     = 23,
    },
    {
        platforms = {
            { pos = Vector3.new(0,  0,  2), size = Vector3.new(14, 1, 2), material = Enum.Material.SmoothPlastic },
            { pos = Vector3.new(0,  0, -2), size = Vector3.new(14, 1, 2), material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "colorshift" },
        difficulty = 1,
        length     = 14,
    },
    {
        platforms = {
            { pos = Vector3.new(0,  0,  0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(9,  2,  0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
            { pos = Vector3.new(18, 0,  0), size = Vector3.new(5, 1, 5), material = Enum.Material.Neon },
        },
        hazards    = {},
        mutations  = { "rising", "colorshift" },
        difficulty = 1,
        length     = 23,
    },
    {
        platforms = {
            { pos = Vector3.new(0, 0, 0), size = Vector3.new(30, 1, 4), material = Enum.Material.SmoothPlastic },
        },
        hazards    = {},
        mutations  = { "colorshift" },
        difficulty = 1,
        length     = 30,
    },
}

return ChunkEasy
