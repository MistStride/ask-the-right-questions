// 引擎C 天平校准判定 hook：记录尝试并在提交时结算。
// 操作区不暴露热度、方向或精度，避免玩家靠 UI 反馈反向搜索答案区间。
import { useCallback, useState } from 'react'

export interface JudgeResult {
  inRange: boolean
  precision?: number
  dir?: 'left' | 'right'
}

export function useScaleLogic(idealRange: [number, number], idealPoint: number) {
  const [position, setPosition] = useState(50)
  const [lastResult, setLastResult] = useState<JudgeResult | null>(null)
  const [bestScore, setBestScore] = useState<number | null>(null)

  const judge = useCallback(
    (pos: number): JudgeResult => {
      const [min, max] = idealRange
      if (pos >= min && pos <= max) {
        const precision = Math.max(0, 100 - Math.round(Math.abs(pos - idealPoint) * 2))
        setLastResult({ inRange: true, precision })
        setBestScore((prev) => (prev === null ? precision : Math.max(prev, precision)))
        return { inRange: true, precision }
      }
      const dir = pos < min ? 'left' : 'right'
      const result: JudgeResult = { inRange: false, dir }
      setLastResult(result)
      return result
    },
    [idealRange, idealPoint],
  )

  const reset = useCallback(() => {
    setPosition(50)
    setLastResult(null)
    setBestScore(null)
  }, [])

  return { position, setPosition, lastResult, bestScore, judge, reset }
}
