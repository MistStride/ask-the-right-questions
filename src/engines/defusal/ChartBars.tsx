// 引擎D 数据拆弹：手写 SVG 柱状图。
// - 热点按语义落在真实位置：axis=纵轴、bar=单柱、comparison=两柱比较区
// - 纵轴拆弹成功：整图切回真实基线；单柱拆弹：该柱恢复；比较陷阱保留柱形并揭示解读问题
// - 全部拆除：整图剥落（所有柱翻新 + Y 轴刻度切换为真实范围）
import { motion } from 'framer-motion'
import type { Locale } from '../../schema/levelTypes'
import { DEFUSE_UI } from './defusalI18n'

interface BarDatum {
  label: string
  value: number
}

type SpotTarget =
  | { type: 'axis' }
  | { type: 'bar'; barIndex: number }
  | { type: 'comparison'; barIndices: [number, number] }

interface SpotView {
  spotId: string
  target: SpotTarget
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

  const axisTrap = spots.find((spot) => spot.isTrap && spot.target.type === 'axis')
  const axisCorrected = allDefused || Boolean(axisTrap && defused.has(axisTrap.spotId))
  const centerX = (index: number) => ML + index * slot + slot / 2

  const positionFor = (spot: SpotView) => {
    if (spot.target.type === 'axis') {
      return { left: ((ML - 25) / VB_W) * 100, top: ((MT + plotH / 2) / VB_H) * 100 }
    }
    if (spot.target.type === 'comparison') {
      const [first, second] = spot.target.barIndices
      const x = (centerX(first) + centerX(second)) / 2
      const y = Math.max(MT + 18, Math.min(bottom - 22, Math.min(barY(first, false), barY(second, false)) - 18))
      return { left: (x / VB_W) * 100, top: (y / VB_H) * 100 }
    }
    return {
      left: (centerX(spot.target.barIndex) / VB_W) * 100,
      top: (barY(spot.target.barIndex, false) / VB_H) * 100,
    }
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="block w-full"
        role="img"
        aria-label={locale === 'zh' ? '可交互数据图表' : 'Interactive data chart'}
      >
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
        {axisCorrected ? (
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
          const barTrap = spots.find((spot) => spot.isTrap && spot.target.type === 'bar' && spot.target.barIndex === i)
          const isDefused = Boolean(barTrap && defused.has(barTrap.spotId))
          const real = isDefused || axisCorrected
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
        spots.map((spot) => {
          const defusedHere = defused.has(spot.spotId)
          const wrongHere = wrongPoked.has(spot.spotId)
          const position = positionFor(spot)
          const locationLabel = spot.target.type === 'axis'
            ? locale === 'zh' ? '纵轴' : 'Y axis'
            : spot.target.type === 'comparison'
              ? locale === 'zh' ? '比较' : 'compare'
              : ''
          if (defusedHere) {
            return (
              <motion.span
                key={`d-${spot.spotId}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow"
                style={{ left: `${position.left}%`, top: `${position.top}%` }}
              >
                {t.defused}
              </motion.span>
            )
          }
          return (
            <motion.button
              key={`s-${spot.spotId}`}
              data-spot-id={spot.spotId}
              data-target-type={spot.target.type}
              type="button"
              onClick={() => onTapSpot(spot.spotId)}
              animate={{ opacity: wrongHere ? 0.45 : 1 }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-defuse bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-defuse shadow ${wrongHere ? '' : 'animate-pulse'}`}
              style={{ left: `${position.left}%`, top: `${position.top}%` }}
              title={wrongHere ? t.wrongHint : t.suspect}
            >
              {wrongHere ? '💥' : '⚡'}{locationLabel && <span className="ml-0.5">{locationLabel}</span>}
            </motion.button>
          )
        })}
    </div>
  )
}
