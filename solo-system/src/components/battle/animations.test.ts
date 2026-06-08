import { getEnemyAttack, getWeaponAttack } from './animations'
import { enemyLibrary } from '../../data/enemyLibrary'
import { itemLibrary } from '../../data/itemLibrary'

test('every enemy id has an attack motion (or fallback)', () => {
  for (const e of enemyLibrary) expect(getEnemyAttack(e.id)).toBeTruthy()
  expect(getEnemyAttack('unknown')).toBeTruthy()
})
test('every weapon baseId + unarmed has an attack motion', () => {
  for (const w of itemLibrary.filter(i => i.slot === 'weapon')) expect(getWeaponAttack(w.baseId)).toBeTruthy()
  expect(getWeaponAttack(null)).toBeTruthy()
})
test('heavy enemy attack differs from normal', () => {
  expect(getEnemyAttack('orc', true)).not.toEqual(getEnemyAttack('orc', false))
})
