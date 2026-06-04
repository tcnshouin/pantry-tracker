import { render, screen } from '@testing-library/react'
import { CountdownTimer } from './CountdownTimer'

test('shows remaining time and an expired state', () => {
  const now = 1_000_000
  render(<CountdownTimer deadline={now + 90_000} nowMs={now} />)
  expect(screen.getByText(/01:30/)).toBeInTheDocument()
})

test('shows EXPIRED when past deadline', () => {
  const now = 1_000_000
  render(<CountdownTimer deadline={now - 1} nowMs={now} />)
  expect(screen.getByText(/EXPIRED/i)).toBeInTheDocument()
})
