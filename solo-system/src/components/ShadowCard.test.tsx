import { render, screen } from '@testing-library/react'
import { ShadowCard } from './ShadowCard'
import type { Shadow } from '../domain/shadows/types'

const shadow: Shadow = { id: 's', sourceEnemyId: 'gate_e_boss', name: 'Shadow of Gatekeeper', power: 18 }

test('shows the shadow name and power', () => {
  render(<ShadowCard shadow={shadow} deployed={false} />)
  expect(screen.getByText(/Shadow of Gatekeeper/)).toBeInTheDocument()
  expect(screen.getByText(/18/)).toBeInTheDocument()
})

test('shows a deployed badge when deployed', () => {
  render(<ShadowCard shadow={shadow} deployed />)
  expect(screen.getByText(/DEPLOYED/i)).toBeInTheDocument()
})

test('renders a disabled button when disabled', () => {
  const onClick = () => {}
  render(<ShadowCard shadow={shadow} deployed={false} onClick={onClick} disabled />)
  const btn = screen.getByRole('button')
  expect(btn).toBeDisabled()
})
