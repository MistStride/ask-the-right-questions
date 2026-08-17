// 六维思维雷达图 —— 手写 SVG 六边形，不引图表库
// 数据来自 progressStore.radar（0-100 每维），通关关卡点亮对应维度
// 生长动画：描边按 pathLength 画出 → 填色块从中心"长出来" → 顶点圆点逐个弹出
import { motion } from 'framer-motion'
import type { Locale, RadarDimension } from '../schema/levelTypes'

export const RADAR_DIMENSIONS: { key: RadarDimension; zh: string; en: string; icon: string }[] = [
  { key: 'structure', zh: '结构识别力', en: 'Structure', icon: '🧱' },
  { key: 'evidence', zh: '证据鉴别力', en: 'Evidence', icon: '🔎' },
  { key: 'assumption', zh: '假设挖掘力', en: 'Assumption', icon: '⛏️' },
  { key: 'fallacy', zh: '谬误免疫力', en: 'Fallacy', icon: '🛡️' },
  { key: 'data', zh: '数据免疫力', en: 'Data', icon: '🧮' },
  { key: 'emotion', zh: '情绪自控力', en: 'Emotion', icon: '🐘' },
]

const N = RADAR_DIMENSIONS.length
const CX = 180
const CY = 148
const R = 100
const LABEL_R = 128

/** 第 i 个轴（0=正上方，顺时针）在 ratio 比例处的坐标 */
function pt(i: number, ratio: number): [number, number] {
  const angle = (Math.PI * 2 * i) / N - Math.PI / 2
  return [CX + Math.cos(angle) * R * ratio, CY + Math.sin(angle) * R * ratio]
}

/** 标签锚点（六边形外侧） */
function labelPt(i: number): [number, number] {
  const angle = (Math.PI * 2 * i) / N - Math.PI / 2
  return [CX + Math.cos(angle) * LABEL_R, CY + Math.sin(angle) * LABEL_R]
}

const ANCHORS = ['middle', 'start', 'start', 'middle', 'end', 'end'] as const
const DYS = [-7, -8, 15, 17, 15, -8]

function pointsOf(ringRatio: number): string {
  return RADAR_DIMENSIONS.map((_, i) => {
    const [x, y] = pt(i, ringRatio)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

function dataPoints(values: Record<RadarDimension, number>): string {
  return RADAR_DIMENSIONS.map((d, i) => {
    const [x, y] = pt(i, values[d.key] / 100)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

interface RadarChartProps {
  values: Record<RadarDimension, number>
  locale: Locale
}

export default function RadarChart({ values, locale }: RadarChartProps) {
  const hasAny = RADAR_DIMENSIONS.some((d) => values[d.key] > 0)
  const poly = dataPoints(values)
  const pathD = `M ${poly} Z`

  return (
    <div>
      <svg
        viewBox="0 0 360 330"
        className="mx-auto block w-full max-w-[400px]"
        role="img"
        aria-label={locale === 'zh' ? '六维思维雷达图' : 'Six-dimension thinking radar'}
      >
        {/* 网格环：25% / 50% / 75% / 100% */}
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <polygon
            key={r}
            points={pointsOf(r)}
            fill="none"
            stroke="#e6dfd0"
            strokeWidth={r === 1 ? 1.4 : 1}
          />
        ))}
        {/* 轴线 */}
        {RADAR_DIMENSIONS.map((_, i) => {
          const [x, y] = pt(i, 1)
          return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#e6dfd0" strokeWidth={1} />
        })}
        {/* 维度标签（六边形外侧） */}
        {RADAR_DIMENSIONS.map((d, i) => {
          const [x, y] = labelPt(i)
          const active = values[d.key] > 0
          return (
            <text
              key={d.key}
              x={x}
              y={y}
              textAnchor={ANCHORS[i]}
              dy={DYS[i]}
              fontSize={12}
              fontWeight={active ? 700 : 400}
              fill={active ? '#3d3831' : '#b3a992'}
            >
              {d.icon} {d[locale]}
            </text>
          )
        })}
        {/* 数据多边形：描边生长 + 填色从中心长出 */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#d99a1e"
          strokeWidth={2.5}
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        />
        <motion.polygon
          points={poly}
          fill="rgba(217,154,30,0.16)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.3 }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />
        {/* 顶点圆点：逐个弹出 */}
        {RADAR_DIMENSIONS.map((d, i) => {
          const [x, y] = pt(i, values[d.key] / 100)
          return (
            <motion.circle
              key={d.key}
              cx={x}
              cy={y}
              r={3.4}
              fill="#d99a1e"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.07, type: 'spring', stiffness: 300, damping: 16 }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            />
          )
        })}
      </svg>

      {!hasAny && (
        <p className="mt-3 text-center text-xs text-slate-500">
          {locale === 'zh' ? '还没有数据 —— 通关一关，对应维度就会长出来' : 'No data yet — clear a level and its dimension will grow in'}
        </p>
      )}

      {/* 数值图例 */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {RADAR_DIMENSIONS.map((d) => {
          const v = values[d.key]
          const on = v > 0
          return (
            <div
              key={d.key}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${
                on ? 'border-amber-500/30 bg-amber-50/70' : 'border-line bg-panel-2/70'
              }`}
            >
              <span className="text-sm">{d.icon}</span>
              <span className={`flex-1 truncate text-xs ${on ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>
                {d[locale]}
              </span>
              <span className={`font-mono text-xs font-bold ${on ? 'text-gold' : 'text-slate-300'}`}>
                {Math.round(v)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
