import { STAT_TYPES, type Player, type SaveState } from '../domain/types'
import { db, SAVE_KEY } from './db'

export const SCHEMA_VERSION = 3

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
    inventory: [],
    equipment: { weapon: null, armor: null, accessory: null },
  }
}

function migrate(raw: SaveState): SaveState {
  let s = raw
  if (s.schemaVersion < 2) {
    s = { ...s, gates: s.gates ?? { clearedGateIds: [] }, schemaVersion: 2 }
  }
  if (s.schemaVersion < 3) {
    s = {
      ...s,
      inventory: (s as any).inventory ?? [],
      equipment: (s as any).equipment ?? { weapon: null, armor: null, accessory: null },
      schemaVersion: 3,
    }
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
