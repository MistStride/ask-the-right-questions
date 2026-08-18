// 引擎E 心智驯兽场 判定 hook：
//  - 点正确批判性问题 → 安抚成功（进入下一冲动）
//  - 点错 → 大象躁动 +20%（可重选）；满 100% → 暴走（深呼吸重置当前冲动，不惩罚）
//  - 通关 = 全部冲动安抚成功
import { useCallback, useEffect, useState } from 'react'
import type { TamerRuntimeLevel } from '../../schema/levelTypes'

export type SelectOutcome = 'calmed' | 'miss' | 'raging'

export function useTamerLogic(level: TamerRuntimeLevel) {
  const [idx, setIdx] = useState(0)
  const [rage, setRage] = useState(level.initialRage)
  const [wrongTries, setWrongTries] = useState(0)
  const [lastWrongKey, setLastWrongKey] = useState<string | null>(null)
  const [calmKey, setCalmKey] = useState(0)
  const [raging, setRaging] = useState(false)

  const total = level.events.length
  const current = level.events[Math.min(idx, total - 1)]
  const calmedCount = Math.min(idx, total)
  const isComplete = idx >= total

  const select = useCallback(
    (optionKey: string): SelectOutcome => {
      if (raging) return 'raging'
      if (optionKey === current.correctKey) {
        setCalmKey((k) => k + 1)
        setRage(0)
        setIdx((i) => i + 1)
        return 'calmed'
      }
      setWrongTries((w) => w + 1)
      setLastWrongKey(optionKey)
      setRage((r) => Math.min(100, r + level.ragePerMiss))
      return 'miss'
    },
    [raging, current, level.ragePerMiss],
  )

  // 躁动度满 → 暴走（需深呼吸重置）
  useEffect(() => {
    if (rage >= 100) setRaging(true)
  }, [rage])

  /** 深呼吸：情绪回到初始值，重试当前冲动 */
  const breathe = useCallback(() => {
    setRage(level.initialRage)
    setRaging(false)
  }, [level.initialRage])

  const reset = useCallback(() => {
    setIdx(0)
    setRage(level.initialRage)
    setWrongTries(0)
    setLastWrongKey(null)
    setCalmKey(0)
    setRaging(false)
  }, [level.initialRage])

  return {
    current,
    calmedCount,
    total,
    rage,
    wrongTries,
    lastWrongKey,
    calmKey,
    raging,
    isComplete,
    select,
    breathe,
    reset,
  }
}
