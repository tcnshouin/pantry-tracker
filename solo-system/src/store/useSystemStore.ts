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

interface SystemState {
  save: SaveState
  ready: boolean
  hydrate: () => Promise<void>
  completeQuest: (instanceId: string) => Promise<void>
  checkPenalty: () => void
  allocateStatPoint: (stat: StatType) => void
  __setClock: (c: Clock) => void
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
        ? [...save.history, { day: save.dayKey, completed: save.quests.filter(q => q.completed).length, issued: save.quests.length }]
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
