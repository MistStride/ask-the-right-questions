// 引擎C｜天平校准站 Scale
// 玩法：把滑块放到"最合理的位置"——合理区间不显示，靠热度渐晕寻找；越近中心分越高。
// 模式：spectrum 词义光谱（第 4 章）/ conclusion 结论区间（第 12 章）
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useScaleLogic } from './useScaleLogic'
import CalibrationSlider from './CalibrationSlider'
import { SCALE_UI } from './scaleI18n'
import HintPanel from '../../components/HintPanel'
import LevelCompleteModal from '../../components/LevelCompleteModal'
import { useUiStore } from '../../store/uiStore'
import { useProgressStore } from '../../store/progressStore'
import { useSettingsStore } from '../../store/settingsStore'
import type { ScaleRuntimeLevel } from '../../schema/levelTypes'

interface Props {
  level: ScaleRuntimeLevel
  onExit: () => void
  onHome: () => void
  onReplay: () => void
  nextLevelId?: string
  onNext: () => void
  chapterTitle: string
}

export default function ScaleEngine({
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
  const t = SCALE_UI[locale]
  const mode = level.mode

  const logic = useScaleLogic(level.idealRange, level.idealPoint)
  const { position, setPosition, lastResult, bestScore, burstKey, heat, judge, reset } = logic

  const [modalOpen, setModalOpen] = useState(false)
  const [score, setScore] = useState(0)
  const [settled, setSettled] = useState(false)

  const modeLabel = useMemo(
    () => (mode === 'conclusion' ? t.modeConclusion : t.modeSpectrum),
    [mode, t],
  )

  const handleRelease = (pos: number) => {
    judge(pos)
  }

  const handleSubmit = () => {
    if (bestScore === null) {
      showToast(t.submitHint, 'info')
      return
    }
    if (settled) return
    setSettled(true)
    const finalScore = bestScore
    setScore(finalScore)
    markLevelComplete(level.meta.levelId, finalScore, level.meta.rewardTags)
    setModalOpen(true)
  }

  const handleReplay = () => {
    setModalOpen(false)
    setSettled(false)
    setScore(0)
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
        <span className="rounded-lg border border-scale/40 bg-scale/5 px-3 py-1.5 font-mono text-xs font-semibold tracking-widest text-scale">
          {modeLabel}
        </span>
        <span className="text-sm text-slate-600">{chapterTitle}</span>
      </div>

      {/* 目标卡 */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-xl border border-scale/50 bg-scale/10 px-4 py-3"
      >
        <p className="text-sm font-bold text-scale-deep">{t.objective}</p>
      </motion.div>

      {/* 待校准陈述 */}
      <div className="rounded-2xl border-2 border-scale/40 bg-panel p-6 text-center shadow-[0_1px_8px_rgba(124,58,237,0.10)]">
        <p className="text-[19px] font-semibold leading-relaxed text-slate-800">{level.prompt}</p>
      </div>

      {/* 滑块区 */}
      <div className="mt-4 rounded-2xl border border-line bg-panel p-6">
        <CalibrationSlider
          value={position}
          heat={heat}
          burstKey={burstKey}
          labels={level.spectrumLabels}
          onChange={setPosition}
          onRelease={handleRelease}
          locale={locale}
        />

        {/* 判定结果 */}
        <div className="mt-4 min-h-[52px]">
          {lastResult?.inRange ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 rounded-xl border border-green-600/40 bg-green-50 px-4 py-2.5"
            >
              <span className="text-sm font-bold text-green-700">
                {t.hit} <span className="font-mono text-lg">{lastResult.precision}</span>
              </span>
              <span className="text-xs text-green-600">
                {locale === 'zh' ? `（最佳 ${bestScore}）` : `(best ${bestScore})`}
              </span>
            </motion.div>
          ) : lastResult ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-50 px-4 py-2.5"
            >
              <span className="text-sm font-bold text-red-600">
                {lastResult.dir === 'left' ? t.missLeft : t.missRight}
              </span>
            </motion.div>
          ) : (
            <p className="text-center text-xs text-slate-400">
              {locale === 'zh' ? '拖动滑块，松手判定；可反复尝试，取最好成绩' : 'Drag the slider and release to judge; retry as often as you like, best score counts'}
            </p>
          )}
        </div>
      </div>

      <HintPanel hints={level.hints} locale={locale} />

      {/* 底部操作 */}
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(124,58,237,0.3)] transition ${
            bestScore !== null && !settled ? 'bg-scale hover:brightness-110' : 'cursor-not-allowed bg-slate-300'
          }`}
        >
          {t.submit}
        </button>
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
    </div>
  )
}
