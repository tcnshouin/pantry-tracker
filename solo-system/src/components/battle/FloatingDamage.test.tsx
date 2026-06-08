import { render, screen } from '@testing-library/react'
import { FloatingDamage } from './FloatingDamage'

test('renders the damage amount', () => {
  render(<FloatingDamage amount={24} crit={false} miss={false} />)
  expect(screen.getByText('24')).toBeInTheDocument()
})
test('renders MISS when miss', () => {
  render(<FloatingDamage amount={0} crit={false} miss />)
  expect(screen.getByText(/MISS/i)).toBeInTheDocument()
})
test('crit shows a CRIT marker', () => {
  render(<FloatingDamage amount={50} crit miss={false} />)
  expect(screen.getByText('50')).toBeInTheDocument()
  expect(screen.getByText(/CRIT/i)).toBeInTheDocument()
})
