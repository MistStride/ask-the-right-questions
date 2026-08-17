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

/** 引擎A 玩法变体：scan=标准透视；dig=考古挖掘（挖隐藏假设）；gap=空洞补全（找被遗漏的信息） */
export type XrayMode = 'scan' | 'dig' | 'gap'

/* ---------------- 关卡「逻辑文件」：只含结构与判定规则，不含任何语言文案 ---------------- */

export interface XrayNodeRef {
  nodeId: string
  type: NodeType
  /** 关联到 i18n 文件 textRefs 字典的键，运行时替换为对应语言的 anchorText */
  textRef: string
  /** true = 不在正文中高亮（埋在土里/被藏起来），由引擎用特殊交互揭示 */
  hidden?: boolean
}

export interface XrayChainRef {
  from: string
  to: string
}

/** gap 模式的空洞：correctTextRef 指向 i18n textRefs 中的键，其文案即正确答案 */
export interface XrayGapRef {
  gapId: string
  correctTextRef: string
}

/** 串行步骤：一关拆成多步，每步只找一个目标（找错类型算错）。
 *  targets 引用正确节点 nodeId；gap 空洞用 "gap:<gapId>" 引用 */
export interface XrayStepRef {
  stepId: string
  targets: string[]
}

export interface XrayLevelData {
  levelId: string
  chapter: number
  engine: 'xray'
  difficulty: Difficulty
  contributor?: string
  /** 通关后点亮哪些思维雷达维度 */
  rewardTags: RadarDimension[]
  /** 玩法变体，默认 scan */
  mode?: XrayMode
  /** 正确节点 */
  nodes: XrayNodeRef[]
  /** 干扰节点（同样显示在正文中，但点选会提示错误） */
  distractors: XrayNodeRef[]
  /** 连线判定：理由→结论（第 3 章起启用） */
  correctChain?: XrayChainRef[]
  /** gap 模式：正文用 【gap:xxx】 标记的空洞 */
  gaps?: XrayGapRef[]
  /** 串行步骤（可选）：缺省时所有正确节点为单步。每步只找一个目标 */
  steps?: XrayStepRef[]
}

/* ---------------- 关卡「i18n 文件」：某一种语言的完整文案包 ---------------- */

export interface XrayTexts {
  sourceText: string
  /** 键与逻辑文件的 textRef 对应，值是用于在 sourceText 中定位的原文片段 */
  textRefs: Record<string, string>
  /** gap 模式：每个空洞的候选选项（语言相关，放文案层） */
  gapRefs?: Record<string, string[]>
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
  mode: XrayMode
  sourceText: string
  /** 正文可点击锚点（不含 hidden 节点） */
  anchors: XrayAnchor[]
  /** dig 模式：埋在土里的隐藏节点（假设等） */
  hiddenNodes: XrayAnchor[]
  /** gap 模式：空洞及其候选（candidates 来自 i18n gapRefs，correct 来自 textRefs） */
  gaps: { gapId: string; correctText: string; candidates: string[] }[]
  /** 串行步骤（运行时已归一：缺省时生成为单步） */
  steps: XrayStepRef[]
  hints: string[]
  explanation: string
  correctChain?: XrayChainRef[]
}
