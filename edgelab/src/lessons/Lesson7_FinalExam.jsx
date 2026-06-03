import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CandleChart from '../components/chart/CandleChart';
import { generateCandles, injectPattern, applyDrift } from '../data/candleGenerator';
import { useAppStore } from '../store/useAppStore';

const MOCK_SETUPS = [
  {
    id: 'mock-1', asset: 'BTC/USDT', title: 'Setup #1',
    scenario: 'Uptrend in progress. A 3-candle pattern forms on a strong impulse candle. Price pulls back into a specific zone on declining volume.',
    question: 'What is the highest-probability setup and direction?',
    choices: [
      { id: 'a', text: 'Bullish FVG retest → LONG from the gap zone' },
      { id: 'b', text: 'Bearish OB retest → SHORT from resistance' },
      { id: 'c', text: 'Liquidity sweep above resistance → SHORT after wick' },
      { id: 'd', text: 'Volume climax exhaustion → SHORT immediately' },
    ],
    correct: 'a',
    buildChart: () => {
      const c = generateCandles({ count: 70, startPrice: 41000, volatility: 300, trend: 0.1 });
      injectPattern(c, 30, [
        { open: 43000, close: 43500, high: 43600, low: 42950, volume: 1200 },
        { open: 43500, close: 45400, high: 45550, low: 43480, volume: 4800 },
        { open: 45400, close: 44800, high: 45450, low: 44200, volume: 2100 },
      ]);
      injectPattern(c, 36, [
        { open: 44800, close: 44100, high: 44850, low: 44050, volume: 900 },
        { open: 44100, close: 43700, high: 44150, low: 43600, volume: 750 },
        { open: 43700, close: 44300, high: 44350, low: 43500, volume: 2800 },
      ]);
      return c;
    },
    annotations: [
      { type: 'zone',  startCandle: 30, endCandle: 32, low: 43600, high: 44200, color: '#3d9bff', label: 'Bullish FVG' },
      { type: 'arrow', candle: 38, dir: 'up', label: '→ LONG Entry', color: '#00d17a' },
    ],
    plan: `SETUP: Bullish FVG Retest → LONG
FVG Zone: 43,600 – 44,200 (C1 high to C3 low)
Impulse volume: 4,800 (4x average) — institutional buying
ENTRY: Reaction candle that wicks into FVG zone and closes above it → enter next open
STOP: Below 43,500 (below FVG zone entirely)
TARGET 1: 45,400 (swing high / FVG origin)
TARGET 2: Measured move above — 47,000+
R/R: ~3.5:1
CONFLUENCE: Low-vol pullback (900, 750 vs 4,800 impulse) = no real selling pressure. Classic continuation setup.`,
  },
  {
    id: 'mock-2', asset: 'NASDAQ:NQ', title: 'Setup #2',
    scenario: 'Clear uptrend. Price makes a HH, pulls back to HL, then pushes up but FAILS to make a new HH — prints a lower high. Shortly after, price drops aggressively.',
    question: 'What does this price action indicate?',
    choices: [
      { id: 'a', text: 'Bullish continuation — buy the Higher Low' },
      { id: 'b', text: 'CHoCH forming — wait for HL break before acting' },
      { id: 'c', text: 'Volume climax — short the lower high immediately' },
      { id: 'd', text: 'Order block retest — short from the LH candle' },
    ],
    correct: 'b',
    buildChart: () => {
      const c = generateCandles({ count: 70, startPrice: 18800, volatility: 85, trend: 0.1 });
      injectPattern(c, 22, [{ open: 19500, close: 19900, high: 19950, low: 19480, volume: 2100 }]);
      injectPattern(c, 28, [{ open: 19700, close: 19550, high: 19720, low: 19530, volume: 1000 }]);
      injectPattern(c, 34, [{ open: 19550, close: 19720, high: 19740, low: 19530, volume: 950  }]);
      injectPattern(c, 38, [
        { open: 19680, close: 19380, high: 19700, low: 19360, volume: 3800 },
        { open: 19380, close: 19050, high: 19400, low: 19030, volume: 4200 },
      ]);
      return c;
    },
    annotations: [
      { type: 'label', candle: 22, text: 'HH', color: '#00d17a', position: 'above' },
      { type: 'label', candle: 28, text: 'HL', color: '#3d9bff', position: 'below' },
      { type: 'label', candle: 34, text: 'LH ⚠', color: '#ff3d5a', position: 'above' },
      { type: 'hline', price: 19550, color: '#f5c842', label: 'Higher Low — Watch' },
      { type: 'arrow', candle: 39, dir: 'down', label: 'CHoCH Confirmed', color: '#ff3d5a' },
    ],
    plan: `SETUP: Change of Character — Do NOT Short Yet
The LH is a WARNING. The CHoCH is confirmed only when price CLOSES below the HL (19,550). Shorting at the LH is premature — price could still resume uptrend.
CORRECT PROCESS:
1. Mark HL at 19,550
2. Wait for close below it (CHoCH = confirmed)
3. Wait for bearish BOS on LTF
4. Enter short on retest of 19,380–19,550 (now resistance)
ENTRY: Retest of break level
STOP: Above LH (19,740)
TARGET: Prior swing low structure`,
  },
  {
    id: 'mock-3', asset: 'BTC/USDT', title: 'Setup #3',
    scenario: 'Resistance level tested twice. A candle forms with a wick spiking 250 points above resistance but the body closes 600 points below the level. Volume is 6x average.',
    question: 'What is this pattern and entry strategy?',
    choices: [
      { id: 'a', text: 'Bullish breakout — buy the close above resistance' },
      { id: 'b', text: 'False breakout — wait and ignore' },
      { id: 'c', text: 'Sell-side liquidity sweep → LONG from wick close' },
      { id: 'd', text: 'Buy-side liquidity sweep → SHORT after confirmation' },
    ],
    correct: 'd',
    buildChart: () => {
      const c = generateCandles({ count: 70, startPrice: 38000, volatility: 350, trend: 0 });
      injectPattern(c, 18, [{ open: 40100, close: 40500, high: 40600, low: 40050, volume: 1900 }]);
      injectPattern(c, 26, [{ open: 40200, close: 40450, high: 40580, low: 40180, volume: 1600 }]);
      for (let i = 30; i < 44; i++) {
        const o = 39500 + (Math.random() - 0.5) * 600;
        const cl = 39500 + (Math.random() - 0.5) * 600;
        c[i] = { i, open: o, close: cl, high: Math.max(o, cl) + 100 + Math.random() * 200, low: Math.min(o, cl) - 100 - Math.random() * 200, volume: 800 + Math.random() * 400 };
      }
      injectPattern(c, 44, [
        { open: 40100, close: 39500, high: 40850, low: 39450, volume: 5800 },
        { open: 39500, close: 38800, high: 39550, low: 38750, volume: 4400 },
        { open: 38800, close: 38200, high: 38850, low: 38150, volume: 3600 },
      ]);
      return c;
    },
    annotations: [
      { type: 'hline', price: 40600, color: '#f5c842', label: 'Resistance / Liquidity Pool' },
      { type: 'arrow', candle: 44, dir: 'down', label: '→ SHORT after sweep close', color: '#ff3d5a' },
    ],
    plan: `SETUP: Buy-Side Liquidity Sweep → SHORT
Resistance at 40,600 tested twice = stops cluster above. Sweep wick to 40,850 triggers all stops. Candle CLOSES at 39,500 — back below level.
ENTRY: Open of next candle after sweep close (~39,500)
STOP: Above wick high (41,000)
TARGET: Prior range low (~37,500)
R/R: 1,500-point risk / 2,000-point target = ~1.3:1 minimum (use lower T2 for better R/R)
KEY: Sweep wick = above resistance. Close = below resistance. This is SHORT, not long.`,
  },
  {
    id: 'mock-4', asset: 'NASDAQ:NQ', title: 'Setup #4',
    scenario: 'Multi-session uptrend. A strong candle at the top has 8x normal volume but a body covering only 30% of its total wick-to-wick range. The next two candles are bearish on below-average volume.',
    question: 'What does this volume pattern tell you?',
    choices: [
      { id: 'a', text: 'Continuation — buy the dip on those two bearish candles' },
      { id: 'b', text: 'Volume climax — trend exhausting, prepare for reversal' },
      { id: 'c', text: 'Low volume pullback — trend resumes after the two candles' },
      { id: 'd', text: 'Order block — wait for retest and enter long' },
    ],
    correct: 'b',
    buildChart: () => {
      const c = generateCandles({ count: 70, startPrice: 18000, volatility: 80, trend: 0.2 });
      applyDrift(c, 20, 49, 110);
      injectPattern(c, 50, [
        { open: 23200, close: 23500, high: 23900, low: 23000, volume: 9600 },
        { open: 23500, close: 23200, high: 23550, low: 23100, volume: 2400 },
        { open: 23200, close: 22900, high: 23250, low: 22850, volume: 1800 },
      ]);
      return c;
    },
    annotations: [
      { type: 'arrow', candle: 50, dir: 'up', label: 'Volume Climax (9.6K)', color: '#f5c842' },
    ],
    plan: `SETUP: Volume Climax → Pause All Longs
8x volume + 30% body ratio = absorption. All buyers absorbed by institutional sellers. The two bearish candles after are NOT "safe dips" — they are the beginning of distribution.
NEXT STEPS:
1. Do NOT buy the dip
2. Watch for CHoCH (break of recent HL)
3. If CHoCH confirmed → short on retest
4. If no CHoCH → wait for structure to clarify
RULE: After a volume climax, ALL longs are paused. Wait for structure reset before any trade.`,
  },
  {
    id: 'mock-5', asset: 'BTC/USDT', title: 'Setup #5',
    scenario: 'Downtrend. Bearish impulse drops 2,000 points on high volume. Price pulls back upward on 4 candles averaging 15% of impulse volume. Shallow retracement, no strong close.',
    question: 'How do you classify this pullback?',
    choices: [
      { id: 'a', text: 'Trend reversal — longs are valid here' },
      { id: 'b', text: 'Low volume pullback in downtrend → short continuation entry' },
      { id: 'c', text: 'Distribution phase — wait for new high before shorting' },
      { id: 'd', text: 'Accumulation — institutions are loading longs quietly' },
    ],
    correct: 'b',
    buildChart: () => {
      const c = generateCandles({ count: 70, startPrice: 47000, volatility: 400, trend: -0.2 });
      injectPattern(c, 28, [
        { open: 44000, close: 42000, high: 44050, low: 41950, volume: 5800 },
        { open: 42000, close: 41200, high: 42050, low: 41150, volume: 4600 },
      ]);
      injectPattern(c, 33, [
        { open: 41200, close: 41700, high: 41750, low: 41180, volume: 980  },
        { open: 41700, close: 42100, high: 42150, low: 41680, volume: 820  },
        { open: 42100, close: 42300, high: 42350, low: 42080, volume: 750  },
        { open: 42300, close: 42000, high: 42350, low: 41980, volume: 880  },
        { open: 42000, close: 41000, high: 42050, low: 40950, volume: 5200 },
      ]);
      return c;
    },
    annotations: [
      { type: 'zone',  startCandle: 33, endCandle: 37, low: 41150, high: 42350, color: '#3d9bff', label: 'Low Vol Pullback Zone' },
      { type: 'arrow', candle: 37, dir: 'down', label: '→ SHORT at zone top', color: '#ff3d5a' },
    ],
    plan: `SETUP: Low Volume Pullback in Downtrend → SHORT
Impulse: 5,800 + 4,600 volume (avg ~5,200)
Pullback: avg 860 volume = 16.5% of impulse — zero seller resistance
ENTRY: Top of pullback zone (~42,300) on first bearish candle
STOP: Above pullback high + buffer (42,500)
TARGET: Prior swing low, then measured move
RULE: In a downtrend, low-vol pullbacks = your entry. High vol pullback = real fight, stay out.`,
  },
  {
    id: 'mock-6', asset: 'NASDAQ:NQ', title: 'Setup #6 — The Trap',
    scenario: 'A bullish FVG forms. Price pulls back to the zone. A candle prints a bullish close inside the zone with 3x average volume. The NEXT candle gaps down hard on 6x volume.',
    question: 'Why was the FVG entry a trap?',
    choices: [
      { id: 'a', text: 'The FVG zone was inside a HTF resistance OB' },
      { id: 'b', text: 'The high volume on entry candle was absorption, not demand' },
      { id: 'c', text: 'There was a major resistance level 50 points above' },
      { id: 'd', text: 'All of the above — multiple factors made it invalid' },
    ],
    correct: 'd',
    buildChart: () => {
      const c = generateCandles({ count: 70, startPrice: 19500, volatility: 85, trend: 0 });
      injectPattern(c, 10, [{ open: 20200, close: 20550, high: 20600, low: 20180, volume: 2800 }]);
      injectPattern(c, 18, [{ open: 20100, close: 20500, high: 20580, low: 20080, volume: 2200 }]);
      injectPattern(c, 32, [
        { open: 20300, close: 20450, high: 20500, low: 20280, volume: 1100 },
        { open: 20450, close: 20800, high: 20850, low: 20430, volume: 3200 },
        { open: 20800, close: 20580, high: 20820, low: 20350, volume: 2400 },
      ]);
      injectPattern(c, 38, [
        { open: 20580, close: 20550, high: 20600, low: 20350, volume: 900  },
        { open: 20550, close: 20620, high: 20650, low: 20400, volume: 3800 },
        { open: 20620, close: 19900, high: 20640, low: 19880, volume: 6200 },
        { open: 19900, close: 19400, high: 19920, low: 19380, volume: 4800 },
      ]);
      return c;
    },
    annotations: [
      { type: 'hline', price: 20600, color: '#ff3d5a', label: 'HTF Resistance / OB' },
      { type: 'zone',  startCandle: 32, endCandle: 34, low: 20350, high: 20500, color: '#3d9bff', label: 'FVG (inside resistance)' },
      { type: 'arrow', candle: 40, dir: 'down', label: '⚠ Trap Revealed', color: '#ff3d5a' },
    ],
    plan: `WHY IT WAS A TRAP — All Three Factors
Factor 1 — HTF Resistance:
FVG formed inside a daily OB/resistance zone (20,550–20,600). LTF bullish signal + HTF resistance = counter-trend trade against institutions.
Factor 2 — Absorption Volume:
3x volume on the "bullish" retest candle with narrow spread = institutions SELLING into every buy. Classic absorption, not demand.
Factor 3 — No Target Room:
Resistance 50 points above the entry = no room to run. R/R was negative before entering.
LESSON: Never trade LTF signals against HTF confluence. One signal = moderate probability. LTF FVG + HTF OB + absorption vol = skip.`,
  },
  {
    id: 'mock-7', asset: 'BTC/USDT', title: 'Setup #7 — Full Confluence',
    scenario: 'Downtrend. Equal lows swept with a wick (5x volume). At the sweep extreme is also a bullish OB from a prior move. Reversal candle after sweep: 4x volume. HTF shows this is a major daily support.',
    question: 'Rate this setup and construct the trade.',
    choices: [
      { id: 'a', text: 'Low probability — too complex' },
      { id: 'b', text: 'Moderate — sweep alone is not enough' },
      { id: 'c', text: 'High probability — 4-factor confluence LONG' },
      { id: 'd', text: 'Skip — never fade a downtrend' },
    ],
    correct: 'c',
    buildChart: () => {
      const c = generateCandles({ count: 70, startPrice: 35000, volatility: 380, trend: -0.1 });
      injectPattern(c, 20, [{ open: 33800, close: 33400, high: 33850, low: 33200, volume: 1400 }]);
      injectPattern(c, 28, [{ open: 33700, close: 33350, high: 33750, low: 33180, volume: 1300 }]);
      injectPattern(c, 35, [{ open: 33600, close: 33330, high: 33650, low: 33190, volume: 1200 }]);
      injectPattern(c, 40, [{ open: 33500, close: 33200, high: 33520, low: 33100, volume: 1100 }]);
      injectPattern(c, 43, [
        { open: 33200, close: 32600, high: 33220, low: 32200, volume: 6400 },
        { open: 32600, close: 33800, high: 33850, low: 32550, volume: 5200 },
        { open: 33800, close: 34300, high: 34350, low: 33770, volume: 3800 },
      ]);
      return c;
    },
    annotations: [
      { type: 'hline', price: 33190, color: '#f5c842', label: 'Equal Lows (Liquidity Pool)' },
      { type: 'zone',  startCandle: 40, endCandle: 41, low: 33100, high: 33520, color: '#00d17a', label: 'Bullish OB (Confluence)' },
      { type: 'arrow', candle: 43, dir: 'down', label: 'Sweep Below EQL', color: '#ff3d5a' },
      { type: 'arrow', candle: 44, dir: 'up',   label: '→ LONG Entry', color: '#00d17a' },
    ],
    plan: `SETUP: HIGH PROBABILITY — 4-Factor Confluence LONG
✓ Liquidity: Equal lows swept — sell-side pool cleared
✓ Order Block: Bullish OB at sweep extreme — institutional buy orders
✓ Volume: 6,400 sweep + 5,200 reversal = real institutional activity
✓ HTF: Daily support level aligned
ENTRY: Open after reversal confirms (~33,800 or pullback to 33,200–33,500 OB)
STOP: Below sweep wick (32,100)
TARGET 1: 35,000 (prior swing)
TARGET 2: 36,500 (major structure)
R/R: ~3.8:1
4 independent signals all pointing the same direction = full-size position.`,
  },
  {
    id: 'mock-8', asset: 'NASDAQ:NQ', title: 'Setup #8 — BOS Entry',
    scenario: 'Uptrend. Bullish BOS closes above prior HH with strong volume. Price immediately pulls back toward the BOS level and prior HL zone, forming a 3-candle consolidation.',
    question: 'What is the optimal entry strategy after a BOS?',
    choices: [
      { id: 'a', text: 'Chase the BOS candle — buy immediately as it breaks' },
      { id: 'b', text: 'Wait for pullback to BOS level, enter on reaction candle' },
      { id: 'c', text: 'Skip — BOS candles always reverse' },
      { id: 'd', text: 'Short the pullback — price always retests BOS to the downside' },
    ],
    correct: 'b',
    buildChart: () => {
      const c = generateCandles({ count: 70, startPrice: 19000, volatility: 85, trend: 0.1 });
      injectPattern(c, 20, [{ open: 19600, close: 20000, high: 20050, low: 19580, volume: 1900 }]);
      injectPattern(c, 26, [{ open: 19800, close: 19650, high: 19820, low: 19630, volume: 900  }]);
      injectPattern(c, 32, [{ open: 19650, close: 19900, high: 19950, low: 19630, volume: 1500 }]);
      injectPattern(c, 36, [{ open: 19900, close: 19780, high: 19920, low: 19760, volume: 850  }]);
      injectPattern(c, 40, [
        { open: 19780, close: 20350, high: 20400, low: 19760, volume: 4200 },
        { open: 20350, close: 20200, high: 20370, low: 20060, volume: 1200 },
        { open: 20200, close: 20100, high: 20220, low: 20000, volume: 900  },
        { open: 20100, close: 20600, high: 20650, low: 20080, volume: 3800 },
      ]);
      return c;
    },
    annotations: [
      { type: 'hline', price: 20050, color: '#f5c842', label: 'Prior HH / BOS Level' },
      { type: 'arrow', candle: 40, dir: 'up', label: 'BOS Candle' },
      { type: 'zone',  startCandle: 41, endCandle: 43, low: 20000, high: 20370, color: '#00d17a', label: 'Pullback Entry Zone' },
      { type: 'arrow', candle: 43, dir: 'up', label: '→ LONG Entry', color: '#00d17a' },
    ],
    plan: `SETUP: BOS Pullback Entry → LONG
NEVER chase the BOS candle. Buying the top of a momentum candle = wide stop, poor R/R.
CORRECT APPROACH:
1. Mark the BOS level (prior HH = 20,050)
2. Wait for pullback to BOS level + prior HL zone
3. Look for reaction candle (bullish close) holding the zone
4. Enter on next candle open
ENTRY: 20,100–20,200 zone
STOP: Below 20,000 (if BOS level fails, structure in question)
TARGET: Measured move — HL-to-BOS distance projected up
KEY: BOS level = your entry zone, not the BOS candle close.`,
  },
  {
    id: 'mock-9', asset: 'BTC/USDT', title: 'Setup #9 — No Trade',
    scenario: 'A 5-minute FVG forms and price pulls back to the zone. A candle closes inside the FVG. HTF (4h) is in a downtrend. There is a major resistance level 40 points above entry. No sweep or OB confluence.',
    question: 'What is the correct decision?',
    choices: [
      { id: 'a', text: 'Take the trade — an FVG is an FVG' },
      { id: 'b', text: 'Take it with a tight stop' },
      { id: 'c', text: 'Skip — context kills the setup' },
      { id: 'd', text: 'Short from the FVG zone instead' },
    ],
    correct: 'c',
    buildChart: () => {
      const c = generateCandles({ count: 70, startPrice: 42000, volatility: 350, trend: -0.15 });
      injectPattern(c, 35, [
        { open: 40200, close: 40500, high: 40600, low: 40150, volume: 1000 },
        { open: 40500, close: 41200, high: 41250, low: 40480, volume: 2800 },
        { open: 41200, close: 40900, high: 41220, low: 40650, volume: 1400 },
      ]);
      injectPattern(c, 41, [
        { open: 40900, close: 40650, high: 40920, low: 40600, volume: 900  },
        { open: 40650, close: 40750, high: 40800, low: 40500, volume: 1100 },
        { open: 40750, close: 39800, high: 40780, low: 39750, volume: 4800 },
      ]);
      return c;
    },
    annotations: [
      { type: 'zone',  startCandle: 35, endCandle: 37, low: 40600, high: 40650, color: '#f5c842', label: 'LTF FVG (weak)' },
      { type: 'arrow', candle: 35, dir: 'down', label: 'HTF Trend = DOWN', color: '#ff3d5a' },
      { type: 'arrow', candle: 43, dir: 'down', label: 'HTF Takes Control', color: '#ff3d5a' },
    ],
    plan: `CORRECT CALL: SKIP
Three reasons to skip every time:
1. HTF Conflict: 4h is in downtrend. A 5m bullish FVG is a counter-trend LTF signal. HTF always wins.
2. No Target Room: Resistance 40 points above entry. With a proper stop, R/R is negative before entering.
3. 5m FVG Only: No HTF backing. No sweep. No OB. Single signal on the lowest timeframe = lottery ticket.
THE META-RULE: There will always be another setup. The discipline to skip weak setups is what separates profitable traders from breakeven. Mark this in your journal as a NO-TRADE ZONE and move on.`,
  },
  {
    id: 'mock-10', asset: 'BTC/USDT', title: 'Setup #10 — The Complete Trade',
    scenario: 'FINAL: BTC at a daily FVG zone. Prior bullish BOS on 4h. Low-vol pullback into the zone. Equal lows form at the zone and get swept with a wick (5x volume). Reversal candle immediately after: 4x volume.',
    question: 'All concepts apply. Construct the complete trade.',
    choices: [
      { id: 'a', text: 'Trade BTC only — single asset, single signal' },
      { id: 'b', text: 'Skip — too many factors to track' },
      { id: 'c', text: 'Full-size LONG — sweep + FVG + OB + BOS + LV pullback = 5-factor confluence' },
      { id: 'd', text: 'Small probe only — downtrend context is risky' },
    ],
    correct: 'c',
    buildChart: () => {
      const c = generateCandles({ count: 70, startPrice: 43000, volatility: 380, trend: 0.12 });
      injectPattern(c, 22, [{ open: 45000, close: 45600, high: 45650, low: 44980, volume: 3600 }]);
      injectPattern(c, 26, [{ open: 45400, close: 45100, high: 45420, low: 45080, volume: 1100 }]);
      injectPattern(c, 30, [
        { open: 45100, close: 45400, high: 45450, low: 45050, volume: 1000 },
        { open: 45400, close: 46800, high: 46850, low: 45380, volume: 4200 },
        { open: 46800, close: 46200, high: 46820, low: 45900, volume: 1900 },
      ]);
      injectPattern(c, 36, [
        { open: 46200, close: 45900, high: 46220, low: 45880, volume: 750  },
        { open: 45900, close: 45650, high: 45920, low: 45630, volume: 680  },
        { open: 45650, close: 45420, high: 45670, low: 45100, volume: 750  },
        { open: 45420, close: 46100, high: 46150, low: 45080, volume: 5800 },
        { open: 46100, close: 46700, high: 46750, low: 46080, volume: 4200 },
      ]);
      return c;
    },
    annotations: [
      { type: 'zone',  startCandle: 30, endCandle: 32, low: 45450, high: 45900, color: '#3d9bff', label: 'Daily FVG Zone' },
      { type: 'hline', price: 45100, color: '#f5c842', label: 'Equal Lows (Liquidity)' },
      { type: 'arrow', candle: 39, dir: 'up', label: '→ LONG Full Size', color: '#00d17a' },
    ],
    plan: `THE COMPLETE TRADE — 5-Factor Confluence LONG
✓ Structure: Bullish BOS on 4h — trend confirmed up
✓ FVG: Daily timeframe zone (45,450–45,900) — high-weight signal
✓ Order Block: Prior HL + FVG zone overlap = OB+FVG confluence
✓ Liquidity Sweep: Equal lows at 45,100 swept — sell-side cleared
✓ Volume: LV pullback (680–750) + 5,800 sweep reversal = institutional confirmation
ENTRY: Open of candle after sweep reversal (~45,420) or pullback to FVG zone
STOP: Below sweep wick low — below 45,050 (ATR buffer)
TARGET 1: 46,800 (FVG high)
TARGET 2: 48,000 (measured move)
R/R: ~350pt risk / ~1,380pt target = 3.9:1
SIZING: 5 independent signals all aligned = full-position entry. Not a probe. Not a starter. The setup you trained 7 lessons for.`,
  },
];

export default function Lesson7_FinalExam() {
  const navigate = useNavigate();
  const { completeLesson } = useAppStore();
  const [current,   setCurrent]  = useState(0);
  const [phase,     setPhase]    = useState('question');
  const [chosen,    setChosen]   = useState(null);
  const [score,     setScore]    = useState(0);
  const [results,   setResults]  = useState([]);
  const [showAnns,  setShowAnns] = useState(false);

  const setup    = MOCK_SETUPS[current];
  const chartData = useMemo(() => setup.buildChart(), [current]);

  const totalCorrect = results.filter(r => r.correct).length;

  const handleAnswer = (choiceId) => {
    const correct = choiceId === setup.correct;
    setChosen(choiceId);
    setShowAnns(true);
    setScore(s => s + (correct ? 10 : 0));
    setResults(r => [...r, { id: setup.id, correct }]);
    setPhase('result');
  };

  const next = () => {
    if (current < MOCK_SETUPS.length - 1) {
      setCurrent(c => c + 1);
      setPhase('question');
      setChosen(null);
      setShowAnns(false);
    } else {
      completeLesson('lesson-7', score);
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-96 flex-shrink-0 border-r border-border bg-surface overflow-y-auto p-5">
        <div className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">
          Final Exam · {current + 1}/{MOCK_SETUPS.length}
        </div>
        <h2 className="font-serif text-xl text-text font-bold mb-1">{setup.title}</h2>
        <div className="font-mono text-xs text-blue mb-4">{setup.asset}</div>
        {/* Progress bar */}
        <div className="flex gap-1 mb-5">
          {MOCK_SETUPS.map((s, i) => {
            const r = results.find(r => r.id === s.id);
            return (
              <div key={s.id} className={`h-1.5 flex-1 rounded-full
                ${i === current ? 'bg-yellow' : r ? (r.correct ? 'bg-green' : 'bg-red') : 'bg-border'}`} />
            );
          })}
        </div>
        {/* Scenario */}
        <div className="bg-panel border border-borderBright rounded-lg p-4 mb-4">
          <div className="font-mono text-[10px] text-blue uppercase tracking-widest mb-2">Scenario</div>
          <p className="font-mono text-xs text-muted leading-relaxed">{setup.scenario}</p>
        </div>
        {/* Question */}
        {phase === 'question' && (
          <>
            <div className="font-mono text-xs text-yellow mb-3">🎯 {setup.question}</div>
            <div className="space-y-2">
              {setup.choices.map(ch => (
                <button key={ch.id} onClick={() => handleAnswer(ch.id)}
                  className="w-full text-left p-3 rounded-lg border border-border bg-panel hover:border-borderBright transition-colors">
                  <span className="font-mono text-[10px] text-muted uppercase mr-2">{ch.id})</span>
                  <span className="font-mono text-xs text-text">{ch.text}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {/* Result */}
        {phase === 'result' && (
          <>
            <div className="space-y-1.5 mb-4">
              {setup.choices.map(ch => (
                <div key={ch.id} className={`flex items-start gap-2 p-2.5 rounded-lg
                  ${ch.id === setup.correct ? 'bg-green/10 border border-green/30' :
                    ch.id === chosen && chosen !== setup.correct ? 'bg-red/10 border border-red/30' :
                    'bg-panel border border-transparent'}`}>
                  <span className={`font-mono text-xs font-bold flex-shrink-0
                    ${ch.id === setup.correct ? 'text-green' : ch.id === chosen ? 'text-red' : 'text-dim'}`}>
                    {ch.id === setup.correct ? '✓' : ch.id === chosen ? '✗' : '·'}
                  </span>
                  <span className="font-mono text-xs text-muted">{ch.text}</span>
                </div>
              ))}
            </div>
            <div className="bg-panel border border-borderBright rounded-lg p-4 mb-4">
              <div className="font-mono text-[10px] text-blue uppercase tracking-widest mb-2">Full Trade Plan</div>
              <pre className="font-mono text-[10px] text-muted leading-relaxed whitespace-pre-wrap">{setup.plan}</pre>
            </div>
            <button onClick={next}
              className="w-full py-3 rounded-lg border border-green bg-green/10 text-green font-mono text-sm font-bold">
              {current < MOCK_SETUPS.length - 1 ? `NEXT SETUP →` : `FINISH — ${totalCorrect + (chosen === setup.correct ? 1 : 0)}/10 ✓`}
            </button>
          </>
        )}
        <div className="mt-4 pt-4 border-t border-border flex justify-between font-mono text-xs">
          <span className="text-muted">Score</span>
          <span className="text-yellow font-bold">{score}/{MOCK_SETUPS.length * 10}</span>
        </div>
      </div>
      {/* Chart */}
      <div className="flex-1 bg-bg flex flex-col">
        <div className="px-4 py-2 border-b border-border bg-surface flex items-center gap-4">
          <span className="font-mono text-sm font-bold text-text">{setup.asset}</span>
          <span className="font-mono text-xs text-muted">
            {phase === 'question' ? 'Read the chart — no annotations' : 'Annotated — review the analysis'}
          </span>
        </div>
        <div className="flex-1">
          <CandleChart candles={chartData} annotations={showAnns ? setup.annotations : []} showVolume height={520} />
        </div>
      </div>
    </div>
  );
}
