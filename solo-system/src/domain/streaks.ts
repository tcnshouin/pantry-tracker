import { balanceConfig } from './balanceConfig'
import type { StreakRecord } from './types'

function prevDay(dayKey: string): string {
  const d = new Date(dayKey + 'T12:00:00')
  d.setDate(d.getDate() - 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function bumpStreak(rec: StreakRecord | undefined, templateId: string, today: string): StreakRecord {
  if (!rec) return { templateId, count: 1, lastCompletedDay: today }
  if (rec.lastCompletedDay === today) return rec
  const consecutive = rec.lastCompletedDay === prevDay(today)
  return { templateId, count: consecutive ? rec.count + 1 : 1, lastCompletedDay: today }
}

export function resetStreak(rec: StreakRecord): StreakRecord {
  return { ...rec, count: 0 }
}

export function streakMultiplier(count: number): number {
  const m = 1 + count * balanceConfig.streakMultiplierStep
  return Math.min(m, balanceConfig.streakMultiplierMax)
}
