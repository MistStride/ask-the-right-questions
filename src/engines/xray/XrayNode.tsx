// 单个可点击锚点节点：未点=灰色可悬停；点对=青色点亮+标签；点错=红闪抖动。
import { motion } from 'framer-motion'
import type { Locale, NodeType } from '../../schema/levelTypes'

export const NODE_VISUALS: Record<NodeType, { emoji: string; hover: string; found: string; label: string }> = {
  conclusion: {
    emoji: '🚩',
    hover: 'hover:bg-cyan-400/15 hover:text-cyan-200 hover:shadow-[0_0_18px_rgba(34,211,238,0.25)]',
    found: 'bg-cyan-400/20 text-cyan-100 border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.35)]',
    label: 'conclusion',
  },
  reason: {
    emoji: '⛓️',
    hover: 'hover:bg-sky-400/15 hover:text-sky-200 hover:shadow-[0_0_18px_rgba(56,189,248,0.25)]',
    found: 'bg-sky-400/20 text-sky-100 border-sky-400/60 shadow-[0_0_20px_rgba(56,189,248,0.35)]',
    label: 'reason',
  },
  assumption: {
    emoji: '⛏️',
    hover: 'hover:bg-violet-400/15 hover:text-violet-200 hover:shadow-[0_0_18px_rgba(167,139,250,0.25)]',
    found: 'bg-violet-400/20 text-violet-100 border-violet-400/60 shadow-[0_0_20px_rgba(167,139,250,0.35)]',
    label: 'assumption',
  },
  fallacy: {
    emoji: '⚡',
    hover: 'hover:bg-rose-400/15 hover:text-rose-200 hover:shadow-[0_0_18px_rgba(251,113,133,0.25)]',
    found: 'bg-rose-400/20 text-rose-100 border-rose-400/60 shadow-[0_0_20px_rgba(251,113,133,0.35)]',
    label: 'fallacy',
  },
  omission: {
    emoji: '🕳️',
    hover: 'hover:bg-amber-400/15 hover:text-amber-200 hover:shadow-[0_0_18px_rgba(251,191,36,0.25)]',
    found: 'bg-amber-400/20 text-amber-100 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.35)]',
    label: 'omission',
  },
  ambiguous_term: {
    emoji: '💠',
    hover: 'hover:bg-fuchsia-400/15 hover:text-fuchsia-200 hover:shadow-[0_0_18px_rgba(232,121,249,0.25)]',
    found: 'bg-fuchsia-400/20 text-fuchsia-100 border-fuchsia-400/60 shadow-[0_0_20px_rgba(232,121,249,0.35)]',
    label: 'ambiguous',
  },
}

export const NODE_TYPE_LABELS: Record<NodeType, { zh: string; en: string }> = {
  conclusion: { zh: '结论', en: 'Conclusion' },
  reason: { zh: '理由', en: 'Reason' },
  assumption: { zh: '隐藏假设', en: 'Assumption' },
  fallacy: { zh: '逻辑谬误', en: 'Fallacy' },
  omission: { zh: '被遗漏的信息', en: 'Omission' },
  ambiguous_term: { zh: '歧义词', en: 'Ambiguous term' },
}

interface Props {
  nodeId: string
  text: string
  type: NodeType
  isCorrect: boolean
  found: boolean
  wrongFlash: boolean
  onClick: () => void
  locale: Locale
}

export default function XrayNode({ nodeId, text, type, isCorrect, found, wrongFlash, onClick, locale }: Props) {
  const v = NODE_VISUALS[type]

  if (found) {
    return (
      <motion.span
        data-node-id={nodeId}
        initial={{ scale: 0.92, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 20 }}
        className={`mx-0.5 inline rounded-md border px-1 py-0.5 font-medium ${v.found}`}
      >
        <span className="mr-0.5">{v.emoji}</span>
        {text}
        <span className="ml-1 rounded bg-black/30 px-1 text-[10px] uppercase tracking-wide">
          {NODE_TYPE_LABELS[type][locale]}
        </span>
      </motion.span>
    )
  }

  return (
    <motion.span
      key={wrongFlash ? `flash-${text}` : `idle-${text}`}
      animate={
        wrongFlash
          ? { x: [0, -5, 5, -4, 4, 0], backgroundColor: 'rgba(244,63,94,0.22)' }
          : { x: 0, backgroundColor: 'rgba(34,211,238,0)' }
      }
      transition={wrongFlash ? { duration: 0.45 } : { duration: 0.25 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={`anchor-hover inline border-b border-dashed text-slate-300 ${v.hover} ${
        isCorrect ? 'border-cyan-400/60' : 'border-slate-500/40'
      }`}
    >
      {text}
    </motion.span>
  )
}
