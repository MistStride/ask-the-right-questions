# 项目交接文档 · HANDOFF

> 用途：压缩上下文重开对话时，把这份文档 + ROADMAP 丢给新会话即可无缝接手。
> 最后更新：2026-09-07 晚（难度梯度 2.0 已全量铺开 35 关；「知识教学层」①章节知识卡已上线）

---

## 1. 项目一句话

**《学会提问》(Asking the Right Questions)** —— 数据驱动的批判性思维训练游戏集：
5 套通用交互引擎覆盖全书 13 章，中英双语，纯前端零后端，社区靠填 JSON 贡献关卡。

- 线上 Demo：https://miststride.github.io/ask-the-right-questions/
- 远程仓库：https://github.com/MistStride/ask-the-right-questions （main 分支，public）
- 技术栈：Vite + React 19 + TS + Tailwind 4 + React Router (HashRouter) + Zustand + Framer Motion + Zod
- 本地开发：`npm run dev`（根路径）；生产构建：`npm run build` → 产物输出到 `docs/`（提交进仓库供 Pages 用）

## 1.5 知识教学层（把游戏重新接回《学会提问》原书）

项目 5 引擎 35 关后，游戏机制盖住了书的方法论——玩家不被告知在练书里哪一章。2026-09-07 起按"4 个插入点"逐步补教学：

- **① 章节知识卡（✅ 已完成）**：`src/content/chapters.ts` 的 `ChapterMeta` 新增 `teaching:{zh,en}`（13 章全部填好书摘/判断清单/为什么重要），`src/pages/ChapterPage.tsx` 在标题卡片与关卡列表之间渲染「📖 本章知识点 · 来自《学会提问》」卡片。
- **② 关卡内"知识点"折叠条（待做）**：每关 step 的 prompt 旁加「书里怎么讲」折叠，讲通用方法论（区别于现有针对文本的 hints）。
- **③ 结算"思维报告"回扣书本（待做）**：结算页列出本关练到的书概念＋定义＋本局表现（顺手补"结算只给总分无分步反馈"缺口）。
- **④ 全局知识库/术语表（待做）**：顶栏「📚 知识库」入口，13 章概念＋关键术语速查。

## 2. 当前完成度（对照 design/ROADMAP.md）

| 纲要阶段 | 状态 | 说明 |
|---|---|---|
| 阶段 0 脚手架 | ✅ | Vite8 + React19 + TS + Tailwind4 + Router + Zustand + Framer + Zod |
| 阶段 1 引擎A + 第2章 | ✅ | 论证透视镜（scan 找结论/理由） |
| 阶段 2 引擎A 铺量 | ✅ | ch03 correctChain 连线 / ch05 dig 挖假设 / ch11 gap 空洞 + Schema 扩展 |
| 阶段 3 i18n + 雷达 | ⏸️/✅ | 3.2 雷达图完成；3.1 react-i18next 评估后**暂缓**（轻量字典已满足验收） |
| 阶段 4 引擎B 法庭 | ✅ | ch06 逻辑诊所 / ch07 专家质询 / ch08 研究审计 / ch09 对质墙（lineup） |
| 阶段 5 引擎C+D | ✅ | ch04/12 天平校准（scale 词义光谱）+ ch10 数据拆弹（defusal） |
| 阶段 6 引擎E 驯兽场 | ✅ | ch01 教程（海绵vs淘金）+ ch13 终章 BOSS（5→6 冲动，已难度升级） |
| 阶段 7 战绩分享卡 | ✅ | 雷达图升级"思维诊断报告"（`src/components/ShareCard.tsx`：6 档头衔 + 静态雷达 + 强弱 chip）+ html-to-image toPng pixelRatio=3 导出 1080x1440 高清 PNG |
| 阶段 8 开源基建 | ✅ | 8.1 Actions 部署✅（纯 CI 构建检查，部署走 main/docs）；8.2 `scripts/new-level.mjs` 关卡脚手架 CLI ✅（`npm run new-level`，5 引擎合法模板）；8.3 CONTRIBUTING.md + 4 个 Issue 模板 ✅；8.4 push ✅ |

**关卡总量**：35 关（ch01=1 教程、ch02~12 各 3、ch13=1 BOSS），全部中英双语。
git 历史：约 20 个 commit，远程 main 最新。

## 3. 与纲要对比，没实现好 / 待办的部分

> 阶段 0-8 已全部完成。剩余为"精修级"改进，见第 4 节。

1. **3.1 正式 i18n**：现有轻量字典可用但零散（每个页面自带 t 字典），react-i18next 迁移被暂缓——功能没问题，属于工程整洁度（依赖已装：i18next/react-i18next）。

## 4. 可改进清单（精修方向，按优先级）

**A. 内容/玩法（用户视角最敏感）**
- [x] **难度梯度 2.0 · 全量铺开（2026-09-07 晚，35 关）**：难度分布 D1×12 / D2×11 / D3×12。逐引擎：xray scan ch02 试点（8a46bcd）→ scale ch04/12（题干拉长、区间收窄）→ defusal ch10（D3 手册只给方向不给位置）→ tamer ch01/ch13（BOSS 8 事件、正确项混合追问/判断 + 伪问题陷阱）→ xray ch03/05/11（正文 127→357 字级阶梯，L3 含「结论伪装」干扰、dig 挖双重隐藏假设、gap 埋多重遗漏线索）→ courtroom ch06-09 全部 12 关（干扰提问从卡通级升级为"看似关心案情实则跑题"的半迷惑问题，各章 L1/L2/L3 难度修正为 1/2/3 阶梯）。校验：`scripts/check-anchors.mjs` 全过、构建零错误、已推送线上。
- [ ] 关卡内"逐步提示"体系（hints 已有字段，可做逐条解锁；难度梯度 2.0 原规划含"D2/D3 提示折叠扣分"，尚未实现）
- [ ] 通关结算更细的得分拆解（每步判定给分原因）
- [ ] 游戏音效/震动反馈（目前纯视觉）

**B. 传播与留存（阶段 7 已落地基础版）**
- [x] 雷达图 → "思维诊断报告"卡片（头衔、六维、高光时刻、可下载分享图）✅
- [ ] OG meta / 分享预览（链接卡片好看）
- [ ] 分享卡可扩展：通关时间/连续通关天数/最弱维度鼓励语

**C. 工程与开源**
- [x] `scripts/new-level.mjs` 关卡脚手架 CLI（`npm run new-level`）✅
- [x] CONTRIBUTING.md + Issue 模板（关卡/翻译/难度校准/bug）✅
- [ ] 移动端适配检查（目前以桌面布局为主）
- [ ] 自动化测试：目前验证靠 .preview/verify-*.cjs（Playwright 脚本），可考虑接入 CI
- [ ] 社区示例关卡（用 CLI 产出一个"Good First Issue"标签的示例 PR 模板）

**D. 已知技术债（本次已清理一部分）**
- [x] 首页"第 2 章可玩"遗留文案 → 改为实时统计
- [x] 五引擎卡片"开发中"死分支 → 移除
- [x] `src/i18n/ui.ts` 整文件死代码（无人引用）→ 已删除
- [ ] 章节页/首页仍各自维护 t 字典（重复），等正式 i18n 时统一

## 5. 工程铁律 & 常用命令（新会话必须遵守）

1. **一次只做一个阶段/一个功能**，做完"界面里能看到"再进下一个。
2. **内容与引擎分离**：加关卡只碰 `src/content/levels/` JSON + 同名 `.i18n.json`，引擎代码不动。
3. **语义锚点**：法庭/透视镜的 spot 锚点文本必须**逐字符**出现在 testimony/sourceText 里（中英各写各的）；锚点不匹配构建会报错。
4. **判定与文案解耦**：逻辑文件不含语言，i18n 文件不含判定。
5. **JSON 靠 Zod 校验**：字段写错 dev/build 期立即报错，`npm run build` 零错误是底线。
6. **新引擎 = 四件套**：levelTypes 类型 + levelSchema + engines/<name>/ 组件 + LevelPage 分发 case。
7. **部署机制（重要）**：部署走 **Settings → Pages → Deploy from a branch: main / folder: /docs**（已配好）。
   workflow `.github/workflows/deploy.yml` 只是 CI 构建检查（不要改回部署型，gh-pages 同步步骤有坑会红叉）。
   **每次改完代码必须**：`npm run build`（产物进 docs/）→ `git add -A && git commit && git push` → Pages 1-2 分钟自动更新。
8. **推送命令**（沙箱环境）：`git -c credential.helper= -c credential.https://github.com.helper=wincred -c credential.helper=wincred -c http.proxy=http://127.0.0.1:7897 -c https.proxy=http://127.0.0.1:7897 push origin main`
9. **验证脚本**：`C:/Users/shoyo/WorkBuddy/2026-08-18-04-07-00/.preview/` 下有 verify-*.cjs（Playwright，dev server 须先起），URL 必须用 hash 形式 `http://localhost:5173/#/level/xxx`。
10. **路由是 HashRouter**：URL 形如 `/#/level/ch07-level01`；验证脚本改 locale 用 localStorage（key `atrq-settings-v1`）后必须 `page.reload()` 才生效（纯 hash 导航不重载页面）。

## 6. 重开对话推荐提示词（直接复制使用）

```
继续精修《学会提问》批判性思维训练游戏项目。先读这两份文档再动手：
1. design/HANDOFF.md（交接总结+待办+铁律）
2. design/ROADMAP.md（原始纲要）

然后按 HANDOFF 第 3、4 节的优先级继续：
优先做阶段 7「战绩分享卡」（雷达图升级为可下载的思维诊断报告分享图），
做完在界面里验证效果再提交推送（记得 npm run build 把 docs/ 产物一起提交）。
```

## 7. 本会话已完成的最后事项（2026-08-19 05:20）

- **阶段 7 战绩分享卡**：雷达图升级"思维诊断报告"（头衔 6 档 + 静态雷达 + 强弱 chip）+ html-to-image 导出 1080x1440 高清 PNG
- **阶段 8.2 关卡脚手架 CLI**：`scripts/new-level.mjs`（`npm run new-level`，参数/交互双模式，5 引擎合法模板，实测过 Zod+锚点校验）
- **阶段 8.3 开源协作**：CONTRIBUTING.md（EN）+ .github/ISSUE_TEMPLATE/ 4 个模板（关卡/翻译/难度/bug）；README 中英补 CLI 与 CONTRIBUTING 链接
- **此前已完成**：遗留文案清理、workflow 改纯 CI 构建检查、关卡扩容 35 关、tamer 难度升级、Pages 白屏终极修复

## 8. 难度梯度 2.0（2026-09-07 起，ch02 试点）

**问题诊断（脚本量化 35 关）**：`difficulty` 字段仅用于章节页显示 🔥，不参与任何玩法/文本量；D1/D2/D3 平均正文 101/105/83 字（越高越短）；全文 13–152 字，平均 101 字——难度是「假」的，题目偏短偏分明。

**分级标准（让 difficulty 同时驱动文本量与机制）**：

| 维度 | D1 入门 | D2 进阶 | D3 挑战 |
|---|---|---|---|
| 正文中文量 | 120–160 字 | 200–280 字 | 320–450 字 |
| 节点/干扰 | 2–3 + 2 明显 | 3–4 + 2 半迷惑歧义词 | 3 + 3 含结论伪装/理由伪装陷阱 |
| 步骤链 | 单步 | 2 步 | 3 步 + 跨节点综合 |

**ch02 试点结果（已提交 8a46bcd）**：L1 127字/3+2 → L2 169字/4+2 → L3 357字/3+3（干扰项含 type=conclusion 的「结论伪装」，NODE_TYPE_LABELS 已覆盖，点击报「干扰项」）。

**复用脚本**（项目根 scripts/）：
- `node scripts/analyze-levels.mjs` —— 量化每关正文中文量/节点数/提示数/难度/模式，复查阶梯
- `node scripts/check-anchors.mjs` —— 严格校验 xray 锚点：textRef 必须是 sourceText 精确子串、i18n 键与主 JSON 节点完全对应、gap 正确项在候选数组

**铺开顺序（已完成全部）**：xray 其余章（ch03/05/11）→ 最薄的 scale（6 关）→ defusal → courtroom（干扰问题去卡通化）→ tamer（boss 去固定「追问」）。
