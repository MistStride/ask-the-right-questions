// 难度接入机制：提示扣分策略。
// difficulty 现在不只是显示用的标签，而是真实影响结算：
//   D1 提示免费；D2 每条提示扣 10 分；D3 每条提示扣 15 分。
// 5 套引擎共用此策略，保证「越难的关，求助越贵」在全局一致。

/** 该难度下，每展开一条提示扣多少分。 */
export function hintCostFor(difficulty: number): number {
  if (difficulty >= 3) return 15
  if (difficulty === 2) return 10
  return 0
}

/** 通关结算：基础分 − 已用提示数 × 单条代价，最低保底 1 分（避免全扣光）。 */
export function applyHintPenalty(baseScore: number, hintsUsed: number, difficulty: number): number {
  return Math.max(1, Math.round(baseScore) - hintsUsed * hintCostFor(difficulty))
}

export interface ScoreBreakdown {
  base: number
  hintsUsed: number
  cost: number
}
