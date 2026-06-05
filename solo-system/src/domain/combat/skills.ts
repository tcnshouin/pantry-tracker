import { balanceConfig } from '../balanceConfig'

export type SkillKind = 'damage' | 'heal' | 'buffCrit' | 'debuff'

export interface SkillDef {
  id: string
  name: string
  unlockLevel: number
  mpCost: number
  kind: SkillKind
  attackMult?: number
  baseHeal?: number
  healPerInt?: number
  critBonus?: number
  attackDown?: number
  defenseDown?: number
  turns?: number
}

const c = balanceConfig.combat.skills

const SKILLS: SkillDef[] = [
  { ...c.powerStrike, kind: 'damage' },
  { ...c.mend, kind: 'heal' },
  { ...c.focus, kind: 'buffCrit' },
  { ...c.weaken, kind: 'debuff' },
]

export function listSkills(): SkillDef[] {
  return SKILLS
}

export function getSkill(id: string): SkillDef | undefined {
  return SKILLS.find(s => s.id === id)
}

export function skillUnlocked(skill: SkillDef, playerLevel: number): boolean {
  return playerLevel >= skill.unlockLevel
}
