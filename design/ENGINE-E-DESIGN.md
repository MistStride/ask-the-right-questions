# 阶段 6 设计方案：引擎 E 心智驯兽场（第 1/13 章）

> 对应《ROADMAP.md》阶段 6（6.1 第 1 章教程关 / 6.2 第 13 章终章 BOSS）与《完整技术设计方案》4.6 节。
> 本文档是**代码生成契约**。大象与骑象人隐喻：大象=情绪/直觉（快思考），骑象人=理性（慢思考）。

---

## E-1. 玩法一句话

你心里有头**大象**（情绪冲动），遇到刺激它会躁动。你要在它"暴走"前，从候选回应里点出**批判性问题**（骑象人出手）安抚它。一连串冲动全部安抚 → 驾驭成功。

## E-2. 玩家体验流程（验收基准）

1. **进关第一眼**：目标卡「🐘 安抚你心里的大象——别让冲动替你发言」+ 情绪条（大象躁动度）
2. **第 1 章教程特殊开场**：「海绵 vs 淘金」二选一——看到一条观点，你是"全盘吸收"还是"先提问"？选淘金 → 进入正式教程
3. 每个**冲动时刻**：
   - 场景推进 + 大象躁动动画（左右摇摆、情绪条上涨）
   - 一行"内心的冲动"（如「医生都是骗钱的！」）
   - 3 张候选回应卡：**1 张批判性问题**（正确）+ 2 张冲动附和/无关回应（干扰）
4. **点对** → 大象安抚动画（安静 + 金色光环 + 骑象人 🧑‍🦱 出现）+ 解析「✔ 骑象人：<为什么这是对的>」→ 下一个冲动
5. **点错** → 大象更躁动（抖动 + 情绪条 +20%），提示「✗ 这不是安抚，再想想」，可重选
6. **情绪条满（100%）→ 大象暴走**：全屏震荡 + 「💢 暴走！」→ 「🫁 深呼吸」按钮重置（情绪回 20%，重试当前冲动，**不惩罚关卡**）
7. 全部冲动安抚 → 通关：「🧘 骑象人驾驭了大象！」结算弹窗

## E-3. 数据结构契约（levelTypes.ts）

```typescript
export type TamerMode = 'tutorial' | 'boss'
export type TamerBias =
  | 'jumping_to_conclusion' // 跳到结论
  | 'egocentrism'           // 自我中心
  | 'black_and_white'       // 非黑即白
  | 'conformity'            // 从众

export interface TamerImpulseRef {
  eventId: string
  biasType: TamerBias
  /** 候选回应卡（i18n 键数组，含 1 正确 + 2 干扰） */
  optionRefs: string[]
  /** 正确回应的 i18n 键（必须 ∈ optionRefs） */
  correctOptionRef: string
}

export interface TamerLevelData {
  levelId: string
  chapter: number
  engine: 'tamer'
  difficulty: Difficulty
  contributor?: string
  rewardTags: RadarDimension[]
  mode?: TamerMode
  /** 场景描述（i18n 键） */
  scenarioRef: string
  impulseEvents: TamerImpulseRef[]
  /** 每关情绪条初始值（0-100，默认 20） */
  initialRage?: number
  /** 点错一次情绪上涨（默认 20） */
  ragePerMiss?: number
}

export interface TamerTexts {
  scenario: string
  /** 冲动时刻的"内心冲动"文案：eventId → 文案 */
  impulsePrompts: Record<string, string>
  /** 候选回应文案池：optionKey → 文案 */
  options: Record<string, string>
  /** 安抚成功解析 + 偏见标签：eventId → { calm, biasLabel } */
  eventMeta: Record<string, { calm: string; biasLabel: string }>
  hints: string[]
  explanation: string
}

export interface TamerRuntimeLevel {
  meta: LevelDefinition['meta']
  mode: TamerMode
  scenario: string
  events: {
    eventId: string
    biasType: TamerBias
    biasLabel: string
    impulsePrompt: string
    options: { key: string; text: string }[]
    correctKey: string
    calm: string
  }[]
  initialRage: number
  ragePerMiss: number
  hints: string[]
  explanation: string
}
```

## E-4. Zod 校验（levelSchema.ts）

- `impulseEvents` 非空；每个事件 `correctOptionRef` 必须存在于 `optionRefs`；`optionRefs` 至少 3 个
- `initialRage` 0-100 默认 20；`ragePerMiss` 1-100 默认 20
- 索引校验：`scenarioRef` 存在于 i18n `scenario`；每个 `eventId` 的 `impulsePrompts`/`eventMeta` 都存在；每个 optionRef 存在于 i18n `options`；`correctOptionRef` 的文案确实在 `optionRefs` 文案池中

## E-5. 判定逻辑（useTamerLogic）

```
selectOption(optionKey):
  当前事件 = impulseEvents[idx]
  若 optionKey === 当前事件.correctOptionRef → 安抚成功：
    idx += 1；情绪条归零；若 idx 到最后 → 通关
  否则 → 选错：rage += ragePerMiss（封顶 100）；wrongTries += 1
    若 rage ≥ 100 → 暴走状态（需"深呼吸"重置：rage=20，重试当前事件）

score = max(60, 100 - wrongTries * 10)
通关 = 全部事件安抚成功
```

## E-6. 视觉与动效（明亮纸感 + 金色主题）

- token：`--color-tamer: #b45309`（琥珀金）、`--color-tamer-deep: #92400e`
- 大象：emoji 🐘 大号 + framer-motion 动画（躁动：x 摇摆 + rotate；安抚：安静 + 金色光环扩散；暴走：scale 放大 + 全屏红闪）
- 情绪条：琥珀红渐变，点错抖动上升；满格全屏「💢 暴走！」震荡
- 冲动提示：红色"内心冲动"气泡（大象的心里话）
- 回应卡：白卡，正确项被点后金色高亮；干扰项被点后红边抖动（可再点）
- 结算：`completionTitle="🧘 骑象人驾驭了大象！"` / boss 版「🏇 骑象踏平虚假论证荒原！」

## E-7. 关卡内容（2 关）

| 关卡 | 模式 | 场景 | 冲动（biasType） | rewardTags |
|---|---|---|---|---|
| ch01-level01 | tutorial | 朋友圈保健品"我爸吃了一周就好了，医生都是骗钱的" | ①跳到结论「医生都是骗钱的！」②自我中心「我爸说的就是对的」③非黑即白「要么信爸要么信医生」 | `emotion` |
| ch13-level01 | boss | 网红带货直播，弹幕刷屏 | ①从众「全网都在买肯定是好东西」②跳到结论「销量高=质量好」③非黑即白「要么信主播要么是黑粉」④自我中心「我朋友都说好」⑤证据质询「他说研究证明有效」 | `emotion` |

第 1 章教程含开场「海绵 vs 淘金」二选一（海绵=吸收观点 → 提示"你是海绵吗？试试先提问"；淘金=先提问 → 进入正式教程）。

## E-8. 集成点（四件套照旧）

1. `levelTypes.ts`：Tamer 全套类型
2. `levelSchema.ts`：`tamerLevelSchema` + `tamerLevelTextsSchema`
3. `engines/tamer/`：TamerEngine.tsx + ElephantScene.tsx + OptionCards.tsx + useTamerLogic.ts + tamerI18n.ts
4. `LevelPage.tsx`：分发 `case 'tamer'`（React.lazy）
5. `levelIndex.ts`：校验分支
6. `index.css`：`--color-tamer` token
7. `docs/ROADMAP.md`：阶段 6 进度

## 验收清单（对照 ROADMAP 6.1/6.2）

- [ ] 6.1 第 1 章教程：海绵/淘金二选一 + 大象躁动 → 点批判性问题安抚
- [ ] 6.2 第 13 章 BOSS：多冲动序列，骑象人踏平荒原
- [ ] 点错 → 大象更躁动（情绪条涨）可重选；满格暴走 → 深呼吸重置不惩罚
- [ ] 双语：目标卡/冲动/回应卡/解析/结算全切
- [ ] 引导：进关即知"点出批判性问题安抚大象"
- [ ] 回归：前 4 引擎 + 雷达页不受影响

## 风险与取舍

| 风险 | 决策 |
|---|---|
| 时间压力（总纲 timeWindowMs）对新手太难 | 教程关无时限；BOSS 关用"情绪条"间接施压（不设硬倒计时），点错涨条已够紧张 |
| 选项太明显变成"找茬" | 干扰项用"冲动附和/无关转移"两种，贴近真实心里话；正确项是"提问句"（总以问号结尾），玩家学会"看到观点先问" |
| 大象 SVG 手绘成本高 | 用 emoji 🐘 + framer-motion 动画（摇摆/光环/暴走），视觉够用且低成本 |
| 暴走惩罚过重劝退 | 暴走 = 深呼吸重置当前冲动（不重置整关、不扣分），保留紧张感不劝退 |
