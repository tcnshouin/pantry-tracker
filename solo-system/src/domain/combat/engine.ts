import { balanceConfig } from '../balanceConfig'
import { nextRandom } from './rng'
import type { Buff, Combatant, CombatState, PlayerAction } from './types'
import { getSkill } from './skills'

function critBonus(c: Combatant): number {
  return c.buffs.filter(b => b.kind === 'critUp').reduce((a, b) => a + b.amount, 0)
}
function effAttack(c: Combatant): number {
  const down = c.buffs.filter(b => b.kind === 'attackDown').reduce((a, b) => a + b.amount, 0)
  return c.attack * (1 - down)
}
function effDefense(c: Combatant): number {
  const down = c.buffs.filter(b => b.kind === 'defenseDown').reduce((a, b) => a + b.amount, 0)
  return c.defense * (1 - down)
}

interface AttackResult { hp: number; rngState: number; text: string }

function resolveAttack(attacker: Combatant, defender: Combatant, rngState: number, mult: number): AttackResult {
  let rng = rngState
  const dodgeRoll = nextRandom(rng); rng = dodgeRoll.state
  if (dodgeRoll.value < defender.dodgeChance) {
    return { hp: defender.hp, rngState: rng, text: `${defender.name} dodged ${attacker.name}'s attack` }
  }
  let dmg = Math.max(1, effAttack(attacker) * mult - effDefense(defender))
  if (defender.defending) dmg *= 1 - balanceConfig.combat.defendDamageReduction
  const critRoll = nextRandom(rng); rng = critRoll.state
  const crit = critRoll.value < attacker.critChance + critBonus(attacker)
  if (crit) dmg *= attacker.critMultiplier
  const final = Math.round(dmg)
  return { hp: Math.max(0, defender.hp - final), rngState: rng, text: `${attacker.name} hit ${defender.name} for ${final}${crit ? ' (CRIT)' : ''}` }
}

function decay(buffs: Buff[]): Buff[] {
  return buffs.map(b => ({ ...b, turnsLeft: b.turnsLeft - 1 })).filter(b => b.turnsLeft > 0)
}

function log(state: CombatState, text: string): CombatState {
  return { ...state, log: [...state.log, { id: state.nextLogId, text }], nextLogId: state.nextLogId + 1 }
}

export function applyPlayerAction(state: CombatState, action: PlayerAction): CombatState {
  if (state.phase !== 'player') return state
  let s: CombatState = state
  let player = { ...s.player, defending: action.type === 'defend' }
  let enemy = { ...s.enemies[s.currentEnemyIndex] }
  let rng = s.rngState
  const logs: string[] = []

  const doPlayer = () => {
    if (player.hp <= 0) return
    if (action.type === 'attack') {
      const r = resolveAttack(player, enemy, rng, 1); rng = r.rngState; enemy = { ...enemy, hp: r.hp }; logs.push(r.text)
    } else if (action.type === 'defend') {
      const restore = Math.round(player.maxMP * balanceConfig.combat.defendMpRestoreFraction)
      player = { ...player, mp: Math.min(player.maxMP, player.mp + restore) }
      logs.push(`${player.name} defends`)
    } else if (action.type === 'skill') {
      const skill = getSkill(action.skillId)
      if (!skill) { logs.push('Unknown skill'); return }
      if (player.mp < skill.mpCost) { logs.push('Not enough MP'); return }
      player = { ...player, mp: player.mp - skill.mpCost }
      if (skill.kind === 'damage') {
        const r = resolveAttack({ ...player, attack: player.attack * player.skillPowerMult }, enemy, rng, skill.attackMult ?? 1); rng = r.rngState; enemy = { ...enemy, hp: r.hp }; logs.push(`${player.name} used ${skill.name}: ${r.text}`)
      } else if (skill.kind === 'heal') {
        const heal = Math.round((skill.baseHeal ?? 0) * player.skillPowerMult)
        player = { ...player, hp: Math.min(player.maxHP, player.hp + heal) }
        logs.push(`${player.name} used ${skill.name} and healed ${heal}`)
      } else if (skill.kind === 'buffCrit') {
        player = { ...player, buffs: [...player.buffs, { kind: 'critUp', amount: skill.critBonus ?? 0, turnsLeft: (skill.turns ?? 1) + 1 }] }
        logs.push(`${player.name} used ${skill.name}`)
      } else if (skill.kind === 'debuff') {
        enemy = { ...enemy, buffs: [...enemy.buffs, { kind: 'attackDown', amount: skill.attackDown ?? 0, turnsLeft: (skill.turns ?? 1) + 1 }, { kind: 'defenseDown', amount: skill.defenseDown ?? 0, turnsLeft: (skill.turns ?? 1) + 1 }] }
        logs.push(`${player.name} used ${skill.name} on ${enemy.name}`)
      }
    }
  }

  const doEnemy = () => {
    if (enemy.hp <= 0) return
    const heavy = s.round % balanceConfig.combat.enemyHeavyMoveEveryNRounds === 0
    const mult = heavy ? balanceConfig.combat.enemyHeavyMoveMultiplier : 1
    const r = resolveAttack(enemy, player, rng, mult); rng = r.rngState; player = { ...player, hp: r.hp }
    logs.push(heavy ? `${enemy.name} unleashes a heavy strike! ${r.text}` : r.text)
  }

  if (player.speed >= enemy.speed) { doPlayer(); doEnemy() } else { doEnemy(); doPlayer() }

  player = { ...player, buffs: decay(player.buffs), defending: false }
  enemy = { ...enemy, buffs: decay(enemy.buffs) }

  const enemies = s.enemies.map((e, i) => (i === s.currentEnemyIndex ? enemy : e))
  s = { ...s, player, enemies, rngState: rng, round: s.round + 1 }
  for (const t of logs) s = log(s, t)

  const shadowPower = s.shadowPower ?? 0
  const current = s.enemies[s.currentEnemyIndex]
  if (shadowPower > 0 && current.hp > 0) {
    const dmg = Math.max(1, shadowPower)
    s = { ...s, enemies: s.enemies.map((e, i) => i === s.currentEnemyIndex ? { ...e, hp: Math.max(0, e.hp - dmg) } : e) }
    s = log(s, `Your shadows strike ${current.name} for ${dmg}`)
  }

  if (s.player.hp <= 0) return { ...s, phase: 'lost' }
  const finalEnemy = s.enemies[s.currentEnemyIndex]
  if (finalEnemy.hp <= 0) {
    if (s.currentEnemyIndex >= s.enemies.length - 1) return { ...s, phase: 'won' }
    s = { ...s, currentEnemyIndex: s.currentEnemyIndex + 1 }
    return log(s, `${s.enemies[s.currentEnemyIndex].name} appears`)
  }
  return s
}
