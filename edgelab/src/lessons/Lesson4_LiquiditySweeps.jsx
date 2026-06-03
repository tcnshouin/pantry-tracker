import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CandleChart from '../components/chart/CandleChart';
import { generateCandles, injectPattern, applyDrift } from '../data/candleGenerator';
import { useAppStore } from '../store/useAppStore';

const CONCEPT = {
  module: 'Liquidity',
  title: 'Liquidity Sweeps & Stop Hunts',
  sections: [
    {
      heading: 'What Is Liquidity?',
      body: `In trading, liquidity = clusters of pending orders. Retail traders predictably place:
- Stops BELOW support (buy stops cluster there)
- Stops ABOVE resistance (sell stops cluster there)
These clusters create "liquidity pools" that institutions TARGET to fill their large orders at better prices.`,
    },
    {
      heading: 'The Sweep Mechanism',
      body: `Institutions push price into a liquidity pool, triggering stop orders. This fills their position and removes opposing liquidity. The tell:
A wick pierces the key level but the CANDLE CLOSES BACK on the other side.
Wick above resistance + close below = buy-side sweep → SHORT
Wick below support + close above = sell-side sweep → LONG`,
    },
    {
      heading: 'Equal Highs & Equal Lows',
      body: `Equal highs or equal lows are the MOST dangerous liquidity pools. When two or more candles share nearly identical highs or lows, retail traders mark it as "double top/bottom" and cluster stops there.
Institutions see this. They target the level, sweep the stops, then reverse sharply.`,
    },
    {
      heading: 'Entry After a Sweep',
      body: `Entry: Next candle open after the sweep candle closes back inside range.
Stop: Beyond the wick extreme (if price continues past the wick, it was a real breakout).
Target: Opposite end of the range (the other liquidity pool).`,
    },
  ],
  signals: [
    'Price approaches a well-established high/low tested 2+ times — stops are clustering there',
    'The sweep candle wicks THROUGH the level but its BODY closes back inside the range',
    'Volume on sweep candle is elevated — triggered stops = real volume spike',
    'The reversal candle immediately after the sweep should be strong and decisive',
    'Equal highs / equal lows = highest-probability sweep targets',
  ],
};

const CHALLENGES = [
  {
    id: 'sweep-highs',
    title: 'Challenge 1 — Identify the Buy-Side Liquidity Sweep',
    asset: 'BTC/USDT',
    question: 'Click the candle that performs the liquidity sweep — the wick that pierces above resistance then closes back below it.',
    targetRange: [48, 51],
    buildChart: () => {
      const c = generateCandles({ count: 80, startPrice: 29000, volatility: 280, trend: 0 });
      injectPattern(c, 24, [{ open: 30200, close: 30600, high: 30700, low: 30150, volume: 1800 }]);
      injectPattern(c, 30, [{ open: 30400, close: 30550, high: 30680, low: 30380, volume: 1200 }]);
      for (let i = 35; i < 48; i++) {
        const o = 30000 + (Math.random() - 0.5) * 400;
        const cl = 30000 + (Math.random() - 0.5) * 400;
        c[i] = { i, open: o, close: cl, high: Math.max(o, cl) + 100 + Math.random() * 200, low: Math.min(o, cl) - 100 - Math.random() * 150, volume: 700 + Math.random() * 400 };
      }
      injectPattern(c, 48, [
        { open: 30400, close: 29800, high: 30950, low: 29750, volume: 5600 },
        { open: 29800, close: 29200, high: 29850, low: 29150, volume: 4200 },
        { open: 29200, close: 28700, high: 29250, low: 28650, volume: 3600 },
      ]);
      return c;
    },
    annotations: [
      { type: 'hline', price: 30700, color: '#f5c842', label: 'Resistance / Liquidity Pool' },
      { type: 'arrow', candle: 48, dir: 'down', label: 'Sweep & Reverse', color: '#ff3d5a' },
    ],
    explanation: `Sweep candle (48): high = 30,950 (pierces resistance at 30,700), but CLOSES at 29,800 — back below the level. Volume: 5,600 (vs avg ~900) = stop cascade. All stops above 30,700 were triggered, institutions sold into that liquidity, then reversed down. Entry: open of next candle (~29,800). Stop: above wick high (31,000). Target: 28,000.`,
  },
  {
    id: 'sweep-equal-lows',
    title: 'Challenge 2 — Equal Lows Sweep (Sell-Side Liquidity)',
    asset: 'NASDAQ:NQ',
    question: 'Click the candle that sweeps the equal lows — wicks below the double-bottom cluster then reverses sharply upward.',
    targetRange: [50, 53],
    buildChart: () => {
      const c = generateCandles({ count: 80, startPrice: 18200, volatility: 88, trend: 0 });
      injectPattern(c, 28, [{ open: 18400, close: 18150, high: 18420, low: 18050, volume: 1200 }]);
      injectPattern(c, 36, [{ open: 18350, close: 18120, high: 18370, low: 18042, volume: 1100 }]);
      injectPattern(c, 43, [{ open: 18300, close: 18140, high: 18320, low: 18038, volume: 1000 }]);
      injectPattern(c, 50, [
        { open: 18200, close: 17820, high: 18220, low: 17650, volume: 4800 },
        { open: 17820, close: 18500, high: 18560, low: 17800, volume: 5200 },
        { open: 18500, close: 18850, high: 18900, low: 18480, volume: 3800 },
      ]);
      return c;
    },
    annotations: [
      { type: 'hline', price: 18042, color: '#f5c842', label: 'Equal Lows (Sell-Side Liquidity)' },
      { type: 'label', candle: 28, text: 'EQL1', color: '#f5c842', position: 'below' },
      { type: 'label', candle: 36, text: 'EQL2', color: '#f5c842', position: 'below' },
      { type: 'label', candle: 43, text: 'EQL3', color: '#f5c842', position: 'below' },
      { type: 'arrow', candle: 50, dir: 'down', label: 'Sweep Below EQL', color: '#ff3d5a' },
      { type: 'arrow', candle: 51, dir: 'up',   label: 'Reversal Confirmed', color: '#00d17a' },
    ],
    explanation: `Three equal lows around 18,040 = massive cluster of buy stops. Sweep wick to 17,650 triggers all stops. Volume: 4,800 + 5,200 on reversal = institutional buying. Entry: open after reversal candle (~17,820 or pullback). Stop: below 17,600. Target: opposite range high (~19,200).`,
  },
];

export default function Lesson4_LiquiditySweeps() {
  const navigate = useNavigate();
  const { completeLesson, recordAttempt } = useAppStore();
  const [phase,      setPhase]     = useState('learn');
  const [cIdx,       setCIdx]      = useState(0);
  const [selected,   setSelected]  = useState(null);
  const [correct,    setCorrect]   = useState(null);
  const [totalScore, setTotalScore]= useState(0);
  const [attempts,   setAttempts]  = useState(0);
  const [showAnns,   setShowAnns]  = useState(false);

  const challenge = CHALLENGES[cIdx];
  const chartData = useMemo(() => challenge.buildChart(), [cIdx]);

  const handleCandleClick = (idx) => {
    if (phase !== 'challenge') return;
    setSelected(idx);
    const [min, max] = challenge.targetRange;
    const isCorrect  = idx >= min && idx <= max;
    setCorrect(isCorrect);
    setShowAnns(true);
    setAttempts(a => a + 1);
    recordAttempt('lesson-4');
    if (isCorrect) setTotalScore(s => s + (attempts === 0 ? 50 : 25));
    setTimeout(() => setPhase('result'), 300);
  };

  const nextChallenge = () => {
    if (cIdx < CHALLENGES.length - 1) {
      setCIdx(c => c + 1);
      setPhase('challenge');
      setSelected(null);
      setCorrect(null);
      setShowAnns(false);
      setAttempts(0);
    } else {
      completeLesson('lesson-4', totalScore);
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-80 flex-shrink-0 border-r border-border bg-surface overflow-y-auto p-5">
        {phase === 'learn' ? (
          <>
            <div className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">Lesson 4 · {CONCEPT.module}</div>
            <h2 className="font-serif text-xl text-text font-bold mb-5">{CONCEPT.title}</h2>
            {CONCEPT.sections.map((s, i) => (
              <div key={i} className="mb-5">
                <h3 className="font-mono text-xs font-bold text-blue mb-2">— {s.heading}</h3>
                <p className="font-mono text-xs text-muted leading-relaxed whitespace-pre-line">{s.body}</p>
              </div>
            ))}
            <div className="bg-panel border border-borderBright rounded-lg p-4 mb-6">
              <div className="font-mono text-[10px] text-green uppercase tracking-widest mb-3">🎯 Signals to Watch</div>
              {CONCEPT.signals.map((s, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <span className="text-green font-mono text-xs flex-shrink-0">›</span>
                  <span className="font-mono text-xs text-muted leading-relaxed">{s}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setPhase('challenge')}
              className="w-full py-3 rounded-lg border border-green bg-green/10 text-green font-mono text-sm font-bold hover:bg-green/20 transition-colors">
              START CHALLENGES →
            </button>
          </>
        ) : (
          <>
            <div className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">{challenge.asset}</div>
            <h3 className="font-serif text-base text-text font-bold mb-4">{challenge.title}</h3>
            {phase === 'challenge' && (
              <div className="bg-yellow/10 border border-yellow/40 rounded-lg p-4 mb-4">
                <p className="font-mono text-xs text-yellow leading-relaxed">🔍 {challenge.question}</p>
              </div>
            )}
            {phase === 'result' && (
              <>
                <div className={`rounded-lg p-4 mb-4 border ${correct ? 'bg-green/10 border-green/40' : 'bg-red/10 border-red/40'}`}>
                  <div className={`font-mono text-sm font-bold mb-2 ${correct ? 'text-green' : 'text-red'}`}>
                    {correct ? '✅ Correct!' : '❌ Not quite.'}
                  </div>
                  <p className="font-mono text-xs text-muted leading-relaxed">{challenge.explanation}</p>
                </div>
                <div className="flex gap-2">
                  {!correct && (
                    <button onClick={() => { setPhase('challenge'); setSelected(null); setCorrect(null); setShowAnns(false); }}
                      className="flex-1 py-2 rounded border border-yellow bg-yellow/10 text-yellow font-mono text-xs font-bold">↩ RETRY</button>
                  )}
                  <button onClick={nextChallenge}
                    className="flex-1 py-2 rounded border border-green bg-green/10 text-green font-mono text-xs font-bold">
                    {cIdx < CHALLENGES.length - 1 ? 'NEXT →' : 'FINISH ✓'}
                  </button>
                </div>
              </>
            )}
            <div className="mt-4 pt-4 border-t border-border flex justify-between font-mono text-xs">
              <span className="text-muted">Challenge {cIdx + 1}/{CHALLENGES.length}</span>
              <span className="text-yellow">{totalScore} pts</span>
            </div>
          </>
        )}
      </div>
      <div className="flex-1 bg-bg flex flex-col">
        <div className="px-4 py-2 border-b border-border bg-surface flex items-center gap-4">
          <span className="font-mono text-sm font-bold text-text">
            {phase === 'learn' ? 'Reference Chart' : challenge.asset}
          </span>
          {phase === 'challenge' && (
            <span className="font-mono text-xs text-yellow animate-pulse">↑ Click to identify</span>
          )}
        </div>
        <div className="flex-1">
          <CandleChart
            candles={chartData}
            annotations={showAnns ? challenge.annotations : []}
            onCandleClick={phase === 'challenge' ? handleCandleClick : null}
            selectedCandle={selected}
            highlightZone={phase === 'result' ? { startCandle: challenge.targetRange[0], endCandle: challenge.targetRange[1] } : null}
            showVolume
            height={520}
          />
        </div>
      </div>
    </div>
  );
}
