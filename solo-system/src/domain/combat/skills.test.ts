import { getSkill, listSkills, skillUnlocked } from './skills'

test('getSkill returns a defined skill by id', () => {
  expect(getSkill('powerStrike')?.name).toBe('Power Strike')
  expect(getSkill('nope')).toBeUndefined()
})

test('listSkills returns all four skills in unlock order', () => {
  expect(listSkills().map(s => s.id)).toEqual(['powerStrike', 'mend', 'focus', 'weaken'])
})

test('skillUnlocked compares player level to unlock level', () => {
  expect(skillUnlocked(getSkill('mend')!, 2)).toBe(false)
  expect(skillUnlocked(getSkill('mend')!, 3)).toBe(true)
})
