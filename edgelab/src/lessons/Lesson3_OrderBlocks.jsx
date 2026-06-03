import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CandleChart from '../components/chart/CandleChart';
import { generateCandles, injectPattern, applyDrift } from '../data/candleGenerator';
import { useAppStore } from '../store/useAppStore';

const CONCEPT = {
  module: 'Order Blocks',
  title: 'Order Blocks — Smart Money Footprints',
  sections: [
    {
      heading: 'What Is an Order Block?',
      body: `An Order Block (OB) is the last candle in the OPPOSITE direction before a strong impulsive move. It marks where institutions placed large pending orders.
Bearish OB = Last BULLISH candle before a strong bearish move
Bullish OB = Last BEARISH candle before a strong bullish move
The OB body range (open to close) is the key zone.`,
    },
    {
      heading: 'Why Order Blocks Work',
      body: `Institutions cannot fill entire positions in one candle. Partial orders are placed across multiple candles, then the move happens. The REMAINING unfilled orders sit at that original price level.
When price returns, institutions fill the rest — this creates the "defense" that makes OBs work. You are entering alongside them.`,
    },
    {
      heading: 'How to Trade Order Blocks',
      body: `Entry: Price returns to OB zone. Wait for a rejection trigger (bearish engulfing, hammer, wick rejection) INSIDE the zone.
Stop: Beyond the OB extreme (full breach = invalidation).
Target: The high/low of the original impulse, then beyond.`,
    },
    {
      heading: 'OB + FVG Confluence',
      body: `The highest-probability setups occur when an OB overlaps with an FVG from the same move. This is called OB+FVG confluence.
Two types of institutional activity at the same price = the level is heavily defended. These are your A-grade setups.`,
    },
  ],
  signals: [
    'The impulse away from the OB must be strong — multiple candles, elevated volume',
    'OB zone = open to close (body) of the last counter-candle before the impulse',
    'On retest: look for bearish/bullish engulfing, pinbar, or wick rejection inside OB body',
    'Fresh OBs (never retested) are far more reliable than OBs tested multiple times',
    'OBs at major HTF swing points (daily/4h) outweigh LTF OBs',
  ],
};

const CHALLENGES = [
  {
    id: 'ob-bearish',
    title: 'Challenge 1 — Identify the Bearish Order Block',
    asset: 'BTC/USDT',
    question: 'Click the Bearish Order Block — the last BULLISH candle before the major bearish impulse.',
    targetRange: [34, 37],
    buildChart: () => {
      const c = generateCandles({ count: 80, startPrice: 44000, volatility: 380, trend: 0 });
      injectPattern(c, 32, [
        { open: 45100, close: 44900, high: 45200, low: 44850, volume: 880  },
        { open: 44900, close: 45300, high: 45400, low: 44850, volume: 1200 },
        { open: 45300, close: 45700, high: 45800, low: 45250, volume: 1450 },
        { open: 45700, close: 44200, high: 45750, low: 44150, volume: 5200 },
        { open: 44200, close: 43600, high: 44250, low: 43550, volume: 4100 },
        { open: 43600, close: 43100, high: 43650, low: 43050, volume: 3200 },
      ]);
      return c;
    },
    annotations: [
      { type: 'zone',  startCandle: 34, endCandle: 35, low: 45300, high: 45800, color: '#ff3d5a', label: 'Bearish OB Zone' },
      { type: 'arrow', candle: 35, dir: 'down', label: 'Institutional Sell Move', color: '#ff3d5a' },
    ],
    explanation: `Bearish OB = candle 34 (last bullish candle, close: 45,700) before the 1,500-point drop on candle 35 (volume: 5,200). OB zone: 45,300–45,800 (body of OB candle). On pullback to this zone: enter short on rejection. Stop: above 45,800. Target: 44,200 (impulse start), then 43,000.`,
  },
  {
    id: 'ob-bullish',
    title: 'Challenge 2 — Identify the Bullish Order Block',
    asset: 'NASDAQ:NQ',
    question: 'Click the Bullish Order Block — the last BEARISH candle before the major bullish impulse.',
    targetRange: [42, 45],
    buildChart: () => {
      const c = generateCandles({ count: 80, startPrice: 17500, volatility: 85, trend: 0 });
      injectPattern(c, 40, [
        { open: 17700, close: 17820, high: 17850, low: 17680, volume: 920  },
        { open: 17820, close: 17620, high: 17840, low: 17600, volume: 1100 },
        { open: 17620, close: 17400, high: 17640, low: 17380, volume: 1300 },
        { open: 17400, close: 18200, high: 18250, low: 17380, volume: 4800 },
        { open: 18200, close: 18550, high: 18600, low: 18180, volume: 3800 },
        { open: 18550, close: 18900, high: 18950, low: 18530, volume: 3100 },
      ]);
      return c;
    },
    annotations: [
      { type: 'zone',  startCandle: 42, endCandle: 43, low: 17380, high: 17640, color: '#00d17a', label: 'Bullish OB Zone' },
      { type: 'arrow', candle: 43, dir: 'up', label: 'Institutional Buy Move', color: '#00d17a' },
    ],
    explanation: `Bullish OB = candle 42 (last bearish candle, open 17,620 → close 17,400) before the 800-point rally. OB zone: 17,380–17,640. On pullback to this zone: look for bullish rejection (hammer, engulf). Stop: below 17,380. Target: 18,200 (impulse end), then 18,900.`,
  },
];

export default function Lesson3_OrderBlocks() {
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
    recordAttempt('lesson-3');
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
      completeLesson('lesson-3', totalScore);
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-80 flex-shrink-0 border-r border-border bg-surface overflow-y-auto p-5">
        {phase === 'learn' ? (
          <>
            <div className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">Lesson 3 · {CONCEPT.module}</div>
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
