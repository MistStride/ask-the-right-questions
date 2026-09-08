import { describe, expect, it } from 'vitest'
import { applyHintPenalty, hintCostFor } from '../../src/utils/hintPolicy'

describe('hint scoring policy', () => {
  it.each([
    [1, 0],
    [2, 10],
    [3, 15],
  ])('maps difficulty %i to a %i-point hint cost', (difficulty, expected) => {
    expect(hintCostFor(difficulty)).toBe(expected)
  })

  it('subtracts used hints and keeps a completed score above zero', () => {
    expect(applyHintPenalty(82, 2, 2)).toBe(62)
    expect(applyHintPenalty(10, 2, 3)).toBe(1)
  })
})
