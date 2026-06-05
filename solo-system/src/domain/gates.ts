import { balanceConfig } from './balanceConfig'
import { deriveCombatStats } from './combat/derive'
import type { Combatant, CombatState } from './combat/types'
import type { Player } from './types'
import { enemyLibrary } from '../data/enemyLibrary'
import type { GateDef } from '../data/gateLibrary'

export function gateUnlocked(gate: GateDef, clearedGateIds: string[]): boolean {
  return gate.unlockedBy === null || clearedGateIds.includes(gate.unlockedBy)
}

export function canEnterGate(gate: GateDef, player: Player, clearedGateIds: string[]): boolean {
  return gateUnlocked(gate, clearedGateIds) && player.gateKeys >= gate.keyCost
}

function playerCombatant(player: Player): Combatant {
  const d = deriveCombatStats(player)
  return {
    id: 'player', name: 'Hunter', isPlayer: true,
    hp: d.maxHP, maxHP: d.maxHP, mp: d.maxMP, maxMP: d.maxMP,
    attack: d.attack, defense: d.defense, speed: d.speed, skillPowerMult: d.skillPowerMult,
    critChance: d.critChance, critMultiplier: d.critMultiplier, dodgeChance: d.dodgeChance,
    buffs: [], defending: false,
  }
}

function enemyCombatant(id: string): Combatant {
  const e = enemyLibrary.find(x => x.id === id)
  if (!e) throw new Error(`unknown enemy ${id}`)
  return {
    id: e.id, name: e.name, isPlayer: false,
    hp: e.hp, maxHP: e.hp, mp: 0, maxMP: 0,
    attack: e.attack, defense: e.defense, speed: e.speed, skillPowerMult: 1,
    critChance: e.critChance, critMultiplier: balanceConfig.combat.critMultiplier, dodgeChance: e.dodgeChance,
    buffs: [], defending: false,
  }
}

export function buildCombatState(gate: GateDef, player: Player, seed: number): CombatState {
  return {
    gateId: gate.id,
    goldReward: gate.goldReward,
    player: playerCombatant(player),
    enemies: gate.enemyIds.map(enemyCombatant),
    currentEnemyIndex: 0,
    round: 1,
    phase: 'player',
    log: [{ id: 0, text: `You enter ${gate.name}` }],
    rngState: (seed & 0x7fffffff) || 1,
    nextLogId: 1,
  }
}
