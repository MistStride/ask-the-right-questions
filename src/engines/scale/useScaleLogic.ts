// 引擎C 天平校准 判定 hook：
//  - 松手判定：position ∈ idealRange → 命中（精度 = 100 - |pos-idealPoint|*2，越近中心分越高）
//  - 区间外 → 只提示偏左/偏右方向（不给数字，保持挑战）
//  - 最佳成绩 = 历次命中精度的最大值；提交需要至少命中一次
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
  const [burstKey, setBurstKey] = useState(0)

  /** 实时"热度"：距 idealPoint 越近越暖（0-1），驱动滑块/接近度条颜色 */
  const heat = Math.max(0, Math.min(1, 1 - Math.abs(position - idealPoint) / 50))

  const judge = useCallback(
    (pos: number): JudgeResult => {
      const [min, max] = idealRange
      if (pos >= min && pos <= max) {
        const precision = Math.max(0, 100 - Math.round(Math.abs(pos - idealPoint) * 2))
        setLastResult({ inRange: true, precision })
        setBestScore((prev) => (prev === null ? precision : Math.max(prev, precision)))
        setBurstKey((k) => k + 1) // 触发靶心动画
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
    setBurstKey(0)
  }, [])

  return { position, setPosition, lastResult, bestScore, burstKey, heat, judge, reset }
}
