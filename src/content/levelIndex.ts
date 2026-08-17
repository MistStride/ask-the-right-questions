// 关卡索引：自动扫描 content/levels/ 下的所有关卡 JSON。
// 新增关卡只需放入对应 chapter 目录，这里会自动发现并做 Zod 校验。
import { xrayLevelSchema, levelTextsSchema } from '../schema/levelSchema'
import type { LevelDefinition, XrayLevelData, XrayTexts } from '../schema/levelTypes'

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

function buildLevels(): LevelDefinition[] {
  const defs: LevelDefinition[] = []
  for (const [path, raw] of Object.entries(levelFiles)) {
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
    const texts = textsParsed.data as LevelDefinition['texts']

    validateAnchors(path, data.levelId, data, texts)

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
