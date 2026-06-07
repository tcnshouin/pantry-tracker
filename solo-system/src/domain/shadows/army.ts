import { balanceConfig } from '../balanceConfig'
import { rollChance } from '../combat/rng'
import { enemyLibrary, type EnemyDef } from '../../data/enemyLibrary'
import type { Shadow } from './types'

export function shadowPowerFromEnemy(e: EnemyDef): number {
  return Math.round((e.attack + e.hp / 10 + e.defense) * balanceConfig.shadows.powerPerSourceFactor)
}

export function ariseFromEnemy(enemyId: string, seed: number): Shadow {
  const e = enemyLibrary.find(x => x.id === enemyId)
  if (!e) throw new Error(`unknown enemy ${enemyId}`)
  return { id: `shadow-${seed}`, sourceEnemyId: e.id, name: `Shadow of ${e.name}`, power: shadowPowerFromEnemy(e) }
}

export function rollArise(chance: number, state: number): { raised: boolean; state: number } {
  const r = rollChance(state, chance)
  return { raised: r.hit, state: r.state }
}

export function deployCap(level: number): number {
  return balanceConfig.shadows.baseDeployCap + Math.floor(level / balanceConfig.shadows.deployCapPerLevels)
}

export function deployedShadowPower(shadows: Shadow[], deployedIds: string[]): number {
  return shadows.filter(s => deployedIds.includes(s.id)).reduce((a, s) => a + s.power, 0)
}
