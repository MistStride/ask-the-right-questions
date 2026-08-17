// 语义锚点 → 文本分段。
// 绝不用字符偏移量（翻译后必然错位），而是用「原文片段」做运行时查找，
// 这正是设计文档强调的 i18n 长期可维护性的核心实现。
import type { XrayAnchor } from '../schema/levelTypes'

export interface TextSegment {
  text: string
  anchor?: XrayAnchor
}

interface Placed {
  start: number
  end: number
  anchor: XrayAnchor
}

export function segmentByAnchors(sourceText: string, anchors: XrayAnchor[]): TextSegment[] {
  if (!sourceText) return []

  const used: { start: number; end: number }[] = []
  const placed: Placed[] = []

  // 长片段优先（避免子串抢占），长度相同时正确节点优先
  const sorted = [...anchors].sort((a, b) => {
    const lenDiff = b.anchorText.length - a.anchorText.length
    if (lenDiff !== 0) return lenDiff
    return Number(b.isCorrect) - Number(a.isCorrect)
  })

  for (const anchor of sorted) {
    const needle = anchor.anchorText
    if (!needle) continue
    const start = findFirstFreeIndex(sourceText, needle, used)
    if (start >= 0) {
      const end = start + needle.length
      used.push({ start, end })
      placed.push({ start, end, anchor })
    } else {
      // 正常情况下 levelIndex 的校验已经保证能匹配；此处兜底提示
      console.warn(`[xray] 锚点 "${needle}" 未能在正文中匹配到，请检查 i18n 文本`)
    }
  }

  placed.sort((a, b) => a.start - b.start)

  const segments: TextSegment[] = []
  let cursor = 0
  for (const p of placed) {
    if (p.start > cursor) segments.push({ text: sourceText.slice(cursor, p.start) })
    segments.push({
      text: sourceText.slice(p.start, p.end),
      anchor: p.anchor,
    })
    cursor = p.end
  }
  if (cursor < sourceText.length) segments.push({ text: sourceText.slice(cursor) })
  return segments
}

function findFirstFreeIndex(text: string, needle: string, used: { start: number; end: number }[]): number {
  let idx = text.indexOf(needle)
  while (idx >= 0) {
    const end = idx + needle.length
    if (!used.some((u) => idx < u.end && end > u.start)) return idx
    idx = text.indexOf(needle, idx + 1)
  }
  return -1
}
