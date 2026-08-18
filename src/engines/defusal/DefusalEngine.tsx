// 引擎D｜数据拆弹 Defusal
// 玩法：被动手脚的柱状图上有若干「⚡ 可疑」点，其中藏有统计陷阱。
// 拆对 → 该柱剥落露出真相；拆错 → 爆炸警示（不惩罚）。全部拆完 → 整图剥落。
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useDefusalLogic } from './useDefusalLogic'
import ChartBars from './ChartBars'
import BombFlash from './BombFlash'
import { DEFUSE_UI } from './defusalI18n'
import HintPanel from '../../components/HintPanel'
import LevelCompleteModal from '../../components/LevelCompleteModal'
import { useUiStore } from '../../store/uiStore'
import { useProgressStore } from '../../store/progressStore'
import { useSettingsStore } from '../../store/settingsStore'
import type { DefusalRuntimeLevel } from '../../schema/levelTypes'

interface Props {
  level: DefusalRuntimeLevel
  onExit: () => void
  onHome: () => void
  onReplay: () => void
  nextLevelId?: string
  onNext: () => void
  chapterTitle: string
}

export default function DefusalEngine({
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
  const t = DEFUSE_UI[locale]

  const logic = useDefusalLogic(level)
  const { defused, wrongPoked, flashKey, defusedCount, totalTraps, wrongCount, isComplete, tapSpot, reset } = logic

  const [modalOpen, setModalOpen] = useState(false)
  const [score, setScore] = useState(88)
  const settledRef = useRef(false)

  const traps = level.spots.filter((s) => s.isTrap)

  // 通关：等剥落动画看完再弹结算
  useEffect(() => {
    if (isComplete && !settledRef.current) {
      settledRef.current = true
      const finalScore = Math.max(70, 100 - wrongCount * 8)
      setScore(finalScore)
      markLevelComplete(level.meta.levelId, finalScore, level.meta.rewardTags)
      const timer = window.setTimeout(() => setModalOpen(true), 1100)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [isComplete, wrongCount, level, markLevelComplete])

  const handleTapSpot = (spotId: string) => {
    const outcome = tapSpot(spotId)
    const spot = level.spots.find((s) => s.spotId === spotId)
    if (outcome === 'defused') {
      showToast(`${t.defuseToast}${spot?.debunkText ?? ''}`, 'success')
    } else if (outcome === 'wrong') {
      showToast(t.wrongToast, 'error')
    } else {
      showToast(t.alreadyToast, 'info')
    }
  }

  const handleReplay = () => {
    setModalOpen(false)
    settledRef.current = false
    reset()
    onReplay()
  }

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
        <span className="rounded-lg border border-defuse/40 bg-defuse/5 px-3 py-1.5 font-mono text-xs font-semibold tracking-widest text-defuse">
          DEFUSAL · 数据拆弹
        </span>
        <span className="text-sm text-slate-600">{chapterTitle}</span>
        <span className="ml-auto font-mono text-sm text-defuse">
          {t.progress} {defusedCount}/{totalTraps} 🧨
        </span>
      </div>

      {/* 目标卡 */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-xl border border-defuse/50 bg-defuse/10 px-4 py-3"
      >
        <p className="text-sm font-bold text-defuse-deep">{t.objective(totalTraps)}</p>
      </motion.div>

      {/* 拆弹手册 */}
      <div className="mb-4 rounded-2xl border border-line bg-panel p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-slate-800">{t.manualTitle}</h2>
          <span className="text-xs text-slate-400">{t.manualTip}</span>
        </div>
        <ul className="mt-3 space-y-2">
          {level.manual.map((line, i) => {
            const done = traps[i] ? defused.has(traps[i].spotId) : false
            return (
              <li key={i} className={`flex items-start gap-2 text-sm ${done ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                <span className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${done ? 'bg-green-600 text-white' : 'border border-line bg-panel-2 text-slate-400'}`}>
                  {done ? '✓' : i + 1}
                </span>
                {line}
              </li>
            )
          })}
        </ul>
      </div>

      {/* 图表 + 可疑点 */}
      <div className={`rounded-2xl border bg-panel p-5 transition ${isComplete ? 'border-green-500/60' : 'border-line'}`}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{level.chartTitle}</p>
        <ChartBars
          data={level.chartData}
          yAxis={level.yAxis}
          spots={level.spots}
          defused={defused}
          wrongPoked={wrongPoked}
          onTapSpot={handleTapSpot}
          locale={locale}
        />
        <p className="mt-2 text-xs text-slate-400">
          {locale === 'zh' ? '图表上的 ⚡ 标记是可疑点——点它拆弹，但不是每个都是陷阱' : 'The ⚡ marks are suspicious spots — tap to defuse, but not all of them are traps'}
        </p>
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
        completionSub={wrongCount === 0 ? t.clean : t.messy}
      />

      {/* 剪错线爆炸红闪 */}
      <BombFlash flashKey={flashKey} />
    </div>
  )
}
