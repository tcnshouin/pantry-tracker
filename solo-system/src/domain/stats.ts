import { balanceConfig } from './balanceConfig'
import type { Stat } from './types'

export function applyStatXP(stat: Stat, amount: number): Stat {
  let subLevel = stat.subLevel
  let statXP = stat.statXP + Math.max(0, Math.round(amount))
  while (statXP >= balanceConfig.statXPPerSubLevel) {
    statXP -= balanceConfig.statXPPerSubLevel
    subLevel += 1
  }
  return { ...stat, subLevel, statXP }
}
