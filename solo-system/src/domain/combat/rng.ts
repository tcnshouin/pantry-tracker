export function nextRandom(state: number): { value: number; state: number } {
  const s = (state * 1103515245 + 12345) & 0x7fffffff
  return { value: s / 0x7fffffff, state: s }
}

export function rollChance(state: number, chance: number): { hit: boolean; state: number } {
  const r = nextRandom(state)
  return { hit: r.value < chance, state: r.state }
}
