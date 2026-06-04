import { db } from './db'
import { loadState, saveState, freshSaveState } from './repository'

beforeEach(async () => { await db.saves.clear() })

test('loadState returns null when nothing is stored', async () => {
  expect(await loadState()).toBeNull()
})

test('saveState then loadState round-trips', async () => {
  const s = freshSaveState(4)
  s.player.level = 7
  await saveState(s)
  const loaded = await loadState()
  expect(loaded?.player.level).toBe(7)
  expect(loaded?.settings.resetHour).toBe(4)
})
