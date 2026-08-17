// 引擎A｜论证透视镜 X-Ray Argument Scanner
// 三种玩法变体：
//  scan — 从噪音里透视出结论/理由，点对点亮骨骼
//  dig  — 明处扫结构，暗处挖隐藏假设（考古挖掘区）
//  gap  — 扫结构 + 补全被撕掉的关键信息空洞
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { segmentByAnchors } from '../../utils/matchAnchors'
import { useXrayLogic } from './useXrayLogic'
import XrayNode, { NODE_TYPE_LABELS } from './XrayNode'
import XrayChainArrows from './XrayChainArrows'
import DigSite from './DigSite'
import GapNode from './GapNode'
import ObjectiveBar from './ObjectiveBar'
import HintPanel from '../../components/HintPanel'
import LevelCompleteModal from '../../components/LevelCompleteModal'
import { useUiStore } from '../../store/uiStore'
import { useProgressStore } from '../../store/progressStore'
import { useSettingsStore } from '../../store/settingsStore'
import type { XrayAnchor, XrayRuntimeLevel } from '../../schema/levelTypes'

interface Props {
  level: XrayRuntimeLevel
  onExit: () => void
  onHome: () => void
  onReplay: () => void
  nextLevelId?: string
  onNext: () => void
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

const STEP_DONE_MSG = {
  zh: (next: string) => `✓ 目标达成！下一步：找出【${next}】`,
  en: (next: string) => `✓ Objective complete! Next: find ${next}`,
}

const ORDER_MSG = {
  zh: (label: string) => `✗ 顺序提醒：现在要找的是【${label}】，先别点其他的`,
  en: (label: string) => `✗ Hold on — find ${label} first`,
}

const MODE_LABEL = {
  zh: { scan: 'X-RAY · 论证透视镜', dig: 'DIG · 考古挖掘', gap: 'GAP · 空洞寻踪' },
  en: { scan: 'X-RAY · ARGUMENT SCANNER', dig: 'DIG SITE · EXCAVATION', gap: 'GAP HUNT · MISSING INFO' },
}

const MODE_TIP = {
  zh: {
    scan: '点击正文中带虚线的片段，找出目标栏里的论证元素；不在目标里的都是干扰项',
    dig: '明处的论证元素直接点击；隐藏假设要去下方「挖掘区」挖出来',
    gap: '先点击论证元素，再把 🕳️ 破洞补上——那里藏着被省略的关键信息',
  },
  en: {
    scan: 'Click the dashed fragments to find the objective items; anything else is a distractor',
    dig: 'Click the visible elements; dig out the hidden premise in the excavation site below',
    gap: 'Click the argument elements, then patch the 🕳️ gap — it holds the omitted key info',
  },
}

/** 把正文中的 【gap:xxx】 标记拆成文本段与空洞段 */
function splitGapMarks(text: string): Array<{ kind: 'text'; text: string } | { kind: 'gap'; gapId: string }> {
  const parts: Array<{ kind: 'text'; text: string } | { kind: 'gap'; gapId: string }> = []
  const re = /【gap:([\w-]+)】/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ kind: 'text', text: text.slice(last, m.index) })
    parts.push({ kind: 'gap', gapId: m[1] })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ kind: 'text', text: text.slice(last) })
  return parts
}

export default function XrayEngine({
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
  const containerRef = useRef<HTMLDivElement | null>(null)

  // —— 组装判定目标：正文可见锚点（正确）+ 隐藏节点 + 空洞 ——
  const targets = useMemo(() => {
    const visibleCorrect = level.anchors.filter((a) => a.isCorrect)
    const gapTargets: XrayAnchor[] = level.gaps.map((g) => ({
      nodeId: `gap:${g.gapId}`,
      type: 'omission',
      anchorText: g.correctText,
      isCorrect: true,
    }))
    return [...visibleCorrect, ...level.hiddenNodes, ...gapTargets]
  }, [level])

  const { foundIds, foundCount, total, wrongFlashId, mistakes, isComplete, handleClick, markFound, registerMistake, reset } =
    useXrayLogic(targets)

  const gapById = useMemo(() => new Map(level.gaps.map((g) => [g.gapId, g])), [level.gaps])

  // —— 串行步骤：一次只找一个目标 ——
  const steps = level.steps
  const [stepIdx, setStepIdx] = useState(0)
  const currentStep = steps[Math.min(stepIdx, steps.length - 1)]
  const activeIds = useMemo(() => new Set(currentStep.targets), [currentStep])

  const typeById = useMemo(() => {
    const m = new Map<string, XrayAnchor['type']>()
    for (const t of targets) m.set(t.nodeId, t.type)
    return m
  }, [targets])

  const stepLabelOf = (step: (typeof steps)[number]) => {
    const types = new Set<string>()
    for (const id of step.targets) {
      const tp = typeById.get(id)
      if (tp) types.add(NODE_TYPE_LABELS[tp][locale])
    }
    return [...types].join(' + ')
  }
  const currentLabel = stepLabelOf(currentStep)

  // 当前步骤全部找到 → 自动推进到下一步
  const stepDone = currentStep.targets.every((id) => foundIds.has(id))
  useEffect(() => {
    if (stepDone && stepIdx < steps.length - 1) {
      const timer = window.setTimeout(() => {
        const nextIdx = stepIdx + 1
        setStepIdx(nextIdx)
        const nextStep = steps[nextIdx]
        const types = new Set<string>()
        for (const id of nextStep.targets) {
          const tp = typeById.get(id)
          if (tp) types.add(NODE_TYPE_LABELS[tp][locale])
        }
        showToast(STEP_DONE_MSG[locale]([...types].join(' + ')), 'info')
      }, 550)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [stepDone, stepIdx, steps, locale, showToast, typeById])

  const segments = useMemo(
    () => segmentByAnchors(level.sourceText, level.anchors),
    [level.sourceText, level.anchors],
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [score, setScore] = useState(100)
  const settledRef = useRef(false)

  useEffect(() => {
    if (isComplete && !settledRef.current) {
      settledRef.current = true
      const finalScore = Math.max(50, 100 - mistakes * 12)
      setScore(finalScore)
      markLevelComplete(level.meta.levelId, finalScore, level.meta.rewardTags)
      const timer = window.setTimeout(() => setModalOpen(true), 700)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [isComplete, mistakes, level, markLevelComplete])

  const handleNodeClick = (anchor: XrayAnchor) => {
    if (!anchor.isCorrect) {
      registerMistake(anchor.nodeId)
      showToast(WRONG_MSG[locale](anchor.type), 'error')
      return
    }
    if (activeIds.has(anchor.nodeId)) {
      handleClick(anchor)
      showToast(FOUND_MSG[locale](anchor.type), 'success')
    } else {
      registerMistake(anchor.nodeId)
      showToast(ORDER_MSG[locale](currentLabel), 'error')
    }
  }

  const handleGapPick = (gapId: string, picked: string) => {
    const gap = gapById.get(gapId)
    if (!gap) return
    if (!activeIds.has(`gap:${gapId}`)) {
      registerMistake(`gap:${gapId}`)
      showToast(ORDER_MSG[locale](currentLabel), 'error')
      return
    }
    if (picked === gap.correctText) {
      markFound(`gap:${gapId}`)
      showToast(locale === 'zh' ? '🩹 关键遗漏已补全！' : 'Key omission patched!', 'success')
    } else {
      registerMistake(`gap:${gapId}`)
      showToast(locale === 'zh' ? '✗ 这不是关键遗漏' : '✗ Not the missing key info', 'error')
    }
  }

  const handleUnearth = (node: XrayAnchor) => {
    if (!activeIds.has(node.nodeId)) {
      registerMistake(node.nodeId)
      showToast(ORDER_MSG[locale](currentLabel), 'error')
      return
    }
    markFound(node.nodeId)
    showToast(
      locale === 'zh' ? `⛏ 挖出${NODE_TYPE_LABELS[node.type].zh}！` : `Uncovered a hidden ${NODE_TYPE_LABELS[node.type].en}!`,
      'success',
    )
  }

  const handleBlocked = () => {
    showToast(ORDER_MSG[locale](currentLabel), 'error')
  }

  const handleReplay = () => {
    setModalOpen(false)
    settledRef.current = false
    setStepIdx(0)
    reset()
    onReplay()
  }

  const progress = total > 0 ? Math.round((foundCount / total) * 100) : 0
  const mode = level.mode
  const isFinishedView = isComplete

  /** 渲染正文（含 gap 标记二次拆分） */
  const renderBody = (): ReactNode[] => {
    const out: ReactNode[] = []
    segments.forEach((seg, i) => {
      if (seg.anchor) {
        out.push(
          <XrayNode
            key={`${seg.anchor.nodeId}-${i}`}
            nodeId={seg.anchor.nodeId}
            text={seg.text}
            type={seg.anchor.type}
            isCorrect={seg.anchor.isCorrect}
            found={foundIds.has(seg.anchor.nodeId)}
            wrongFlash={wrongFlashId === seg.anchor.nodeId}
            onClick={() => handleNodeClick(seg.anchor!)}
            locale={locale}
          />,
        )
        return
      }
      const parts = splitGapMarks(seg.text)
      parts.forEach((p, j) => {
        if (p.kind === 'text') {
          out.push(<span key={`${i}-t${j}`}>{p.text}</span>)
        } else {
          const gap = gapById.get(p.gapId)
          if (!gap) return
          out.push(
            <GapNode
              key={`${i}-g${j}`}
              gapId={p.gapId}
              candidates={gap.candidates}
              correctText={gap.correctText}
              found={foundIds.has(`gap:${p.gapId}`)}
              wrongFlash={wrongFlashId === `gap:${p.gapId}`}
              active={activeIds.has(`gap:${p.gapId}`)}
              onPick={handleGapPick}
              onBlocked={handleBlocked}
              locale={locale}
            />,
          )
        }
      })
    })
    return out
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
          ← {locale === 'zh' ? '返回章节' : 'Back'}
        </button>
        <span className="rounded-lg border border-cyan-600/40 bg-cyan-50 px-3 py-1.5 font-mono text-xs font-semibold tracking-widest text-cyan-800">
          {MODE_LABEL[locale][mode]}
        </span>
        <span className="text-sm text-slate-600">{chapterTitle}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-sm text-cyan-700">
            {foundCount}/{total}
          </span>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-panel-2">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            />
          </div>
        </div>
      </div>

      {/* 目标栏：串行单目标——一次只让你找一样 */}
      <ObjectiveBar
        mode={mode}
        steps={steps}
        currentStepIdx={stepIdx}
        correctTargets={targets}
        foundIds={foundIds}
        locale={locale}
      />

      {/* 正文扫描区 */}
      <motion.div
        layout
        ref={containerRef}
        className={`relative overflow-visible rounded-2xl border bg-panel p-6 sm:p-8 ${
          isFinishedView ? 'border-gold/50' : 'border-line'
        }`}
      >
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        {!isFinishedView && <div className="scanline" />}
        {isFinishedView && <div className="pointer-events-none absolute inset-0 bg-gold/5" />}

        <p className="relative mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          {locale === 'zh' ? '待扫描的文本' : 'TEXT TO SCAN'}
        </p>

        <p className="relative text-[17px] leading-[2.05] text-slate-700">{renderBody()}</p>

        {/* 理由 → 结论 连线层 */}
        {level.correctChain && level.correctChain.length > 0 && (
          <XrayChainArrows containerRef={containerRef} chain={level.correctChain} foundIds={foundIds} />
        )}

        <div className="relative mt-5 flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-xray" />
          {isFinishedView
            ? locale === 'zh'
              ? '论证结构已全部还原 ✓'
              : 'Argument fully restored ✓'
            : MODE_TIP[locale][mode]}
        </div>
      </motion.div>

      {/* 考古挖掘区（dig 模式） */}
      {mode === 'dig' && level.hiddenNodes.length > 0 && (
        <DigSite
          hiddenNodes={level.hiddenNodes}
          foundIds={foundIds}
          activeNodeIds={activeIds}
          onUnearth={handleUnearth}
          onBlocked={handleBlocked}
          locale={locale}
        />
      )}

      {/* 图例 */}
      <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
        {['conclusion', 'reason', 'assumption', 'omission'].map((t) => (
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
          className="rounded-lg border border-line px-4 py-2 text-sm text-slate-600 transition hover:bg-panel-2 hover:text-slate-900"
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
