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

test('deployShadow respects the cap; undeploy frees a slot', async () => {
  const store = await ready()
  const shadows = Array.from({ length: 6 }, (_, i) => ({ id: `s${i}`, sourceEnemyId: 'goblin', name: 'G', power: 5 }))
  store.setState(s => ({ save: { ...s.save, shadows } }))
  for (const sh of shadows) store.getState().deployShadow(sh.id)
  expect(store.getState().save.deployedShadowIds.length).toBe(3)
  store.getState().undeployShadow('s0')
  expect(store.getState().save.deployedShadowIds.length).toBe(2)
  store.getState().deployShadow('s5')
  expect(store.getState().save.deployedShadowIds.length).toBe(3)
})

test('winning a gate can raise shadows and never changes level/EXP/statXP', async () => {
  const store = await ready()
  const before = store.getState().save.player
  store.getState().enterGate('gate-e1')
  let guard = 0
  while (store.getState().combat?.phase === 'player' && guard++ < 500) store.getState().combatAction({ type: 'attack' })
  const after = store.getState().save
  expect(after.player.level).toBe(before.level)
  expect(after.player.currentEXP).toBe(before.currentEXP)
  expect(after.player.stats.STR.statXP).toBe(before.stats.STR.statXP)
  expect(after.player.stats.STR.subLevel).toBe(before.stats.STR.subLevel)
})

test('deployed shadows deal damage in the next gate (combat log shows a shadow strike)', async () => {
  const store = await ready()
  store.setState(s => ({ save: { ...s.save, shadows: [{ id: 'x', sourceEnemyId: 'gate_e_boss', name: 'Boss Shadow', power: 30 }], deployedShadowIds: ['x'] } }))
  store.getState().enterGate('gate-e1')
  store.getState().combatAction({ type: 'defend' })
  const log = store.getState().combat?.log.map(l => l.text).join(' ') ?? ''
  expect(log).toMatch(/shadows strike/i)
})

test('fleeing raises no shadows', async () => {
  const store = await ready()
  const n = store.getState().save.shadows.length
  store.getState().enterGate('gate-e1')
  store.getState().fleeGate()
  expect(store.getState().save.shadows.length).toBe(n)
})

test('losing a gate raises no shadows', async () => {
  const store = await ready()
  store.setState(s => ({ save: { ...s.save, player: { ...s.save.player, gateKeys: 5, stats: Object.fromEntries(Object.entries(s.save.player.stats).map(([k, v]) => [k, { ...v, subLevel: 0 }])) as typeof s.save.player.stats } } }))
  const n = store.getState().save.shadows.length
  store.getState().enterGate('gate-e1')
  let guard = 0
  while (store.getState().combat?.phase === 'player' && guard++ < 1000) store.getState().combatAction({ type: 'attack' })
  if (store.getState().combat?.phase === 'lost') {
    expect(store.getState().save.shadows.length).toBe(n)
  }
})

test('deployShadow ignores an unknown shadow id', async () => {
  const store = await ready()
  store.getState().deployShadow('does-not-exist')
  expect(store.getState().save.deployedShadowIds).toEqual([])
})
