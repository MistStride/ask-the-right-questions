// 引擎A 判定逻辑 hook：统一管理「已找到节点 / 点错红闪 / 错误计数 / 通关状态」。
// 支持三种标记路径：点击正文锚点、挖掘隐藏节点（dig）、补全空洞（gap）。
import { useCallback, useEffect, useRef, useState } from 'react'
import type { XrayAnchor } from '../../schema/levelTypes'

export function useXrayLogic(correct: XrayAnchor[]) {
  const total = correct.length
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set())
  const [wrongFlashId, setWrongFlashId] = useState<string | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const timerRef = useRef<number | null>(null)

  const foundCount = foundIds.size
  const isComplete = total > 0 && foundCount >= total

  /** 非点击路径（挖掘 / 补洞）标记某个目标已找到 */
  const markFound = useCallback((nodeId: string) => {
    setFoundIds((prev) => {
      if (prev.has(nodeId)) return prev
      return new Set(prev).add(nodeId)
    })
  }, [])

  /** 点击正文锚点：正确→点亮，错误→红闪 */
  const handleClick = useCallback(
    (anchor: XrayAnchor) => {
      if (anchor.isCorrect) {
        markFound(anchor.nodeId)
        return true
      }
      setWrongFlashId(anchor.nodeId)
      setMistakes((m) => m + 1)
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setWrongFlashId(null), 900)
      return false
    },
    [markFound],
  )

  /** 非点击交互（挖掘点错层 / 补洞点错候选）也计入错误 */
  const registerMistake = useCallback((flashId: string) => {
    setWrongFlashId(flashId)
    setMistakes((m) => m + 1)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setWrongFlashId(null), 900)
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

  return { foundIds, foundCount, total, wrongFlashId, mistakes, isComplete, handleClick, markFound, registerMistake, reset }
}
