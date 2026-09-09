// 结算"每步判定"复盘面板的统一数据契约。
// 5 个引擎语义差异很大：用 discriminated union（kind 字段）分发到不同渲染器，
// 同一个面板组件 src/components/StepReviewPanel.tsx 用 switch(kind) 分支。
// 命中状态用色板统一：hit=emerald、near=amber、miss=red-500、neutral=slate。

import type { Locale } from './levelTypes'

export type ReviewStatus = 'hit' | 'near' | 'miss' | 'neutral'

/** X-Ray 透视镜：串行步骤（每步一组目标）+ 全局干扰/顺序错点击 */
export interface XrayStepReview {
  kind: 'xray'
  items: Array<{
    stepIdx: number
    stepLabel: string
    targetDescs: Array<{ id: string; text: string; type: string }>
    foundIds: string[]
    missedIds: string[]
  }>
  wrongClicks: Array<{ id: string; text: string; type: string; note: string }>
  summary: { foundCount: number; total: number; mistakes: number }
}

/** 法庭：破绽逐个击碎（每破绽一条 + 该破绽上的偏题/近失误计数）*/
export interface CourtroomStepReview {
  kind: 'courtroom'
  items: Array<{
    spotId: string
    anchorText: string
    issueType: string
    status: ReviewStatus
    hitByText?: string
    wrongTries: number
    nearMissTries: number
    debunkText: string
  }>
  summary: { hitCount: number; total: number; wrongTries: number; nearMissTries: number }
}

/** 天平校准：试错日志 + 最终最佳 */
export interface ScaleStepReview {
  kind: 'scale'
  tries: Array<{ position: number; precision: number; inRange: boolean; dir?: 'left' | 'right' }>
  bestScore: number
  idealRange: [number, number]
  idealPoint: number
  finalInRange: boolean
}

/** 数据拆弹：陷阱逐个拆（带假陷阱干扰计数）*/
export interface DefusalStepReview {
  kind: 'defusal'
  traps: Array<{ spotId: string; label: string; status: ReviewStatus; debunkText?: string }>
  wrongDecoys: number
  summary: { defusedCount: number; total: number }
}

/** 驯兽场：事件逐个安抚（带每事件偏题/近失误）*/
export interface TamerStepReview {
  kind: 'tamer'
  items: Array<{
    eventId: string
    biasLabel: string
    impulsePrompt: string
    status: ReviewStatus
    wrongTries: number
    nearMissTries: number
    correctText: string
    calmExplanation: string
  }>
  summary: { calmedCount: number; total: number; wrongTries: number; nearMissTries: number }
}

export type StepReviewItem =
  | XrayStepReview
  | CourtroomStepReview
  | ScaleStepReview
  | DefusalStepReview
  | TamerStepReview

export type AnyStepReview = StepReviewItem

// 共享小工具
export const STATUS_LABEL: Record<ReviewStatus, { zh: string; en: string }> = {
  hit: { zh: '命中', en: 'Hit' },
  near: { zh: '相关但不足', en: 'Near miss' },
  miss: { zh: '未达成', en: 'Missed' },
  neutral: { zh: '—', en: '—' },
}

export const STATUS_DOT: Record<ReviewStatus, string> = {
  hit: 'bg-emerald-500',
  near: 'bg-amber-500',
  miss: 'bg-red-500',
  neutral: 'bg-slate-300',
}

export const localeOf = (_: StepReviewItem, locale: Locale) => locale