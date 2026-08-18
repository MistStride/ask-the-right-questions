# 阶段 5 设计方案：引擎 C 天平校准站 + 引擎 D 数据拆弹

> 对应《ROADMAP.md》阶段 5（第 4/12 章 + 第 10 章）与《完整技术设计方案》4.4/4.5 节。
> 本文档是**代码生成契约**：字段、判定、验收全部按此实现，生成代码时以此为准，不另行发挥。
> 引擎 C 与引擎 D 相互独立，可并行实现；本文档按 C → D 顺序展开。

---

# 引擎 C｜天平校准站（第 4 章词义光谱 + 第 12 章结论区间）

## C-1. 玩法一句话

给你一个陈述/词语，光谱两端是两种极端立场。拖动滑块找到"合理的位置"——离"最佳点"越近分越高，但合理区间的边界**不直接显示**，只能靠"热度"感觉。

## C-2. 玩家体验流程（验收基准，界面里能看到）

1. **进关第一眼**（引导思想延续）：目标卡「🎯 校准：把滑块放到最合理的位置——离中心越近分越高」
2. 中央是大滑块（0-100），两端标签（如「完全自由」←→「完全被约束」），上方是待判断的陈述（如「公民应当拥有自由」）
3. **拖动滑块时有"热度反馈"**：越接近合理区间，轨道颜色越暖（灰蓝 → 绿 → 金），但**区间边界不可见**（只有渐晕）——玩家凭手感校准，而不是照着边界对齐
4. **松手判定**：显示结果——在区间内「✓ 落在合理区！精度 87」；区间外「✗ 偏右了，合理区大概在 55-75」→ 玩家可再拖再判（**取最好成绩**，无挫败感）
5. 满意后点「⚖️ 提交校准」→ **命中靶心动画**（滑块处靶心波纹扩散 + 金色光晕）→ 结算弹窗（复用 LevelCompleteModal：分数 + 解析）

## C-3. 数据结构契约（`levelTypes.ts` 新增）

```typescript
export type ScaleMode = 'spectrum' | 'conclusion'
// spectrum  词义光谱（第 4 章）：校准一个歧义词的合理含义范围
// conclusion 结论区间（第 12 章）：从证据出发，能得出多强的结论

export interface ScaleLevelData {
  levelId: string
  chapter: number
  engine: 'scale'
  difficulty: Difficulty
  contributor?: string
  rewardTags: RadarDimension[]
  mode?: ScaleMode              // 缺省 'spectrum'
  promptRef: string             // i18n 键：待判断的陈述/词语
  spectrumLabels: [string, string]  // i18n 键：左端标签 / 右端标签（逻辑层放键，文案进 i18n）
  idealRange: [number, number]  // 0-100 合理区间 [min, max]
  idealPoint: number            // 区间内"最佳点"，0-100
}

export interface ScaleTexts {
  prompt: string
  spectrumLabels: [string, string]  // 实际文案
  hints: string[]
  explanation: string           // 通关解析：为什么这个区间是合理的
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
```

## C-4. Zod 校验（`levelSchema.ts` 新增 `scaleLevelSchema`）

- `idealRange` 两个数都在 0-100，且 `min < max`
- `idealPoint` 在 0-100，**且必须落在 `idealRange` 内**（否则区间设计自相矛盾）
- `spectrumLabels` 是长度为 2 的字符串数组（Zod `z.tuple`）
- 索引校验：`promptRef` 存在于 i18n `prompt`；两个标签文案非空

## C-5. 判定与评分

```
drag 时：热度 = 由 position 距 idealPoint 的远近决定轨道颜色（不进判定）
release 时：
  if position ∈ [idealRange.min, idealRange.max] → 判定「命中」
     精度 = 100 - round(|position - idealPoint| * 2)   // 越近中心分越高
  else → 判定「偏离」，提示偏向哪端：
     position < min → "偏左了，合理区在更右的位置"
     position > max → "偏右了，合理区在更左的位置"
  （提示文案只给方向，不给具体数字，保持挑战）
最佳成绩 = max(历次命中精度)；未命中过则提示"还没落入合理区"
提交 → score = 最佳成绩（下限 0，未命中过 = 无提交资格，必须至少命中一次）
```

**通关 = 点「提交校准」且至少命中过一次**（玩家自己决定何时提交，鼓励多试）。

## C-6. 视觉与动效（明亮纸感 + 紫色主题）

- 主题色 token：`--color-scale: #7c3aed`（紫，总纲"天平=紫色"）、`--color-scale-deep: #5b21b6`
- 滑块：粗轨道（h-5 圆角），轨道底色灰蓝；**热度渐晕**——距 idealPoint 越近，轨道渐变为绿→金（用 `background` 渐变插值，区间边界故意模糊）
- 两端标签、中间刻度（每 10 一格）
- 命中判定：滑块处出现**靶心动画**（同心圆波纹扩散 + 金色光晕，framer-motion）
- 结算弹窗传 `completionTitle="⚖️ 校准完成！"`

## C-7. 关卡内容（2 关）

| 关卡 | 模式 | 陈述 | 两端 | 合理区间 | 最佳点 | rewardTags |
|---|---|---|---|---|---|---|
| ch04-level01 | spectrum | 「每个人都应当享有言论自由」 | 想说什么说什么 ←→ 完全服从审查 | 45-80 | 62 | `structure` |
| ch12-level01 | conclusion | 「每周运动三次能改善健康」的证据 | 运动包治百病 ←→ 运动毫无作用 | 35-70 | 52 | `data` |

解析要点：歧义词/结论没有唯一正确答案，但证据支持一个**理性范围**——这正是批判性思维的灰度思维。

---

# 引擎 D｜数据拆弹（第 10 章统计陷阱）

## D-1. 玩法一句话

一张被人动了手脚的统计图表。图表上有几个「⚡ 可疑」标记，其中**有些是陷阱、有些是误导你的干扰项**。点对陷阱=拆弹成功，该处"剥落"露出真相；点错=爆炸警示（不惩罚，可重来）。全部陷阱拆完 → 整张图剥落，露出真实图表。

## D-2. 玩家体验流程

1. **进关第一眼**：目标卡「🎯 拆弹：图表里藏着 N 个统计陷阱，逐个拆除」+ **「拆弹手册」卡片**（列出本关可能存在的陷阱类型文本清单，如"检查 Y 轴起点""注意样本量"——**给排查方向但不给位置**）
2. 中央是**被动手脚的柱状图**（手写 SVG）：图上叠加若干「⚡ 可疑」标记点（不剧透类型，与引擎 B 同一哲学）
3. 点一个可疑点：
   - **是陷阱** → 拆弹成功：该柱/区域"剥落"动画（碎屑落下 + 露出修正后的真实局部）+ toast「🧨 拆掉陷阱：<解析>」+ 手册对应条目打勾
   - **是干扰项**（无辜标记）→ **爆炸警示**：全屏红色闪光 + 抖动 + 「💥 剪错线了！这不是陷阱」（**不惩罚、不计错**，可重来；稍后该标记变暗，提示别再点）
4. 全部陷阱拆除 → 整图**剥落露出真相**（真实 Y 轴/真实数据浮现）→ 结算弹窗「🧨 拆弹成功！」

## D-3. 数据结构契约（`levelTypes.ts` 新增）

```typescript
export interface DefusalLevelData {
  levelId: string
  chapter: number
  engine: 'defusal'
  difficulty: Difficulty
  contributor?: string
  rewardTags: RadarDimension[]
  // —— 图表定义（柱状图，手写 SVG，不用 Recharts）——
  chartData: { labelRef: string; value: number }[]   // labelRef → i18n 键
  yAxis: { min: number; max: number; start: number }  // start = Y 轴显示起点（陷阱：≠0）
  // —— 可疑点（含陷阱与干扰项）——
  suspectSpots: DefusalSpotRef[]
  // —— 拆弹手册条目（每个陷阱对应一条排查指引）——
  manualRefs: string[]          // i18n 键列表，进关展示
}

export interface DefusalSpotRef {
  spotId: string
  /** 指向 chartData 的索引，标明可疑点挂在哪个柱上 */
  barIndex: number
  isTrap: boolean               // true=真陷阱；false=干扰项
  debunkRef?: string            // i18n 键：拆弹成功解析（陷阱才有）
}

export interface DefusalTexts {
  chartTitle: string
  labels: string[]              // 各柱的 label 文案（与 chartData 顺序对应）
  manual: string[]              // 拆弹手册条目文案
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
```

> 与总纲的差异说明：总纲用 `chartConfig.yAxisTruncated + trueYAxisMin` 表达截断陷阱，且陷阱类型枚举复杂。本方案改为**显式 `yAxis.start`（显示起点）**——陷阱本质就是"起点被抬高了"，拆弹后真实起点回落到 `yAxis.min`。柱状图只表达"截断 Y 轴 / 零点缺失"一类陷阱（第 10 章最经典），其余类型（相关当因果等）留给未来折线图扩展。

## D-4. Zod 校验（`levelSchema.ts` 新增 `defusalLevelSchema`）

- `chartData` 非空，`value` 为有限数；`yAxis.min < yAxis.start`（start 在 min 与 max 之间），`yAxis.max > yAxis.start`
- `suspectSpots` 非空，`barIndex` 在 `chartData` 索引范围内，**至少 1 个 `isTrap: true`**（保证可通关）
- 陷阱 spot 必须有 `debunkRef` 且存在于 i18n `debunkRefs`；干扰 spot 不需要
- `manualRefs` 非空且都存在于 i18n `manual`
- 索引校验：每个 trap 的 debunkRef 在 i18n 中存在；`manualRefs` 长度 == trap 数量（手册逐条对应）

## D-5. 判定逻辑

```
tapSpot(spot):
  if spot 已处理（拆过或标记过）→ 忽略
  if spot.isTrap → 拆弹成功：
     标记已拆；该柱剥落动画；toast「🧨 拆掉陷阱：<debunkText>」
     手册第 N 条打勾
     if 全部陷阱已拆 → 整图剥落 + 结算
  else → 爆炸警示：
     红色闪光 + 抖动 + toast「💥 剪错线了！这不是陷阱」
     标记"已误触"（变暗，之后点击只提示"这不是陷阱，别碰它"）
     （不扣分不惩罚）
```

**通关 = 全部 `isTrap` 拆除**。误触次数不影响分数（鼓励排查），但影响结算文案（"干净利落" vs "略有点毛躁"，纯趣味）。

## D-6. 视觉与动效（明亮纸感 + 橙色主题）

- 主题色 token：`--color-defuse: #ea580c`（橙，总纲"拆弹=橙色"）、`--color-defuse-deep: #c2410c`
- 柱状图：手写 SVG，柱子灰蓝/橙描边；**Y 轴起点故意抬高**（`yAxis.start`），柱子底部悬空——视觉上"飘着"，这就是陷阱之一
- 可疑点：柱顶「⚡ 可疑」徽标（橙色脉冲），不剧透类型
- 拆弹成功：该柱"剥落"（碎屑粒子 + 透明度过渡）→ 露出真实柱高（按 `yAxis.min` 绘制）→ 与手册打勾联动
- 爆炸警示：全屏红闪（`bg-defuse/15` 闪 2 次）+ 页面抖动（`defuse-shake` CSS 关键帧）+ toast
- 整图剥落：所有柱从下往上"翻新"，真实 Y 轴刻度浮现（framer-motion 交错动画）
- 结算弹窗传 `completionTitle="🧨 拆弹成功！"`

## D-7. 关卡内容（1 关起步）

| 关卡 | 场景 | 陷阱 | 干扰可疑点 |
|---|---|---|---|
| ch10-level01 | 「本季度业绩飙升 200%！」的柱状图 | ①Y 轴起点抬高到 950（截断陷阱）②仅展示"最赚钱的 2 个季度"（cherry-picking，落在某柱上） | 1 个无辜柱上的可疑标记（误导玩家） |

Y 轴：min=0, start=950, max=1000；4 根柱（Q1-Q4 或 4 个产品），2 个陷阱 + 1 个干扰。
真实数据：拆弹后显示完整柱高（从 0 起）。手册条目：「检查 Y 轴起点是不是 0」「数据是不是只挑了好日子」→ 分别对应两个陷阱。

## D-8. 集成点（四件套，照旧）

1. `levelTypes.ts`：新增 ScaleMode/ScaleLevelData/ScaleTexts/ScaleRuntimeLevel + Defusal 全套类型
2. `levelSchema.ts`：`scaleLevelSchema` + `defusalLevelSchema`（含各自 texts schema，zh/en 嵌套）
3. `engines/scale/`（ScaleEngine.tsx + CalibrationSlider.tsx + TargetBurst.tsx + useScaleLogic.ts + scaleI18n.ts）、`engines/defusal/`（DefusalEngine.tsx + ChartBars.tsx + BombFlash.tsx + useDefusalLogic.ts + defusalI18n.ts）
4. `LevelPage.tsx`：分发加 `case 'scale'` / `case 'defusal'`（继续 React.lazy 懒加载）
5. `levelIndex.ts`：校验扩展（C-4 / D-4 规则）
6. `index.css`：`--color-scale` / `--color-defuse` token + `defuse-shake` 关键帧
7. `docs/ROADMAP.md`：阶段 5 进度

## 验收清单（对照 ROADMAP 5.1/5.2，全部"界面里能看到"）

- [ ] 5.1 引擎 C：滑块拖动有**热度反馈**（颜色随接近度渐变）；落区间内得分、越近 idealPoint 分越高；结算**命中靶心动画**
- [ ] 5.2 引擎 D：图表上有可疑点；拆弹成功该处**剥落露出真相**；剪错**爆炸警示**（不惩罚重来）；全部拆完**整图剥落**
- [ ] 双语：目标卡/滑块标签/手册/爆炸/结算全切
- [ ] 引导：进关即知"滑块放哪""手册先看哪条"
- [ ] 回归：引擎 A/B + 雷达页不受影响

## 风险与取舍

| 风险 | 决策 |
|---|---|
| 引擎 C 区间不显示，玩家会不会找不到？ | 热度渐晕 + 提示方向（"偏左/偏右"）足够引导；且可反复试，无挫败 |
| 引擎 D 用 Recharts 会不会更省事？ | 手写 SVG 柱状图：零依赖 + 陷阱热区/剥落动画完全可控；折线等类型留未来扩展 |
| 引擎 D 陷阱类型太单一？ | 本阶段聚焦最经典的"截断 Y 轴 + 挑数据"；类型枚举留扩展位 |
| 引擎 C 离散档 vs 连续？ | 连续滑块 + 热度，贴合"灰度思维"隐喻；难度档位（scaleSteps）留未来 |
| 爆炸警示"不惩罚"会不会让人乱点？ | 误触标记会变暗提示"这不是陷阱"，自然收敛；结算文案有"毛躁"趣味反馈 |
