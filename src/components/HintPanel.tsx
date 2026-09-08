// 分级提示面板：从「方向」到「直接圈出」，鼓励先自己思考。
// difficulty 接入：D2/D3 每展开一条提示会扣分（扣分比例见 utils/hintPolicy.ts），
// 展开前先展示代价，展开后通过 onUsedChange 通知父级结算。
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Locale } from '../schema/levelTypes'
import { hintCostFor } from '../utils/hintPolicy'

interface Props {
  hints: string[]
  locale: Locale
  /** 关卡难度（1/2/3）。决定每条提示的扣分代价与可用条数上限。 */
  difficulty?: number
  /** 每次展开一条提示后回调当前已用条数（用于父级结算扣分）。 */
  onUsedChange?: (used: number) => void
}

const LABELS = {
  zh: { hint: '提示', used: '已用提示', exhausted: '提示已用完，靠你了', cost: '展开将扣' },
  en: { hint: 'Hint', used: 'hints used', exhausted: 'No more hints — you got this', cost: 'costs' },
}

export default function HintPanel({ hints, locale, difficulty = 1, onUsedChange }: Props) {
  const [shown, setShown] = useState(0)
  const label = LABELS[locale]
  const cost = hintCostFor(difficulty)
  // D3 只放 2 条可展开（更贵、更克制）；D1/D2 全部可展开
  const cap = difficulty >= 3 ? Math.min(2, hints.length) : hints.length
  const exhausted = shown >= cap
  const reveal = () => {
    const next = Math.min(cap, shown + 1)
    if (next === shown) return
    setShown(next)
    onUsedChange?.(next)
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={exhausted}
          onClick={reveal}
          className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition ${
            exhausted
              ? 'cursor-not-allowed border-line text-slate-400'
              : 'border-amber-500/50 bg-amber-100 text-amber-700 hover:bg-amber-200/70'
          }`}
        >
          💡 {label.hint}
          {cost > 0 && !exhausted && (
            <span className="ml-1.5 text-xs font-normal text-amber-600/90">
              −{cost}分/条
            </span>
          )}
        </button>
        {shown > 0 && (
          <span className="text-xs text-slate-500">
            {label.used} {shown}/{cap}
          </span>
        )}
        {exhausted && <span className="text-xs text-slate-500">{label.exhausted}</span>}
        {cost > 0 && shown === 0 && (
          <span className="text-xs text-slate-400">（{label.cost} {cost} 分）</span>
        )}
      </div>
      <AnimatePresence initial={false}>
        {hints.slice(0, shown).map((h, i) => (
          <motion.div
            key={`${shown}-${i}`}
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="mt-2 rounded-lg border border-line bg-panel-2 px-3.5 py-2.5 text-sm text-slate-700">
              <span className="mr-2 text-amber-600">#{i + 1}</span>
              {h}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
