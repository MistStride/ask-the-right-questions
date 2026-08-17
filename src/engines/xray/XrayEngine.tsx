// 引擎A｜论证透视镜 X-Ray Argument Scanner
// 把正文中的「结论/理由/假设」从噪音里透视出来：点对=点亮骨骼，点错=红闪提示。
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { segmentByAnchors } from '../../utils/matchAnchors'
import { useXrayLogic } from './useXrayLogic'
import XrayNode, { NODE_TYPE_LABELS } from './XrayNode'
import HintPanel from '../../components/HintPanel'
import LevelCompleteModal from '../../components/LevelCompleteModal'
import { useUiStore } from '../../store/uiStore'
import { useProgressStore } from '../../store/progressStore'
import { useSettingsStore } from '../../store/settingsStore'
import type { XrayAnchor, XrayRuntimeLevel } from '../../schema/levelTypes'

interface Props {
  level: XrayRuntimeLevel
  /** 顶部「← 返回章节」 */
  onExit: () => void
  /** 结算弹窗「返回地图」→ 回首页 */
  onHome: () => void
  /** 下一关 id（不存在则返回 undefined，结算弹窗隐藏下一关按钮） */
  nextLevelId?: string
  onNext: () => void
  onReplay: () => void
  chapterTitle: string
}

const WRONG_MSG = {
  zh: (type: XrayAnchor['type']) => `点错了——这是「${NODE_TYPE_LABELS[type].zh}」，干扰项`,
  en: (type: XrayAnchor['type']) => `Miss — that's a "${NODE_TYPE_LABELS[type].en}" (distractor)`,
}

const FOUND_MSG = {
  zh: (type: XrayAnchor['type']) => `√ 找到${NODE_TYPE_LABELS[type].zh}！`,
  en: (type: XrayAnchor['type']) => `Found the ${NODE_TYPE_LABELS[type].en}!`,
}

export default function XrayEngine({
  level,
  onExit,
  onHome,
  nextLevelId,
  onNext,
  onReplay,
  chapterTitle,
}: Props) {
  const locale = useSettingsStore((s) => s.locale)
  const showToast = useUiStore((s) => s.showToast)
  const markLevelComplete = useProgressStore((s) => s.markLevelComplete)

  const segments = useMemo(
    () => segmentByAnchors(level.sourceText, level.anchors),
    [level.sourceText, level.anchors],
  )
  const { foundIds, foundCount, total, wrongFlashId, mistakes, isComplete, handleClick, reset } =
    useXrayLogic(level.anchors)

  const [modalOpen, setModalOpen] = useState(false)
  const [score, setScore] = useState(100)
  const settledRef = useRef(false)

  // 通关结算（只结算一次）
  useEffect(() => {
    if (isComplete && !settledRef.current) {
      settledRef.current = true
      const finalScore = Math.max(50, 100 - mistakes * 12)
      setScore(finalScore)
      markLevelComplete(level.meta.levelId, finalScore, level.meta.rewardTags)
      const timer = window.setTimeout(() => setModalOpen(true), 650)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [isComplete, mistakes, level, markLevelComplete])

  const handleNodeClick = (anchor: XrayAnchor) => {
    const hit = handleClick(anchor)
    if (hit) {
      showToast(FOUND_MSG[locale](anchor.type), 'success')
    } else {
      showToast(WRONG_MSG[locale](anchor.type), 'error')
    }
  }

  const handleReplay = () => {
    setModalOpen(false)
    settledRef.current = false
    reset()
    onReplay()
  }

  const progress = total > 0 ? Math.round((foundCount / total) * 100) : 0

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16">
      {/* 顶部状态栏 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-slate-400 transition hover:bg-panel-2 hover:text-slate-200"
        >
          ← {locale === 'zh' ? '返回章节' : 'Back'}
        </button>
        <span className="rounded-lg border border-xray/50 bg-xray/10 px-3 py-1.5 font-mono text-xs font-semibold tracking-widest text-cyan-300">
          X-RAY · {locale === 'zh' ? '论证透视镜' : 'ARGUMENT SCANNER'}
        </span>
        <span className="text-sm text-slate-400">{chapterTitle}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-sm text-cyan-300">
            {foundCount}/{total}
          </span>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-panel-2">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            />
          </div>
        </div>
      </div>

      {/* 正文扫描区 */}
      <motion.div
        layout
        className={`relative overflow-hidden rounded-2xl border bg-panel p-6 sm:p-8 ${
          isComplete ? 'border-gold/50' : 'border-line'
        }`}
      >
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        {!isComplete && <div className="scanline" />}
        {isComplete && (
          <div className="pointer-events-none absolute inset-0 bg-gold/5" />
        )}

        <p className="relative mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          {locale === 'zh' ? '待扫描的文本' : 'TEXT TO SCAN'}
        </p>

        <p className="relative text-[17px] leading-[2.05] text-slate-300">
          {segments.map((seg, i) =>
            seg.anchor ? (
              <XrayNode
                key={`${seg.anchor.nodeId}-${i}`}
                text={seg.text}
                type={seg.anchor.type}
                isCorrect={seg.anchor.isCorrect}
                found={foundIds.has(seg.anchor.nodeId)}
                wrongFlash={wrongFlashId === seg.anchor.nodeId}
                onClick={() => handleNodeClick(seg.anchor!)}
                locale={locale}
              />
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </p>

        <div className="relative mt-5 flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-xray" />
          {isComplete
            ? locale === 'zh'
              ? '骨骼已全部点亮 ✓'
              : 'Skeleton fully restored ✓'
            : locale === 'zh'
              ? '悬停可扫描 → 点击点亮论证元素'
              : 'Hover to scan → click to light up'}
        </div>
      </motion.div>

      {/* 图例 */}
      <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
        {['conclusion', 'reason', 'ambiguous_term'].map((t) => (
          <span key={t} className="rounded-full border border-line bg-panel px-2.5 py-1">
            {NODE_TYPE_LABELS[t as XrayAnchor['type']][locale]}
          </span>
        ))}
      </div>

      <HintPanel hints={level.hints} locale={locale} />

      {/* 底部操作 */}
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleReplay}
          className="rounded-lg border border-line px-4 py-2 text-sm text-slate-400 transition hover:bg-panel-2 hover:text-slate-200"
        >
          ↻ {locale === 'zh' ? '重新透视' : 'Rescan'}
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
      />
    </div>
  )
}
