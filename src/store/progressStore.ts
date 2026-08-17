import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RadarDimension } from '../schema/levelTypes'

export interface CompletionRecord {
  score: number
  completedAt: string
}

interface ProgressState {
  /** levelId → 通关记录 */
  completed: Record<string, CompletionRecord>
  /** 六维雷达累计值（0-100） */
  radar: Record<RadarDimension, number>
  markLevelComplete: (levelId: string, score: number, rewardTags: RadarDimension[]) => void
  resetAll: () => void
}

const emptyRadar: Record<RadarDimension, number> = {
  structure: 0,
  evidence: 0,
  assumption: 0,
  fallacy: 0,
  data: 0,
  emotion: 0,
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completed: {},
      radar: { ...emptyRadar },
      markLevelComplete: (levelId, score, rewardTags) =>
        set((state) => {
          const radar = { ...state.radar }
          for (const tag of rewardTags) {
            radar[tag] = Math.min(100, radar[tag] + Math.round(score / 2))
          }
          return {
            completed: {
              ...state.completed,
              [levelId]: { score, completedAt: new Date().toISOString() },
            },
            radar,
          }
        }),
      resetAll: () => set({ completed: {}, radar: { ...emptyRadar } }),
    }),
    { name: 'atrq-progress-v1' },
  ),
)
