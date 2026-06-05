export interface EnemyDef {
  id: string
  name: string
  hp: number
  attack: number
  defense: number
  speed: number
  critChance: number
  dodgeChance: number
}

export const enemyLibrary: EnemyDef[] = [
  { id: 'goblin', name: 'Goblin', hp: 45, attack: 8, defense: 1, speed: 4, critChance: 0.02, dodgeChance: 0.02 },
  { id: 'imp', name: 'Imp', hp: 35, attack: 10, defense: 0, speed: 8, critChance: 0.05, dodgeChance: 0.05 },
  { id: 'wolf', name: 'Shadow Wolf', hp: 60, attack: 11, defense: 2, speed: 7, critChance: 0.05, dodgeChance: 0.03 },
  { id: 'orc', name: 'Orc Grunt', hp: 90, attack: 14, defense: 4, speed: 3, critChance: 0.03, dodgeChance: 0.0 },
  { id: 'gate_e_boss', name: 'Gatekeeper', hp: 140, attack: 16, defense: 5, speed: 5, critChance: 0.05, dodgeChance: 0.02 },
  { id: 'gate_d_boss', name: 'Stone Golem', hp: 240, attack: 22, defense: 8, speed: 4, critChance: 0.05, dodgeChance: 0.0 },
]
