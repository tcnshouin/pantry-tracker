import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the system initializing screen', () => {
  render(<App />)
  expect(screen.getByText(/INITIALIZING SYSTEM/i)).toBeInTheDocument()
})
