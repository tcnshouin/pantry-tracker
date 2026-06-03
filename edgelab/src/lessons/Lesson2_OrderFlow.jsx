import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CandleChart from '../components/chart/CandleChart';
import { generateCandles, injectPattern, applyDrift } from '../data/candleGenerator';
import { useAppStore } from '../store/useAppStore';

const CONCEPT = {
  module: 'Order Flow',
  title: 'Order Flow & Fair Value Gaps',
  sections: [
    {
      heading: 'What Is Order Flow?',
      body: `Order flow is the real-time imbalance between buyers and sellers. When institutions place massive orders, price moves aggressively — leaving structural evidence behind.
Reading order flow means reading these footprints. The most visible footprint is the Fair Value Gap.`,
    },
    {
      heading: 'Fair Value Gap (FVG)',
      body: `An FVG is a 3-candle pattern where the middle candle moves so aggressively that a gap forms:
Bullish FVG: Candle 3's LOW is ABOVE Candle 1's HIGH
Bearish FVG: Candle 3's HIGH is BELOW Candle 1's LOW
The gap = a zone where price had no two-sided trading. Price is drawn back to "fill" this imbalance — it acts as a magnet.`,
    },
    {
      heading: 'How to Trade FVGs',
      body: `Entry: Wait for price to return to the FVG zone. Look for a reaction candle (rejection wick, engulfing) INSIDE the zone.
Stop: Below/above the FVG entirely. If price closes through the zone, FVG is invalidated.
Target: Far edge of FVG, then the prior swing high/low.`,
    },
    {
      heading: 'FVG Strength Factors',
      body: `Strong FVG: Impulse candle volume 2x+ average. Large body, small wicks. At a major structural level.
Weak FVG: Small impulse body. Normal volume. On a lower timeframe only. Against HTF trend.
Rule: Only trade FVGs that are WITH the HTF trend and have high-volume impulse candles.`,
    },
  ],
  signals: [
    'Middle candle body must be large — small bodies create weak, unreliable FVGs',
    'Volume on the impulse (middle) candle should be 2x+ average recent volume',
    'On FVG retest: watch for reaction — candle should wick into FVG but CLOSE back out',
    'FVG at a higher timeframe structure level (near HH, HL, OB) = highest weight',
    'FVG that gets fully closed through (body trades through both edges) = invalidated',
  ],
};

const CHALLENGES = [
  {
    id: 'fvg-bullish',
    title: 'Challenge 1 — Find the Bullish FVG',
    asset: 'BTC/USDT',
    question: 'Click the MIDDLE candle (C2) of the bullish Fair Value Gap — the impulse candle that created the imbalance.',
    targetRange: [39, 41],
    buildChart: () => {
      const c = generateCandles({ count: 80, startPrice: 41000, volatility: 350, trend: 0.05 });
      injectPattern(c, 38, [
        { open: 42200, close: 42600, high: 42700, low: 42100, volume: 1100 },
        { open: 42600, close: 44800, high: 44950, low: 42550, volume: 4200 },
        { open: 44800, close: 44400, high: 44860, low: 44000, volume: 1600 },
      ]);
      return c;
    },
    annotations: [
      { type: 'zone',  startCandle: 38, endCandle: 40, low: 42700, high: 44000, color: '#3d9bff', label: 'Bullish FVG Zone' },
      { type: 'arrow', candle: 39, dir: 'up', label: 'C2 — Impulse (FVG Creator)', color: '#3d9bff' },
      { type: 'label', candle: 38, text: 'C1', color: '#6b7a91', position: 'below' },
      { type: 'label', candle: 39, text: 'C2', color: '#3d9bff', position: 'above' },
      { type: 'label', candle: 40, text: 'C3', color: '#6b7a91', position: 'above' },
    ],
    explanation: `C2 (candle 39) moved from 42,600 to 44,800 — a 2,200-point impulse on 4,200 volume (4x average). C1 high = 42,700. C3 low = 44,000. Gap between 42,700 and 44,000 = the FVG zone. Price is magnetically drawn back to this area before continuing up. Entry zone: 42,700–44,000.`,
  },
  {
    id: 'fvg-bearish',
    title: 'Challenge 2 — Find the Bearish FVG',
    asset: 'NASDAQ:NQ',
    question: 'Click the MIDDLE candle of the bearish Fair Value Gap — the impulse candle that created the bearish imbalance.',
    targetRange: [44, 46],
    buildChart: () => {
      const c = generateCandles({ count: 80, startPrice: 19200, volatility: 80, trend: -0.05 });
      injectPattern(c, 43, [
        { open: 19400, close: 19250, high: 19420, low: 19230, volume: 900  },
        { open: 19250, close: 17900, high: 19260, low: 17850, volume: 5100 },
        { open: 17900, close: 18100, high: 18200, low: 17860, volume: 1800 },
      ]);
      return c;
    },
    annotations: [
      { type: 'zone',  startCandle: 43, endCandle: 45, low: 18200, high: 19230, color: '#ff3d5a', label: 'Bearish FVG Zone' },
      { type: 'arrow', candle: 44, dir: 'down', label: 'C2 — Bearish Impulse', color: '#ff3d5a' },
    ],
    explanation: `C1 low = 19,230. C3 high = 18,200. Gap between 18,200–19,230 = bearish FVG. C2 volume: 5,100 (vs avg ~900) confirms institutional selling. On a pullback retest to 18,200–19,230, look for bearish rejection candle. Stop: above FVG high (19,230).`,
  },
];

export default function Lesson2_OrderFlow() {
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
    recordAttempt('lesson-2');
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
      completeLesson('lesson-2', totalScore);
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-80 flex-shrink-0 border-r border-border bg-surface overflow-y-auto p-5">
        {phase === 'learn' ? (
          <>
            <div className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">Lesson 2 · {CONCEPT.module}</div>
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
