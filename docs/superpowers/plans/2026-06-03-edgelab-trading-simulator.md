# EdgeLab Trading Simulator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build EdgeLab — a fully local React trading education platform with a paper-trading simulator and 7 structured lessons covering ICT/SMC concepts (market structure, FVGs, order blocks, liquidity sweeps, VSA, confirmations, final exam).

**Architecture:** Vite + React 18 SPA, no backend. Canvas-based candlestick chart engine. Zustand with localStorage persistence for progress. React Router v6 for page routing. All price data is generated client-side via a deterministic mock engine with pattern injection.

**Tech Stack:** React 18, Vite 5, React Router v6, Zustand 4, Tailwind CSS 3, Lucide React, JetBrains Mono + Playfair Display (Google Fonts), HTML5 Canvas.

**Source spec:** Full code for every file is in the spec document sent by the user. This plan references section numbers from that spec.

---

## File Map

| File | Responsibility |
|------|---------------|
| `edgelab/index.html` | Vite entry HTML |
| `edgelab/vite.config.js` | Vite config |
| `edgelab/tailwind.config.js` | Design tokens (colors, fonts) |
| `edgelab/src/index.css` | Google Fonts import + Tailwind base |
| `edgelab/src/main.jsx` | React root mount |
| `edgelab/src/App.jsx` | BrowserRouter + Routes |
| `edgelab/src/data/candleGenerator.js` | generateCandles, injectPattern, applyDrift |
| `edgelab/src/data/assets.js` | ASSETS array + TIMEFRAMES |
| `edgelab/src/data/scenarioLibrary.js` | LESSONS_META + LESSONS_MAP (imports all lessons) |
| `edgelab/src/data/strategyPlaybook.js` | Full strategy reference data |
| `edgelab/src/store/useAppStore.js` | Zustand store with persist middleware |
| `edgelab/src/components/chart/CandleChart.jsx` | Canvas OHLCV renderer + annotation overlay |
| `edgelab/src/components/ui/TopNav.jsx` | Top navigation bar |
| `edgelab/src/components/course/CourseDashboard.jsx` | Lesson list + progress stats |
| `edgelab/src/components/course/LessonShell.jsx` | Route wrapper for any lesson |
| `edgelab/src/components/simulator/SimulatorPage.jsx` | Live paper-trading simulator |
| `edgelab/src/pages/PlaybookPage.jsx` | Strategy reference page |
| `edgelab/src/lessons/Lesson1_MarketStructure.jsx` | BOS + CHoCH |
| `edgelab/src/lessons/Lesson2_OrderFlow.jsx` | FVG identification |
| `edgelab/src/lessons/Lesson3_OrderBlocks.jsx` | OB identification |
| `edgelab/src/lessons/Lesson4_LiquiditySweeps.jsx` | Liquidity sweep identification |
| `edgelab/src/lessons/Lesson5_VolumeVSA.jsx` | Volume climax + low-vol pullback |
| `edgelab/src/lessons/Lesson6_ConfirmationsRejections.jsx` | Dual-chart valid vs invalid + quiz |
| `edgelab/src/lessons/Lesson7_FinalExam.jsx` | 10 mock setups multiple-choice exam |

---

## Task 1: Project Scaffold + Config

**Files:**
- Create: `edgelab/` (Vite scaffold)
- Modify: `edgelab/package.json`
- Create: `edgelab/tailwind.config.js`
- Create: `edgelab/src/index.css`

**Working dir:** `/Users/andreupaz/tradingsim/.claude/worktrees/magical-elbakyan-4ce595/`

- [ ] **Step 1: Scaffold Vite project**

```bash
cd /Users/andreupaz/tradingsim/.claude/worktrees/magical-elbakyan-4ce595
npm create vite@latest edgelab -- --template react
```
Expected: `edgelab/` directory created with React template.

- [ ] **Step 2: Install runtime dependencies**

```bash
cd edgelab
npm install react-router-dom zustand lucide-react
```

- [ ] **Step 3: Install dev dependencies + init Tailwind**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
Expected: `tailwind.config.js` and `postcss.config.js` created.

- [ ] **Step 3b: Fix PostCSS ESM conflict (Vite 5 + Tailwind 3)**

Vite 5 sets `"type": "module"` in `package.json`, making all `.js` files ESM. The generated `postcss.config.js` uses CommonJS `module.exports = {}` syntax which breaks under ESM. Rename it:

```bash
mv postcss.config.js postcss.config.cjs
```

Verify `postcss.config.cjs` contains:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 3c: Update `index.html` title and verify `vite.config.js`**

Open `index.html`. Change `<title>Vite + React</title>` to `<title>EdgeLab</title>`.

Check `vite.config.js` — the default scaffold content is fine; the spec does not require customisation. If the spec version differs, paste it now.

- [ ] **Step 4: Replace `tailwind.config.js`** (spec §3, Step 4)

```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono:  ['"JetBrains Mono"', 'monospace'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        bg:           '#0a0c0f',
        surface:      '#111318',
        panel:        '#161a21',
        border:       '#1e2530',
        borderBright: '#2a3445',
        green:        '#00d17a',
        red:          '#ff3d5a',
        yellow:       '#f5c842',
        blue:         '#3d9bff',
        muted:        '#6b7a91',
        dim:          '#3d4a5c',
      }
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Replace `src/index.css`** (spec §3, Step 5)

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Playfair+Display:wght@700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: #0a0c0f;
  color: #e8edf5;
  font-family: 'JetBrains Mono', monospace;
  -webkit-font-smoothing: antialiased;
}
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #2a3445; border-radius: 2px; }
canvas { display: block; }
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```
Expected: "Local: http://localhost:5173" — default Vite React page loads.

- [ ] **Step 7: Commit scaffold**

```bash
git add edgelab/
git commit -m "feat: scaffold EdgeLab Vite+React project with Tailwind design tokens"
```

---

## Task 2: Data Layer

**Files:**
- Create: `edgelab/src/data/candleGenerator.js`
- Create: `edgelab/src/data/assets.js`
- Create: `edgelab/src/store/useAppStore.js`
- Create: `edgelab/src/data/strategyPlaybook.js`

- [ ] **Step 1: Create `src/data/candleGenerator.js`** (spec §4)

Paste the full `generateCandles`, `injectPattern`, and `applyDrift` functions from spec §4 exactly.

- [ ] **Step 2: Create `src/data/assets.js`** (spec §4)

```js
export const ASSETS = [
  { id: 'BTC', name: 'BTC/USDT',   category: 'Crypto',   startPrice: 42000, volatility: 480, trend: 0.05, volBase: 1200, decimals: 0 },
  { id: 'ETH', name: 'ETH/USDT',   category: 'Crypto',   startPrice: 2800,  volatility: 32,  trend: 0.04, volBase: 900,  decimals: 1 },
  { id: 'NQ',  name: 'NASDAQ:NQ',  category: 'Futures',  startPrice: 18500, volatility: 95,  trend: 0.08, volBase: 700,  decimals: 0 },
  { id: 'ES',  name: 'S&P500:ES',  category: 'Futures',  startPrice: 5200,  volatility: 22,  trend: 0.06, volBase: 600,  decimals: 1 },
];
export const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D'];
```

- [ ] **Step 3: Create `src/store/useAppStore.js`** (spec §6)

Paste the full Zustand store with `persist` middleware from spec §6. Ensure it uses a **named export** (not default):
```js
export const useAppStore = create(persist(...));
```
Every lesson imports it as `import { useAppStore } from '../store/useAppStore'`.

- [ ] **Step 4: Create `src/data/strategyPlaybook.js`** (spec §16)

Paste the full `STRATEGY_PLAYBOOK` export from spec §16.

- [ ] **Step 5: Smoke-test the data layer in browser console**

In `src/main.jsx`, temporarily add:
```js
import { generateCandles } from './data/candleGenerator';
console.log(generateCandles({ count: 5, startPrice: 42000, volatility: 400, trend: 0, volBase: 800 }));
```
Run `npm run dev`, open console. Expected: array of 5 candle objects each with `{i, open, close, high, low, volume}`.
Remove the console.log after verifying.

- [ ] **Step 6: Commit data layer**

```bash
git add edgelab/src/data/ edgelab/src/store/
git commit -m "feat: add candle generator, assets, Zustand store, and strategy playbook"
```

---

## Task 3: Canvas Chart Engine

**Files:**
- Create: `edgelab/src/components/chart/CandleChart.jsx`

This is the most critical file. Build it standalone-testable before wiring into other components.

- [ ] **Step 1: Create `src/components/chart/CandleChart.jsx`** (spec §5)

Paste the full component from spec §5 exactly. Key implementation points:
- Uses `useRef` for `canvasRef` and `containerRef`
- `draw()` function wrapped in `useCallback` — deps: `[candles, annotations, highlightZone, selectedCandle, height, VOL_H]`
- `ResizeObserver` in `useEffect` to redraw on container resize
- Supports annotation types: `zone`, `hline`, `arrow`, `label`
- Click handler computes candle index from mouse X position

- [ ] **Step 2: Create a temporary test component to verify chart renders**

Create `src/TestChart.jsx`:
```jsx
import CandleChart from './components/chart/CandleChart';
import { generateCandles } from './data/candleGenerator';
const testCandles = generateCandles({ count: 60, startPrice: 42000, volatility: 400, trend: 0.1, volBase: 800 });
const testAnnotations = [
  { type: 'hline', price: 43000, color: '#f5c842', label: 'Test Level' },
  { type: 'arrow', candle: 20, dir: 'up', label: 'BOS', color: '#00d17a' },
  { type: 'zone', startCandle: 30, endCandle: 35, low: 42500, high: 43500, color: '#3d9bff', label: 'FVG' },
];
export default function TestChart() {
  return (
    <div style={{ width: '100%', padding: 24, background: '#0a0c0f' }}>
      <CandleChart candles={testCandles} annotations={testAnnotations} showVolume height={420} />
    </div>
  );
}
```

In `src/main.jsx`, temporarily render `<TestChart />`.

- [ ] **Step 3: Verify chart visually**

`npm run dev` — confirm:
- Dark background with green/red candles rendering
- Volume bars visible at bottom
- Yellow hline with label
- Green arrow pointing up
- Blue zone rectangle with label
- No console errors

- [ ] **Step 4: Remove TestChart.jsx and restore main.jsx**

- [ ] **Step 5: Commit chart engine**

```bash
git add edgelab/src/components/chart/
git commit -m "feat: add Canvas-based CandleChart with annotations and volume panel"
```

---

## Task 4: App Shell — Nav + Routing + Dashboard

**Files:**
- Create: `edgelab/src/components/ui/TopNav.jsx`
- Create: `edgelab/src/App.jsx`
- Create: `edgelab/src/components/course/CourseDashboard.jsx`
- Create: `edgelab/src/components/course/LessonShell.jsx`
- Modify: `edgelab/src/main.jsx`

- [ ] **Step 1: Create `src/components/ui/TopNav.jsx`** (spec §6)

Paste TopNav from spec §6. Note: `BookOpen` import from lucide-react needed for Playbook tab (added in Task 9). For now, define tabs with just `LayoutDashboard` and `TrendingUp`.

- [ ] **Step 2: Create stub lesson files** (prevents import errors from scenarioLibrary)

Create these 7 stub files — each exports a minimal component:
```jsx
// e.g. src/lessons/Lesson1_MarketStructure.jsx
export default function Lesson1_MarketStructure() {
  return <div style={{padding:24,color:'#e8edf5',fontFamily:'monospace'}}>Lesson 1 — Coming Soon</div>;
}
```
Repeat for Lesson2 through Lesson7 with matching names.

- [ ] **Step 3: Create `src/data/scenarioLibrary.js`** (spec §6)

Paste the full file from spec §6. This imports all 7 lesson components and exports `LESSONS_META` and `LESSONS_MAP`.

- [ ] **Step 4: Create `src/components/course/CourseDashboard.jsx`** (spec §6)

Paste the full CourseDashboard component from spec §6.

- [ ] **Step 5: Create `src/components/course/LessonShell.jsx`** (spec §6)

Paste the LessonShell component from spec §6.

- [ ] **Step 6: Create `src/App.jsx`** (spec §6)

Paste App.jsx from spec §6. Routes: `/dashboard`, `/simulator`, `/lesson/:id`.
Stub SimulatorPage for now:
```jsx
// temporary stub at top of App.jsx (remove in Task 5)
const SimulatorPage = () => <div style={{padding:24,color:'#e8edf5'}}>Simulator — Coming Soon</div>;
```

- [ ] **Step 7: Update `src/main.jsx`**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

- [ ] **Step 8: Verify routing**

`npm run dev`:
- `/dashboard` → CourseDashboard with 7 lesson cards, Lesson 1 unlocked, 2–7 locked
- Click Lesson 1 → `/lesson/lesson-1` → stub message renders
- TopNav shows EdgeLab logo + Dashboard/Simulator tabs
- Stats row shows `0/7 Lessons Done`

- [ ] **Step 9: Commit app shell**

```bash
git add edgelab/src/
git commit -m "feat: add app shell with TopNav, CourseDashboard, LessonShell routing"
```

---

## Task 5: Trading Simulator

**Files:**
- Create: `edgelab/src/components/simulator/SimulatorPage.jsx`
- Modify: `edgelab/src/App.jsx` (remove stub, import real SimulatorPage)

- [ ] **Step 1: Create `src/components/simulator/SimulatorPage.jsx`** (spec §7)

Paste the full SimulatorPage from spec §7. Key features:
- Asset selector (BTC, ETH, NQ, ES)
- Timeframe selector (cosmetic — no actual candle granularity change)
- Play/Pause button — adds one candle per second via `setInterval`
- Long/Short/Close order entry
- Account panel: Balance, Open P&L, Equity, Win Rate, Trades count
- Trade log (last 20 trades)

- [ ] **Step 2: Wire into App.jsx**

Remove the stub `SimulatorPage` constant. Add:
```jsx
import SimulatorPage from './components/simulator/SimulatorPage';
```

- [ ] **Step 3: Verify simulator**

`npm run dev` → `/simulator`:
- BTC chart renders with 80 candles
- Click ▶ PLAY → new candles appear every ~1 second
- Open a Long → Open P&L updates live
- Close position → appears in trade log, balance updates
- Switch asset → chart resets with new price range
- Win Rate calculated correctly after 3+ trades

- [ ] **Step 4: Commit simulator**

```bash
git add edgelab/src/components/simulator/
git commit -m "feat: add live paper-trading simulator with P&L tracking and trade log"
```

---

## Task 6: Lessons 1–5 (Pattern-Based)

All five lessons follow the same base template (spec §8). Each has `CONCEPT` + `CHALLENGES` data and a `learn → challenge → result` state machine.

**Files:**
- Modify: `edgelab/src/lessons/Lesson1_MarketStructure.jsx` (replace stub)
- Modify: `edgelab/src/lessons/Lesson2_OrderFlow.jsx`
- Modify: `edgelab/src/lessons/Lesson3_OrderBlocks.jsx`
- Modify: `edgelab/src/lessons/Lesson4_LiquiditySweeps.jsx`
- Modify: `edgelab/src/lessons/Lesson5_VolumeVSA.jsx`

**For each lesson, follow these steps:**

- [ ] **Step 1: Replace stub with full lesson component**

Use the base template from spec §8. Replace `CONCEPT` and `CHALLENGES` with the lesson-specific data:
- Lesson 1 → spec §9 (BOS + CHoCH, 2 challenges)
- Lesson 2 → spec §10 (FVG identification, 2 challenges)
- Lesson 3 → spec §11 (Order Block identification, 2 challenges)
- Lesson 4 → spec §12 (Liquidity sweep identification, 2 challenges)
- Lesson 5 → spec §13 (Volume climax + low-vol pullback, 2 challenges)

**Critical imports for every lesson:**
```jsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CandleChart from '../components/chart/CandleChart';
import { generateCandles, injectPattern, applyDrift } from '../data/candleGenerator';
import { useAppStore } from '../store/useAppStore';
```

**State machine pattern:**
```
'learn'     → Click START CHALLENGES → 'challenge'
'challenge' → Click candle → show answer → 'result'
'result'    → Click NEXT / FINISH
```

**Score rule:** First attempt = 50 pts, retry = 25 pts. Max 100 pts per lesson.

**`buildChart()` must be wrapped in `useMemo`:**
```jsx
const chartData = useMemo(() => challenge.buildChart(), [cIdx]);
```

- [ ] **Step 2: Verify each lesson after implementing**

For each lesson:
1. Navigate to `/lesson/lesson-N`
2. Learn phase loads with concept sections + signals
3. Click START CHALLENGES → challenge phase with yellow question box
4. Click incorrect candle → red feedback, retry button shown
5. Click correct candle range → green feedback, explanation shown
6. Complete both challenges → redirected to `/dashboard`
7. Lesson N now shows as done with score badge
8. Lesson N+1 is now unlocked

- [ ] **Step 3: Commit lessons 1–5**

```bash
git add edgelab/src/lessons/Lesson1_MarketStructure.jsx \
        edgelab/src/lessons/Lesson2_OrderFlow.jsx \
        edgelab/src/lessons/Lesson3_OrderBlocks.jsx \
        edgelab/src/lessons/Lesson4_LiquiditySweeps.jsx \
        edgelab/src/lessons/Lesson5_VolumeVSA.jsx
git commit -m "feat: implement lessons 1-5 (BOS/CHoCH, FVG, OB, liquidity sweeps, VSA)"
```

---

## Task 7: Lesson 6 — Dual-Chart Confirmations

**Files:**
- Modify: `edgelab/src/lessons/Lesson6_ConfirmationsRejections.jsx` (replace stub)

This lesson differs from lessons 1–5: it uses a side-by-side dual-chart layout comparing valid vs. invalid setups, with a quiz (TRADE / SKIP buttons) instead of candle-click challenges.

- [ ] **Step 1: Implement `Lesson6_ConfirmationsRejections.jsx`** (spec §14)

Paste the full component from spec §14. Key structure:
- Left panel: pair selector (3 setup types) + valid/invalid toggle + description + quiz
- Right panel: two charts side by side (`grid-cols-2`)
- `SETUP_PAIRS` array with 3 entries: FVG pair, Sweep pair, OB pair
- Each pair has `valid` and `invalid` with separate `buildChart()` and `annotations`
- Quiz asks TRADE or SKIP — answers stored in `quizAnswers` state
- All 3 quizzes answered → COMPLETE LESSON button appears

**`buildChart()` memoization note:** Unlike lessons 1–5 where `buildChart()` is called inside `useMemo([cIdx])`, Lesson 6's `buildChart()` calls are defined as static data inside the `SETUP_PAIRS` constant (not inside render). They are called inline as `pair.valid.buildChart()` and `pair.invalid.buildChart()` in the render body. To avoid rebuilding on every render, call them in `useMemo`:
```jsx
const validChart   = useMemo(() => pair.valid.buildChart(),   [pairIdx]);
const invalidChart = useMemo(() => pair.invalid.buildChart(), [pairIdx]);
```
This is consistent with the pattern used in all other lessons.

**Important imports:**
```jsx
import { useState, useMemo } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
```

- [ ] **Step 2: Verify Lesson 6**

1. Navigate to `/lesson/lesson-6` (requires Lessons 1–5 complete)
2. Three pair buttons in left panel
3. Toggle shows green ✓ VALID chart on left, red ✗ INVALID on right simultaneously
4. Switching pairs updates both charts
5. Answer all 3 quizzes → COMPLETE LESSON appears
6. Complete → score saved, back to dashboard

- [ ] **Step 3: Commit Lesson 6**

```bash
git add edgelab/src/lessons/Lesson6_ConfirmationsRejections.jsx
git commit -m "feat: implement lesson 6 dual-chart confirmation vs rejection lesson"
```

---

## Task 8: Lesson 7 — Final Exam

**Files:**
- Modify: `edgelab/src/lessons/Lesson7_FinalExam.jsx` (replace stub)

10 multiple-choice setups. Clean chart shown first, annotated after answer.

- [ ] **Step 1: Implement `Lesson7_FinalExam.jsx`** (spec §15)

Paste the full component from spec §15. Key structure:
- `MOCK_SETUPS` array with 10 entries — each has `buildChart()`, 4 `choices`, `correct`, `plan`, `annotations`
- Progress bar at top (10 colored dots — yellow=current, green=correct, red=wrong)
- `phase: 'question' | 'result'` — no learn phase
- Clean chart in question phase, annotated in result phase
- Full trade plan revealed in result panel
- Score: 10 pts per correct answer, max 100

**Important:**
```jsx
import { useState, useMemo } from 'react';
```
`chartData` must be memoized:
```jsx
const chartData = useMemo(() => setup.buildChart(), [current]);
```

- [ ] **Step 2: Verify Lesson 7**

1. Navigate to `/lesson/lesson-7` (requires Lesson 6 complete)
2. Setup 1 loads with scenario text and 4 choices
3. Choosing a wrong answer highlights it red, correct answer green
4. Full trade plan appears in result panel
5. Progress dots track correctly
6. Setup 10 → FINISH button shows final score
7. Complete → dashboard shows all 7 lessons done

- [ ] **Step 3: Commit Lesson 7**

```bash
git add edgelab/src/lessons/Lesson7_FinalExam.jsx
git commit -m "feat: implement lesson 7 final exam with 10 annotated mock setups"
```

---

## Task 9: Playbook Page + Nav Update

**Files:**
- Create: `edgelab/src/pages/PlaybookPage.jsx`
- Modify: `edgelab/src/App.jsx` (add /playbook route)
- Modify: `edgelab/src/components/ui/TopNav.jsx` (add Playbook tab)

- [ ] **Step 1: Create `src/pages/PlaybookPage.jsx`** (spec §16)

Paste the full PlaybookPage component from spec §16, including the local `Section` component at the bottom.

- [ ] **Step 2: Add route to `App.jsx`**

```jsx
import PlaybookPage from './pages/PlaybookPage';
// In <Routes>:
<Route path="/playbook" element={<PlaybookPage />} />
```

- [ ] **Step 3: Add Playbook tab to `TopNav.jsx`**

```jsx
import { TrendingUp, LayoutDashboard, BookOpen } from 'lucide-react';
// In tabs array:
{ to: '/playbook', label: 'Playbook', icon: BookOpen },
```

- [ ] **Step 4: Verify Playbook**

`/playbook` shows:
- Core Philosophy (5 points)
- 4 Setup Types in a 2-col grid (each with Entry/Stop/T1/T2/Invalid rows)
- Confluence Scoring System (5 factors + sizing table)
- Risk Management + No-Trade Zones
- Daily Trading Routine (8 steps)

- [ ] **Step 5: Commit Playbook**

```bash
git add edgelab/src/pages/ edgelab/src/App.jsx edgelab/src/components/ui/TopNav.jsx
git commit -m "feat: add Strategy Playbook page with full ICT/SMC reference"
```

---

## Task 10: Final Verification

- [ ] **Step 1: Hard reset progress and do a full run-through**

Open DevTools → Application → Local Storage → delete `edgelab-progress`.
Refresh `/dashboard` — 0/7 done, all locked except Lesson 1.

- [ ] **Step 2: Complete all 7 lessons sequentially**

- Lesson 1: Complete both challenges. Verify Lesson 2 unlocks.
- Lesson 2: Complete both challenges. Verify Lesson 3 unlocks.
- Lesson 3: Complete both challenges. Verify Lesson 4 unlocks.
- Lesson 4: Complete both challenges. Verify Lesson 5 unlocks.
- Lesson 5: Complete both challenges. Verify Lesson 6 unlocks.
- Lesson 6: Answer all 3 quizzes. Verify Lesson 7 unlocks.
- Lesson 7: Complete all 10 setups. Verify all 7 show as done.

- [ ] **Step 3: Verify dashboard stats**

After all lessons:
- "7/7 Lessons Done"
- Total Score displayed correctly (sum of all lesson scores)
- Accuracy % calculated
- Progress bar at 100%

- [ ] **Step 4: Verify simulator independently**

- Play BTC → candles stream
- Open Long → P&L updates
- Switch to ETH mid-position (should be allowed, resets chart but keeps position?)
- Close position → appears in trade log
- Win Rate updates

- [ ] **Step 5: Verify progress persists across refresh**

Complete Lesson 1, hard-refresh the page. Lesson 1 should still show as complete.

- [ ] **Step 6: Run production build**

```bash
npm run build
```
Expected: No TypeScript errors (this is JS). Should complete with dist/ output.
If Tailwind purge warnings about missing classes: verify `tailwind.config.js` content includes `"./src/**/*.{js,jsx}"`.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: EdgeLab Trading Simulator — complete build (7 lessons + simulator + playbook)"
```

---

## Known Gotchas (from spec §Notes)

1. **`useMemo` imports**: Every lesson uses `useMemo`. Missing import → silent render loop. Always import: `import { useState, useMemo } from 'react';`

2. **`injectPattern` mutates in-place**: `generateCandles()` first, then `injectPattern()`. Always wrap `buildChart()` in `useMemo([cIdx])` to avoid regenerating on every render.

3. **Canvas sizing**: `CandleChart` needs a flex/grid parent with defined width. The `containerRef` div uses `style={{ width: '100%', height }}` — parent must not be `width: 0`.

4. **Lesson registration**: Every lesson must appear in BOTH `LESSONS_META` (dashboard display) AND `LESSONS_MAP` (router). Missing from either = broken link or invisible lesson.

5. **Zustand persist**: Key is `edgelab-progress` in localStorage. Use DevTools to clear it during testing.

6. **Tailwind dynamic classes**: Classes like `bg-green/10`, `border-red/30` must be in source files (not generated at runtime) for Tailwind's purge to include them. All classes are static strings in the spec — don't refactor them to dynamic string concatenation.

7. **`scenarioLibrary.js` imports**: This file imports all 7 lesson components. Create stubs for all 7 BEFORE creating `scenarioLibrary.js` to avoid import errors.
