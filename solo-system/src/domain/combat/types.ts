import type { Item } from '../items/types'

export interface DerivedCombatStats {
  maxHP: number
  maxMP: number
  attack: number
  defense: number
  speed: number
  skillPowerMult: number
  critChance: number
  critMultiplier: number
  dodgeChance: number
}

export type BuffKind = 'critUp' | 'attackDown' | 'defenseDown'

export interface Buff { kind: BuffKind; amount: number; turnsLeft: number }

export interface Combatant {
  id: string
  name: string
  isPlayer: boolean
  hp: number
  maxHP: number
  mp: number
  maxMP: number
  attack: number
  defense: number
  speed: number
  skillPowerMult: number
  critChance: number
  critMultiplier: number
  dodgeChance: number
  buffs: Buff[]
  defending: boolean
}

export type CombatPhase = 'player' | 'won' | 'lost'

export interface CombatLogEntry { id: number; text: string }

export interface CombatState {
  gateId: string
  goldReward: number
  player: Combatant
  enemies: Combatant[]
  currentEnemyIndex: number
  round: number
  phase: CombatPhase
  log: CombatLogEntry[]
  rngState: number
  nextLogId: number
  droppedItems?: Item[]
}

export type PlayerAction =
  | { type: 'attack' }
  | { type: 'defend' }
  | { type: 'skill'; skillId: string }
