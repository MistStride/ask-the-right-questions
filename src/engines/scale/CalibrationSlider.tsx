// 引擎C 校准滑块：原生 range + 热度渐晕 + 接近度指示条。
// 合理区边界不显示，只靠"热度"（thumb 光晕 + 指示条颜色）引导玩家。
import { motion } from 'framer-motion'
import type { Locale } from '../../schema/levelTypes'
import { SCALE_UI } from './scaleI18n'

interface Props {
  value: number
  heat: number
  /** 最近一次判定结果（inRange 时触发靶心波纹） */
  burstKey: number
  labels: [string, string]
  onChange: (v: number) => void
  /** 松手/键盘松开时判定 */
  onRelease: (v: number) => void
  locale: Locale
}

/** 热度 → 颜色：红 → 橙 → 绿 → 金 */
function heatColor(h: number): string {
  if (h < 0.3) return '#e11d48' // 红
  if (h < 0.6) return '#ea580c' // 橙
  if (h < 0.85) return '#16a34a' // 绿
  return '#d99a1e' // 金
}

export default function CalibrationSlider({ value, heat, burstKey, labels, onChange, onRelease, locale }: Props) {
  const t = SCALE_UI[locale]
  const color = heatColor(heat)
  const pct = heat * 100

  return (
    <div className="relative">
      <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-600">
        <span>{labels[0]}</span>
        <span className="font-mono text-scale">{value}</span>
        <span>{labels[1]}</span>
      </div>

      {/* 滑块轨道 */}
      <div className="relative">
        {/* 靶心波纹（命中时） */}
        {burstKey > 0 && (
          <motion.div
            key={burstKey}
            className="pointer-events-none absolute top-1/2 z-10 -translate-y-1/2"
            style={{ left: `${value}%`, marginLeft: -14 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute left-0 top-0 h-7 w-7 rounded-full border-2 border-gold"
                initial={{ scale: 0.4, opacity: 0.9 }}
                animate={{ scale: 1.6 + i * 0.9, opacity: 0 }}
                transition={{ duration: 0.9, delay: i * 0.15, ease: 'easeOut' }}
              />
            ))}
            <motion.span
              className="absolute left-1 top-1 h-5 w-5 rounded-full bg-gold/50"
              initial={{ scale: 0.3, opacity: 1 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </motion.div>
        )}

        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerUp={() => onRelease(value)}
          onKeyUp={() => onRelease(value)}
          className="scale-slider relative z-20 block w-full"
          style={
            {
              '--heat-color': color,
            } as React.CSSProperties
          }
        />
      </div>

      {/* 接近度指示条：实时热度反馈 */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] text-slate-400">{t.heatLabel}</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel-2">
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${pct}%`, backgroundColor: color }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          />
        </div>
      </div>
    </div>
  )
}
