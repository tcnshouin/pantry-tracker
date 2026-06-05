export type StatType = 'STR' | 'VIT' | 'AGI' | 'INT' | 'PER'
export const STAT_TYPES: StatType[] = ['STR', 'VIT', 'AGI', 'INT', 'PER']

export type ClassRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'NATIONAL' | 'MONARCH'

export interface Stat { type: StatType; subLevel: number; statXP: number }

export interface Player {
  level: number
  currentEXP: number
  freeStatPoints: number
  classRank: ClassRank
  currency: number
  gateKeys: number
  stats: Record<StatType, Stat>
}

export interface QuestTemplate {
  id: string
  title: string
  description: string
  stat: StatType
  baseEXP: number
  baseStatXP: number
  durationMinutes: number
}

export interface QuestInstance {
  instanceId: string
  templateId: string
  title: string
  description: string
  stat: StatType
  baseEXP: number
  baseStatXP: number
  issuedAt: number
  deadline: number
  completed: boolean
  completedAt: number | null
  isRedemption: boolean
}

export interface StreakRecord { templateId: string; count: number; lastCompletedDay: string | null }

export interface PenaltyZone { active: boolean; debuffMultiplier: number; enteredAt: number | null }

export interface SaveState {
  schemaVersion: number
  player: Player
  dayKey: string | null
  quests: QuestInstance[]
  streaks: Record<string, StreakRecord>
  penalty: PenaltyZone
  settings: { resetHour: number }
  history: { day: string; completed: number; issued: number }[]
  gates: { clearedGateIds: string[] }
}
