import { db, SAVE_KEY } from './db'
import { loadState, freshSaveState, SCHEMA_VERSION } from './repository'

beforeEach(async () => { await db.saves.clear() })

test('a v4 save gains rituals and backfills quest source', async () => {
  const v4: any = freshSaveState(4)
  delete v4.rituals
  v4.schemaVersion = 4
  v4.quests = [
    { instanceId: 'a', templateId: 't', title: 'X', description: '', stat: 'STR', baseEXP: 10, baseStatXP: 5, issuedAt: 0, deadline: 9, completed: false, completedAt: null, isRedemption: false },
    { instanceId: 'b', templateId: 'r', title: 'R', description: '', stat: 'VIT', baseEXP: 10, baseStatXP: 5, issuedAt: 0, deadline: 9, completed: false, completedAt: null, isRedemption: true },
  ]
  await db.saves.put({ key: SAVE_KEY, state: v4 })
  const loaded = await loadState()
  expect(loaded?.schemaVersion).toBe(SCHEMA_VERSION)
  expect(loaded?.rituals).toEqual([])
  expect(loaded?.quests[0].source).toBe('library')
  expect(loaded?.quests[1].source).toBe('redemption')
})

test('a v1 save composes all migrations to v5', async () => {
  const v1: any = freshSaveState(4)
  delete v1.gates; delete v1.inventory; delete v1.equipment; delete v1.shadows; delete v1.deployedShadowIds; delete v1.rituals
  v1.schemaVersion = 1
  await db.saves.put({ key: SAVE_KEY, state: v1 })
  const loaded = await loadState()
  expect(loaded?.schemaVersion).toBe(5)
  expect(loaded?.rituals).toEqual([])
  expect(loaded?.shadows).toEqual([])
})
