import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(persist(
  (set) => ({
    completed: {},
    scores: {},
    completeLesson: (id, score) => set(state => ({
      completed: { ...state.completed, [id]: true },
      scores:    { ...state.scores,    [id]: Math.max(score, state.scores[id] || 0) },
    })),
    recordAttempt: (id) => set(state => ({
      attempts: { ...state.attempts || {}, [id]: (state.attempts?.[id] || 0) + 1 },
    })),
    resetAll: () => set({ completed: {}, scores: {} }),
  }),
  { name: 'edgelab-progress' }
));
