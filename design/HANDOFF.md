# 项目交接文档 · HANDOFF

> 用途：压缩上下文重开对话时，把这份文档 + ROADMAP 丢给新会话即可无缝接手。
> 最后更新：2026-08-18 15:40（关卡扩容批 2 完成、workflow 修复、遗留文案清理之后）

---

## 1. 项目一句话

**《学会提问》(Asking the Right Questions)** —— 数据驱动的批判性思维训练游戏集：
5 套通用交互引擎覆盖全书 13 章，中英双语，纯前端零后端，社区靠填 JSON 贡献关卡。

- 线上 Demo：https://miststride.github.io/ask-the-right-questions/
- 远程仓库：https://github.com/MistStride/ask-the-right-questions （main 分支，public）
- 技术栈：Vite + React 19 + TS + Tailwind 4 + React Router (HashRouter) + Zustand + Framer Motion + Zod
- 本地开发：`npm run dev`（根路径）；生产构建：`npm run build` → 产物输出到 `docs/`（提交进仓库供 Pages 用）

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
| 阶段 8 开源基建 | ⚠️ 部分 | 8.1 Actions 部署✅（纯 CI 构建检查，部署走 main/docs）；8.4 push✅；8.2 关卡脚手架 CLI ❌；8.3 CONTRIBUTING/Issue 模板 ❌ |

**关卡总量**：35 关（ch01=1 教程、ch02~12 各 3、ch13=1 BOSS），全部中英双语。
git 历史：约 20 个 commit，远程 main 最新。

## 3. 与纲要对比，没实现好 / 待办的部分

1. **阶段 7 战绩分享卡（传播钩子，最值得做）**：雷达页目前只有雷达图，没有"思维诊断报告"（头衔+高光时刻），没有一键生成可发小红书/朋友圈的分享图片（计划用 html-to-image）。
2. **8.2 关卡脚手架 CLI**：写关卡靠手抄模板 JSON，重复劳动；计划 `scripts/new-level.ts` 一行生成。
3. **8.3 开源协作文档**：CONTRIBUTING.md、Issue 模板（新增关卡/翻译/难度校准）未写——影响"社区填 JSON 贡献关卡"的愿景落地。
4. **3.1 正式 i18n**：现有轻量字典可用但零散（每个页面自带 t 字典），react-i18next 迁移被暂缓——功能没问题，属于工程整洁度。

## 4. 可改进清单（精修方向，按优先级）

**A. 内容/玩法（用户视角最敏感）**
- [ ] 各引擎难度校准：tamer 已升级（反问伪问题辨别），其余引擎（xray/scale/courtroom/defusal）的干扰项/难度梯度可继续加码
- [ ] 关卡内"逐步提示"体系（hints 已有字段，可做逐条解锁）
- [ ] 通关结算更细的得分拆解（每步判定给分原因）
- [ ] 游戏音效/震动反馈（目前纯视觉）

**B. 传播与留存（阶段 7）**
- [ ] 雷达图 → "思维诊断报告"卡片（头衔、六维、高光时刻、可下载分享图）
- [ ] OG meta / 分享预览（链接卡片好看）

**C. 工程与开源**
- [ ] `scripts/new-level.ts` 关卡脚手架 CLI
- [ ] CONTRIBUTING.md + Issue 模板（关卡/翻译/难度校准）
- [ ] 移动端适配检查（目前以桌面布局为主）
- [ ] 自动化测试：目前验证靠 .preview/verify-*.cjs（Playwright 脚本），可考虑接入 CI

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

## 7. 本次会话已完成的最后一件事（2026-08-18 15:40）

- 清理全部"加工遗留物"文案：首页"第 2 章可玩/开发中"、章节页"敬请期待"、死代码 `src/i18n/ui.ts`
- workflow 从"部署型"改为"纯 CI 构建检查"（修复 gh-pages 同步必失败的 bug，绿勾不再红叉）
- 关卡扩容两批共 22 个新关（每章 3 关，共 35 关）+ 法庭锚点扫描修复
- 心智驯兽场难度升级（反问伪问题/陈述句正确项/看似合理干扰项）
- GitHub Pages 白屏终极修复（main/docs 分支内提交产物 + folder=/docs）
