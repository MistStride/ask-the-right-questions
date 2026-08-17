// 统一反馈弹层：所有引擎的「答对 / 答错」都走这里，保证跨引擎操作手感一致。
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useUiStore, type ToastTone } from '../store/uiStore'

const TONES: Record<
  ToastTone,
  { border: string; bg: string; icon: string; text: string; shadow: string }
> = {
  success: {
    border: 'border-cyan-400/60',
    bg: 'bg-[#0d2136]/95',
    icon: '✓',
    text: 'text-cyan-300',
    shadow: 'shadow-[0_0_28px_rgba(34,211,238,0.25)]',
  },
  error: {
    border: 'border-rose-500/60',
    bg: 'bg-[#2b1220]/95',
    icon: '✗',
    text: 'text-rose-300',
    shadow: 'shadow-[0_0_28px_rgba(244,63,94,0.22)]',
  },
  info: {
    border: 'border-amber-400/60',
    bg: 'bg-[#2a200e]/95',
    icon: '⛏',
    text: 'text-amber-300',
    shadow: 'shadow-[0_0_28px_rgba(245,185,66,0.2)]',
  },
}

export default function FeedbackToast() {
  const { message, tone, id, hideToast } = useUiStore()

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(hideToast, 2400)
    return () => window.clearTimeout(timer)
  }, [message, id, hideToast])

  const t = TONES[tone]

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={id}
            initial={{ y: -28, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -18, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium backdrop-blur-md ${t.border} ${t.bg} ${t.shadow}`}
          >
            <span className={`text-base font-bold ${t.text}`}>{t.icon}</span>
            <span className="text-slate-100">{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
