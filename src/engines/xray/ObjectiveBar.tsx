// 目标栏：进入关卡即明确「本关要找什么」，找到的自动打勾，未找到的高亮提示。
// 解决"不知道要做什么、只能乱点"的引导问题。
import { motion } from 'framer-motion'
import { NODE_TYPE_LABELS, NODE_VISUALS } from './XrayNode'
import type { Locale, NodeType, XrayAnchor, XrayMode } from '../../schema/levelTypes'

const OBJECTIVE: Record<XrayMode, { zh: string; en: string }> = {
  scan: {
    zh: '找出这段论证的【结论】和支撑它的【理由】',
    en: 'Find the conclusion and its supporting reasons',
  },
  dig: {
    zh: '先扫出【结论】和【理由】，再挖出埋在土里的【隐藏假设】',
    en: 'Scan for the conclusion and reason, then dig out the hidden assumption',
  },
  gap: {
    zh: '点出【结论】和【理由】，再补上被撕掉的关键信息',
    en: 'Map the conclusion and reason, then patch the torn key info',
  },
}

interface Props {
  mode: XrayMode
  correctTargets: XrayAnchor[]
  foundIds: Set<string>
  locale: Locale
}

export default function ObjectiveBar({ mode, correctTargets, foundIds, locale }: Props) {
  // 按节点类型统计 总数/已找到
  const stats = new Map<NodeType, { total: number; found: number }>()
  for (const t of correctTargets) {
    const s = stats.get(t.type) ?? { total: 0, found: 0 }
    s.total += 1
    if (foundIds.has(t.nodeId)) s.found += 1
    stats.set(t.type, s)
  }

  const chips = [...stats.entries()]
    .map(([type, s]) => ({ type, ...s }))
    // 未完成的排前面（引导玩家先关注没找到的）
    .sort((a, b) => {
      const aDone = a.found >= a.total ? 1 : 0
      const bDone = b.found >= b.total ? 1 : 0
      return aDone - bDone
    })

  const heading = locale === 'zh' ? '本关目标' : 'Objective'

  return (
    <div className="mb-4 rounded-2xl border border-amber-500/40 bg-white p-4 shadow-[0_4px_16px_rgba(120,95,45,0.1)]">
      <div className="flex items-center gap-2">
        <span className="text-base">🎯</span>
        <p className="text-sm font-bold text-slate-800">{heading}</p>
        <span className="mx-1 h-4 w-px bg-line" />
        <p className="text-xs leading-relaxed text-slate-500">{OBJECTIVE[mode][locale]}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip) => {
          const v = NODE_VISUALS[chip.type]
          const done = chip.found >= chip.total
          const label = NODE_TYPE_LABELS[chip.type][locale]
          const showCount = chip.total > 1 || chip.type === 'omission'
          return (
            <motion.span
              key={chip.type}
              layout
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                done
                  ? 'border-line bg-panel-2 text-slate-400 line-through decoration-slate-300'
                  : chip.found > 0
                    ? 'border-amber-500/60 bg-amber-50 text-amber-800'
                    : 'border-amber-600/70 bg-amber-100 text-amber-900'
              }`}
            >
              <span>{v.emoji}</span>
              <span>{label}</span>
              {showCount && (
                <span className="font-mono">
                  {chip.found}/{chip.total}
                </span>
              )}
              {done && <span>✓</span>}
              {!done && chip.found === 0 && (
                <span className="ml-0.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-600" />
              )}
            </motion.span>
          )
        })}
      </div>
    </div>
  )
}
