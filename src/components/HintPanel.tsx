// 分级提示面板：从「方向」到「直接圈出」，鼓励先自己思考。
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Locale } from '../schema/levelTypes'

interface Props {
  hints: string[]
  locale: Locale
}

const LABELS = {
  zh: { hint: '提示', used: '已用提示', exhausted: '提示已用完，靠你了' },
  en: { hint: 'Hint', used: 'hints used', exhausted: 'No more hints — you got this' },
}

export default function HintPanel({ hints, locale }: Props) {
  const [shown, setShown] = useState(0)
  const label = LABELS[locale]
  const exhausted = shown >= hints.length

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={exhausted}
          onClick={() => setShown((s) => Math.min(hints.length, s + 1))}
          className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition ${
            exhausted
              ? 'cursor-not-allowed border-line text-slate-400'
              : 'border-amber-500/50 bg-amber-100 text-amber-700 hover:bg-amber-200/70'
          }`}
        >
          💡 {label.hint}
        </button>
        {shown > 0 && (
          <span className="text-xs text-slate-500">
            {label.used} {shown}/{hints.length}
          </span>
        )}
        {exhausted && <span className="text-xs text-slate-500">{label.exhausted}</span>}
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
