// 引擎D 数据拆弹 判定 hook：
//  - 点真陷阱 → 拆弹成功（剥落 + 解析）
//  - 点干扰项 → 爆炸警示（不惩罚，标记误触，之后点击只提示）
//  - 通关 = 全部陷阱拆除（与误触解耦）
import { useCallback, useEffect, useRef, useState } from 'react'
import type { DefusalRuntimeLevel } from '../../schema/levelTypes'

export type TapOutcome = 'defused' | 'wrong' | 'already'

export function useDefusalLogic(level: DefusalRuntimeLevel) {
  const [defused, setDefused] = useState<Set<string>>(new Set())
  const [wrongPoked, setWrongPoked] = useState<Set<string>>(new Set())
  const [flashKey, setFlashKey] = useState(0)
  const flashTimer = useRef<number | null>(null)

  const traps = level.spots.filter((s) => s.isTrap)
  const defusedCount = traps.filter((s) => defused.has(s.spotId)).length
  const totalTraps = traps.length
  const isComplete = totalTraps > 0 && defusedCount >= totalTraps
  const wrongCount = wrongPoked.size

  const tapSpot = useCallback(
    (spotId: string): TapOutcome => {
      const spot = level.spots.find((s) => s.spotId === spotId)
      if (!spot) return 'already'
      if (defused.has(spotId)) return 'already'
      if (spot.isTrap) {
        setDefused((prev) => new Set(prev).add(spotId))
        return 'defused'
      }
      setWrongPoked((prev) => new Set(prev).add(spotId))
      setFlashKey((k) => k + 1) // 触发爆炸红闪
      return 'wrong'
    },
    [level.spots, defused],
  )

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current)
    },
    [],
  )

  const reset = useCallback(() => {
    setDefused(new Set())
    setWrongPoked(new Set())
    setFlashKey(0)
  }, [])

  return { defused, wrongPoked, flashKey, defusedCount, totalTraps, wrongCount, isComplete, tapSpot, reset }
}
