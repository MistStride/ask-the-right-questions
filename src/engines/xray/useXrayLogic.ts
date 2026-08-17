// 引擎A 判定逻辑（与渲染分离）：记录已找到节点、错误闪现、错误次数。
import { useCallback, useEffect, useRef, useState } from 'react'
import type { XrayAnchor } from '../../schema/levelTypes'

export function useXrayLogic(anchors: XrayAnchor[]) {
  const correct = anchors.filter((a) => a.isCorrect)
  const total = correct.length

  const [foundIds, setFoundIds] = useState<Set<string>>(new Set())
  const [wrongFlashId, setWrongFlashId] = useState<string | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const timerRef = useRef<number | null>(null)

  const foundCount = foundIds.size
  const isComplete = total > 0 && foundCount >= total

  /** 返回 true 表示点击的是正确节点 */
  const handleClick = useCallback((anchor: XrayAnchor) => {
    if (anchor.isCorrect) {
      setFoundIds((prev) => {
        if (prev.has(anchor.nodeId)) return prev
        return new Set(prev).add(anchor.nodeId)
      })
      return true
    }
    setWrongFlashId(anchor.nodeId)
    setMistakes((m) => m + 1)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setWrongFlashId(null), 900)
    return false
  }, [])

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const reset = useCallback(() => {
    setFoundIds(new Set())
    setWrongFlashId(null)
    setMistakes(0)
  }, [])

  return { foundIds, foundCount, total, wrongFlashId, mistakes, isComplete, handleClick, reset }
}
