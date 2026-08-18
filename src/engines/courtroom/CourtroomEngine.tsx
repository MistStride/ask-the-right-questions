// 引擎B｜逻辑法庭 Courtroom
// 玩法：证人作证 → 把问题弹药库的问题拖到/点选到证词破绽上 → 全部击碎通关。
// 三种模式（同一判定逻辑，仅布局与词汇不同）：
//  trial  庭审质询（第 7/8 章）   clinic 逻辑诊所（第 6 章）   lineup 嫌疑人对质墙（第 9 章）
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useCourtroomLogic, type CourtroomQuestion, type CourtroomSpot } from './useCourtroomLogic'
import { COURT_UI } from './courtI18n'
import CredibilityBar from './CredibilityBar'
import QuestionBank from './QuestionBank'
import CourtroomTestimony from './CourtroomTestimony'
import CourtroomBurst from './CourtroomBurst'
import HintPanel from '../../components/HintPanel'
import LevelCompleteModal from '../../components/LevelCompleteModal'
import { useUiStore } from '../../store/uiStore'
import { useProgressStore } from '../../store/progressStore'
import { useSettingsStore } from '../../store/settingsStore'
import type { CourtroomRuntimeLevel } from '../../schema/levelTypes'

interface Props {
  level: CourtroomRuntimeLevel
  onExit: () => void
  onHome: () => void
  onReplay: () => void
  nextLevelId?: string
  onNext: () => void
  chapterTitle: string
}

const MODE_LABEL = {
  zh: { trial: 'COURT · 庭审质询', clinic: 'CLINIC · 逻辑诊所', lineup: 'LINEUP · 嫌疑人对质墙' },
  en: { trial: 'COURT · CROSS-EXAM', clinic: 'CLINIC · LOGIC DIAGNOSIS', lineup: 'LINEUP · SUSPECT WALL' },
} as const

const WORD_OF = {
  zh: { trial: '证人', clinic: '病人', lineup: '嫌疑人' },
  en: { trial: 'Witness', clinic: 'Patient', lineup: 'Suspect' },
} as const

export default function CourtroomEngine({
  level,
  onExit,
  onHome,
  onReplay,
  nextLevelId,
  onNext,
  chapterTitle,
}: Props) {
  const locale = useSettingsStore((s) => s.locale)
  const showToast = useUiStore((s) => s.showToast)
  const markLevelComplete = useProgressStore((s) => s.markLevelComplete)
  const t = COURT_UI[locale]
  const mode = level.mode

  const logic = useCourtroomLogic(level)
  const {
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
    dismissBurst,
    reset,
  } = logic

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [score, setScore] = useState(100)
  const settledRef = useRef(false)
  const dragQuestionRef = useRef<CourtroomQuestion | null>(null)

  const questionsById = useMemo(() => new Map(level.questions.map((q) => [q.questionId, q])), [level.questions])

  // 命中/试错红闪清理
  useEffect(() => {
    if (!flashSpotId && !flashQuestionId) return
    const timer = window.setTimeout(clearFlash, 900)
    return () => window.clearTimeout(timer)
  }, [flashSpotId, flashQuestionId, clearFlash])

  // 爆裂蒙版：1.3s 后自动关闭（结算弹窗 1.4s 弹出，蒙版不能盖住它）
  useEffect(() => {
    if (!burstOpen) return undefined
    const timer = window.setTimeout(dismissBurst, 1300)
    return () => window.clearTimeout(timer)
  }, [burstOpen, dismissBurst])

  // 通关：爆裂特效由最后一个命中触发，看完再弹结算
  useEffect(() => {
    if (isComplete && !settledRef.current) {
      settledRef.current = true
      const finalScore = Math.round(50 + remainingCredibility * 0.4 + Math.max(0, 20 - wrongTries * 5))
      setScore(finalScore)
      markLevelComplete(level.meta.levelId, finalScore, level.meta.rewardTags)
      const timer = window.setTimeout(() => setModalOpen(true), 1400)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [isComplete, remainingCredibility, wrongTries, level, markLevelComplete])

  const handleStrike = (questionId: string, spot: CourtroomSpot) => {
    const q = questionsById.get(questionId)
    if (!q) return
    const outcome = strike(q, spot)
    if (outcome === 'hit') {
      showToast(`${t.hitToast} ${spot.debunkText}`, 'success')
      setSelectedId(null)
    } else if (outcome === 'miss') {
      showToast(t.missToast, 'error')
    } else {
      showToast(t.alreadyToast, 'info')
    }
  }

  /** 拖拽命中：问题卡拖到破绽段上 */
  const handleDropSpot = (spot: CourtroomSpot) => {
    const q = dragQuestionRef.current
    if (!q) return
    handleStrike(q.questionId, spot)
    dragQuestionRef.current = null
  }

  /** 点选命中：先点问题卡选中，再点破绽段 */
  const handleTapSpot = (spot: CourtroomSpot) => {
    if (!selectedId) {
      showToast(t.selectFirst, 'info')
      return
    }
    handleStrike(selectedId, spot)
  }

  const handleReplay = () => {
    setModalOpen(false)
    settledRef.current = false
    setSelectedId(null)
    reset()
    onReplay()
  }

  const collapsed = remainingCredibility <= 0 && !isComplete
  const word = WORD_OF[locale][mode]

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16">
      {/* 顶部状态栏 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-slate-600 transition hover:bg-panel-2 hover:text-slate-900"
        >
          ← {t.back}
        </button>
        <span className="rounded-lg border border-court/40 bg-court/5 px-3 py-1.5 font-mono text-xs font-semibold tracking-widest text-court">
          {MODE_LABEL[locale][mode]}
        </span>
        <span className="text-sm text-slate-600">{chapterTitle}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-sm text-court">
            {hitCount}/{total} 💥
          </span>
        </div>
      </div>

      {/* 目标卡：进关即明确「要干嘛」 */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-xl border border-gold/50 bg-gold/10 px-4 py-3"
      >
        <p className="text-sm font-bold text-gold-deep">{t.objective(total)}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {locale === 'zh' ? `「⚡ 可疑」标记处就是破绽所在；打中要害证词信誉崩落，全部击碎即获胜` : 'Lines marked "⚡ Suspicious" hide the flaws; shatter them all to win'}
        </p>
      </motion.div>

      {/* 案件头 */}
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-court/40 bg-court/10 text-lg">
          {mode === 'clinic' ? '🩺' : mode === 'lineup' ? '🕵️' : '⚖️'}
        </span>
        <div>
          <p className="text-sm font-bold text-slate-800">{level.caseTitle}</p>
          <p className="text-xs text-slate-500">
            {word}：{level.witnessName}
          </p>
        </div>
      </div>

      {/* 信誉血条 */}
      <div className="mb-4 rounded-2xl border border-line bg-panel p-4">
        <CredibilityBar value={remainingCredibility} max={level.credibility} collapsed={collapsed} locale={locale} />
      </div>

      {/* 证词 */}
      <CourtroomTestimony
        mode={mode}
        testimony={level.testimony}
        spots={level.weakSpots}
        hitSpots={hitSpots}
        flashSpotId={flashSpotId}
        onDropSpot={handleDropSpot}
        onTapSpot={handleTapSpot}
        locale={locale}
      />

      {/* 问题弹药库 / 证据卡堆 */}
      <div className="mt-4">
        <QuestionBank
          mode={mode}
          questions={level.questions}
          usedIds={usedQuestions}
          flashQuestionId={flashQuestionId}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDragStart={(q) => {
            dragQuestionRef.current = q
          }}
          locale={locale}
        />
      </div>

      <HintPanel hints={level.hints} locale={locale} />

      {/* 底部操作 */}
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleReplay}
          className="rounded-lg border border-line px-4 py-2 text-sm text-slate-600 transition hover:bg-panel-2 hover:text-slate-900"
        >
          ↻ {t.reset}
        </button>
      </div>

      {/* 通关结算 */}
      <LevelCompleteModal
        open={modalOpen}
        levelTitle={chapterTitle}
        score={score}
        rewardTags={level.meta.rewardTags}
        explanation={level.explanation}
        contributor={level.meta.contributor}
        hasNext={Boolean(nextLevelId)}
        onNext={onNext}
        onHome={onHome}
        onReplay={handleReplay}
        locale={locale}
        completionTitle={t.completeTitle}
        completionSub={t.completeSub}
      />

      {/* 全屏爆裂特效 */}
      <CourtroomBurst open={burstOpen} locale={locale} />
    </div>
  )
}
