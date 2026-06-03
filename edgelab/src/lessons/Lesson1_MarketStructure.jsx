import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CandleChart from '../components/chart/CandleChart';
import { generateCandles, injectPattern, applyDrift } from '../data/candleGenerator';
import { useAppStore } from '../store/useAppStore';

const CONCEPT = {
  module: 'Market Structure',
  title: 'Market Structure — The Foundation of Everything',
  sections: [
    {
      heading: 'What Is Market Structure?',
      body: `Market structure is the sequence of swing highs and swing lows that defines trend direction. It is the first thing every professional trader reads before placing a single order.
Uptrend   = Higher Highs (HH) + Higher Lows (HL)
Downtrend = Lower Lows (LL)  + Lower Highs (LH)
Range     = Equal highs + equal lows (accumulation or distribution)
Without understanding structure, every other signal is noise.`,
    },
    {
      heading: 'Break of Structure (BOS)',
      body: `A BOS occurs when price closes decisively beyond the previous swing high (bullish BOS) or swing low (bearish BOS). This CONFIRMS trend continuation.
Bullish BOS: Price closes above the prior HH → trend confirmed up
Bearish BOS: Price closes below the prior LL → trend confirmed down
Use BOS for: Confirming trend direction, timing pullback entries.`,
    },
    {
      heading: 'Change of Character (CHoCH)',
      body: `A CHoCH is the FIRST sign that a trend is reversing. In an uptrend:
1. Price fails to make a new HH (prints a Lower High instead)
2. Then price breaks BELOW the most recent HL
= CHoCH confirmed
This is NOT a short signal on its own — it is a warning to stop trading longs and prepare for possible reversal.`,
    },
    {
      heading: 'The Key Rule',
      body: `BOS = trend continuation. Trade WITH it.
CHoCH = character change. Stop trading the prior direction.
After a CHoCH: wait for a bearish BOS on the lower timeframe, then trade the new trend with lower risk.`,
    },
  ],
  signals: [
    'Mark 3–5 significant swing highs and lows before looking for signals',
    'BOS requires a full candle BODY close through the level — wicks alone do not count',
    'Volume on the BOS candle should exceed pullback candles by 2x+',
    'CHoCH sequence: HH → HL → HH → HL → LH (warning) → HL break = CHoCH',
    'Higher timeframe structure (4h, Daily) outweighs lower timeframe signals',
  ],
};

const CHALLENGES = [
  {
    id: 'bos-bullish',
    title: 'Challenge 1 — Identify the Bullish BOS',
    asset: 'BTC/USDT',
    question: 'Click the candle that creates a BULLISH Break of Structure — the candle that closes above the prior significant swing high.',
    targetRange: [46, 49],
    buildChart: () => {
      const c = generateCandles({ count: 80, startPrice: 27000, volatility: 220, trend: 0.1 });
      injectPattern(c, 26, [{ open: 27500, close: 27900, high: 28000, low: 27450, volume: 1800 }]);
      injectPattern(c, 33, [{ open: 27700, close: 27500, high: 27750, low: 27450, volume: 900  }]);
      injectPattern(c, 40, [{ open: 27500, close: 27800, high: 27850, low: 27480, volume: 1400 }]);
      injectPattern(c, 44, [{ open: 27750, close: 27600, high: 27800, low: 27550, volume: 800  }]);
      injectPattern(c, 46, [
        { open: 27600, close: 28200, high: 28250, low: 27580, volume: 3400 },
        { open: 28200, close: 28500, high: 28550, low: 28150, volume: 2600 },
        { open: 28500, close: 28700, high: 28750, low: 28450, volume: 2000 },
      ]);
      return c;
    },
    annotations: [
      { type: 'hline', price: 28000, color: '#f5c842', label: 'Prior Swing High (HH1)' },
      { type: 'label', candle: 26,   text: 'HH1', color: '#f5c842', position: 'above' },
      { type: 'label', candle: 33,   text: 'HL',  color: '#3d9bff', position: 'below' },
      { type: 'label', candle: 44,   text: 'HL2', color: '#3d9bff', position: 'below' },
      { type: 'arrow', candle: 46,   dir: 'up',   label: 'BOS Here', color: '#00d17a' },
    ],
    explanation: `The BOS occurs when price closes above the prior HH1 at 28,000. Sequence: HH1 (26) → HL (33) → rally toward HH → HL2 (44) → BOS candle closes at 28,200 (above 28,000). Volume on BOS candle: 3,400 vs average ~1,000. Elevated volume confirms institutional participation. Entry: pullback to 27,800–28,000 area.`,
  },
  {
    id: 'choch-bearish',
    title: 'Challenge 2 — Identify the Bearish CHoCH',
    asset: 'NASDAQ:NQ',
    question: 'Click the candle that creates a BEARISH CHoCH — the first candle to close below the Higher Low in an uptrend.',
    targetRange: [50, 53],
    buildChart: () => {
      const c = generateCandles({ count: 80, startPrice: 18800, volatility: 90, trend: 0.12 });
      injectPattern(c, 28, [{ open: 19200, close: 19600, high: 19650, low: 19150, volume: 1700 }]);
      injectPattern(c, 32, [{ open: 19450, close: 19300, high: 19480, low: 19280, volume: 950  }]);
      injectPattern(c, 38, [{ open: 19300, close: 19850, high: 19900, low: 19280, volume: 2200 }]);
      injectPattern(c, 43, [{ open: 19700, close: 19580, high: 19720, low: 19560, volume: 1100 }]);
      injectPattern(c, 47, [{ open: 19580, close: 19720, high: 19740, low: 19560, volume: 800  }]);
      injectPattern(c, 50, [
        { open: 19660, close: 19380, high: 19680, low: 19360, volume: 3600 },
        { open: 19380, close: 19100, high: 19400, low: 19080, volume: 2900 },
        { open: 19100, close: 18850, high: 19120, low: 18830, volume: 2400 },
      ]);
      return c;
    },
    annotations: [
      { type: 'hline', price: 19580, color: '#f5c842', label: 'Higher Low (HL2)' },
      { type: 'label', candle: 38, text: 'HH2', color: '#00d17a', position: 'above' },
      { type: 'label', candle: 43, text: 'HL2', color: '#3d9bff', position: 'below' },
      { type: 'label', candle: 47, text: 'LH ⚠', color: '#ff3d5a', position: 'above' },
      { type: 'arrow', candle: 50, dir: 'down', label: 'CHoCH', color: '#ff3d5a' },
    ],
    explanation: `CHoCH at candle 50: price closes at 19,380 — below HL2 at 19,580. The prior warning was candle 47 (LH instead of HH3). Volume on CHoCH: 3,600 (vs pullback average ~900). This is institutional selling, not noise. After this: stop trading longs, wait for bearish BOS to confirm new downtrend, then short retests.`,
  },
];

export default function Lesson1_MarketStructure() {
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
    recordAttempt('lesson-1');
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
      completeLesson('lesson-1', totalScore);
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-80 flex-shrink-0 border-r border-border bg-surface overflow-y-auto p-5">
        {phase === 'learn' ? (
          <>
            <div className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">Lesson 1 · {CONCEPT.module}</div>
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
