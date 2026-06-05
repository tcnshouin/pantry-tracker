import { db, SAVE_KEY } from './db'
import { loadState, freshSaveState, SCHEMA_VERSION } from './repository'

beforeEach(async () => { await db.saves.clear() })

test('a v1 save (no gates) is migrated to v2 with empty clearedGateIds', async () => {
  const v1: any = freshSaveState(4)
  delete v1.gates
  v1.schemaVersion = 1
  await db.saves.put({ key: SAVE_KEY, state: v1 })
  const loaded = await loadState()
  expect(loaded?.schemaVersion).toBe(SCHEMA_VERSION)
  expect(loaded?.gates).toEqual({ clearedGateIds: [] })
})

test('a current v2 save loads unchanged', async () => {
  const v2 = freshSaveState(4)
  v2.gates.clearedGateIds.push('gate-e1')
  await db.saves.put({ key: SAVE_KEY, state: v2 })
  const loaded = await loadState()
  expect(loaded?.gates.clearedGateIds).toEqual(['gate-e1'])
})
