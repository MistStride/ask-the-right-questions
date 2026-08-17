// 连线层：当 correctChain 两端的节点都点亮后，画出「理由 → 结论」箭头，拼出论证骨架。
import { useLayoutEffect, useState, type RefObject } from 'react'
import type { XrayChainRef } from '../../schema/levelTypes'

interface Props {
  containerRef: RefObject<HTMLDivElement | null>
  chain: XrayChainRef[]
  foundIds: Set<string>
}

interface EdgeLine {
  from: string
  to: string
  x1: number
  y1: number
  x2: number
  y2: number
}

export default function XrayChainArrows({ containerRef, chain, foundIds }: Props) {
  const [lines, setLines] = useState<EdgeLine[]>([])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || chain.length === 0) {
      setLines([])
      return
    }
    const measure = () => {
      const crect = container.getBoundingClientRect()
      const next: EdgeLine[] = []
      for (const edge of chain) {
        if (!foundIds.has(edge.from) || !foundIds.has(edge.to)) continue
        const fromEl = container.querySelector<HTMLElement>(`[data-node-id="${edge.from}"]`)
        const toEl = container.querySelector<HTMLElement>(`[data-node-id="${edge.to}"]`)
        if (!fromEl || !toEl) continue
        const fr = fromEl.getBoundingClientRect()
        const tr = toEl.getBoundingClientRect()
        next.push({
          from: edge.from,
          to: edge.to,
          x1: fr.left + fr.width / 2 - crect.left,
          y1: fr.bottom - crect.top + 2,
          x2: tr.left + tr.width / 2 - crect.left,
          y2: tr.top - crect.top - 2,
        })
      }
      setLines(next)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(container)
    return () => ro.disconnect()
  }, [containerRef, chain, foundIds])

  if (lines.length === 0) return null

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <marker
          id="xray-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path
            d="M2 1L8 5L2 9"
            fill="none"
            stroke="context-stroke"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
      {lines.map((l) => (
        <line
          key={`${l.from}-${l.to}`}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="#0e7490"
          strokeWidth="2"
          strokeDasharray="6 3"
          markerEnd="url(#xray-arrow)"
        />
      ))}
    </svg>
  )
}
