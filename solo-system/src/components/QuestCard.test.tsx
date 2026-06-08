import { render, screen } from '@testing-library/react'
import { QuestCard } from './QuestCard'
import type { QuestInstance } from '../domain/types'

const q = (over: Partial<QuestInstance>): QuestInstance => ({ instanceId: 'i', templateId: 't', title: 'Meditate', description: 'sit', stat: 'PER', baseEXP: 25, baseStatXP: 12, issuedAt: 0, deadline: Date.now() + 99999, completed: false, completedAt: null, isRedemption: false, source: 'ritual', ...over })

test('shows a RITUAL badge for ritual quests', () => {
  render(<QuestCard quest={q({})} onComplete={() => {}} />)
  expect(screen.getByText(/RITUAL/i)).toBeInTheDocument()
})

test('library quest shows no RITUAL badge', () => {
  render(<QuestCard quest={q({ source: 'library' })} onComplete={() => {}} />)
  expect(screen.queryByText(/RITUAL/i)).toBeNull()
})
