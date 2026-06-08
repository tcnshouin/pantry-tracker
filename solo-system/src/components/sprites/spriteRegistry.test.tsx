import { render } from '@testing-library/react'
import { EnemySprite } from './EnemySprite'
import { WeaponSprite } from './WeaponSprite'
import { enemyLibrary } from '../../data/enemyLibrary'
import { itemLibrary } from '../../data/itemLibrary'

test('every enemy id renders an svg sprite', () => {
  for (const e of enemyLibrary) {
    const { container } = render(<EnemySprite enemyId={e.id} size={64} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  }
})

test('an unknown enemy id still renders a fallback svg', () => {
  const { container } = render(<EnemySprite enemyId={'does-not-exist'} size={64} />)
  expect(container.querySelector('svg')).toBeInTheDocument()
})

test('every weapon baseId renders an svg, and no-weapon renders unarmed svg', () => {
  for (const w of itemLibrary.filter(i => i.slot === 'weapon')) {
    const { container } = render(<WeaponSprite baseId={w.baseId} size={32} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  }
  const { container } = render(<WeaponSprite baseId={null} size={32} />)
  expect(container.querySelector('svg')).toBeInTheDocument()
})
