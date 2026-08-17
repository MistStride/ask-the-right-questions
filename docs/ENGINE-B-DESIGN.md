# 引擎 B 逻辑法庭 · 详细设计方案（阶段 4）

> 对应《ROADMAP.md》阶段 4（第 6/7/8/9 章）与《完整技术设计方案》4.3 节。
> 本文档是**代码生成契约**：字段、判定、验收全部按此实现，生成代码时以此为准，不另行发挥。

---

## 1. 玩法一句话

证人正在作证，证词里有几处"破绽"（薄弱环节）。把**问题弹药库**里的问题拖过去（或点选后点过去）打中破绽，每打中一处证词信誉就崩一块（血条掉血 + 裂纹），全部破绽打碎 → 证词整体崩裂 → 通关。

## 2. 玩家体验流程（验收基准，界面里能看到）

1. **进关第一眼**（继承目标栏思想）：顶部常驻目标卡——"🎯 目标：找出证词中的 N 处破绽，用问题击碎它"，血条显示"证词信誉 100"
2. 中央是**证词面板**：证人头像 + 陈述气泡。薄弱句带「⚡ 可疑」角标（虚线红框轻微脉冲，**提示"这里有破绽"但不剧透破绽类型**）
3. 底部是**问题弹药库**：横向滚动的问题卡片，每张显示问题文案 + 锐度值。**不标注哪个是干扰问题**（考验判断）
4. 拖一张问题卡到某个证词段上（或点卡选中 → 点证词段）：
   - **命中要害** → 问题卡飞向该段、证词段"裂纹爆开"、血条掉血动画、toast「⚡ 击中要害：<戳穿解析>」、该段变"已击碎"（红色划线置灰 + 显示破绽标签）
   - **打偏 / 无关问题** → 法官锤桌反馈 toast「🚫 法官：这个问题无关紧要，不是这里的破绽」，问题卡标记"已试错"（红边），**不扣血**（鼓励试错）
5. 所有破绽击碎 → 全屏「💥 证词击碎！」爆裂特效 → 结算弹窗（复用 LevelCompleteModal：得分 + 深度解析 + 下一关）
6. 右上角语言切换、中英双语全程可用

## 3. 数据结构契约（`src/schema/levelTypes.ts` 新增）

```typescript
export type CourtroomMode = 'trial' | 'clinic' | 'lineup'
// trial  庭审质询（第 7/8 章）     ：证词一段，像报纸文章/气泡
// clinic 逻辑诊所（第 6 章）       ：换皮成"病历 + 处方笺"，破绽=病灶，问题=诊断
// lineup 嫌疑人对质墙（第 9 章）  ：换皮成"多张嫌疑人陈述卡贴墙"，问题=证据卡

export interface CourtroomWeakSpotRef {
  spotId: string        // 如 'spot_expert_qual'
  anchorTextRef: string // i18n textRefs 键 → 证词中薄弱句的原文（语义锚点，非字符偏移）
  issueType: string     // 弱点类型，如 'expert_qualification' 'small_sample' 'rival_cause'
  debunkRef: string     // i18n textRefs 键 → 命中后展示的"戳穿解析"
  sharpness: number     // 命中扣血量 1-100（全关 sharpness 合计 ≈ credibility）
}

export interface CourtroomQuestionRef {
  questionId: string
  textRef: string       // i18n textRefs 键 → 问题文案
  sharpness: number     // 命中扣血（展示用，实际扣血以 weakSpot.sharpness 为准）
  targetIssue: string   // 该问题针对的 issueType（命中判据）
  isRelevant: boolean   // true=真问题可命中；false=干扰问题（法官警告）
}

export interface CourtroomLevelData {
  levelId: string
  chapter: number
  engine: 'courtroom'
  difficulty: Difficulty
  contributor?: string
  rewardTags: RadarDimension[]
  mode?: CourtroomMode          // 缺省 'trial'
  testimony: string             // 完整证词（i18n 注入；lineup 模式自动按弱点切卡）
  credibility: number           // 起始证词信誉 0-100，缺省 100
  weakSpots: CourtroomWeakSpotRef[]
  questionBank: CourtroomQuestionRef[]
}

export interface CourtroomTexts {
  testimony: string             // 证词全文
  caseTitle: string             // 案件标题，如「案件：神奇减肥茶」
  witnessName: string           // 证人名，如「证人：史密斯博士」
  textRefs: Record<string, string> // 弱点句原文 / 问题文案 / debunk / explanation 的文案池
  hints: string[]
  explanation: string           // 通关深度解析（总纲：为什么这些是破绽）
}
```

### 运行时组装（LevelPage 完成，引擎只消费运行时结构）

```typescript
export interface CourtroomRuntimeLevel {
  meta: LevelDefinition['meta']
  mode: CourtroomMode
  caseTitle: string
  witnessName: string
  testimony: string
  credibility: number
  weakSpots: { spotId: string; anchorText: string; issueType: string; debunkText: string; sharpness: number }[]
  questions: { questionId: string; text: string; sharpness: number; targetIssue: string; isRelevant: boolean }[]
  hints: string[]
  explanation: string
}
```

## 4. Zod 校验规则（`src/schema/levelSchema.ts` 新增 `courtroomLevelSchema`）

- 通用：`levelId` 非空、`chapter` 1-13、`difficulty` 1|2|3、`rewardTags` 数组
- `credibility` 默认 100，范围 1-100
- `weakSpots` 非空数组；`sharpness` 1-100；`issueType` 非空
- `questionBank` 非空数组
- **索引校验（levelIndex.ts）**：
  - 每个 `weakSpot.anchorTextRef` 与 `debunkRef` 必须存在于该语言 `textRefs`
  - 每个 `question.textRef` 必须存在
  - 每个 `anchorTextRef` 的文案必须能在 `testimony` 中**真实匹配到**（中英文各自校验，沿用引擎 A 的 `matchAnchors` 逻辑）
  - 每个 `question.targetIssue` 至少对应一个 `weakSpot.issueType`（保证没有废问题）；反之每个 `issueType` 至少有一个相关问题（保证每个破绽可被击碎）
  - 全关 `weakSpots.sharpness` 合计 ≥ `credibility`（保证全击碎后血条必归零，视觉一致）

## 5. 判定逻辑（`src/engines/courtroom/useCourtroomLogic.ts`，纯函数 hook）

状态：`hitSpots: Set<string>`（已击碎）、`usedQuestions: Set<string>`（已试错标记）、`remainingCredibility`、`wrongTries`（无关尝试计数）

```
handleStrike(question, spot)：
  若 spot 已击碎 → 忽略（toast「这处破绽已经被击碎了」）
  若 question.targetIssue === spot.issueType 且 question.isRelevant → 命中：
    hitSpots += spot；remainingCredibility -= spot.sharpness（下限 0）
    toast「⚡ 击中要害！」；展示 spot.debunkText
    若 hitSpots.size === weakSpots.length → 通关（触发爆裂特效 + onComplete(score)）
  否则 → 法官警告：
    wrongTries += 1；usedQuestions += question（问题卡标红边，仍可拖到别处）
    toast「🚫 法官：这个问题无关紧要」
    （不扣血，鼓励试错）
```

**通关判定 = 全部 weakSpots 击碎**（不依赖血条，防内容配置错误导致卡关）；血条是"紧张感与效率"的视觉表现，归零时若还有破绽未击碎 → 提示「证词已濒临崩溃，继续追击！」

**评分公式**（结算弹窗显示，与引擎 A 的"还原度"字段对齐）：
```
score = round( 50 + remainingCredibility × 0.4 + max(0, 20 - wrongTries × 5) )
```
（满血 + 零试错 ≈ 98；乱打会掉分但保底 50）

## 6. 三模式渲染设计（`src/engines/courtroom/` 目录）

```
courtroom/
├── CourtroomEngine.tsx      # 主组件：装配三模式布局 + 状态机
├── CourtroomTestimony.tsx   # 证词面板（按 mode 布局差异）
├── QuestionBank.tsx         # 问题弹药库（卡片 + 拖拽/点选源）
├── CredibilityBar.tsx       # 证词信誉血条（深红渐变 + 裂纹动画）
├── CourtroomBurst.tsx       # 全屏「证词击碎！」爆裂特效
├── useCourtroomLogic.ts     # 判定 hook（第 5 节）
└── courtI18n.ts             # 引擎 UI 文案（zh/en，不走内容 i18n）
```

- **公共骨架**（三模式共享）：目标卡 + 血条 + 问题库 + 判定。差异只在证词面板的**布局与主题词汇**：
  - `trial`：证词段落式（报纸文风），证人头像；「破绽」词
  - `clinic`：病历卡样式（米白纸 + 红色"病灶"印章），证人→"病人自述"；「病灶」
  - `lineup`：证词按弱点锚点自动切分成 N 张"嫌疑人陈述卡"贴墙（每卡含一个弱点句 + 相邻句），问题区改"证据卡"样式；「陈述 / 证据」
- **lineup 切卡规则**（纯渲染层，不改数据结构）：按文本顺序遍历，遇到弱点句即开新卡，卡 = 弱点句 + 其后到下一个弱点前的普通句。内容贡献者只需写一个 testimony + weakSpots，三模式自动适配。

## 7. 视觉与动效（明亮纸感主题）

- 新增主题色 token（`src/index.css`）：`--color-court: #b91c1c`（深红，总纲"法庭=深红"），配套 `--color-court-deep: #7f1d1d`
- 血条：深红渐变条，命中时宽度收缩动画 + 数字跳动 + 顶部裂纹贴图（CSS mask 简单裂纹）
- 破绽段：虚线红框 + 「⚡ 可疑」角标 + 轻微脉冲（**不剧透 issueType**）；命中后红底划线置灰 + 「💥 已击碎」标签
- 命中反馈：问题卡飞向证词段（framer-motion layoutId 或简单 scale+位移）、证词段"裂纹爆开"（边缘锯齿扩散动画）
- 爆裂特效（CourtroomBurst）：全屏深红裂纹从中心扩散 + 「💥 证词击碎！」大字弹出（framer-motion scale spring）→ 500ms 后接结算弹窗
- 法官警告：toast 用红色系 + 锤子 emoji「🔨」

## 8. 关卡内容规划（每章 1 关，先跑通，社区再铺量）

| 关卡 | 模式 | 场景 | 破绽（issueType） | rewardTags |
|---|---|---|---|---|
| ch06-level01 | clinic | 「逻辑诊所」：病人自述，诊断逻辑谬误 | 诉诸人身 `ad_hominem` / 滑坡 `slippery_slope` / 以偏概全 `hasty_generalization` | `fallacy` |
| ch07-level01 | trial | 「神奇减肥茶」广告里的专家证言 | 专家资质存疑 `expert_qualification` / 利益冲突 `conflict_of_interest` / 个人见证当证据 `personal_testimonial` | `evidence` |
| ch08-level01 | trial | 「研究显示」引用审计 | 样本过小 `small_sample` / 无对照组 `no_control` / 相关性当因果 `correlation_causation` | `evidence` |
| ch09-level01 | lineup | 「嫌疑人对质墙」：一个现象多个解释 | 替代原因 `rival_cause` 类 × 3（如"时间先后≠因果""共同原因""巧合"） | `fallacy` |

每关：3 个破绽 + 5 个问题（3 真 2 干扰），`credibility: 100`，三个破绽 sharpness 合计 100（如 40/35/25）。

内容文件：`src/content/levels/chapter-06|07|08|09/level-01.json`（逻辑）+ `level-01.i18n.json`（zh/en），完全照引擎 A 的"逻辑/文案分离"模式。

## 9. 集成点（四件套，缺一不可）

1. `src/schema/levelTypes.ts`：新增第 3 节全部类型（EngineType 已有 `courtroom`，无需改）
2. `src/schema/levelSchema.ts`：新增 `courtroomLevelSchema` + 并入 `levelSchema` 联合
3. `src/engines/courtroom/`：第 6 节全部组件（复制 `engines/xray/` 结构：类型 + Schema + 组件 + 分发 case）
4. `src/pages/LevelPage.tsx`：运行时组装分支（`engine === 'courtroom'` 时按第 3 节"运行时组装"构造 `CourtroomRuntimeLevel`）+ 渲染分发 `case 'courtroom'`（用 `React.lazy` 懒加载引擎 B，控制首包体积）
5. `src/content/levelIndex.ts`：索引校验扩展（第 4 节规则）
6. `src/index.css`：新增 court 色 token
7. `docs/ROADMAP.md`：阶段 4 进度标注

## 10. 引导设计（吸取阶段 2 用户反馈：玩家必须"知道要干嘛"）

- 进关即有目标卡：「🎯 目标：找出证词中的 N 处破绽，用问题击碎它」
- 破绽段常驻「⚡ 可疑」提示（知道往哪打，但破绽内容要靠问题判断）
- 问题库提示条：「有些问题能打中破绽，有些是干扰——拖错不扣信誉」
- 血条始终可见，命中/试错反馈即时（toast 立即切换，不用等动画退场——沿用阶段 2 修好的 FeedbackToast）

## 11. 验收清单（对照 ROADMAP 4.1-4.4，全部"界面里能看到"）

- [ ] 4.1 类型 + Zod：JSON 写错（缺 textRef / 锚点匹配不上 / 问题没对应破绽）→ dev/build 报错
- [ ] 4.2 交互：拖问题卡到证词薄弱段 → 命中裂纹 + 血条掉血；拖无关问题 → 法官警告不扣血
- [ ] 4.3 第 7 章核心关：最后一个破绽击碎 → 全屏「💥 证词击碎！」爆裂特效 → 结算
- [ ] 4.4 变体：第 6 章诊所（病历样式 + 病灶词）、第 9 章对质墙（多陈述卡 + 证据卡）
- [ ] 双语：中英文切全部文案（目标卡/证词/问题/法官提示/结算）
- [ ] 引导：进关即知"要找 N 处破绽、拖问题去打"
- [ ] 回归：引擎 A 4 关 + 雷达页不受影响

## 12. 风险与取舍

| 风险 | 决策 |
|---|---|
| 拖拽在触屏上难用 | 双操作：拖拽 + 点选（点问题卡选中 → 点证词段），点选优先为移动端兜底 |
| 破绽太明显变"找茬"、太隐晦找不到 | 只标「⚡ 可疑」角标，不写破绽类型；难度由问题库的干扰比例调节（第 7 章 2 干扰，后续可加） |
| 内容配错导致卡关（sharpness 永远扣不完） | 通关 = 全破绽击碎（与血条解耦）；sharpness 合计 ≥ credibility 由索引校验兜底 |
| lineup 切卡规则复杂 | 渲染层自动切卡，内容作者零负担；卡数 = 破绽数 + 1 |
| 引擎代码体积拖慢首屏 | `React.lazy` 懒加载引擎 B |
