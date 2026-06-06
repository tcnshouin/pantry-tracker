import { createSystemStore } from './useSystemStore'
import { db } from '../persistence/db'

const clock = (ms: number) => ({ now: () => ms })
beforeEach(async () => { await db.saves.clear() })

async function ready() {
  const store = createSystemStore({ clock: clock(Date.now()) })
  await store.getState().hydrate()
  store.setState(s => ({ save: { ...s.save, player: { ...s.save.player, gateKeys: 5, currency: 1000, stats: Object.fromEntries(Object.entries(s.save.player.stats).map(([k, v]) => [k, { ...v, subLevel: 10 }])) as typeof s.save.player.stats } } }))
  return store
}

test('winning a gate drops at least one item into inventory and does not change level/EXP/statXP', async () => {
  const store = await ready()
  const before = store.getState().save.player
  store.getState().enterGate('gate-e1')
  let guard = 0
  while (store.getState().combat?.phase === 'player' && guard++ < 500) store.getState().combatAction({ type: 'attack' })
  const after = store.getState().save
  if (store.getState().combat?.phase === 'won') {
    expect(after.inventory.length).toBeGreaterThanOrEqual(1)
    expect(store.getState().combat?.droppedItems?.length).toBeGreaterThanOrEqual(1)
  }
  expect(after.player.level).toBe(before.level)
  expect(after.player.currentEXP).toBe(before.currentEXP)
  expect(after.player.stats.STR.statXP).toBe(before.stats.STR.statXP)
  expect(after.player.stats.STR.subLevel).toBe(before.stats.STR.subLevel)
})

test('equip moves an item from inventory to its slot; unequip returns it', async () => {
  const store = await ready()
  const it = { id: 'w1', baseId: 'b', name: 'W', slot: 'weapon' as const, rarity: 'common' as const, enhanceLevel: 0, bonuses: [{ kind: 'attack' as const, value: 5 }] }
  store.setState(s => ({ save: { ...s.save, inventory: [it] } }))
  store.getState().equipItem('w1')
  expect(store.getState().save.equipment.weapon?.id).toBe('w1')
  expect(store.getState().save.inventory).toHaveLength(0)
  store.getState().unequipItem('weapon')
  expect(store.getState().save.equipment.weapon).toBeNull()
  expect(store.getState().save.inventory).toHaveLength(1)
})

test('equipping a second item of the same slot returns the previous one to inventory', async () => {
  const store = await ready()
  const a = { id: 'a', baseId: 'b', name: 'A', slot: 'weapon' as const, rarity: 'common' as const, enhanceLevel: 0, bonuses: [] }
  const b = { id: 'b2', baseId: 'b', name: 'B', slot: 'weapon' as const, rarity: 'common' as const, enhanceLevel: 0, bonuses: [] }
  store.setState(s => ({ save: { ...s.save, inventory: [a, b] } }))
  store.getState().equipItem('a')
  store.getState().equipItem('b2')
  expect(store.getState().save.equipment.weapon?.id).toBe('b2')
  expect(store.getState().save.inventory.map(i => i.id)).toContain('a')
})

test('enhanceItem spends gold and upgrades; insufficient gold is a no-op', async () => {
  const store = await ready()
  const it = { id: 'w1', baseId: 'b', name: 'W', slot: 'weapon' as const, rarity: 'common' as const, enhanceLevel: 0, bonuses: [{ kind: 'attack' as const, value: 10 }] }
  store.setState(s => ({ save: { ...s.save, inventory: [it], player: { ...s.save.player, currency: 1000 } } }))
  store.getState().enhanceItem('w1')
  expect(store.getState().save.inventory[0].enhanceLevel).toBe(1)
  expect(store.getState().save.player.currency).toBeLessThan(1000)
  store.setState(s => ({ save: { ...s.save, player: { ...s.save.player, currency: 0 } } }))
  const lvl = store.getState().save.inventory[0].enhanceLevel
  store.getState().enhanceItem('w1')
  expect(store.getState().save.inventory[0].enhanceLevel).toBe(lvl)
})

test('equipped reward gear multiplies real quest EXP', async () => {
  const store = await ready()
  const charm = { id: 'c', baseId: 'b', name: 'Charm', slot: 'accessory' as const, rarity: 'rare' as const, enhanceLevel: 0, bonuses: [{ kind: 'expMult' as const, value: 1 }] }
  store.setState(s => ({ save: { ...s.save, equipment: { weapon: null, armor: null, accessory: charm } } }))
  const q = store.getState().save.quests[0]
  const expBefore = store.getState().save.player.currentEXP
  await store.getState().completeQuest(q.instanceId)
  const gained = store.getState().save.player.currentEXP - expBefore
  expect(gained).toBeGreaterThan(q.baseEXP)
})
