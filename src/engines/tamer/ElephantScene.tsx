// 引擎E 大象场景：🐘 动画 + 躁动度情绪条。
// 躁动（进行中）：左右摇摆；安抚瞬间：金色光环；暴走：放大 + 红闪。
import { motion } from 'framer-motion'
import type { Locale } from '../../schema/levelTypes'
import { TAMER_UI } from './tamerI18n'

interface Props {
  rage: number
  calmKey: number
  raging: boolean
  locale: Locale
}

export default function ElephantScene({ rage, calmKey, raging, locale }: Props) {
  const t = TAMER_UI[locale]
  const pct = Math.max(0, Math.min(100, rage))

  return (
    <div className="relative flex flex-col items-center">
      {/* 大象 + 动画 */}
      <div className="relative flex h-36 w-36 items-center justify-center">
        {/* 安抚光环（每次安抚触发一次） */}
        {calmKey > 0 && (
          <motion.div
            key={calmKey}
            className="absolute inset-0 rounded-full border-4 border-gold/70"
            initial={{ scale: 0.5, opacity: 0.9 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        )}
        {raging ? (
          <motion.div
            className="text-7xl"
            animate={{ scale: [1, 1.25, 1], rotate: [0, -6, 6, -4, 4, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            💢🐘
          </motion.div>
        ) : (
          <motion.div
            className="text-7xl"
            animate={
              rage > 40
                ? { x: [0, -7, 7, -5, 5, 0], rotate: [0, -2, 2, -1, 1, 0] }
                : { x: 0, rotate: 0 }
            }
            transition={
              rage > 40
                ? { duration: 0.45, repeat: Infinity }
                : { type: 'spring', stiffness: 200, damping: 20 }
            }
          >
            🐘
          </motion.div>
        )}
      </div>

      {/* 情绪条 */}
      <div className="mt-1 w-full max-w-xs">
        <div className="mb-1 flex justify-between text-[11px] text-slate-500">
          <span>❤️‍🔥 {t.rageLabel}</span>
          <span className="font-mono">{Math.round(pct)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full border border-line bg-panel-2">
          <motion.div
            className={`h-full rounded-full ${
              pct >= 70 ? 'bg-gradient-to-r from-red-700 to-red-500' : 'bg-gradient-to-r from-amber-500 to-tamer'
            }`}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 160, damping: 20 }}
          />
        </div>
      </div>
    </div>
  )
}
