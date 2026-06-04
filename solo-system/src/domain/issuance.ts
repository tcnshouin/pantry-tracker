import type { QuestInstance, QuestTemplate } from './types'

export function needsNewDay(storedDayKey: string | null, currentDayKey: string): boolean {
  return storedDayKey !== currentDayKey
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed || 1
  const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export interface IssueInput {
  library: QuestTemplate[]
  count: number
  now: number
  durationOverrideMs: number | null
  seed: number
}

export function issueDailyQuests(input: IssueInput): QuestInstance[] {
  const { library, count, now, durationOverrideMs, seed } = input
  const chosen = seededShuffle(library, seed).slice(0, count)
  return chosen.map((t, i) => ({
    instanceId: `${now}-${i}-${t.id}`,
    templateId: t.id,
    title: t.title,
    description: t.description,
    stat: t.stat,
    baseEXP: t.baseEXP,
    baseStatXP: t.baseStatXP,
    issuedAt: now,
    deadline: now + (durationOverrideMs ?? t.durationMinutes * 60_000),
    completed: false,
    completedAt: null,
    isRedemption: false,
  }))
}
