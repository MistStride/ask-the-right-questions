// 统一反馈弹层：所有引擎的「答对 / 答错」都走这里，保证跨引擎操作手感一致。
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useUiStore, type ToastTone } from '../store/uiStore'

const TONES: Record<
  ToastTone,
  { border: string; bg: string; icon: string; text: string; shadow: string }
> = {
  success: {
    border: 'border-cyan-600/40',
    bg: 'bg-white/95',
    icon: '✓',
    text: 'text-cyan-700',
    shadow: 'shadow-[0_10px_30px_rgba(30,90,110,0.18)]',
  },
  error: {
    border: 'border-rose-500/40',
    bg: 'bg-white/95',
    icon: '✗',
    text: 'text-rose-600',
    shadow: 'shadow-[0_10px_30px_rgba(160,50,70,0.16)]',
  },
  info: {
    border: 'border-amber-500/40',
    bg: 'bg-white/95',
    icon: '⛏',
    text: 'text-amber-700',
    shadow: 'shadow-[0_10px_30px_rgba(120,95,45,0.16)]',
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
            <span className="text-slate-800">{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
