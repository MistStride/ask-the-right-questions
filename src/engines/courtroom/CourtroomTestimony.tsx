// 证词面板：把 testimony 按破绽锚点切成段，破绽段渲染成「⚡ 可疑」可拖放目标。
// 三种模式布局：
//  trial / clinic — 段落式（报纸/病历）；lineup — 自动切成多张「嫌疑人陈述卡」贴墙。
import { motion } from 'framer-motion'
import type { CourtroomMode, Locale } from '../../schema/levelTypes'
import { COURT_UI } from './courtI18n'
import type { CourtroomSpot } from './useCourtroomLogic'

export interface SpotSegment {
  text: string
  spot?: CourtroomSpot
}

/** 把 testimony 按破绽锚点切段（长片段优先找位置，再按位置排序） */
export function splitTestimony(testimony: string, spots: CourtroomSpot[]): SpotSegment[] {
  if (!testimony) return []
  const used: { start: number; end: number }[] = []
  const placed: { start: number; end: number; spot: CourtroomSpot }[] = []
  const sorted = [...spots].sort((a, b) => b.anchorText.length - a.anchorText.length)
  for (const spot of sorted) {
    const needle = spot.anchorText
    if (!needle) continue
    let idx = testimony.indexOf(needle)
    while (idx >= 0) {
      const end = idx + needle.length
      if (!used.some((u) => idx < u.end && end > u.start)) break
      idx = testimony.indexOf(needle, idx + 1)
    }
    if (idx >= 0) {
      used.push({ start: idx, end: idx + needle.length })
      placed.push({ start: idx, end: idx + needle.length, spot })
    }
  }
  placed.sort((a, b) => a.start - b.start)
  const segments: SpotSegment[] = []
  let cursor = 0
  for (const p of placed) {
    if (p.start > cursor) segments.push({ text: testimony.slice(cursor, p.start) })
    segments.push({ text: testimony.slice(p.start, p.end), spot: p.spot })
    cursor = p.end
  }
  if (cursor < testimony.length) segments.push({ text: testimony.slice(cursor) })
  return segments
}

/** lineup 模式：把段落按破绽切成「陈述卡」（每卡 = 一个破绽句 + 其后普通句） */
export function splitLineupCards(segments: SpotSegment[]): SpotSegment[][] {
  const cards: SpotSegment[][] = []
  let current: SpotSegment[] = []
  for (const seg of segments) {
    if (seg.spot && current.some((s) => s.spot)) {
      // 已有一个破绽的卡，遇到新破绽开新卡
      cards.push(current)
      current = []
    }
    current.push(seg)
    if (seg.spot) {
      cards.push(current)
      current = []
    }
  }
  if (current.length > 0) cards.push(current)
  return cards.filter((c) => c.length > 0)
}

interface Props {
  mode: CourtroomMode
  testimony: string
  spots: CourtroomSpot[]
  hitSpots: Set<string>
  flashSpotId: string | null
  onDropSpot: (spot: CourtroomSpot) => void
  onTapSpot: (spot: CourtroomSpot) => void
  locale: Locale
}

export default function CourtroomTestimony({
  mode,
  testimony,
  spots,
  hitSpots,
  flashSpotId,
  onDropSpot,
  onTapSpot,
  locale,
}: Props) {
  const t = COURT_UI[locale]
  const segments = splitTestimony(testimony, spots)
  const isLineup = mode === 'lineup'

  /** 单个破绽段的按钮（可拖放 + 可点击） */
  const renderSpot = (spot: CourtroomSpot, key: string) => {
    const hit = hitSpots.has(spot.spotId)
    const flash = flashSpotId === spot.spotId
    if (hit) {
      return (
        <motion.span
          key={key}
          initial={{ scale: 0.94 }}
          animate={{ scale: 1 }}
          className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-court/50 bg-court/10 px-1 py-0.5 align-middle text-sm font-semibold text-court-deep line-through decoration-2"
        >
          {spot.anchorText}
          <span className="rounded bg-court px-1 text-[10px] font-bold text-white no-underline">💥 {t.shattered}</span>
        </motion.span>
      )
    }
    return (
      <motion.button
        key={key}
        type="button"
        draggable={false}
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDropSpot(spot)
        }}
        onClick={() => onTapSpot(spot)}
        animate={
          flash
            ? { x: [0, -5, 5, -4, 4, 0], borderColor: '#b91c1c', backgroundColor: 'rgba(185,28,28,0.12)' }
            : { x: 0, borderColor: 'rgba(185,28,28,0.45)', backgroundColor: 'rgba(185,28,28,0.04)' }
        }
        transition={flash ? { duration: 0.45 } : { duration: 0.2 }}
        className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-dashed px-1.5 py-0.5 align-middle text-sm font-semibold text-slate-700"
        style={{ borderColor: 'rgba(185,28,28,0.45)' }}
        title={t.suspicious}
      >
        <span className="animate-pulse text-xs">⚡</span>
        {spot.anchorText}
      </motion.button>
    )
  }

  const renderInline = (keyPrefix: string) => (
    <p className="text-[17px] leading-[2.05] text-slate-700">
      {segments.map((seg, i) =>
        seg.spot ? renderSpot(seg.spot, `${keyPrefix}-s${i}`) : <span key={`${keyPrefix}-t${i}`}>{seg.text}</span>,
      )}
    </p>
  )

  if (isLineup) {
    const cards = splitLineupCards(segments)
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card, ci) => (
          <div key={ci} className="rounded-xl border border-line bg-panel-2/60 p-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">
              {t.suspectWord} #{ci + 1}
            </p>
            <p className="text-sm leading-[1.9] text-slate-700">
              {card.map((seg, i) =>
                seg.spot ? renderSpot(seg.spot, `c${ci}-s${i}`) : <span key={`c${ci}-t${i}`}>{seg.text}</span>,
              )}
            </p>
          </div>
        ))}
      </div>
    )
  }

  // trial / clinic：段落式面板
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-panel p-6 sm:p-8 ${isLineup ? '' : 'border-line'}`}>
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
      <p className="relative mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
        {locale === 'zh' ? '证人陈述' : 'TESTIMONY'}
      </p>
      <div className="relative">{renderInline('trial')}</div>
    </div>
  )
}
