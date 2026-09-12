import { describe, expect, it } from 'vitest'
import { LEVELS } from '../../src/content/levelIndex'
import type {
  CourtroomLevelData,
  CourtroomTexts,
  DefusalLevelData,
  ScaleLevelData,
  TamerLevelData,
  TamerTexts,
  XrayLevelData,
} from '../../src/schema/levelTypes'

const locales = ['zh', 'en'] as const

describe('gray-area content quality gate', () => {
  it('keeps intermediate and advanced explanations substantive', () => {
    for (const level of LEVELS.filter((item) => item.meta.difficulty >= 2)) {
      for (const locale of locales) {
        const text = level.texts[locale] as { hints: string[]; explanation: string }
        expect(text.hints.length, `${level.meta.levelId}/${locale} hints`).toBeGreaterThanOrEqual(2)
        expect(text.explanation.trim().length, `${level.meta.levelId}/${locale} explanation`).toBeGreaterThanOrEqual(60)
      }
    }
  })

  it('gives every intermediate and advanced X-ray level at least two plausible alternatives', () => {
    for (const level of LEVELS.filter(
      (item) => item.meta.engine === 'xray' && item.meta.difficulty >= 2,
    )) {
      const data = level.data as XrayLevelData
      expect(data.distractors.length, level.meta.levelId).toBeGreaterThanOrEqual(2)
    }
  })

  it('explains why every courtroom near-miss is tempting but insufficient in both languages', () => {
    for (const level of LEVELS.filter(
      (item) => item.meta.engine === 'courtroom' && item.meta.difficulty >= 2,
    )) {
      const data = level.data as CourtroomLevelData
      const nearMisses = data.questionBank.filter((question) => !question.isRelevant)
      expect(nearMisses.length, level.meta.levelId).toBeGreaterThanOrEqual(2)

      for (const locale of locales) {
        const texts = level.texts[locale] as CourtroomTexts
        for (const question of nearMisses) {
          expect(
            texts.nearMissFeedback?.[question.questionId]?.trim().length ?? 0,
            `${level.meta.levelId}/${locale}/${question.questionId}`,
          ).toBeGreaterThanOrEqual(20)
        }
      }
    }
  })

  it('uses a bounded range instead of a single magic answer in calibration levels', () => {
    for (const level of LEVELS.filter(
      (item) => item.meta.engine === 'scale' && item.meta.difficulty >= 2,
    )) {
      const data = level.data as ScaleLevelData
      const width = data.idealRange[1] - data.idealRange[0]
      expect(width, level.meta.levelId).toBeGreaterThanOrEqual(8)
      expect(width, level.meta.levelId).toBeLessThanOrEqual(data.difficulty === 3 ? 30 : 40)
    }
  })

  it('keeps at least two believable decoys in advanced data-defusal levels', () => {
    for (const level of LEVELS.filter(
      (item) => item.meta.engine === 'defusal' && item.meta.difficulty >= 2,
    )) {
      const data = level.data as DefusalLevelData
      expect(
        data.suspectSpots.filter((spot) => !spot.isTrap).length,
        level.meta.levelId,
      ).toBeGreaterThanOrEqual(2)
    }
  })

  it('gives every impulse one graded near-miss with bilingual, specific feedback', () => {
    for (const level of LEVELS.filter((item) => item.meta.engine === 'tamer')) {
      const data = level.data as TamerLevelData
      for (const event of data.impulseEvents) {
        expect(event.nearMissOptionRefs?.length ?? 0, `${level.meta.levelId}/${event.eventId}`).toBeGreaterThanOrEqual(1)
        for (const locale of locales) {
          const texts = level.texts[locale] as TamerTexts
          for (const optionRef of event.nearMissOptionRefs ?? []) {
            expect(
              texts.nearMissFeedback?.[optionRef]?.trim().length ?? 0,
              `${level.meta.levelId}/${locale}/${optionRef}`,
            ).toBeGreaterThanOrEqual(20)
          }
        }
      }
    }
  })
})
