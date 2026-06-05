import { STAT_TYPES, type Player, type SaveState } from '../domain/types'
import { db, SAVE_KEY } from './db'

export const SCHEMA_VERSION = 2

export function freshPlayer(): Player {
  const stats = Object.fromEntries(STAT_TYPES.map(t => [t, { type: t, subLevel: 0, statXP: 0 }])) as Player['stats']
  return { level: 1, currentEXP: 0, freeStatPoints: 0, classRank: 'E', currency: 0, gateKeys: 0, stats }
}

export function freshSaveState(resetHour: number): SaveState {
  return {
    schemaVersion: SCHEMA_VERSION,
    player: freshPlayer(),
    dayKey: null,
    quests: [],
    streaks: {},
    penalty: { active: false, debuffMultiplier: 1, enteredAt: null },
    settings: { resetHour },
    history: [],
    gates: { clearedGateIds: [] },
  }
}

function migrate(raw: SaveState): SaveState {
  let s = raw
  if (s.schemaVersion < 2) {
    s = { ...s, gates: s.gates ?? { clearedGateIds: [] }, schemaVersion: 2 }
  }
  return s
}

export async function loadState(): Promise<SaveState | null> {
  const row = await db.saves.get(SAVE_KEY)
  return row ? migrate(row.state) : null
}

export async function saveState(state: SaveState): Promise<void> {
  await db.saves.put({ key: SAVE_KEY, state })
}
