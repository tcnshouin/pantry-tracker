import { balanceConfig } from '../balanceConfig'
import type { Player } from '../types'
import type { DerivedCombatStats } from './types'

export function deriveCombatStats(player: Player): DerivedCombatStats {
  const c = balanceConfig.combat
  const s = player.stats
  return {
    maxHP: c.baseHP + s.VIT.subLevel * c.hpPerVit,
    maxMP: c.baseMP + s.INT.subLevel * c.mpPerInt,
    attack: c.baseAttack + s.STR.subLevel * c.attackPerStr,
    defense: c.basePlayerDefense + s.VIT.subLevel * c.defensePerVit,
    speed: s.AGI.subLevel,
    skillPowerMult: 1 + s.INT.subLevel * c.skillPowerPerInt,
    critChance: Math.min(c.critCap, s.PER.subLevel * c.critPerPer),
    critMultiplier: c.critMultiplier,
    dodgeChance: Math.min(c.dodgeCap, s.PER.subLevel * c.dodgePerPer),
  }
}
