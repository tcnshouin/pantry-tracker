import { beforeEach, expect, test } from 'vitest'
import { createSystemStore } from './useSystemStore'
import { db } from '../persistence/db'

beforeEach(async () => {
  await db.saves.clear()
})

const clock = (ms: number) => ({ now: () => ms })

test('hydrate on a fresh DB issues a daily quest set', async () => {
  const store = createSystemStore({ clock: clock(new Date('2026-06-04T08:00:00').getTime()) })
  await store.getState().hydrate()
  expect(store.getState().save.quests.length).toBeGreaterThan(0)
  expect(store.getState().save.player.level).toBe(1)
})

test('completing a quest raises EXP and persists', async () => {
  const store = createSystemStore({ clock: clock(new Date('2026-06-04T08:00:00').getTime()) })
  await store.getState().hydrate()
  const first = store.getState().save.quests[0]
  await store.getState().completeQuest(first.instanceId)
  const done = store.getState().save.quests.find(q => q.instanceId === first.instanceId)
  expect(done?.completed).toBe(true)
  expect(store.getState().save.player.currentEXP).toBeGreaterThan(0)
})

test('a passed deadline with an incomplete quest enters the penalty zone on checkPenalty', async () => {
  const t0 = new Date('2026-06-04T08:00:00').getTime()
  const store = createSystemStore({ clock: clock(t0) })
  await store.getState().hydrate()
  store.getState().__setClock(clock(t0 + 1000 * 60 * 60 * 48))
  store.getState().checkPenalty()
  expect(store.getState().save.penalty.active).toBe(true)
})

test('entering the penalty zone appends exactly one redemption quest', async () => {
  const t0 = new Date('2026-06-04T08:00:00').getTime()
  const store = createSystemStore({ clock: clock(t0) })
  await store.getState().hydrate()
  store.getState().__setClock(clock(t0 + 1000 * 60 * 60 * 48))
  store.getState().checkPenalty()
  const redemptions = store.getState().save.quests.filter(q => q.isRedemption)
  expect(redemptions).toHaveLength(1)
  expect(redemptions[0].completed).toBe(false)
  store.getState().checkPenalty()
  expect(store.getState().save.quests.filter(q => q.isRedemption)).toHaveLength(1)
})

test('allocateStatPoint spends a free point and raises the stat sub-level', async () => {
  const store = createSystemStore({ clock: clock(Date.now()) })
  await store.getState().hydrate()
  store.setState(s => ({ save: { ...s.save, player: { ...s.save.player, freeStatPoints: 3 } } }))
  store.getState().allocateStatPoint('STR')
  expect(store.getState().save.player.freeStatPoints).toBe(2)
  expect(store.getState().save.player.stats.STR.subLevel).toBe(1)
})

test('completing an already-completed quest is a no-op', async () => {
  const store = createSystemStore({ clock: clock(new Date('2026-06-04T08:00:00').getTime()) })
  await store.getState().hydrate()
  const first = store.getState().save.quests[0]
  await store.getState().completeQuest(first.instanceId)
  const expAfterFirst = store.getState().save.player.currentEXP
  await store.getState().completeQuest(first.instanceId)
  expect(store.getState().save.player.currentEXP).toBe(expAfterFirst)
})

test('completing the redemption quest clears the penalty zone', async () => {
  const t0 = new Date('2026-06-04T08:00:00').getTime()
  const store = createSystemStore({ clock: clock(t0) })
  await store.getState().hydrate()
  store.getState().__setClock(clock(t0 + 1000 * 60 * 60 * 48))
  store.getState().checkPenalty()
  expect(store.getState().save.penalty.active).toBe(true)
  const redemption = store.getState().save.quests.find(q => q.isRedemption)!
  await store.getState().completeQuest(redemption.instanceId)
  expect(store.getState().save.penalty.active).toBe(false)
})

test('a fresh player with no streak or penalty gains exactly baseEXP', async () => {
  const store = createSystemStore({ clock: clock(new Date('2026-06-04T08:00:00').getTime()) })
  await store.getState().hydrate()
  const first = store.getState().save.quests[0]
  await store.getState().completeQuest(first.instanceId)
  const done = store.getState().save.quests.find(q => q.instanceId === first.instanceId)!
  expect(store.getState().save.player.currentEXP).toBe(done.baseEXP)
})
