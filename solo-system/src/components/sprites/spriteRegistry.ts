export const HUNTER_TINT = '#38bdf8'
export const SHADOW_TINT = '#a78bfa'

const ENEMY_TINTS: Record<string, string> = {
  goblin: '#4ade80',
  imp: '#a855f7',
  wolf: '#94a3b8',
  orc: '#65a30d',
  gate_e_boss: '#ef4444',
  gate_d_boss: '#ef4444',
}

export function enemyTint(enemyId: string): string {
  return ENEMY_TINTS[enemyId] ?? '#ef4444'
}
