import { db, SAVE_KEY } from './db'
import { loadState, freshSaveState, SCHEMA_VERSION } from './repository'

beforeEach(async () => { await db.saves.clear() })

test('a v3 save gains shadows + deployedShadowIds and becomes v4', async () => {
  const v3: any = freshSaveState(4)
  delete v3.shadows
  delete v3.deployedShadowIds
  v3.schemaVersion = 3
  await db.saves.put({ key: SAVE_KEY, state: v3 })
  const loaded = await loadState()
  expect(loaded?.schemaVersion).toBe(SCHEMA_VERSION)
  expect(loaded?.shadows).toEqual([])
  expect(loaded?.deployedShadowIds).toEqual([])
})

test('a v1 save composes all migrations to v5', async () => {
  const v1: any = freshSaveState(4)
  delete v1.gates; delete v1.inventory; delete v1.equipment; delete v1.shadows; delete v1.deployedShadowIds
  v1.schemaVersion = 1
  await db.saves.put({ key: SAVE_KEY, state: v1 })
  const loaded = await loadState()
  expect(loaded?.schemaVersion).toBe(5)
  expect(loaded?.gates).toEqual({ clearedGateIds: [] })
  expect(loaded?.inventory).toEqual([])
  expect(loaded?.shadows).toEqual([])
  expect(loaded?.deployedShadowIds).toEqual([])
})
