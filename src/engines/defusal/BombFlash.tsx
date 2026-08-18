// 剪错线爆炸警示：全屏橙色红闪两次（不惩罚，纯视觉警示）。
import { motion } from 'framer-motion'

export default function BombFlash({ flashKey }: { flashKey: number }) {
  if (flashKey === 0) return null
  return (
    <motion.div
      key={flashKey}
      className="pointer-events-none fixed inset-0 z-40 bg-defuse/25"
      initial={{ opacity: 0.9 }}
      animate={{ opacity: [0.9, 0.15, 0.9, 0] }}
      transition={{ duration: 0.75, ease: 'easeOut' }}
      aria-hidden
    />
  )
}
