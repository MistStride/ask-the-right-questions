# ⛏ 学会提问 · Asking the Right Questions

**别急着相信，先学会提问。**

一本《学会提问》（原书第 12 版）的交互式批判性思维训练游戏集：把全书 13 章提炼成 **5 套可复用的思维引擎**，用游戏的手感练出「淘金式思维」——扫描论证、质询证据、校准灰度、拆除数据陷阱、驯服思维冲动。

- **数据驱动**：每个关卡 = 一份 JSON（结构与判定）+ 一份双语文本包。任何人**只填 JSON 就能贡献一个新关卡**，完全不碰代码。
- **中英双语**：全站 EN/ZH 切换，语义锚点匹配（找"原文片段"而非字符偏移），翻译永不错位。
- **纯前端零后端**：可部署到任意静态托管（GitHub Pages 等）。

🌐 **在线试玩**：<https://miststride.github.io/ask-the-right-questions/>

## ✨ 特性

- **不是刷题，是执行思维动作**：5 套游戏引擎覆盖 13 章，每套对应一组原书思维动作（透视 / 质询 / 校准 / 拆弹 / 驯服）
- **内容与引擎完全分离**：关卡 = 逻辑 JSON（结构判定）+ i18n 文本包（EN/ZH），贡献者不碰任何引擎代码
- **本地进度 + 六维思维雷达**：通关点亮「结构识别力 / 证据鉴别力 / 假设挖掘力 / 谬误免疫力 / 数据免疫力 / 情绪自控力」
- **分级提示 + 深度解析**：每题附渐进式提示，通关后展示原书逻辑拆解

## 🧩 五套思维引擎

| 引擎 | 思维动作 | 视觉/手感 | 覆盖章节 |
|---|---|---|---|
| 🔍 **论证透视镜** X-Ray Scanner | 扫描文本找论题/结论/理由/假设 | 句子被 X 光"透视"出骨骼，点击点亮论证骨架 | 2 / 3 / 5 / 11 |
| ⚖️ **逻辑法庭** Courtroom | 评估证据效力、质询信源 | 逆转裁判式"证词击碎"打脸爽感 | 6 / 7 / 8 / 9 |
| ⚗️ **天平校准站** Calibration | 判断歧义与结论的合理区间 | 连续光谱拖动，命中"专家共识区间"靶心 | 4 / 12 |
| 🧨 **数据拆弹** Defusal | 识破统计陷阱 | 剪线拆弹，拆对图表"剥落"露出真相，剪错爆炸警示 | 10 |
| 🐘 **心智驯兽场** Taming Arena | 克制快思考的情绪冲动 | 大象与骑象人隐喻，开场教程关 + 终章 BOSS 关 | 1 / 13 |

## 🛠 技术栈

React 19 · TypeScript · Vite · Tailwind CSS 4 · Zustand · Framer Motion · React Router · Zod

## 🚀 本地开发

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 生产构建 → docs/（Pages 用）
npm run preview    # 本地预览生产构建
```

> 说明：项目使用 **hash 路由**（`/#/level/...`），在任何静态托管上都能直接刷新/直达子页面，无需服务器端 fallback 配置。

## 🌐 部署到 GitHub Pages

仓库已配置 `base: '/<仓库名>/'`，以下两种方式任选。

### 方式 A — Deploy from a branch（推荐，本项目已把构建产物提交进 `docs/`）

本项目把构建产物输出到 **`docs/`**（见 `vite.config.ts` 的 `build.outDir`），所以分支部署开箱即用：

1. 仓库 → **Settings → Pages → Build and deployment → Source**，选择 **Deploy from a branch**
2. 分支选 **`main`**，文件夹选 **`/docs`**，点 **Save**
3. 之后每次 push 到 `main` 自动更新，等 1-2 分钟访问：`https://<用户名>.github.io/<仓库名>/`
   （例如 `https://miststride.github.io/ask-the-right-questions/`）

> 改代码后记得重建并提交产物：`npm run build && git add docs && git commit && git push`。
> 文件夹选 `/(root)` 会发布源码 → 白屏；**必须选 `/docs`**。

### CI — 构建检查（可选）

仓库内置 `.github/workflows/deploy.yml` 作为**构建检查**：每次 push 到 `main` 自动执行
`npm ci && npm run build`（同时校验全部关卡数据的 Zod 与锚点）。部署不依赖它，方式 A 才是线上生效机制。

### 白屏排查

空白页几乎都是**资源路径**问题：

1. **Source 必须服务构建产物**（Deploy from a branch: main / **folder 选 /docs**），用 branch 模式发源码（/root）必白屏
2. `vite.config.ts` 的 `base` 必须等于仓库名（如 `'/ask-the-right-questions/'`）；改过仓库名必须同步改
3. 必须用 **hash 路由**（本项目已启用），BrowserRouter 在静态托管上子路由会 404
4. 改完重新 push，等 Pages 自动更新（1-2 分钟），**Ctrl+Shift+R 硬刷新**排除浏览器缓存

## 📁 项目结构

```
src/
├── engines/        # 5 套游戏引擎（每套：组件 + 判定 hook + UI 文案）
│   ├── xray/       # 引擎A 论证透视镜
│   ├── courtroom/  # 引擎B 逻辑法庭
│   ├── scale/      # 引擎C 天平校准站
│   ├── defusal/    # 引擎D 数据拆弹
│   └── tamer/      # 引擎E 心智驯兽场
├── content/levels/ # 全部关卡内容（JSON + i18n）——贡献者只改这里
├── schema/         # Zod 关卡校验（写错 JSON 在 dev/build 期直接报错）
├── store/          # Zustand：进度（localStorage）+ 设置 + UI
├── pages/          # 首页 / 章节页 / 关卡页 / 雷达页
└── components/     # 共享组件（反馈弹层、提示面板、结算弹窗、雷达图）
```

## 🤝 贡献一个关卡

**推荐方式 —— 脚手架 CLI：**

```bash
npm run new-level                      # 交互式
npm run new-level -- xray 4            # 引擎 + 章节，其余默认
```

它会按所选引擎生成一份**结构合法**的模板（`level-<N>.json` + `.i18n.json`），
你只需要填入文案（中英双语），`npm run build` 通过即可。

**或者复制现有关卡：**
1. 复制 `src/content/levels/<章节>/` 下的一个关卡目录
2. 编辑 `level-01.json`（结构与判定）和 `level-01.i18n.json`（EN/ZH 文案）
3. 运行 `npm run build` —— Zod + 锚点校验，写错会给出清晰报错
4. 发起 Pull Request。就这么简单，不需要懂引擎代码

完整指南、Issue 模板与工程规范见 **[CONTRIBUTING.md](CONTRIBUTING.md)**。

各引擎设计文档在 `design/` 目录（如 `design/ENGINE-B-DESIGN.md`）。

## 📄 License

MIT
