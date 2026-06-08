import { balanceConfig } from './balanceConfig'
import type { QuestInstance, RitualTemplate } from './types'

export function issueRitualQuests(rituals: RitualTemplate[], now: number, durationOverrideMs: number | null = null): QuestInstance[] {
  return rituals.map((r, i) => {
    const reward = balanceConfig.rituals.difficulties[r.difficulty]
    return {
      instanceId: `ritual-${now}-${i}-${r.id}`,
      templateId: r.id,
      title: r.title,
      description: r.description,
      stat: r.stat,
      baseEXP: reward.baseEXP,
      baseStatXP: reward.baseStatXP,
      issuedAt: now,
      deadline: now + (durationOverrideMs ?? r.durationMinutes * 60_000),
      completed: false,
      completedAt: null,
      isRedemption: false,
      source: 'ritual',
    }
  })
}
