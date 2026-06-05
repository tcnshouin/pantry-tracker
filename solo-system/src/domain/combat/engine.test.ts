import { applyPlayerAction } from './engine'
import type { Combatant, CombatState } from './types'

function mk(over: Partial<Combatant>): Combatant {
  return {
    id: 'x', name: 'X', isPlayer: false, hp: 100, maxHP: 100, mp: 30, maxMP: 30,
    attack: 20, defense: 0, speed: 5, skillPowerMult: 1, critChance: 0, critMultiplier: 1.75,
    dodgeChance: 0, buffs: [], defending: false, ...over,
  }
}

function state(over: Partial<CombatState>): CombatState {
  return {
    gateId: 'g', goldReward: 50,
    player: mk({ id: 'p', name: 'Hunter', isPlayer: true, attack: 20, speed: 10 }),
    enemies: [mk({ id: 'e1', name: 'Goblin', hp: 30, attack: 8 })],
    currentEnemyIndex: 0, round: 1, phase: 'player', log: [], rngState: 1, nextLogId: 1, ...over,
  }
}

test('attack deals attack-minus-defense damage to the current enemy', () => {
  const s = applyPlayerAction(state({}), { type: 'attack' })
  expect(s.enemies[0].hp).toBe(30 - 20)
})

test('faster player kills a weak enemy before it strikes back', () => {
  const s = applyPlayerAction(state({ enemies: [mk({ id: 'e1', hp: 10, attack: 8, speed: 1 })] }), { type: 'attack' })
  expect(s.player.hp).toBe(100)
})

test('defend halves incoming damage', () => {
  const s = applyPlayerAction(state({ player: mk({ id: 'p', isPlayer: true, attack: 20, speed: 1, hp: 100 }), enemies: [mk({ id: 'e1', hp: 999, attack: 20, speed: 10 })] }), { type: 'defend' })
  expect(s.player.hp).toBe(100 - 10)
})

test('defeating the only enemy (boss) wins', () => {
  const s = applyPlayerAction(state({ enemies: [mk({ id: 'boss', hp: 5, attack: 0 })] }), { type: 'attack' })
  expect(s.phase).toBe('won')
})

test('defeating a non-final enemy advances to the next with HP carried', () => {
  const s = applyPlayerAction(
    state({ enemies: [mk({ id: 'e1', hp: 5, attack: 0 }), mk({ id: 'boss', hp: 50, attack: 0 })] }),
    { type: 'attack' },
  )
  expect(s.phase).toBe('player')
  expect(s.currentEnemyIndex).toBe(1)
})

test('player dying loses', () => {
  const s = applyPlayerAction(
    state({ player: mk({ id: 'p', isPlayer: true, hp: 5, attack: 0, speed: 1 }), enemies: [mk({ id: 'e1', hp: 999, attack: 50, speed: 10 })] }),
    { type: 'attack' },
  )
  expect(s.phase).toBe('lost')
})

test('forced crit via crit chance multiplies damage', () => {
  const s = applyPlayerAction(state({ player: mk({ id: 'p', isPlayer: true, attack: 20, speed: 10, critChance: 1 }), enemies: [mk({ id: 'e1', hp: 999 })] }), { type: 'attack' })
  expect(s.enemies[0].hp).toBe(999 - Math.round(20 * 1.75))
})

test('enemy dodge can negate damage', () => {
  const s = applyPlayerAction(state({ enemies: [mk({ id: 'e1', hp: 30, dodgeChance: 1 })] }), { type: 'attack' })
  expect(s.enemies[0].hp).toBe(30)
})

test('Power Strike damage scales with skillPowerMult', () => {
  const base = applyPlayerAction(state({ player: mk({ id: 'p', isPlayer: true, attack: 20, speed: 10, skillPowerMult: 1, mp: 30 }), enemies: [mk({ id: 'e1', hp: 9999 })] }), { type: 'skill', skillId: 'powerStrike' })
  const boosted = applyPlayerAction(state({ player: mk({ id: 'p', isPlayer: true, attack: 20, speed: 10, skillPowerMult: 2, mp: 30 }), enemies: [mk({ id: 'e1', hp: 9999 })] }), { type: 'skill', skillId: 'powerStrike' })
  const baseDmg = 9999 - base.enemies[0].hp
  const boostedDmg = 9999 - boosted.enemies[0].hp
  expect(boostedDmg).toBeGreaterThan(baseDmg)
})
