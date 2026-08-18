# ⛏ Asking the Right Questions

**Don't just believe — ask the right questions.**

> **🌏 Language:** [English](README.md) · [中文](README.zh-CN.md)

An interactive critical-thinking training game based on the book *Asking the Right Questions* (12th edition). The 13 chapters are distilled into **5 reusable thinking engines** that train your "panning-for-gold" mindset through gameplay — scanning arguments, cross-examining evidence, calibrating gray areas, defusing data traps, and taming thinking impulses.

- **Data-driven**: every level is a plain JSON file + a bilingual text pack. Anyone can contribute a new level **without touching any code**.
- **Bilingual**: full EN / ZH support via semantic-anchor matching (translations never break).
- **Zero backend**: 100% client-side, deployable to any static host (GitHub Pages included).

🌐 **Live Demo**: <https://miststride.github.io/ask-the-right-questions/>

## ✨ Features

- **Not quizzing — performing thinking moves**: 5 game engines cover all 13 chapters, each mapping to a set of thinking actions from the book (scan / cross-examine / calibrate / defuse / tame).
- **Content fully decoupled from engines**: a level = one logic JSON (structure & rules) + one i18n text pack (EN/ZH). Contributors never touch engine code.
- **Local progress + six-dimension radar**: clearing levels lights up your profile radar — Structure / Evidence / Assumption / Fallacy / Data / Emotion.
- **Graded hints + deep-dive explanations**: every level offers progressive hints and a post-clear breakdown of the underlying reasoning.

## 🧩 The Five Thinking Engines

| Engine | Thinking move | Feel | Chapters |
|---|---|---|---|
| 🔍 **X-Ray Scanner** | Scan text for issue / conclusion / reasons / assumptions | Sentences get "X-rayed" into a skeleton you click to light up | 2 / 3 / 5 / 11 |
| ⚖️ **Courtroom** | Evaluate evidence strength, cross-examine sources | Ace-Attorney-style interrogation: shatter flawed testimony | 6 / 7 / 8 / 9 |
| ⚗️ **Calibration** | Judge the reasonable range of ambiguous words & conclusions | Drag a continuous spectrum toward the "expert consensus" bullseye | 4 / 12 |
| 🧨 **Defusal** | Spot statistical traps in charts | Cut the wrong wire and the chart peels away to reveal the truth | 10 |
| 🐘 **Taming Arena** | Restrain fast-thinking impulses | Elephant & rider metaphor; tutorial level + final boss level | 1 / 13 |

## 🛠 Tech Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Zustand · Framer Motion · React Router · Zod

## 🚀 Getting Started (Local Dev)

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

> Note: the project uses **hash routing** (`/#/level/...`) so it works on any static host without server-side fallback config.

## 🌐 Deploy to GitHub Pages

The repo is already configured to build with `base: '/<repo-name>/'`, so any of the following works.

### Option A — Deploy from a branch (simplest, no Actions)

This project commits its **build output into `docs/`** (see `vite.config.ts` → `build.outDir`), so branch deployment works out of the box:

1. Push the project to GitHub (it must be **public** for free Pages).
2. Go to your repo → **Settings → Pages** (left sidebar).
3. Under **Build and deployment** → **Source**, select **Deploy from a branch**.
4. Choose branch **`main`** and folder **`/docs`**, click **Save**.
5. Wait 1–2 minutes. Your site appears at:
   `https://<your-username>.github.io/<repo-name>/`
   e.g. `https://miststride.github.io/ask-the-right-questions/`

> After changing code, rebuild and commit the new output: `npm run build && git add docs && git commit && git push`.
> (Folder `/ (root)` publishes the raw source and will show a blank page — always use `/docs`.)

### Option B — GitHub Actions (recommended for production)

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Then in **Settings → Pages → Source**, choose **GitHub Actions**. Every push builds and deploys automatically.

### Troubleshooting — blank page

A blank page on GitHub Pages almost always means **asset paths are wrong** (the app loads but can't find its JS/CSS).

- If your repo is NOT named `ask-the-right-questions`, change `base` in `vite.config.ts` to match your repo name (e.g. `base: '/my-repo-name/'`).
- Use **hash routing** (already enabled) — never BrowserRouter on static hosts without a fallback.
- After changing config, rebuild (`npm run build`) and re-push; Pages rebuilds automatically.

## 📁 Project Structure

```
src/
├── engines/        # The 5 game engines (each: components + logic hook + i18n)
│   ├── xray/       # Engine A — argument scanner
│   ├── courtroom/  # Engine B — cross-examination
│   ├── scale/      # Engine C — spectrum calibration
│   ├── defusal/    # Engine D — chart defusal
│   └── tamer/      # Engine E — elephant taming
├── content/levels/ # ALL level content (JSON + i18n) — contributors edit only this
├── schema/         # Zod schemas that validate every level at build time
├── store/          # Zustand: progress (localStorage) + settings + UI
├── pages/          # Home / Chapter / Level / Profile
└── components/     # Shared UI (feedback toast, hints, complete modal, radar chart)
```

## 🤝 Contributing a Level

1. Copy an existing level folder under `src/content/levels/<chapter>/`.
2. Edit `level-01.json` (structure & rules) and `level-01.i18n.json` (EN/ZH texts).
3. Run `npm run dev` — the level index validates your JSON (Zod) and reports any error clearly.
4. Open a Pull Request. That's it — no engine knowledge required.

Design docs for each engine live in `design/` (e.g. `design/ENGINE-B-DESIGN.md`).

## 📄 License

MIT
