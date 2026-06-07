import { applyPlayerAction } from './engine'
import type { Combatant, CombatState } from './types'

function mk(over: Partial<Combatant>): Combatant {
  return {
    id: 'x', name: 'X', isPlayer: false, hp: 100, maxHP: 100, mp: 30, maxMP: 30,
    attack: 0, defense: 0, speed: 5, skillPowerMult: 1, critChance: 0, critMultiplier: 1.75,
    dodgeChance: 0, buffs: [], defending: false, ...over,
  }
}
function state(over: Partial<CombatState>): CombatState {
  return {
    gateId: 'g', goldReward: 0,
    player: mk({ id: 'p', name: 'Hunter', isPlayer: true, attack: 0, speed: 10 }),
    enemies: [mk({ id: 'e1', name: 'Goblin', hp: 999 })],
    currentEnemyIndex: 0, round: 1, phase: 'player', log: [], rngState: 1, nextLogId: 1, ...over,
  }
}

test('shadow strike damages the current enemy each round', () => {
  const s = applyPlayerAction(state({ shadowPower: 15 }), { type: 'defend' })
  expect(s.enemies[0].hp).toBe(999 - 15)
})

test('shadow strike can finish an enemy and advance to the next', () => {
  const s = applyPlayerAction(
    state({ shadowPower: 50, enemies: [mk({ id: 'e1', hp: 5 }), mk({ id: 'boss', hp: 80 })] }),
    { type: 'defend' },
  )
  expect(s.phase).toBe('player')
  expect(s.currentEnemyIndex).toBe(1)
})

test('shadow strike can finish the boss and win', () => {
  const s = applyPlayerAction(state({ shadowPower: 50, enemies: [mk({ id: 'boss', hp: 5 })] }), { type: 'defend' })
  expect(s.phase).toBe('won')
})

test('zero / undefined shadow power adds no extra damage', () => {
  const none = applyPlayerAction(state({ player: mk({ id: 'p', isPlayer: true, attack: 10, speed: 10 }) }), { type: 'attack' })
  expect(none.enemies[0].hp).toBe(999 - 10)
})
