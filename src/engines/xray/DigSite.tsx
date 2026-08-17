// 考古挖掘区（dig 模式）：隐藏节点埋在土层下，点铲子逐层剥土，挖出即点亮。
import { useState } from 'react'
import { motion } from 'framer-motion'
import { NODE_TYPE_LABELS, NODE_VISUALS } from './XrayNode'
import type { Locale, XrayAnchor } from '../../schema/levelTypes'

const LAYERS = 3
const LAYER_COLORS = ['#7c5a3a', '#9a7448', '#b8915c'] // 从深处到地表

interface Props {
  hiddenNodes: XrayAnchor[]
  foundIds: Set<string>
  onUnearth: (node: XrayAnchor) => void
  locale: Locale
}

export default function DigSite({ hiddenNodes, foundIds, onUnearth, locale }: Props) {
  const [dug, setDug] = useState<Record<string, number>>({})

  if (hiddenNodes.length === 0) return null

  const handleDig = (node: XrayAnchor) => {
    if (foundIds.has(node.nodeId)) return
    const current = dug[node.nodeId] ?? 0
    const next = current + 1
    setDug((d) => ({ ...d, [node.nodeId]: next }))
    if (next >= LAYERS) {
      onUnearth(node)
    }
  }

  const t =
    locale === 'zh'
      ? { title: '考古挖掘区', sub: '论证下面埋着没说的话——点铲子逐层往下挖', dig: '挖', unearthed: '挖出' }
      : { title: 'Excavation Site', sub: 'Something unsaid is buried beneath the argument — dig layer by layer', dig: 'Dig', unearthed: 'Uncovered' }

  return (
    <div className="mt-6 rounded-2xl border border-amber-500/40 bg-panel p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
        ⛏ {t.title}
      </p>
      <p className="mt-1 text-xs text-slate-500">{t.sub}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {hiddenNodes.map((node) => {
          const isFound = foundIds.has(node.nodeId)
          const layersLeft = isFound ? 0 : LAYERS - (dug[node.nodeId] ?? 0)
          const v = NODE_VISUALS[node.type]
          return (
            <div
              key={node.nodeId}
              className={`rounded-xl border p-4 ${
                isFound ? 'border-violet-300 bg-violet-100' : 'border-line bg-panel-2'
              }`}
            >
              {isFound ? (
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                >
                  <p className="text-xs font-bold text-violet-700">
                    {v.emoji} {NODE_TYPE_LABELS[node.type][locale]}
                  </p>
                  <p className="mt-1.5 text-sm font-medium leading-relaxed text-violet-800">
                    {node.anchorText}
                  </p>
                  <p className="mt-1 text-[11px] text-violet-500">
                    {locale === 'zh' ? `✔ ${t.unearthed}` : `✔ ${t.unearthed}`}
                  </p>
                </motion.div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDig(node)}
                  className="group block w-full text-left"
                >
                  <p className="text-xs text-slate-500">
                    {locale === 'zh' ? '???' : '???'}
                    <span className="ml-2 rounded bg-white/70 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                      {NODE_TYPE_LABELS[node.type][locale]}
                    </span>
                  </p>
                  <div className="mt-3 flex h-12 items-end gap-0.5">
                    {Array.from({ length: LAYERS }).map((_, i) => {
                      const layerIndex = LAYERS - 1 - i // 顶部是最浅层
                      const stillThere = i >= LAYERS - layersLeft
                      return (
                        <motion.div
                          key={i}
                          animate={
                            stillThere
                              ? { opacity: 1, scale: 1 }
                              : { opacity: 0, scale: 0.6, y: -8 }
                          }
                          transition={{ duration: 0.25 }}
                          className="h-full flex-1 rounded-t-sm"
                          style={{ backgroundColor: LAYER_COLORS[layerIndex] }}
                        />
                      )
                    })}
                    <span className="ml-2 text-lg text-amber-600 transition group-hover:scale-125">
                      ⛏
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    {locale === 'zh'
                      ? `还剩 ${layersLeft} 层 · 点击继续挖`
                      : `${layersLeft} layer(s) left · click to dig`}
                  </p>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
