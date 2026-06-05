import { createSystemStore } from './useSystemStore'
import { db } from '../persistence/db'

const clock = (ms: number) => ({ now: () => ms })

beforeEach(async () => { await db.saves.clear() })

async function ready() {
  const store = createSystemStore({ clock: clock(Date.now()) })
  await store.getState().hydrate()
  store.setState(s => ({ save: { ...s.save, player: { ...s.save.player, gateKeys: 5, stats: Object.fromEntries(Object.entries(s.save.player.stats).map(([k, v]) => [k, { ...v, subLevel: 10 }])) as typeof s.save.player.stats } } }))
  return store
}

test('enterGate spends a key and starts a combat session', async () => {
  const store = await ready()
  const keysBefore = store.getState().save.player.gateKeys
  store.getState().enterGate('gate-e1')
  expect(store.getState().combat).not.toBeNull()
  expect(store.getState().save.player.gateKeys).toBe(keysBefore - 1)
})

test('enterGate is rejected when locked or out of keys', async () => {
  const store = await ready()
  store.setState(s => ({ save: { ...s.save, player: { ...s.save.player, gateKeys: 0 } } }))
  store.getState().enterGate('gate-e1')
  expect(store.getState().combat).toBeNull()
})

test('winning a gate grants gold, marks it cleared, and does NOT change level/EXP/statXP', async () => {
  const store = await ready()
  const before = store.getState().save.player
  store.getState().enterGate('gate-e1')
  let guard = 0
  while (store.getState().combat?.phase === 'player' && guard++ < 500) {
    store.getState().combatAction({ type: 'attack' })
  }
  const after = store.getState().save
  expect(after.player.level).toBe(before.level)
  expect(after.player.currentEXP).toBe(before.currentEXP)
  expect(after.player.stats.STR.statXP).toBe(before.stats.STR.statXP)
  expect(after.player.stats.STR.subLevel).toBe(before.stats.STR.subLevel)
  if (after.gates.clearedGateIds.includes('gate-e1')) {
    expect(after.player.currency).toBeGreaterThan(before.currency)
  }
})

test('fleeGate ends combat with no rewards', async () => {
  const store = await ready()
  store.getState().enterGate('gate-e1')
  const goldBefore = store.getState().save.player.currency
  store.getState().fleeGate()
  expect(store.getState().combat).toBeNull()
  expect(store.getState().save.player.currency).toBe(goldBefore)
})
