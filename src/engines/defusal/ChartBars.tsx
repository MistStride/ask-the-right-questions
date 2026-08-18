// 引擎D 数据拆弹：手写 SVG 柱状图。
// - Y 轴起点被人为抬高（yAxis.start ≠ yAxis.min）→ 柱子"虚高"，这是核心陷阱
// - 拆弹成功：该柱高度过渡到真实值（按 yAxis.min 绘制）+ 变色 + ✓ 标签
// - 全部拆除：整图剥落（所有柱翻新 + Y 轴刻度切换为真实范围）
import { motion } from 'framer-motion'
import type { Locale } from '../../schema/levelTypes'
import { DEFUSE_UI } from './defusalI18n'

interface BarDatum {
  label: string
  value: number
}

interface SpotView {
  spotId: string
  barIndex: number
  isTrap: boolean
}

interface Props {
  data: BarDatum[]
  yAxis: { min: number; max: number; start: number }
  spots: SpotView[]
  defused: Set<string>
  wrongPoked: Set<string>
  onTapSpot: (spotId: string) => void
  locale: Locale
}

const VB_W = 480
const VB_H = 320
const ML = 52 // Y 轴刻度区
const MR = 18
const MT = 46 // 可疑点空间
const MB = 38 // label 区

function ratioOf(value: number, base: number, span: number): number {
  if (span <= 0) return 0
  return Math.max(0, Math.min(1, (value - base) / span))
}

export default function ChartBars({ data, yAxis, spots, defused, wrongPoked, onTapSpot, locale }: Props) {
  const t = DEFUSE_UI[locale]
  const n = data.length
  const plotW = VB_W - ML - MR
  const plotH = VB_H - MT - MB
  const slot = plotW / n
  const barW = slot * 0.58
  const bottom = MT + plotH

  const allDefused = spots.filter((s) => s.isTrap).every((s) => defused.has(s.spotId))
  // 被动手脚的显示跨度：start..max；真实跨度：min..max
  const fakeSpan = yAxis.max - yAxis.start
  const realSpan = yAxis.max - yAxis.min

  const barY = (i: number, real: boolean) => {
    const v = data[i].value
    const ratio = real ? ratioOf(v, yAxis.min, realSpan) : ratioOf(v, yAxis.start, fakeSpan)
    return bottom - ratio * plotH
  }

  const spotForBar = (i: number) => spots.filter((s) => s.barIndex === i)

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="block w-full" role="img" aria-label={t.objective(0)}>
        {/* 网格线 */}
        {[0, 0.25, 0.5, 0.75, 1].map((r) => (
          <line
            key={r}
            x1={ML}
            x2={VB_W - MR}
            y1={bottom - r * plotH}
            y2={bottom - r * plotH}
            stroke="#e6dfd0"
            strokeWidth={1}
            strokeDasharray={r === 0 ? undefined : '4 4'}
          />
        ))}

        {/* Y 轴刻度：全部拆完才显示真实范围（min..max），否则显示动手脚后的范围（start..max） */}
        {allDefused ? (
          <>
            <text x={ML - 8} y={MT - 2} textAnchor="end" fontSize={11} fill="#16a34a" fontWeight={700}>
              {yAxis.max}
            </text>
            <text x={ML - 8} y={bottom + 2} textAnchor="end" fontSize={11} fill="#16a34a" fontWeight={700}>
              {yAxis.min}
            </text>
          </>
        ) : (
          <>
            <text x={ML - 8} y={MT - 2} textAnchor="end" fontSize={11} fill="#ea580c" fontWeight={700}>
              {yAxis.max}
            </text>
            <text x={ML - 8} y={bottom + 2} textAnchor="end" fontSize={11} fill="#ea580c" fontWeight={700}>
              {yAxis.start}
            </text>
          </>
        )}

        {/* 柱子 */}
        {data.map((_, i) => {
          const isDefused = defused.has(spots.find((s) => s.barIndex === i && s.isTrap)?.spotId ?? '')
          const real = isDefused || allDefused
          const y = barY(i, real)
          const h = bottom - y
          const x = ML + i * slot + (slot - barW) / 2
          return (
            <motion.rect
              key={i}
              x={x}
              width={barW}
              initial={{ y: barY(i, false), height: bottom - barY(i, false) }}
              animate={{ y, height: h }}
              transition={{ type: 'spring', stiffness: 150, damping: 22 }}
              rx={5}
              fill={real ? '#16a34a' : '#f59e0b'}
              fillOpacity={real ? 0.85 : 0.75}
              stroke={real ? '#15803d' : '#d97706'}
              strokeWidth={1.5}
            />
          )
        })}

        {/* X 轴 label */}
        {data.map((d, i) => (
          <text
            key={`lb-${i}`}
            x={ML + i * slot + slot / 2}
            y={VB_H - 14}
            textAnchor="middle"
            fontSize={12}
            fill="#64748b"
          >
            {d.label}
          </text>
        ))}
      </svg>

      {/* 可疑点（绝对定位按钮） */}
      {!allDefused &&
        data.map((_, i) => {
          const sps = spotForBar(i)
          if (sps.length === 0) return null
          const defusedHere = sps.some((s) => defused.has(s.spotId))
          const wrongHere = sps.some((s) => wrongPoked.has(s.spotId))
          const topPct = (barY(i, false) / VB_H) * 100
          const leftPct = ((ML + i * slot + slot / 2) / VB_W) * 100
          if (defusedHere) {
            return (
              <motion.span
                key={`d-${i}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow"
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              >
                {t.defused}
              </motion.span>
            )
          }
          return (
            <motion.button
              key={`s-${i}`}
              type="button"
              onClick={() => onTapSpot(sps[0].spotId)}
              animate={wrongHere ? { scale: 1, opacity: 0.45 } : { scale: [1, 1.12, 1], opacity: 1 }}
              transition={wrongHere ? {} : { scale: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' } }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-defuse bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-defuse shadow"
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              title={wrongHere ? t.wrongHint : t.suspect}
            >
              {wrongHere ? '💥' : '⚡'}
            </motion.button>
          )
        })}
    </div>
  )
}
