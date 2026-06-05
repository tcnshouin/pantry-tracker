export interface GateDef {
  id: string
  name: string
  rankTier: string
  keyCost: number
  goldReward: number
  enemyIds: string[]
  unlockedBy: string | null
}

export const gateLibrary: GateDef[] = [
  { id: 'gate-e1', name: 'E-Rank Gate: Awakening', rankTier: 'E', keyCost: 1, goldReward: 40, enemyIds: ['goblin', 'imp', 'gate_e_boss'], unlockedBy: null },
  { id: 'gate-e2', name: 'E-Rank Gate: Den', rankTier: 'E', keyCost: 1, goldReward: 60, enemyIds: ['wolf', 'goblin', 'orc', 'gate_e_boss'], unlockedBy: 'gate-e1' },
  { id: 'gate-d1', name: 'D-Rank Gate: Quarry', rankTier: 'D', keyCost: 2, goldReward: 110, enemyIds: ['orc', 'wolf', 'orc', 'gate_d_boss'], unlockedBy: 'gate-e2' },
]
