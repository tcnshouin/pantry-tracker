import { createSystemStore } from './useSystemStore'
import { db } from '../persistence/db'

const clock = (ms: number) => ({ now: () => ms })
beforeEach(async () => { await db.saves.clear() })

async function ready(ms = Date.now()) {
  const store = createSystemStore({ clock: clock(ms) })
  await store.getState().hydrate()
  return store
}

test('addRitual stores it and issues an instance for today', async () => {
  const store = await ready()
  store.getState().addRitual({ title: 'Meditate', description: 'sit', stat: 'PER', difficulty: 'easy', durationMinutes: 600 })
  expect(store.getState().save.rituals).toHaveLength(1)
  const inst = store.getState().save.quests.filter(q => q.source === 'ritual')
  expect(inst).toHaveLength(1)
  expect(inst[0].title).toBe('Meditate')
})

test('addRitual rejects blank title and caps at maxRituals', async () => {
  const store = await ready()
  store.getState().addRitual({ title: '  ', description: '', stat: 'STR', difficulty: 'easy', durationMinutes: 60 })
  expect(store.getState().save.rituals).toHaveLength(0)
  for (let i = 0; i < 20; i++) store.getState().addRitual({ title: 'R' + i, description: '', stat: 'STR', difficulty: 'easy', durationMinutes: 60 })
  expect(store.getState().save.rituals.length).toBeLessThanOrEqual(12)
})

test('deleteRitual removes the template', async () => {
  const store = await ready()
  store.getState().addRitual({ title: 'Read', description: '', stat: 'INT', difficulty: 'medium', durationMinutes: 600 })
  const id = store.getState().save.rituals[0].id
  store.getState().deleteRitual(id)
  expect(store.getState().save.rituals).toHaveLength(0)
  expect(store.getState().save.quests.some(q => q.templateId === id)).toBe(true)
})

test('updateRitual edits the template', async () => {
  const store = await ready()
  store.getState().addRitual({ title: 'Run', description: '', stat: 'VIT', difficulty: 'easy', durationMinutes: 600 })
  const id = store.getState().save.rituals[0].id
  store.getState().updateRitual(id, { difficulty: 'hard', title: 'Long Run' })
  expect(store.getState().save.rituals[0].difficulty).toBe('hard')
  expect(store.getState().save.rituals[0].title).toBe('Long Run')
})

test('a rolled-over day issues all rituals plus library quests', async () => {
  const day1 = new Date('2026-06-09T08:00:00').getTime()
  const store = await ready(day1)
  store.getState().addRitual({ title: 'Daily Pushups', description: '', stat: 'STR', difficulty: 'medium', durationMinutes: 600 })
  store.getState().__setClock(clock(new Date('2026-06-10T08:00:00').getTime()))
  await store.getState().hydrate()
  const ritualCount = store.getState().save.quests.filter(q => q.source === 'ritual').length
  const libraryCount = store.getState().save.quests.filter(q => q.source === 'library').length
  expect(ritualCount).toBe(1)
  expect(libraryCount).toBeGreaterThan(0)
})

test('calling hydrate twice on the same day does not duplicate ritual quests', async () => {
  const store = await ready()
  store.getState().addRitual({ title: 'Stretch', description: '', stat: 'AGI', difficulty: 'easy', durationMinutes: 600 })
  const before = store.getState().save.quests.filter(q => q.source === 'ritual').length
  await store.getState().hydrate()
  const after = store.getState().save.quests.filter(q => q.source === 'ritual').length
  expect(after).toBe(before)
})

test('a missed ritual enters the penalty zone', async () => {
  const t0 = new Date('2026-06-09T08:00:00').getTime()
  const store = await ready(t0)
  store.getState().addRitual({ title: 'Sleep early', description: '', stat: 'VIT', difficulty: 'easy', durationMinutes: 60 })
  store.getState().__setClock(clock(t0 + 1000 * 60 * 60 * 3))
  store.getState().checkPenalty()
  expect(store.getState().save.penalty.active).toBe(true)
})
