import { ariseFromEnemy, rollArise, deployCap, deployedShadowPower, shadowPowerFromEnemy } from './army'
import { enemyLibrary } from '../../data/enemyLibrary'
import type { Shadow } from './types'

test('shadowPowerFromEnemy scales with enemy stats; bosses are stronger', () => {
  const goblin = enemyLibrary.find(e => e.id === 'goblin')!
  const boss = enemyLibrary.find(e => e.id === 'gate_e_boss')!
  expect(shadowPowerFromEnemy(boss)).toBeGreaterThan(shadowPowerFromEnemy(goblin))
  expect(shadowPowerFromEnemy(goblin)).toBeGreaterThan(0)
})

test('ariseFromEnemy builds a named shadow from a known enemy', () => {
  const s = ariseFromEnemy('goblin', 123)
  expect(s.sourceEnemyId).toBe('goblin')
  expect(s.name).toMatch(/Goblin/)
  expect(s.power).toBeGreaterThan(0)
  expect(s.id).toBeTruthy()
})

test('rollArise is forced by chance bounds', () => {
  expect(rollArise(1, 99).raised).toBe(true)
  expect(rollArise(0, 99).raised).toBe(false)
})

test('deployCap rises with level', () => {
  expect(deployCap(1)).toBe(3)
  expect(deployCap(20)).toBe(5)
})

test('deployedShadowPower sums only deployed shadows', () => {
  const shadows: Shadow[] = [
    { id: 'a', sourceEnemyId: 'goblin', name: 'A', power: 10 },
    { id: 'b', sourceEnemyId: 'imp', name: 'B', power: 5 },
    { id: 'c', sourceEnemyId: 'orc', name: 'C', power: 20 },
  ]
  expect(deployedShadowPower(shadows, ['a', 'c'])).toBe(30)
  expect(deployedShadowPower(shadows, [])).toBe(0)
})
