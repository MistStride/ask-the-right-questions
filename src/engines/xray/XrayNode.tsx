// 单个可点击锚点节点：未点=灰色可悬停；点对=青色点亮+标签；点错=红闪抖动。
import { motion } from 'framer-motion'
import type { Locale, NodeType } from '../../schema/levelTypes'
import { NODE_TYPE_LABELS, NODE_VISUALS } from './xrayNodeMeta'

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
