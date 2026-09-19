// 引擎B 逻辑法庭 判定 hook：命中/试错/血条/通关状态。
// 规则（见 docs/ENGINE-B-DESIGN.md 第 5 节）：
//  - 问题 targetIssue === 破绽 issueType → 按卡片 sharpness 削减该破绽抗辩值
//  - 同一张卡只能有效使用一次；破绽需要多张互补卡累计击穿
//  - targetIssue 不匹配 → 法官警告（不消耗卡片，可继续判断）
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
  nearMissFeedback?: string
}

export type StrikeOutcome = 'hit' | 'support' | 'miss' | 'already' | 'spent'

export interface StrikeResult {
  outcome: StrikeOutcome
  damage: number
  remaining: number
  shattered: boolean
}

export function classifyCourtroomStrike(
  question: CourtroomQuestion,
  spot: CourtroomSpot,
): 'hit' | 'support' | 'miss' {
  if (question.targetIssue !== spot.issueType) return 'miss'
  return question.isRelevant ? 'hit' : 'support'
}

export function useCourtroomLogic(level: CourtroomRuntimeLevel) {
  const [hitSpots, setHitSpots] = useState<Set<string>>(new Set())
  const [spotDamage, setSpotDamage] = useState<Map<string, number>>(new Map())
  const [spentQuestions, setSpentQuestions] = useState<Set<string>>(new Set())
  const [wrongTries, setWrongTries] = useState(0)
  const [nearMissTries, setNearMissTries] = useState(0)
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set())
  const [nearMissQuestions, setNearMissQuestions] = useState<Set<string>>(new Set())
  const [flashSpotId, setFlashSpotId] = useState<string | null>(null)
  const [flashQuestionId, setFlashQuestionId] = useState<string | null>(null)
  const [burstOpen, setBurstOpen] = useState(false)

  const total = level.weakSpots.length
  const hitCount = hitSpots.size
  const isComplete = total > 0 && hitCount >= total

  /** 剩余信誉随每张正确卡的实际伤害下降，锐度不再只是展示数字。 */
  const remainingCredibility = useMemo(() => {
    const deducted = [...spotDamage.values()].reduce((sum, damage) => sum + damage, 0)
    return Math.max(0, level.credibility - deducted)
  }, [spotDamage, level.credibility])

  const strike = useCallback(
    (question: CourtroomQuestion, spot: CourtroomSpot): StrikeResult => {
      const currentDamage = spotDamage.get(spot.spotId) ?? 0
      if (hitSpots.has(spot.spotId)) {
        return { outcome: 'already', damage: 0, remaining: 0, shattered: true }
      }
      if (spentQuestions.has(question.questionId)) {
        return {
          outcome: 'spent',
          damage: 0,
          remaining: Math.max(0, spot.sharpness - currentDamage),
          shattered: false,
        }
      }
      const outcome = classifyCourtroomStrike(question, spot)
      if (outcome !== 'miss') {
        const damage = Math.min(question.sharpness, spot.sharpness - currentDamage)
        const nextDamage = currentDamage + damage
        const shattered = nextDamage >= spot.sharpness
        setSpotDamage((prev) => new Map(prev).set(spot.spotId, nextDamage))
        setSpentQuestions((prev) => new Set(prev).add(question.questionId))
        if (shattered) setHitSpots((prev) => new Set(prev).add(spot.spotId))
        setFlashSpotId(spot.spotId)
        setFlashQuestionId(null)
        if (outcome === 'support') {
          setNearMissTries((n) => n + 1)
          setNearMissQuestions((prev) => new Set(prev).add(question.questionId))
        }
        if (shattered && hitSpots.size + 1 >= total) setBurstOpen(true)
        return {
          outcome,
          damage,
          remaining: Math.max(0, spot.sharpness - nextDamage),
          shattered,
        }
      }
      setWrongTries((w) => w + 1)
      setUsedQuestions((prev) => new Set(prev).add(question.questionId))
      setFlashQuestionId(question.questionId)
      setFlashSpotId(null)
      return {
        outcome,
        damage: 0,
        remaining: Math.max(0, spot.sharpness - currentDamage),
        shattered: false,
      }
    },
    [hitSpots, spotDamage, spentQuestions, total],
  )

  const clearFlash = useCallback(() => {
    setFlashSpotId(null)
    setFlashQuestionId(null)
  }, [])

  /** 关闭全屏爆裂（通关后由引擎定时调用，避免蒙版永远盖住结算弹窗） */
  const dismissBurst = useCallback(() => {
    setBurstOpen(false)
  }, [])

  const reset = useCallback(() => {
    setHitSpots(new Set())
    setSpotDamage(new Map())
    setSpentQuestions(new Set())
    setWrongTries(0)
    setNearMissTries(0)
    setUsedQuestions(new Set())
    setNearMissQuestions(new Set())
    setFlashSpotId(null)
    setFlashQuestionId(null)
    setBurstOpen(false)
  }, [])

  return {
    hitSpots,
    spotDamage,
    spentQuestions,
    hitCount,
    total,
    wrongTries,
    nearMissTries,
    usedQuestions,
    nearMissQuestions,
    flashSpotId,
    flashQuestionId,
    remainingCredibility,
    isComplete,
    burstOpen,
    strike,
    clearFlash,
    dismissBurst,
    reset,
  }
}
