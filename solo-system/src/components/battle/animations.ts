export interface MotionKeyframes {
  x?: number[]
  y?: number[]
  scale?: number[]
  rotate?: number[]
  transition?: { duration: number }
}

const enemyAttacks: Record<string, MotionKeyframes> = {
  goblin: { x: [0, 18, 0], y: [0, -4, 0], scale: [1, 1.05, 1], transition: { duration: 0.25 } },
  imp: { x: [0, 10, 0], y: [0, -20, 0], scale: [1, 1.1, 1], transition: { duration: 0.3 } },
  wolf: { x: [0, 32, 0], y: [0, -8, 0], scale: [1, 1.15, 1], transition: { duration: 0.3 } },
  orc: { x: [0, 20, 0], y: [0, 12, 0], scale: [1, 1.2, 1], rotate: [0, -8, 0], transition: { duration: 0.45 } },
  gate_e_boss: { x: [0, 28, -8, 0], y: [0, 4, 0], scale: [1, 1.1, 0.95, 1], transition: { duration: 0.4 } },
  gate_d_boss: { x: [0, 10, 0], y: [0, 24, 0], scale: [1, 1.3, 1], transition: { duration: 0.5 } },
  default: { x: [0, 15, 0], scale: [1, 1.1, 1], transition: { duration: 0.35 } },
}

export function getEnemyAttack(id: string, heavy = false): MotionKeyframes {
  const base = enemyAttacks[id] ?? enemyAttacks.default
  if (!heavy) return base
  return {
    x: base.x?.map(v => v * 1.6),
    y: base.y?.map(v => v * 1.6),
    scale: base.scale?.map(v => (v === 1 ? 1 : v * 1.25)),
    rotate: base.rotate?.map(v => v * 1.5),
    transition: { duration: (base.transition?.duration ?? 0.35) * 1.4 },
  }
}

const weaponAttacks: Record<string, MotionKeyframes> = {
  'rusted-blade': { rotate: [0, -30, 10, 0], x: [0, 8, 0], transition: { duration: 0.4 } },
  'hunters-dagger': { x: [0, 14, 4, 16, 0], y: [0, -2, 2, -2, 0], transition: { duration: 0.3 } },
  'shadow-edge': { x: [0, 20, -4, 0], scale: [1, 1.08, 0.96, 1], rotate: [0, -15, 5, 0], transition: { duration: 0.35 } },
  unarmed: { x: [0, 12, 0], scale: [1, 1.05, 1], transition: { duration: 0.25 } },
}

export function getWeaponAttack(baseId: string | null): MotionKeyframes {
  if (!baseId) return weaponAttacks.unarmed
  return weaponAttacks[baseId] ?? weaponAttacks.unarmed
}
