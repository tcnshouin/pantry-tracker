import { render, screen } from '@testing-library/react'
import { ItemCard } from './ItemCard'
import type { Item } from '../domain/items/types'

const item: Item = { id: 'i', baseId: 'b', name: 'Shadow Edge', slot: 'weapon', rarity: 'epic', enhanceLevel: 2, bonuses: [{ kind: 'attack', value: 12 }] }

test('shows item name, enhance level, and a bonus', () => {
  render(<ItemCard item={item} />)
  expect(screen.getByText(/Shadow Edge/)).toBeInTheDocument()
  expect(screen.getByText(/\+2/)).toBeInTheDocument()
  expect(screen.getByText(/ATK/i)).toBeInTheDocument()
})
