// 引擎B 逻辑法庭 判定 hook：命中/试错/血条/通关状态。
// 规则（见 docs/ENGINE-B-DESIGN.md 第 5 节）：
//  - 问题 targetIssue === 破绽 issueType 且 isRelevant → 命中（扣血 + 击碎）
//  - 否则 → 法官警告（不扣血，只计试错次数，鼓励试错）
//  - 通关 = 全部破绽击碎（与血条解耦，防止内容配置错误卡关）
import { useCallback, useMemo, useState } from 'react'
import type { CourtroomRuntimeLevel } from '../../schema/levelTypes'

export interface CourtroomSpot {
  spotId: string
  anchorText: string
  issueType: string
  debunkText: string
  sharpness: number
}

export interface CourtroomQuestion {
  questionId: string
  text: string
  sharpness: number
  targetIssue: string
  isRelevant: boolean
}

export type StrikeOutcome = 'hit' | 'miss' | 'already'

export function useCourtroomLogic(level: CourtroomRuntimeLevel) {
  const [hitSpots, setHitSpots] = useState<Set<string>>(new Set())
  const [wrongTries, setWrongTries] = useState(0)
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set())
  const [flashSpotId, setFlashSpotId] = useState<string | null>(null)
  const [flashQuestionId, setFlashQuestionId] = useState<string | null>(null)
  const [burstOpen, setBurstOpen] = useState(false)

  const total = level.weakSpots.length
  const hitCount = hitSpots.size
  const isComplete = total > 0 && hitCount >= total

  /** 剩余信誉 = credibility - 已击碎破绽的 sharpness 合计 */
  const remainingCredibility = useMemo(() => {
    let deducted = 0
    for (const id of hitSpots) {
      const spot = level.weakSpots.find((s) => s.spotId === id)
      if (spot) deducted += spot.sharpness
    }
    return Math.max(0, level.credibility - deducted)
  }, [hitSpots, level])

  const strike = useCallback(
    (question: CourtroomQuestion, spot: CourtroomSpot): StrikeOutcome => {
      if (hitSpots.has(spot.spotId)) return 'already'
      if (question.targetIssue === spot.issueType && question.isRelevant) {
        setHitSpots((prev) => new Set(prev).add(spot.spotId))
        setFlashSpotId(spot.spotId)
        setFlashQuestionId(null)
        // 最后一个破绽 → 触发「证词击碎！」爆裂
        if (hitSpots.size + 1 >= total) setBurstOpen(true)
        return 'hit'
      }
      setWrongTries((w) => w + 1)
      setUsedQuestions((prev) => new Set(prev).add(question.questionId))
      setFlashQuestionId(question.questionId)
      setFlashSpotId(null)
      return 'miss'
    },
    [hitSpots, total],
  )

  const clearFlash = useCallback(() => {
    setFlashSpotId(null)
    setFlashQuestionId(null)
  }, [])

  const reset = useCallback(() => {
    setHitSpots(new Set())
    setWrongTries(0)
    setUsedQuestions(new Set())
    setFlashSpotId(null)
    setFlashQuestionId(null)
    setBurstOpen(false)
  }, [])

  return {
    hitSpots,
    hitCount,
    total,
    wrongTries,
    usedQuestions,
    flashSpotId,
    flashQuestionId,
    remainingCredibility,
    isComplete,
    burstOpen,
    strike,
    clearFlash,
    reset,
  }
}
