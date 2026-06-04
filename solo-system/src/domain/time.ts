export interface Clock { now: () => number }
export const systemClock: Clock = { now: () => Date.now() }

export function dayKey(ms: number, resetHour: number): string {
  const d = new Date(ms - resetHour * 3600_000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
