// 证词信誉血条：深红渐变，命中掉血时宽度收缩 + 数值跳动。
import { motion } from 'framer-motion'
import type { Locale } from '../../schema/levelTypes'
import { COURT_UI } from './courtI18n'

interface Props {
  value: number
  max: number
  /** 濒临崩溃（<=0 且未通关）时提示 */
  collapsed: boolean
  locale: Locale
}

export default function CredibilityBar({ value, max, collapsed, locale }: Props) {
  const t = COURT_UI[locale]
  const pct = Math.max(0, Math.min(100, (value / max) * 100))

  return (
    <div className="relative">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">
          ❤️‍🔥 {t.credibilityLabel}
        </span>
        <span className="font-mono text-sm font-bold text-court">
          {Math.round(value)}
          <span className="text-slate-400">/{max}</span>
        </span>
      </div>
      <div className="h-3.5 overflow-hidden rounded-full border border-court/30 bg-panel-2">
        <motion.div
          className={`h-full rounded-full ${
            pct <= 30 ? 'bg-gradient-to-r from-red-900 to-court' : 'bg-gradient-to-r from-court-deep to-court'
          }`}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
        />
      </div>
      {collapsed && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-center text-xs font-semibold text-court-deep"
        >
          {t.collapseHint}
        </motion.p>
      )}
    </div>
  )
}
