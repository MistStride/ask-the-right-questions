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
  XrayTexts,
} from '../../src/schema/levelTypes'
import { orderCourtroomQuestions } from '../../src/engines/courtroom/questionOrder'

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

  it('prevents scan levels from leaking one fixed position and step-order recipe', () => {
    const scanLevels = LEVELS.filter(
      (item) => item.meta.engine === 'xray' && (item.data as XrayLevelData).mode === 'scan',
    )
    const conclusionOrdinals = new Set<number>()
    const firstStepTargetTypes = new Set<string>()

    for (const level of scanLevels) {
      const data = level.data as XrayLevelData
      const nodeById = new Map(
        [...data.nodes, ...data.distractors].map((node) => [node.nodeId, node]),
      )
      const firstTarget = data.steps?.[0]?.targets[0]
      if (firstTarget) firstStepTargetTypes.add(nodeById.get(firstTarget)?.type ?? 'unknown')

      for (const locale of locales) {
        const texts = level.texts[locale] as XrayTexts
        const ordered = [...data.nodes, ...data.distractors]
          .filter((node) => !node.hidden)
          .map((node) => ({
            node,
            position: texts.sourceText.indexOf(texts.textRefs[node.textRef]),
          }))
          .sort((a, b) => a.position - b.position)

        const conclusionIndex = ordered.findIndex(
          ({ node }) => node.type === 'conclusion' && data.nodes.includes(node),
        )
        expect(conclusionIndex, `${level.meta.levelId}/${locale} conclusion position`).toBeGreaterThanOrEqual(0)
        conclusionOrdinals.add(conclusionIndex)

        if (level.meta.difficulty >= 2) {
          const correctIds = new Set(data.nodes.map((node) => node.nodeId))
          const correctPositions = ordered
            .filter(({ node }) => correctIds.has(node.nodeId))
            .map(({ position }) => position)
          const distractorPositions = ordered
            .filter(({ node }) => !correctIds.has(node.nodeId))
            .map(({ position }) => position)
          expect(
            Math.min(...distractorPositions),
            `${level.meta.levelId}/${locale} must interleave a decoy before all answers are exhausted`,
          ).toBeLessThan(Math.max(...correctPositions))
        }
      }
    }

    expect(conclusionOrdinals.size, 'scan conclusion positions').toBeGreaterThanOrEqual(3)
    expect(firstStepTargetTypes).toContain('conclusion')
    expect(firstStepTargetTypes).toContain('reason')
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

  it('makes courtroom sharpness functional by requiring multi-card combinations for every flaw', () => {
    for (const level of LEVELS.filter((item) => item.meta.engine === 'courtroom')) {
      const data = level.data as CourtroomLevelData
      const ordered = orderCourtroomQuestions(
        data.questionBank.map((question) => ({ ...question, text: question.questionId })),
        level.meta.levelId,
      )
      expect(
        ordered.map((question) => question.questionId),
        `${level.meta.levelId} question order`,
      ).not.toEqual(data.questionBank.map((question) => question.questionId))
      for (const spot of data.weakSpots) {
        const matching = data.questionBank.filter((question) => question.targetIssue === spot.issueType)
        expect(matching.length, `${level.meta.levelId}/${spot.spotId} card count`).toBeGreaterThanOrEqual(2)
        expect(
          Math.max(...matching.map((question) => question.sharpness)),
          `${level.meta.levelId}/${spot.spotId} single-card shortcut`,
        ).toBeLessThan(spot.sharpness)
        expect(
          matching.reduce((sum, question) => sum + question.sharpness, 0),
          `${level.meta.levelId}/${spot.spotId} total damage`,
        ).toBeGreaterThanOrEqual(spot.sharpness)
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
