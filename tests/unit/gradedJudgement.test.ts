import { describe, expect, it } from 'vitest'
import { classifyCourtroomStrike } from '../../src/engines/courtroom/useCourtroomLogic'
import { classifyTamerOption } from '../../src/engines/tamer/useTamerLogic'

describe('graded judgement', () => {
  it('distinguishes courtroom hits, near misses, and off-target questions', () => {
    const spot = {
      spotId: 'spot-1',
      anchorText: 'claim',
      issueType: 'sample_bias',
      debunkText: 'debunk',
      sharpness: 30,
    }
    const question = {
      questionId: 'q-1',
      text: 'question',
      sharpness: 20,
      targetIssue: 'sample_bias',
      isRelevant: true,
    }

    expect(classifyCourtroomStrike(question, spot)).toBe('hit')
    expect(classifyCourtroomStrike({ ...question, isRelevant: false }, spot)).toBe('near_miss')
    expect(classifyCourtroomStrike({ ...question, targetIssue: 'causation' }, spot)).toBe('miss')
  })

  it('distinguishes tamer answers with a plausible but insufficient middle tier', () => {
    const event = { correctKey: 'core', nearMissKeys: ['adjacent'] }

    expect(classifyTamerOption('core', event)).toBe('calmed')
    expect(classifyTamerOption('adjacent', event)).toBe('near_miss')
    expect(classifyTamerOption('impulsive', event)).toBe('miss')
  })
})
