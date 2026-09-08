import { describe, expect, it } from 'vitest'
import { LEVELS } from '../../src/content/levelIndex'
import type { CourtroomLevelData, TamerLevelData } from '../../src/schema/levelTypes'

describe('level content contract', () => {
  it('loads every level through the runtime Zod and cross-file validators', () => {
    expect(LEVELS).toHaveLength(35)
  })

  it('keeps level ids unique and all 13 chapters playable', () => {
    const levelIds = LEVELS.map((level) => level.meta.levelId)
    const chapters = new Set(LEVELS.map((level) => level.meta.chapter))

    expect(new Set(levelIds).size).toBe(levelIds.length)
    expect([...chapters].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 13 }, (_, index) => index + 1),
    )
  })

  it('covers all five reusable engines', () => {
    expect(new Set(LEVELS.map((level) => level.meta.engine))).toEqual(
      new Set(['xray', 'courtroom', 'scale', 'defusal', 'tamer']),
    )
  })

  it('gives intermediate and advanced courtroom levels plausible near misses', () => {
    const levels = LEVELS.filter(
      (level) => level.meta.engine === 'courtroom' && level.meta.difficulty >= 2,
    )

    for (const level of levels) {
      const data = level.data as CourtroomLevelData
      expect(data.questionBank.filter((question) => !question.isRelevant).length).toBeGreaterThanOrEqual(2)
    }
  })

  it('gives every boss impulse a graded near-miss option', () => {
    const bosses = LEVELS.filter(
      (level) => level.meta.engine === 'tamer' && (level.data as TamerLevelData).mode === 'boss',
    )

    for (const level of bosses) {
      const data = level.data as TamerLevelData
      for (const event of data.impulseEvents) {
        expect(event.nearMissOptionRefs?.length).toBeGreaterThanOrEqual(1)
      }
    }
  })
})
