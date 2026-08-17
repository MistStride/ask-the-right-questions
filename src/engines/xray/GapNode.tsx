// 空洞节点（gap 模式）：正文中被撕掉的「关键信息」，点开候选补全。
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Locale } from '../../schema/levelTypes'

interface Props {
  gapId: string
  candidates: string[]
  correctText: string
  found: boolean
  wrongFlash: boolean
  onPick: (gapId: string, picked: string) => void
  locale: Locale
}

export default function GapNode({
  gapId,
  candidates,
  correctText,
  found,
  wrongFlash,
  onPick,
  locale,
}: Props) {
  const [open, setOpen] = useState(false)

  const labels =
    locale === 'zh'
      ? { hint: '这里少了什么？', patched: '已补全' }
      : { hint: 'What is missing here?', patched: 'Patched' }

  if (found) {
    return (
      <motion.span
        initial={{ scale: 0.9, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-amber-500/60 bg-amber-100 px-1.5 py-0.5 align-middle text-xs font-semibold text-amber-800"
      >
        🩹 {labels.patched}
      </motion.span>
    )
  }

  return (
    <span className="relative mx-0.5 inline-block align-middle">
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        animate={
          wrongFlash
            ? { x: [0, -4, 4, -3, 3, 0], backgroundColor: 'rgba(225,29,72,0.16)' }
            : { x: 0, backgroundColor: 'rgba(14,116,144,0)' }
        }
        transition={wrongFlash ? { duration: 0.45 } : { duration: 0.2 }}
        className="inline-flex items-center gap-1 rounded-md border border-dashed border-amber-500/60 px-2 py-0.5 text-sm font-bold text-amber-700 hover:bg-amber-100"
      >
        🕳️ ?
      </motion.button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute left-0 top-full z-20 mt-1.5 w-72 rounded-xl border border-line bg-white p-2 shadow-[0_8px_28px_rgba(90,72,40,0.18)]"
        >
          <p className="px-1.5 pb-1 text-[11px] font-medium text-amber-700">{labels.hint}</p>
          {candidates.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setOpen(false)
                onPick(gapId, c)
              }}
              className="block w-full rounded-lg px-2.5 py-2 text-left text-xs leading-relaxed text-slate-600 transition hover:bg-panel-2 hover:text-slate-900"
            >
              {c === correctText && <span className="mr-1 text-amber-600">★</span>}
              {c}
            </button>
          ))}
        </motion.div>
      )}
    </span>
  )
}
