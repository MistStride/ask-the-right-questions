// 单个可点击锚点节点：未点=灰色可悬停；点对=青色点亮+标签；点错=红闪抖动。
import { motion } from 'framer-motion'
import type { Locale, NodeType } from '../../schema/levelTypes'

export const NODE_VISUALS: Record<NodeType, { emoji: string; hover: string; found: string; label: string }> = {
  conclusion: {
    emoji: '🚩',
    hover: 'hover:bg-cyan-50 hover:text-cyan-700 hover:shadow-[0_0_0_1px_rgba(14,116,144,0.25)]',
    found: 'bg-cyan-100 text-cyan-800 border-cyan-300 shadow-[0_0_0_1px_rgba(14,116,144,0.18)]',
    label: 'conclusion',
  },
  reason: {
    emoji: '⛓️',
    hover: 'hover:bg-sky-50 hover:text-sky-700 hover:shadow-[0_0_0_1px_rgba(2,132,199,0.25)]',
    found: 'bg-sky-100 text-sky-800 border-sky-300 shadow-[0_0_0_1px_rgba(2,132,199,0.18)]',
    label: 'reason',
  },
  assumption: {
    emoji: '⛏️',
    hover: 'hover:bg-violet-50 hover:text-violet-700 hover:shadow-[0_0_0_1px_rgba(109,40,217,0.25)]',
    found: 'bg-violet-100 text-violet-800 border-violet-300 shadow-[0_0_0_1px_rgba(109,40,217,0.18)]',
    label: 'assumption',
  },
  fallacy: {
    emoji: '⚡',
    hover: 'hover:bg-rose-50 hover:text-rose-700 hover:shadow-[0_0_0_1px_rgba(225,29,72,0.25)]',
    found: 'bg-rose-100 text-rose-800 border-rose-300 shadow-[0_0_0_1px_rgba(225,29,72,0.18)]',
    label: 'fallacy',
  },
  omission: {
    emoji: '🕳️',
    hover: 'hover:bg-amber-50 hover:text-amber-700 hover:shadow-[0_0_0_1px_rgba(180,118,15,0.25)]',
    found: 'bg-amber-100 text-amber-800 border-amber-300 shadow-[0_0_0_1px_rgba(180,118,15,0.18)]',
    label: 'omission',
  },
  ambiguous_term: {
    emoji: '💠',
    hover: 'hover:bg-fuchsia-50 hover:text-fuchsia-700 hover:shadow-[0_0_0_1px_rgba(192,38,211,0.25)]',
    found: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300 shadow-[0_0_0_1px_rgba(192,38,211,0.18)]',
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
        <span className="ml-1 rounded bg-white/70 px-1 text-[10px] uppercase tracking-wide opacity-80">
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
          ? { x: [0, -5, 5, -4, 4, 0], backgroundColor: 'rgba(225,29,72,0.16)' }
          : { x: 0, backgroundColor: 'rgba(14,116,144,0)' }
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
      className={`anchor-hover inline border-b border-dashed text-slate-600 ${v.hover} ${
        isCorrect ? 'border-cyan-600/50' : 'border-slate-400/50'
      }`}
    >
      {text}
    </motion.span>
  )
}
