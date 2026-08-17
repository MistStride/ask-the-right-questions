// 关卡索引：自动扫描 content/levels/ 下的所有关卡 JSON。
// 新增关卡只需放入对应 chapter 目录，这里会自动发现并做 Zod 校验。
// 支持两种引擎：xray（论证透视镜）与 courtroom（逻辑法庭）。
import {
  xrayLevelSchema,
  levelTextsSchema,
  courtroomLevelSchema,
  courtroomLevelTextsSchema,
} from '../schema/levelSchema'
import type {
  CourtroomLevelData,
  CourtroomTexts,
  LevelDefinition,
  XrayLevelData,
  XrayTexts,
} from '../schema/levelTypes'

// 逻辑文件：level-01.json / level-02.json ...（在下方过滤掉 *.i18n.json）
const allLevelFiles = import.meta.glob('./levels/**/level-*.json', {
  eager: true,
  import: 'default',
})
const levelFiles = Object.fromEntries(
  Object.entries(allLevelFiles).filter(([p]) => !p.endsWith('.i18n.json')),
)

// 翻译文件：level-01.i18n.json ...
const textFiles = import.meta.glob('./levels/**/level-*.i18n.json', {
  eager: true,
  import: 'default',
})

function fail(path: string, message: string): never {
  console.error(`[level] ${path} → ${message}`)
  throw new Error(`关卡数据校验失败: ${path} → ${message}`)
}

/** 校验 textRef 都能在对应语言的 sourceText 中真实匹配到（锚点可用性检查） */
function validateAnchors(path: string, levelId: string, data: XrayLevelData, texts: Record<'zh' | 'en', XrayTexts>) {
  for (const locale of ['zh', 'en'] as const) {
    const t = texts[locale]
    for (const node of [...data.nodes, ...data.distractors]) {
      const anchor = t.textRefs[node.textRef]
      if (!anchor) {
        fail(path, `关卡 ${levelId} 引用了不存在的 textRef「${node.textRef}」（${locale} 缺失）`)
      }
      // hidden 节点不参与正文匹配（埋在土里/被藏起来）
      if (!node.hidden && !t.sourceText.includes(anchor)) {
        fail(path, `关卡 ${levelId} 的 anchorText「${anchor}」(${locale}) 无法在 sourceText 中匹配到`)
      }
    }
    // gap 模式：校验每个空洞都有候选，且正确项文案出现在候选中
    if (data.mode === 'gap' && data.gaps) {
      for (const gap of data.gaps) {
        const candidates = t.gapRefs?.[gap.gapId]
        const correct = t.textRefs[gap.correctTextRef]
        if (!candidates || candidates.length < 2) {
          fail(path, `关卡 ${levelId} 的空洞 ${gap.gapId} 缺少候选（${locale} 需至少 2 个选项）`)
        }
        if (!correct) {
          fail(path, `关卡 ${levelId} 的空洞 ${gap.gapId} 引用了不存在的 correctTextRef（${locale}）`)
        }
        if (candidates && !candidates.includes(correct)) {
          fail(path, `关卡 ${levelId} 的空洞 ${gap.gapId} 正确项不在候选中（${locale}）`)
        }
      }
    }
  }
}

/** 校验 steps：targets 都是正确的 nodeId（含 gap:xxx），且恰好覆盖全部正确目标 */
function validateSteps(path: string, levelId: string, data: XrayLevelData) {
  if (!data.steps) return
  const correctIds = new Set<string>()
  for (const n of data.nodes) if (!n.hidden) correctIds.add(n.nodeId)
  for (const n of data.nodes) if (n.hidden) correctIds.add(n.nodeId)
  for (const g of data.gaps ?? []) correctIds.add(`gap:${g.gapId}`)

  const covered = new Set<string>()
  for (const step of data.steps) {
    for (const id of step.targets) {
      if (!correctIds.has(id)) {
        fail(path, `关卡 ${levelId} 步骤 ${step.stepId} 引用了不存在的正确目标「${id}」`)
      }
      if (covered.has(id)) {
        fail(path, `关卡 ${levelId} 步骤重复包含目标「${id}」`)
      }
      covered.add(id)
    }
  }
  const missing = [...correctIds].filter((id) => !covered.has(id))
  if (missing.length > 0) {
    fail(path, `关卡 ${levelId} 的 steps 未覆盖正确目标: ${missing.join(', ')}`)
  }
}

/** 引擎B 法庭关卡校验：破绽句可匹配 + 问题可命中 + 血条能扣完 */
function validateCourtroom(
  path: string,
  levelId: string,
  data: CourtroomLevelData,
  texts: Record<'zh' | 'en', CourtroomTexts>,
) {
  for (const locale of ['zh', 'en'] as const) {
    const t = texts[locale]
    for (const spot of data.weakSpots) {
      const anchor = t.textRefs[spot.anchorTextRef]
      if (!anchor) {
        fail(path, `关卡 ${levelId} 破绽 ${spot.spotId} 引用了不存在的 textRef「${spot.anchorTextRef}」（${locale} 缺失）`)
      }
      if (!t.testimony.includes(anchor)) {
        fail(path, `关卡 ${levelId} 破绽句「${anchor}」(${locale}) 无法在 testimony 中匹配到`)
      }
      if (!t.textRefs[spot.debunkRef]) {
        fail(path, `关卡 ${levelId} 破绽 ${spot.spotId} 引用了不存在的 debunkRef「${spot.debunkRef}」（${locale}）`)
      }
    }
    for (const q of data.questionBank) {
      if (!t.textRefs[q.textRef]) {
        fail(path, `关卡 ${levelId} 问题 ${q.questionId} 引用了不存在的 textRef「${q.textRef}」（${locale}）`)
      }
    }
  }

  // 跨语言规则（与文案无关）
  const issueTypes = new Set(data.weakSpots.map((s) => s.issueType))
  for (const q of data.questionBank) {
    if (!issueTypes.has(q.targetIssue)) {
      fail(path, `关卡 ${levelId} 问题 ${q.questionId} 的 targetIssue「${q.targetIssue}」没有对应的破绽（废问题）`)
    }
  }
  const coveredIssues = new Set(data.questionBank.filter((q) => q.isRelevant).map((q) => q.targetIssue))
  for (const spot of data.weakSpots) {
    if (!coveredIssues.has(spot.issueType)) {
      fail(path, `关卡 ${levelId} 破绽 ${spot.spotId} 的 issueType「${spot.issueType}」没有任何相关问题可命中`)
    }
  }
  const sum = data.weakSpots.reduce((a, s) => a + s.sharpness, 0)
  if (sum < data.credibility) {
    fail(path, `关卡 ${levelId} 破绽 sharpness 合计 ${sum} < credibility ${data.credibility}（血条永远扣不完）`)
  }
}

function buildLevels(): LevelDefinition[] {
  const defs: LevelDefinition[] = []
  for (const [path, raw] of Object.entries(levelFiles)) {
    const engine = (raw as { engine?: string }).engine

    if (engine === 'courtroom') {
      const parsed = courtroomLevelSchema.safeParse(raw as unknown)
      if (!parsed.success) {
        fail(path, `逻辑文件不合法: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`)
      }
      const data = parsed.data as CourtroomLevelData

      const i18nPath = path.replace(/\.json$/, '.i18n.json')
      const rawTexts = textFiles[i18nPath]
      if (!rawTexts) fail(path, `缺少翻译文件 ${i18nPath}`)

      const textsParsed = courtroomLevelTextsSchema.safeParse(rawTexts as unknown)
      if (!textsParsed.success) {
        fail(path, `翻译文件不合法: ${textsParsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`)
      }
      const texts = textsParsed.data as Record<'zh' | 'en', CourtroomTexts>

      validateCourtroom(path, data.levelId, data, texts)

      defs.push({
        meta: {
          levelId: data.levelId,
          chapter: data.chapter,
          engine: data.engine,
          difficulty: data.difficulty,
          contributor: data.contributor,
          rewardTags: data.rewardTags,
        },
        data,
        texts,
      })
      continue
    }

    // 默认走引擎A xray
    const parsed = xrayLevelSchema.safeParse(raw as unknown)
    if (!parsed.success) {
      fail(path, `逻辑文件不合法: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`)
    }
    const data = parsed.data as XrayLevelData

    const i18nPath = path.replace(/\.json$/, '.i18n.json')
    const rawTexts = textFiles[i18nPath]
    if (!rawTexts) fail(path, `缺少翻译文件 ${i18nPath}`)

    const textsParsed = levelTextsSchema.safeParse(rawTexts as unknown)
    if (!textsParsed.success) {
      fail(path, `翻译文件不合法: ${textsParsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`)
    }
    const texts = textsParsed.data as Record<'zh' | 'en', XrayTexts>

    validateAnchors(path, data.levelId, data, texts)
    validateSteps(path, data.levelId, data)

    defs.push({
      meta: {
        levelId: data.levelId,
        chapter: data.chapter,
        engine: data.engine,
        difficulty: data.difficulty,
        contributor: data.contributor,
        rewardTags: data.rewardTags,
      },
      data,
      texts,
    })
  }
  return defs.sort((a, b) => a.data.levelId.localeCompare(b.data.levelId))
}

export const LEVELS: LevelDefinition[] = buildLevels()

export function getLevelById(levelId: string): LevelDefinition | undefined {
  return LEVELS.find((l) => l.meta.levelId === levelId)
}

export function getLevelsByChapter(chapter: number): LevelDefinition[] {
  return LEVELS.filter((l) => l.meta.chapter === chapter)
}
