// 引擎E｜心智驯兽场 Tamer
// 大象与骑象人：冲动（大象）来袭时，点出批判性问题（骑象人）安抚它。
// tutorial（第 1 章）：海绵 vs 淘金开场 + 3 冲动；boss（第 13 章）：5 冲动。
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTamerLogic } from './useTamerLogic'
import ElephantScene from './ElephantScene'
import OptionCards, { type TamerOption } from './OptionCards'
import { TAMER_UI } from './tamerI18n'
import HintPanel from '../../components/HintPanel'
import LevelCompleteModal from '../../components/LevelCompleteModal'
import { useUiStore } from '../../store/uiStore'
import { useProgressStore } from '../../store/progressStore'
import { useSettingsStore } from '../../store/settingsStore'
import type { TamerRuntimeLevel } from '../../schema/levelTypes'

interface Props {
  level: TamerRuntimeLevel
  onExit: () => void
  onHome: () => void
  onReplay: () => void
  nextLevelId?: string
  onNext: () => void
  chapterTitle: string
}

export default function TamerEngine({
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
  const t = TAMER_UI[locale]
  const isTutorial = level.mode === 'tutorial'

  const logic = useTamerLogic(level)
  const { current, calmedCount, total, rage, wrongTries, lastWrongKey, calmKey, raging, isComplete, select, breathe, reset } = logic

  const [spongeOpen, setSpongeOpen] = useState(isTutorial)
  const [spongeFlash, setSpongeFlash] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [score, setScore] = useState(80)
  const settledRef = useRef(false)

  // 通关结算
  useEffect(() => {
    if (isComplete && !settledRef.current) {
      settledRef.current = true
      const finalScore = Math.max(60, 100 - wrongTries * 10)
      setScore(finalScore)
      markLevelComplete(level.meta.levelId, finalScore, level.meta.rewardTags)
      const timer = window.setTimeout(() => setModalOpen(true), 900)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [isComplete, wrongTries, level, markLevelComplete])

  const handleOption = (key: string) => {
    const outcome = select(key)
    if (outcome === 'calmed') {
      const ev = level.events[calmedCount]
      showToast(`${t.calmToast}${ev?.calm ?? ''}`, 'success')
    } else if (outcome === 'miss') {
      showToast(t.missToast, 'error')
    }
    // raging → 由 useTamerLogic 置 raging，UI 显示暴走 overlay
  }

  const handleSponge = () => {
    setSpongeFlash(true)
    window.setTimeout(() => setSpongeFlash(false), 700)
    showToast(t.spongeWarn, 'info')
  }
  const handleGold = () => {
    setSpongeOpen(false)
    showToast(t.goldEnter, 'success')
  }

  const handleReplay = () => {
    setModalOpen(false)
    settledRef.current = false
    reset()
    onReplay()
  }

  const options: TamerOption[] = current?.options ?? []

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
        <span className="rounded-lg border border-tamer/40 bg-tamer/5 px-3 py-1.5 font-mono text-xs font-semibold tracking-widest text-tamer">
          {isTutorial ? t.modeTutorial : t.modeBoss}
        </span>
        <span className="text-sm text-slate-600">{chapterTitle}</span>
        <span className="ml-auto font-mono text-sm text-tamer">
          {t.progress} {calmedCount}/{total} 🐘
        </span>
      </div>

      {/* 目标卡 */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-xl border border-tamer/50 bg-tamer/10 px-4 py-3"
      >
        <p className="text-sm font-bold text-tamer-deep">{t.objective}</p>
      </motion.div>

      {/* 海绵 vs 淘金（教程开场） */}
      {spongeOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 rounded-2xl border-2 border-tamer/40 bg-panel p-6 text-center"
        >
          <h2 className="text-lg font-bold text-slate-800">{t.spongeTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{t.spongeDesc}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleSponge}
              className={`rounded-xl border-2 px-4 py-4 text-sm font-semibold transition ${
                spongeFlash ? 'tamer-shake border-red-500 bg-red-50 text-red-700' : 'border-line bg-panel-2 text-slate-600 hover:border-red-400/50'
              }`}
            >
              {t.spongeCard}
            </button>
            <button
              type="button"
              onClick={handleGold}
              className="rounded-xl border-2 border-tamer bg-tamer/10 px-4 py-4 text-sm font-semibold text-tamer-deep transition hover:bg-tamer/20"
            >
              {t.goldCard}
            </button>
          </div>
        </motion.div>
      )}

      {!spongeOpen && (
        <>
          {/* 场景 + 大象 + 冲动 */}
          <div className="rounded-2xl border border-line bg-panel p-6">
            <p className="text-sm leading-relaxed text-slate-600">{level.scenario}</p>
            <div className="mt-4">
              <ElephantScene rage={rage} calmKey={calmKey} raging={raging} locale={locale} />
            </div>

            {/* 当前冲动（心里话） */}
            {current && !isComplete && (
              <motion.div
                key={current.eventId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3"
              >
                <p className="text-[11px] font-bold uppercase tracking-widest text-red-500">{t.impulseTitle}</p>
                <p className="mt-1 text-[15px] font-semibold text-red-700">{current.impulsePrompt}</p>
                <p className="mt-1 text-[11px] text-red-400">
                  {locale === 'zh' ? `（这是「${current.biasLabel}」的冲动）` : `(the "${current.biasLabel}" impulse)`}
                </p>
              </motion.div>
            )}

            {/* 候选回应 */}
            {current && !isComplete && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-slate-400">{t.chooseHint}</p>
                <OptionCards options={options} lastWrongKey={lastWrongKey} disabled={raging} onSelect={handleOption} />
              </div>
            )}
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
        </>
      )}

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
        completionTitle={isTutorial ? t.completeTitle : '🏇 骑象踏平虚假论证荒原！'}
        completionSub={isTutorial ? t.completeSub : '前 12 章的技能，在这里汇成了你的理性'}
      />

      {/* 暴走 overlay */}
      <AnimatePresence>
        {raging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-tamer/15 backdrop-blur-[2px]"
          >
            <motion.p
              initial={{ scale: 0.3 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 240, damping: 14 }}
              className="text-7xl"
            >
              💢🐘
            </motion.p>
            <h2 className="mt-3 text-2xl font-black text-tamer-deep">{t.burstTitle}</h2>
            <p className="mt-1 text-sm text-tamer-deep/70">{t.burstSub}</p>
            <button
              type="button"
              onClick={breathe}
              className="mt-5 rounded-xl bg-tamer px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(180,83,9,0.35)] transition hover:brightness-110"
            >
              {t.breathe}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
