import { useEffect, useRef, useState } from 'react'
import type { CombatState } from '../../domain/combat/types'
import { diffCombat, type CombatEvent } from './combatDiff'

export interface AnimationBatch { id: number; events: CombatEvent[] }

export function useCombatAnimations(combat: CombatState | null): AnimationBatch {
  const prevRef = useRef<CombatState | null>(null)
  const idRef = useRef(0)
  const [batch, setBatch] = useState<AnimationBatch>({ id: 0, events: [] })
  useEffect(() => {
    if (!combat) { prevRef.current = null; return }
    const prev = prevRef.current
    if (prev && prev !== combat) {
      const events = diffCombat(prev, combat)
      if (events.length > 0) { idRef.current += 1; setBatch({ id: idRef.current, events }) }
    }
    prevRef.current = combat
  }, [combat])
  return batch
}
