import { balanceConfig } from './balanceConfig'
import { STAT_TYPES, type ClassRank, type Player } from './types'

export function expToNext(level: number): number {
  return Math.round(balanceConfig.baseExpConstant * Math.pow(level, balanceConfig.expCurveExponent))
}

function rankForLevel(level: number): ClassRank {
  const t = balanceConfig.classRankThresholds
  const order: ClassRank[] = ['MONARCH', 'NATIONAL', 'S', 'A', 'B', 'C', 'D', 'E']
  return order.find(r => level >= t[r]) ?? 'E'
}

export function addExp(player: Player, amount: number): Player {
  let { level, currentEXP, freeStatPoints } = player
  const stats = { ...player.stats }
  currentEXP += Math.max(0, Math.round(amount))

  while (currentEXP >= expToNext(level)) {
    currentEXP -= expToNext(level)
    level += 1
    freeStatPoints += balanceConfig.freeStatPointsPerLevel
    for (const t of STAT_TYPES) {
      stats[t] = { ...stats[t], subLevel: stats[t].subLevel + 1 }
    }
  }

  return { ...player, level, currentEXP, freeStatPoints, stats, classRank: rankForLevel(level) }
}
