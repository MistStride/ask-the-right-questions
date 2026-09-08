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
