// 全屏「💥 证词击碎！」爆裂特效：深红裂纹从中心辐射扩散 + 大字弹出。
import { motion } from 'framer-motion'
import type { Locale } from '../../schema/levelTypes'
import { COURT_UI } from './courtI18n'

interface Props {
  open: boolean
  locale: Locale
}

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315]

export default function CourtroomBurst({ open, locale }: Props) {
  if (!open) return null
  const t = COURT_UI[locale]
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-court/10 backdrop-blur-[2px]"
      aria-hidden
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {RAYS.map((a, i) => {
          const rad = (a * Math.PI) / 180
          return (
            <motion.line
              key={i}
              x1="200"
              y1="150"
              x2={200 + Math.cos(rad) * 300}
              y2={150 + Math.sin(rad) * 300}
              stroke="#b91c1c"
              strokeWidth="2"
              opacity="0.45"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.55, delay: i * 0.045 }}
            />
          )
        })}
      </svg>
      <div className="relative px-6 text-center">
        <motion.p
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
          className="text-6xl"
        >
          💥
        </motion.p>
        <motion.h2
          initial={{ y: 22, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.22, type: 'spring', stiffness: 220, damping: 18 }}
          className="mt-3 text-3xl font-black tracking-widest text-court"
        >
          {t.burstTitle}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-2 text-sm font-medium text-court-deep/80"
        >
          {t.burstSub}
        </motion.p>
      </div>
    </motion.div>
  )
}
