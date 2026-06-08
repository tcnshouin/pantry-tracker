import { render } from '@testing-library/react'
import { SlashFx } from './SlashFx'

test('renders an svg slash arc', () => {
  const { container } = render(<SlashFx size={120} />)
  expect(container.querySelector('svg')).toBeInTheDocument()
})
