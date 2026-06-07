import { createStore } from 'zustand/vanilla'
import { useStore } from 'zustand'
import { type Clock, systemClock, dayKey } from '../domain/time'
import { balanceConfig } from '../domain/balanceConfig'
import { completeQuest as domainComplete } from '../domain/quests'
import { detectMissedQuests, enterPenalty, clearPenalty, buildRedemptionQuest } from '../domain/penalty'
import { issueDailyQuests, needsNewDay } from '../domain/issuance'
import { resetStreak } from '../domain/streaks'
import { questLibrary } from '../data/questLibrary'
import { freshSaveState, loadState, saveState } from '../persistence/repository'
import type { SaveState, StatType } from '../domain/types'
import { canEnterGate, buildCombatState } from '../domain/gates'
import { applyPlayerAction } from '../domain/combat/engine'
import { gateLibrary } from '../data/gateLibrary'
import type { CombatState, PlayerAction } from '../domain/combat/types'
import { aggregateEquipment } from '../domain/items/bonuses'
import { enhanceCost, enhanceItem as enhanceItemDomain } from '../domain/items/enhance'
import { rollGateDrop } from '../domain/items/generation'
import type { ItemSlot } from '../domain/items/types'
import { ariseFromEnemy, rollArise, deployCap, deployedShadowPower } from '../domain/shadows/army'
import { nextRandom } from '../domain/combat/rng'
import type { Shadow } from '../domain/shadows/types'

interface SystemState {
  save: SaveState
  ready: boolean
  combat: CombatState | null
  hydrate: () => Promise<void>
  completeQuest: (instanceId: string) => Promise<void>
  checkPenalty: () => void
  allocateStatPoint: (stat: StatType) => void
  __setClock: (c: Clock) => void
  enterGate: (gateId: string) => void
  combatAction: (action: PlayerAction) => void
  fleeGate: () => void
  equipItem: (itemId: string) => void
  unequipItem: (slot: ItemSlot) => void
  enhanceItem: (itemId: string) => void
  deployShadow: (id: string) => void
  undeployShadow: (id: string) => void
}

export function createSystemStore(opts?: { clock?: Clock }) {
  let clock = opts?.clock ?? systemClock

  return createStore<SystemState>((set, get) => {
    const persist = (save: SaveState) => { void saveState(save) }

    const rolloverIfNeeded = (save: SaveState): SaveState => {
      const now = clock.now()
      const today = dayKey(now, save.settings.resetHour)
      if (!needsNewDay(save.dayKey, today)) return save
      const history = save.dayKey
        ? [...save.history, {
            day: save.dayKey,
            completed: save.quests.filter(q => q.completed && !q.isRedemption).length,
            issued: save.quests.filter(q => !q.isRedemption).length,
          }]
        : save.history
      const quests = issueDailyQuests({
        library: questLibrary, count: balanceConfig.dailyQuestCount,
        now, durationOverrideMs: null, seed: hashDay(today),
      })
      return { ...save, dayKey: today, quests, history }
    }

    return {
      save: freshSaveState(balanceConfig.defaultResetHour),
      ready: false,
      combat: null,
      __setClock: (c: Clock) => { clock = c },

      hydrate: async () => {
        const loaded = (await loadState()) ?? freshSaveState(balanceConfig.defaultResetHour)
        const rolled = rolloverIfNeeded(loaded)
        persist(rolled)
        set({ save: rolled, ready: true })
      },

      completeQuest: async (instanceId: string) => {
        const save = get().save
        const quest = save.quests.find(q => q.instanceId === instanceId)
        if (!quest || quest.completed) return
        const today = dayKey(clock.now(), save.settings.resetHour)
        const result = domainComplete({
          player: save.player, quest, streak: save.streaks[quest.templateId],
          penalty: save.penalty, today, now: clock.now(),
          rewardMultipliers: aggregateEquipment(save.equipment).reward,
        })
        let penalty = save.penalty
        if (quest.isRedemption && result.quest.completed) penalty = clearPenalty(penalty)
        const next: SaveState = {
          ...save,
          player: result.player,
          quests: save.quests.map(q => q.instanceId === instanceId ? result.quest : q),
          streaks: { ...save.streaks, [quest.templateId]: result.streak },
          penalty,
        }
        persist(next)
        set({ save: next })
      },

      checkPenalty: () => {
        const save = get().save
        const missed = detectMissedQuests(save.quests, clock.now())
        if (missed.length === 0) return
        const streaks = { ...save.streaks }
        for (const m of missed) {
          if (streaks[m.templateId]) streaks[m.templateId] = resetStreak(streaks[m.templateId])
        }
        const hasOpenRedemption = save.quests.some(q => q.isRedemption && !q.completed)
        const quests = hasOpenRedemption ? save.quests : [...save.quests, buildRedemptionQuest(clock.now())]
        const next: SaveState = { ...save, quests, streaks, penalty: enterPenalty(save.penalty, clock.now()) }
        persist(next)
        set({ save: next })
      },

      allocateStatPoint: (stat: StatType) => {
        const save = get().save
        if (save.player.freeStatPoints <= 0) return
        const s = save.player.stats[stat]
        const next: SaveState = {
          ...save,
          player: {
            ...save.player,
            freeStatPoints: save.player.freeStatPoints - 1,
            stats: { ...save.player.stats, [stat]: { ...s, subLevel: s.subLevel + 1 } },
          },
        }
        persist(next)
        set({ save: next })
      },

      enterGate: (gateId: string) => {
        const save = get().save
        const gate = gateLibrary.find(g => g.id === gateId)
        if (!gate) return
        if (!canEnterGate(gate, save.player, save.gates.clearedGateIds)) return
        const sp = deployedShadowPower(save.shadows, save.deployedShadowIds) * balanceConfig.shadows.shadowStrikeFactor
        const next: SaveState = { ...save, player: { ...save.player, gateKeys: save.player.gateKeys - gate.keyCost } }
        persist(next)
        const combat = buildCombatState(gate, next.player, next.equipment, sp, clock.now())
        set({ save: next, combat })
      },

      combatAction: (action: PlayerAction) => {
        const combat = get().combat
        if (!combat || combat.phase !== 'player') return
        const nextCombat = applyPlayerAction(combat, action)
        if (nextCombat.phase === 'won') {
          const save = get().save
          const gate = gateLibrary.find(g => g.id === nextCombat.gateId)
          const rolled = gate ? rollGateDrop(gate, clock.now()) : []
          const drops = rolled.map((d, i) => ({ ...d, id: `item-${clock.now()}-${i}-${Math.random().toString(36).slice(2, 8)}` }))
          const clearedGateIds = save.gates.clearedGateIds.includes(nextCombat.gateId)
            ? save.gates.clearedGateIds
            : [...save.gates.clearedGateIds, nextCombat.gateId]
          const cfg = balanceConfig.shadows.arise
          let astate = (clock.now() & 0x7fffffff) || 1
          const risen: Shadow[] = []
          if (gate) {
            gate.enemyIds.forEach((eid, i) => {
              const chance = i === gate.enemyIds.length - 1 ? cfg.bossChance : cfg.normalChance
              const r = rollArise(chance, astate); astate = r.state
              if (r.raised) {
                const base = ariseFromEnemy(eid, astate); astate = nextRandom(astate).state
                risen.push({ ...base, id: `shadow-${clock.now()}-${i}-${Math.random().toString(36).slice(2, 6)}` })
              }
            })
          }
          const next: SaveState = {
            ...save,
            player: { ...save.player, currency: save.player.currency + nextCombat.goldReward },
            gates: { clearedGateIds },
            inventory: [...save.inventory, ...drops],
            shadows: [...save.shadows, ...risen],
            deployedShadowIds: save.deployedShadowIds,
          }
          persist(next)
          set({ save: next, combat: { ...nextCombat, droppedItems: drops, risenShadows: risen } })
        } else {
          set({ combat: nextCombat })
        }
      },

      equipItem: (itemId: string) => {
        const save = get().save
        const item = save.inventory.find(i => i.id === itemId)
        if (!item) return
        const prev = save.equipment[item.slot]
        const inventory = [
          ...save.inventory.filter(i => i.id !== itemId),
          ...(prev ? [prev] : []),
        ]
        const next: SaveState = { ...save, inventory, equipment: { ...save.equipment, [item.slot]: item } }
        persist(next)
        set({ save: next })
      },

      unequipItem: (slot: ItemSlot) => {
        const save = get().save
        const item = save.equipment[slot]
        if (!item) return
        const next: SaveState = { ...save, inventory: [...save.inventory, item], equipment: { ...save.equipment, [slot]: null } }
        persist(next)
        set({ save: next })
      },

      enhanceItem: (itemId: string) => {
        const save = get().save
        const inInv = save.inventory.find(i => i.id === itemId)
        const slot = (['weapon', 'armor', 'accessory'] as ItemSlot[]).find(s => save.equipment[s]?.id === itemId)
        const item = inInv ?? (slot ? save.equipment[slot] : undefined)
        if (!item) return
        const cost = enhanceCost(item)
        if (save.player.currency < cost) return
        const upgraded = enhanceItemDomain(item)
        const next: SaveState = {
          ...save,
          player: { ...save.player, currency: save.player.currency - cost },
          inventory: inInv ? save.inventory.map(i => i.id === itemId ? upgraded : i) : save.inventory,
          equipment: slot ? { ...save.equipment, [slot]: upgraded } : save.equipment,
        }
        persist(next)
        set({ save: next })
      },

      deployShadow: (id: string) => {
        const save = get().save
        if (save.deployedShadowIds.includes(id)) return
        if (!save.shadows.some(s => s.id === id)) return
        if (save.deployedShadowIds.length >= deployCap(save.player.level)) return
        const next: SaveState = { ...save, deployedShadowIds: [...save.deployedShadowIds, id] }
        persist(next)
        set({ save: next })
      },

      undeployShadow: (id: string) => {
        const save = get().save
        if (!save.deployedShadowIds.includes(id)) return
        const next: SaveState = { ...save, deployedShadowIds: save.deployedShadowIds.filter(x => x !== id) }
        persist(next)
        set({ save: next })
      },

      fleeGate: () => { set({ combat: null }) },
    }
  })
}

function hashDay(day: string): number {
  let h = 0
  for (let i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) & 0x7fffffff
  return h || 1
}

export const systemStore = createSystemStore()
export const useSystemStore = <T,>(sel: (s: SystemState) => T) => useStore(systemStore, sel)
