import type { CourtroomQuestion } from './useCourtroomLogic'

/** Stable per-level shuffle: avoids source-order clues without changing during a replay/render. */
export function orderCourtroomQuestions(questions: CourtroomQuestion[], levelId: string) {
  const ordered = [...questions]
  let seed = [...levelId].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 2166136261)

  for (let index = ordered.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const swapIndex = seed % (index + 1)
    ;[ordered[index], ordered[swapIndex]] = [ordered[swapIndex], ordered[index]]
  }

  return ordered
}
