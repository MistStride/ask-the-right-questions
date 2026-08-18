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

/* ---------------- 引擎B 逻辑法庭（第 6/7/8/9 章）---------------- */

export type CourtroomMode = 'trial' | 'clinic' | 'lineup'
// trial  庭审质询：证词一段，像报纸文章/气泡（第 7/8 章）
// clinic 逻辑诊所：换皮成"病历 + 处方笺"，破绽=病灶，问题=诊断（第 6 章）
// lineup 嫌疑人对质墙：证词自动按弱点切成多张陈述卡，问题=证据卡（第 9 章）

/** 证词薄弱环节（破绽）：anchorTextRef 指向 i18n textRefs 中该薄弱句的原文 */
export interface CourtroomWeakSpotRef {
  spotId: string
  anchorTextRef: string
  /** 弱点类型，如 expert_qualification / small_sample / rival_cause */
  issueType: string
  /** 命中后展示的"戳穿解析"（i18n textRefs 键） */
  debunkRef: string
  /** 命中扣血量 1-100；全关合计应 ≥ credibility */
  sharpness: number
}

export interface CourtroomQuestionRef {
  questionId: string
  textRef: string
  /** 展示用锐度；实际扣血以 weakSpot.sharpness 为准 */
  sharpness: number
  /** 针对的 issueType（命中判据） */
  targetIssue: string
  /** true=真问题可命中；false=干扰问题（法官警告，不扣血） */
  isRelevant: boolean
}

export interface CourtroomLevelData {
  levelId: string
  chapter: number
  engine: 'courtroom'
  difficulty: Difficulty
  contributor?: string
  rewardTags: RadarDimension[]
  mode?: CourtroomMode
  /** 完整证词（i18n 注入；lineup 模式渲染层自动按弱点切卡） */
  testimony: string
  /** 起始证词信誉 0-100 */
  credibility: number
  weakSpots: CourtroomWeakSpotRef[]
  questionBank: CourtroomQuestionRef[]
}

export interface CourtroomTexts {
  caseTitle: string
  witnessName: string
  testimony: string
  /** 弱点句原文 / 问题文案 / debunk 解析的文案池 */
  textRefs: Record<string, string>
  hints: string[]
  explanation: string
}

/** 引擎B 运行时关卡：逻辑 + 当前语言文案合并后，引擎只消费此结构 */
export interface CourtroomRuntimeLevel {
  meta: LevelDefinition['meta']
  mode: CourtroomMode
  caseTitle: string
  witnessName: string
  testimony: string
  credibility: number
  weakSpots: {
    spotId: string
    anchorText: string
    issueType: string
    debunkText: string
    sharpness: number
  }[]
  questions: {
    questionId: string
    text: string
    sharpness: number
    targetIssue: string
    isRelevant: boolean
  }[]
  hints: string[]
  explanation: string
}

/* ---------------- 运行时组装后的关卡定义 ---------------- */

export interface LevelMeta {
  levelId: string
  chapter: number
  engine: EngineType
  difficulty: Difficulty
  contributor?: string
  rewardTags: RadarDimension[]
}

export interface LevelDefinition {
  meta: LevelMeta
  data: XrayLevelData | CourtroomLevelData | ScaleLevelData | DefusalLevelData
  texts:
    | { zh: XrayTexts; en: XrayTexts }
    | { zh: CourtroomTexts; en: CourtroomTexts }
    | { zh: ScaleTexts; en: ScaleTexts }
    | { zh: DefusalTexts; en: DefusalTexts }
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

/* ---------------- 引擎C 天平校准站（第 4/12 章）---------------- */

export type ScaleMode = 'spectrum' | 'conclusion'
// spectrum   词义光谱（第 4 章）：校准歧义词的合理含义范围
// conclusion 结论区间（第 12 章）：证据能支撑多强的结论

export interface ScaleLevelData {
  levelId: string
  chapter: number
  engine: 'scale'
  difficulty: Difficulty
  contributor?: string
  rewardTags: RadarDimension[]
  mode?: ScaleMode
  /** 0-100 合理区间 [min, max] */
  idealRange: [number, number]
  /** 区间内"最佳点"，0-100 */
  idealPoint: number
}

export interface ScaleTexts {
  /** 待校准的陈述/词语 */
  prompt: string
  /** 光谱两端标签：左端 / 右端 */
  spectrumLabels: [string, string]
  hints: string[]
  explanation: string
}

export interface ScaleRuntimeLevel {
  meta: LevelDefinition['meta']
  mode: ScaleMode
  prompt: string
  spectrumLabels: [string, string]
  idealRange: [number, number]
  idealPoint: number
  hints: string[]
  explanation: string
}

/* ---------------- 引擎D 数据拆弹（第 10 章）---------------- */

export interface DefusalLevelData {
  levelId: string
  chapter: number
  engine: 'defusal'
  difficulty: Difficulty
  contributor?: string
  rewardTags: RadarDimension[]
  /** 柱状图数据（labelRef → i18n labels 文案） */
  chartData: { labelRef: string; value: number }[]
  /** Y 轴：min=真实下限（通常 0），start=被动手脚的显示起点（陷阱），max=上限 */
  yAxis: { min: number; max: number; start: number }
  /** 图上的可疑点（真陷阱 + 干扰项） */
  suspectSpots: DefusalSpotRef[]
  /** 拆弹手册条目（i18n 键），与陷阱一一对应 */
  manualRefs: string[]
}

export interface DefusalSpotRef {
  spotId: string
  /** 挂在哪根柱上（chartData 索引） */
  barIndex: number
  isTrap: boolean
  /** 拆弹成功解析（i18n 键，仅陷阱需要） */
  debunkRef?: string
}

export interface DefusalTexts {
  chartTitle: string
  /** 各柱的 label 文案（与 chartData 顺序对应） */
  labels: string[]
  /** debunk 文案池 */
  textRefs: Record<string, string>
  /** 拆弹手册条目文案（与 manualRefs 对应） */
  manual: string[]
  hints: string[]
  explanation: string
}

export interface DefusalRuntimeLevel {
  meta: LevelDefinition['meta']
  chartTitle: string
  chartData: { label: string; value: number }[]
  yAxis: { min: number; max: number; start: number }
  spots: { spotId: string; barIndex: number; isTrap: boolean; debunkText?: string }[]
  manual: string[]
  hints: string[]
  explanation: string
}
