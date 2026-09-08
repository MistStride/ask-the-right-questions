import { describe, expect, it } from 'vitest'
import { splitLineupCards, splitTestimony } from '../../src/engines/courtroom/testimonySegments'
import type { CourtroomSpot } from '../../src/engines/courtroom/useCourtroomLogic'

function spot(spotId: string, anchorText: string): CourtroomSpot {
  return {
    spotId,
    anchorText,
    issueType: 'authority',
    debunkText: 'debunk',
    sharpness: 30,
  }
}

describe('courtroom testimony segmentation', () => {
  it('places repeated anchors without overlapping them', () => {
    const segments = splitTestimony('claim then claim', [spot('a', 'claim'), spot('b', 'claim')])
    expect(segments.filter((segment) => segment.spot).map((segment) => segment.spot?.spotId)).toEqual([
      'a',
      'b',
    ])
  })

  it('creates one lineup card per weak spot', () => {
    const segments = splitTestimony('first and second', [spot('a', 'first'), spot('b', 'second')])
    const cards = splitLineupCards(segments)
    expect(cards.filter((card) => card.some((segment) => segment.spot))).toHaveLength(2)
  })
})
