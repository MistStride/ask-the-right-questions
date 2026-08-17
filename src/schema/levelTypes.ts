// 全部引擎共用与「引擎A 论证透视镜」相关的类型契约。
// 对应设计文档《完整技术设计方案》第四节。

export type EngineType = 'xray' | 'courtroom' | 'scale' | 'defusal' | 'tamer'

export type NodeType =
  | 'conclusion' // 结论
  | 'reason' // 理由
  | 'assumption' // 隐藏假设（价值观/描述性）
  | 'fallacy' // 逻辑谬误
  | 'omission' // 被省略的信息
  | 'ambiguous_term' // 歧义词

export type RadarDimension =
  | 'structure' // 结构识别力
  | 'evidence' // 证据鉴别力
  | 'assumption' // 假设挖掘力
  | 'fallacy' // 谬误免疫力
  | 'data' // 数据免疫力
  | 'emotion' // 情绪自控力

export type Difficulty = 1 | 2 | 3

export type Locale = 'zh' | 'en'

/* ---------------- 关卡「逻辑文件」：只含结构与判定规则，不含任何语言文案 ---------------- */

export interface XrayNodeRef {
  nodeId: string
  type: NodeType
  /** 关联到 i18n 文件 textRefs 字典的键，运行时替换为对应语言的 anchorText */
  textRef: string
}

export interface XrayChainRef {
  from: string
  to: string
}

export interface XrayLevelData {
  levelId: string
  chapter: number
  engine: 'xray'
  difficulty: Difficulty
  contributor?: string
  /** 通关后点亮哪些思维雷达维度 */
  rewardTags: RadarDimension[]
  /** 正确节点 */
  nodes: XrayNodeRef[]
  /** 干扰节点（同样显示在正文中，但点选会提示错误） */
  distractors: XrayNodeRef[]
  /** 连线判定：理由→结论（第 3 章起启用） */
  correctChain?: XrayChainRef[]
}

/* ---------------- 关卡「i18n 文件」：某一种语言的完整文案包 ---------------- */

export interface XrayTexts {
  sourceText: string
  /** 键与逻辑文件的 textRef 对应，值是用于在 sourceText 中定位的原文片段 */
  textRefs: Record<string, string>
  hints: string[]
  explanation: string
}

export interface LevelTexts {
  zh: XrayTexts
  en: XrayTexts
}

/* ---------------- 运行时组装后的关卡定义 ---------------- */

export interface LevelDefinition {
  meta: Pick<XrayLevelData, 'levelId' | 'chapter' | 'engine' | 'difficulty' | 'contributor' | 'rewardTags'>
  data: XrayLevelData
  texts: LevelTexts
}

/** 引擎A 运行时锚点：逻辑 + 当前语言文案合并后的结果 */
export interface XrayAnchor {
  nodeId: string
  type: NodeType
  anchorText: string
  isCorrect: boolean
}

export interface XrayRuntimeLevel {
  meta: LevelDefinition['meta']
  sourceText: string
  anchors: XrayAnchor[]
  hints: string[]
  explanation: string
  correctChain?: XrayChainRef[]
}
