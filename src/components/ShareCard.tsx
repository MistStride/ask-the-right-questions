// 阶段7 战绩分享卡 —— "思维诊断报告"
// 竖版 3:4（360x480 固定尺寸，导出时 pixelRatio=3 → 1080x1440 高清）
// 纯静态无动画（html-to-image 导出稳定）：深色战绩卡 + 金色点缀
// 内容：品牌 + 头衔 + 六维雷达 + 通关统计 + 强/弱维度 + 标语
import { RADAR_DIMENSIONS } from './RadarChart'
import type { Locale, RadarDimension } from '../schema/levelTypes'

/* ---------- 头衔（按通关数 6 档） ---------- */
export function getTitle(doneCount: number, total: number, locale: Locale): string {
  const ratio = doneCount / total
  const zhTitles = ['淘金新手', '论证学徒', '淘金好手', '批判侦探', '批判思维大师']
  const enTitles = ['Gold Rookie', 'Argument Apprentice', 'Skilled Panner', 'Critical Detective', 'Master Critic']
  const idx = ratio >= 1 ? 4 : ratio >= 0.7 ? 3 : ratio >= 0.45 ? 2 : ratio >= 0.15 ? 1 : 0
  return locale === 'zh' ? zhTitles[idx] : enTitles[idx]
}

/* ---------- 静态六维雷达（无动画，供导出） ---------- */
function StaticRadar({ values, locale }: { values: Record<RadarDimension, number>; locale: Locale }) {
  const N = RADAR_DIMENSIONS.length
  const CX = 180
  const CY = 148
  const R = 100
  const LABEL_R = 128
  const pt = (i: number, ratio: number): [number, number] => {
    const angle = (Math.PI * 2 * i) / N - Math.PI / 2
    return [CX + Math.cos(angle) * R * ratio, CY + Math.sin(angle) * R * ratio]
  }
  const labelPt = (i: number): [number, number] => {
    const angle = (Math.PI * 2 * i) / N - Math.PI / 2
    return [CX + Math.cos(angle) * LABEL_R, CY + Math.sin(angle) * LABEL_R]
  }
  const ANCHORS = ['middle', 'start', 'start', 'middle', 'end', 'end'] as const
  const DYS = [-7, -8, 15, 17, 15, -8]
  const pointsOf = (r: number) =>
    RADAR_DIMENSIONS.map((_, i) => {
      const [x, y] = pt(i, r)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ')
  const poly = RADAR_DIMENSIONS.map((d, i) => {
    const [x, y] = pt(i, values[d.key] / 100)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  return (
    <svg viewBox="0 0 360 330" style={{ width: '100%', display: 'block' }}>
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <polygon key={r} points={pointsOf(r)} fill="none" stroke="#4a443b" strokeWidth={r === 1 ? 1.4 : 1} />
      ))}
      {RADAR_DIMENSIONS.map((_, i) => {
        const [x, y] = pt(i, 1)
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#4a443b" strokeWidth={1} />
      })}
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
            fontSize={11}
            fontWeight={active ? 700 : 400}
            fill={active ? '#f0b429' : '#6b6357'}
          >
            {d.icon} {d[locale]}
          </text>
        )
      })}
      <polygon points={poly} fill="rgba(240,180,41,0.18)" stroke="#f0b429" strokeWidth={2.5} strokeLinejoin="round" />
      {RADAR_DIMENSIONS.map((d, i) => {
        const [x, y] = pt(i, values[d.key] / 100)
        return <circle key={d.key} cx={x} cy={y} r={3.4} fill="#f0b429" />
      })}
    </svg>
  )
}

/* ---------- 分享卡 ---------- */
interface ShareCardProps {
  values: Record<RadarDimension, number>
  doneCount: number
  total: number
  avgScore: number
  maxDim: RadarDimension
  minDim: RadarDimension
  locale: Locale
}

export default function ShareCard({ values, doneCount, total, avgScore, maxDim, minDim, locale }: ShareCardProps) {
  const title = getTitle(doneCount, total, locale)
  const maxLabel = RADAR_DIMENSIONS.find((d) => d.key === maxDim)
  const minLabel = RADAR_DIMENSIONS.find((d) => d.key === minDim)
  const tagline = locale === 'zh' ? '别急着相信，先学会提问' : "Don't just believe — ask the right questions"

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-3xl"
      style={{
        width: 360,
        height: 480,
        background: 'linear-gradient(160deg, #241f17 0%, #171310 100%)',
        padding: 26,
        boxSizing: 'border-box',
        fontFamily: "'Segoe UI','PingFang SC','Microsoft YaHei',system-ui,sans-serif",
      }}
    >
      {/* 顶部品牌 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#f0b429' }}>⛏ 学会提问</span>
        <span style={{ fontSize: 9, letterSpacing: 2, color: '#8b8377', fontWeight: 700 }}>
          ASKING THE RIGHT QUESTIONS
        </span>
      </div>

      {/* 头衔 */}
      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: '#8b8377', fontWeight: 700 }}>
          {locale === 'zh' ? '思维诊断报告' : 'THINKING DIAGNOSIS'}
        </div>
        <div style={{ marginTop: 6, fontSize: 40, fontWeight: 900, color: '#f5f1e8' }}>{title}</div>
      </div>

      {/* 雷达 */}
      <div style={{ marginTop: 8, flex: 1, display: 'flex', alignItems: 'center' }}>
        <StaticRadar values={values} locale={locale} />
      </div>

      {/* 统计 */}
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#f5f1e8' }}>
          {locale === 'zh' ? `已完成 ${doneCount}/${total} 关` : `${doneCount}/${total} levels cleared`}
        </span>
        <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 600, color: '#f0b429' }}>
          {locale === 'zh' ? `平均还原度 ${avgScore}` : `avg accuracy ${avgScore}`}
        </span>
      </div>

      {/* 强/弱维度 */}
      <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
        {maxLabel && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#241f17',
              background: '#f0b429',
              borderRadius: 999,
              padding: '5px 12px',
            }}
          >
            🏔 {maxLabel[locale]} {Math.round(values[maxDim])}
          </span>
        )}
        {minLabel && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#f5f1e8',
              background: '#3a342b',
              borderRadius: 999,
              padding: '5px 12px',
            }}
          >
            🎯 {minLabel[locale]} {Math.round(values[minDim])}
          </span>
        )}
      </div>

      {/* 底部标语 */}
      <div style={{ marginTop: 16, borderTop: '1px solid #3a342b', paddingTop: 12, textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: '#a89f92', fontWeight: 600 }}>“{tagline}”</span>
      </div>

      {/* 角落水印 */}
      <span style={{ position: 'absolute', right: 14, bottom: 10, fontSize: 22, opacity: 0.25 }}>🐘</span>
    </div>
  )
}
