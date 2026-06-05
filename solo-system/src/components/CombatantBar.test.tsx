import { render, screen } from '@testing-library/react'
import { CombatantBar } from './CombatantBar'

test('shows name and HP numbers', () => {
  render(<CombatantBar name="Hunter" hp={30} maxHP={120} mp={10} maxMP={20} isPlayer />)
  expect(screen.getByText('Hunter')).toBeInTheDocument()
  expect(screen.getByText(/30\s*\/\s*120/)).toBeInTheDocument()
})

test('enemy bar omits MP', () => {
  render(<CombatantBar name="Goblin" hp={10} maxHP={45} mp={0} maxMP={0} isPlayer={false} />)
  expect(screen.queryByText(/MP/i)).toBeNull()
})
