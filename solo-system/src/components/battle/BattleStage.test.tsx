import { render, screen } from '@testing-library/react'
import { BattleStage } from './BattleStage'
import type { Combatant, CombatState } from '../../domain/combat/types'
import type { Shadow } from '../../domain/shadows/types'

function mk(over: Partial<Combatant>): Combatant {
  return { id: 'x', name: 'X', isPlayer: false, hp: 50, maxHP: 50, mp: 0, maxMP: 0, attack: 0, defense: 0, speed: 0, skillPowerMult: 1, critChance: 0, critMultiplier: 1.75, dodgeChance: 0, buffs: [], defending: false, ...over }
}
const combat: CombatState = {
  gateId: 'gate-e1', goldReward: 0,
  player: mk({ id: 'p', name: 'Hunter', isPlayer: true }),
  enemies: [mk({ id: 'goblin', name: 'Goblin' }), mk({ id: 'imp', name: 'Imp' }), mk({ id: 'gate_e_boss', name: 'Gatekeeper' })],
  currentEnemyIndex: 0, round: 1, phase: 'player', log: [], rngState: 1, nextLogId: 1,
}

test('renders the current enemy name and the hunter', () => {
  render(<BattleStage combat={combat} weaponBaseId={null} shadows={[]} deployedIds={[]} batch={{ id: 0, events: [] }} />)
  expect(screen.getByText('Goblin')).toBeInTheDocument()
  expect(screen.getByText('Hunter')).toBeInTheDocument()
})
test('shows queued wave behind the current enemy', () => {
  const { container } = render(<BattleStage combat={combat} weaponBaseId={null} shadows={[]} deployedIds={[]} batch={{ id: 0, events: [] }} />)
  expect(container.querySelectorAll('[data-queued-enemy]').length).toBe(2)
})
test('renders a +N overflow badge past the display cap', () => {
  const shadows: Shadow[] = Array.from({ length: 12 }, (_, i) => ({ id: `s${i}`, sourceEnemyId: 'goblin', name: 'G', power: 5 }))
  render(<BattleStage combat={combat} weaponBaseId={null} shadows={shadows} deployedIds={shadows.map(s => s.id)} batch={{ id: 0, events: [] }} />)
  expect(screen.getByText(/\+\d+/)).toBeInTheDocument()
})
