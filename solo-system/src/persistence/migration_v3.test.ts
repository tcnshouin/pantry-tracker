import { db, SAVE_KEY } from './db'
import { loadState, freshSaveState, SCHEMA_VERSION } from './repository'

beforeEach(async () => { await db.saves.clear() })

test('a v2 save gains inventory + equipment and becomes v3', async () => {
  const v2: any = freshSaveState(4)
  delete v2.inventory
  delete v2.equipment
  v2.schemaVersion = 2
  await db.saves.put({ key: SAVE_KEY, state: v2 })
  const loaded = await loadState()
  expect(loaded?.schemaVersion).toBe(SCHEMA_VERSION)
  expect(loaded?.inventory).toEqual([])
  expect(loaded?.equipment).toEqual({ weapon: null, armor: null, accessory: null })
})

test('a v1 save composes both migrations to v3', async () => {
  const v1: any = freshSaveState(4)
  delete v1.gates
  delete v1.inventory
  delete v1.equipment
  v1.schemaVersion = 1
  await db.saves.put({ key: SAVE_KEY, state: v1 })
  const loaded = await loadState()
  expect(loaded?.schemaVersion).toBe(SCHEMA_VERSION)
  expect(loaded?.gates).toEqual({ clearedGateIds: [] })
  expect(loaded?.inventory).toEqual([])
  expect(loaded?.equipment).toEqual({ weapon: null, armor: null, accessory: null })
})
