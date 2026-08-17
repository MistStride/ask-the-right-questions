// 目标栏（串行模式）：一关拆成多步，一步只找一个目标。
// 步骤条显示进度；当前步目标高亮（脉冲），已完成打勾置灰，未来步骤锁定（🔒）。
// 找错类型会被判错并提示当前目标——玩家始终只被要求做一件事。
import { motion } from 'framer-motion'
import { NODE_TYPE_LABELS } from './XrayNode'
import type { Locale, NodeType, XrayAnchor, XrayMode, XrayStepRef } from '../../schema/levelTypes'

const OBJECTIVE: Record<XrayMode, { zh: string; en: string }> = {
  scan: {
    zh: '一步步找出论证的骨架：先结论，再理由',
    en: 'Map the argument step by step: conclusion first, then reasons',
  },
  dig: {
    zh: '先扫出结论与理由，最后挖出隐藏假设',
    en: 'Scan for the conclusion and reason, then dig out the hidden assumption',
  },
  gap: {
    zh: '先点出结论与理由，最后补上被省略的关键信息',
    en: 'Map the conclusion and reason, then patch the omitted key info',
  },
}

interface Props {
  mode: XrayMode
  steps: XrayStepRef[]
  currentStepIdx: number
  correctTargets: XrayAnchor[]
  foundIds: Set<string>
  locale: Locale
}

export default function ObjectiveBar({
  mode,
  steps,
  currentStepIdx,
  correctTargets,
  foundIds,
  locale,
}: Props) {
  const typeById = new Map<string, NodeType>()
  for (const t of correctTargets) typeById.set(t.nodeId, t.type)

  const stepLabels: string[] = steps.map((step) => {
    const types = new Set<string>()
    for (const id of step.targets) {
      const type = typeById.get(id)
      if (type) types.add(NODE_TYPE_LABELS[type][locale])
    }
    return [...types].join(' + ')
  })

  const current = steps[currentStepIdx]
  const stepTotal = steps.length
  const heading = locale === 'zh' ? '本关目标' : 'Objective'
  const stepText = locale === 'zh' ? '步骤' : 'Step'
  const doneText = locale === 'zh' ? '已完成' : 'done'

  // 当前步骤内已找到数
  const currentFound = current.targets.filter((id) => foundIds.has(id)).length

  return (
    <div className="mb-4 rounded-2xl border border-amber-500/40 bg-white p-4 shadow-[0_4px_16px_rgba(120,95,45,0.1)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base">🎯</span>
        <p className="text-sm font-bold text-slate-800">{heading}</p>
        <span className="mx-1 h-4 w-px bg-line" />
        <p className="text-xs leading-relaxed text-slate-500">{OBJECTIVE[mode][locale]}</p>
        {/* 步骤条 */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="mr-1 font-mono text-xs text-slate-500">
            {stepText} {currentStepIdx + 1}/{stepTotal}
          </span>
          {steps.map((s, i) => (
            <span
              key={s.stepId}
              className={`h-1.5 w-6 rounded-full transition ${
                i < currentStepIdx
                  ? 'bg-emerald-500'
                  : i === currentStepIdx
                    ? 'bg-gold shadow-[0_0_6px_rgba(217,154,30,0.5)]'
                    : 'bg-line'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 当前步骤目标：一次只让你找这一个 */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <motion.span
          key={current.stepId}
          initial={{ opacity: 0.5, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-600 bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900"
        >
          <span>👉</span>
          <span>
            {locale === 'zh' ? '现在要找：' : 'Find now: '}
            {stepLabels[currentStepIdx]}
          </span>
          {current.targets.length > 1 && (
            <span className="font-mono">
              {currentFound}/{current.targets.length}
            </span>
          )}
        </motion.span>

        {/* 后续步骤（锁定预览） */}
        {steps.slice(currentStepIdx + 1).map((s, i) => {
          const label = stepLabels[currentStepIdx + 1 + i]
          return (
            <span
              key={s.stepId}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-panel-2 px-3 py-1 text-xs text-slate-400"
            >
              🔒 {label}
            </span>
          )
        })}

        {/* 已完成步骤 */}
        {steps.slice(0, currentStepIdx).map((s, i) => (
          <span
            key={s.stepId}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-500/50 bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
          >
            ✓ {stepLabels[i]} <span className="opacity-70">{doneText}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
