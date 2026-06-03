import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CandleChart from '../components/chart/CandleChart';
import { generateCandles, injectPattern, applyDrift } from '../data/candleGenerator';
import { useAppStore } from '../store/useAppStore';

const CONCEPT = {
  module: 'Volume & VSA',
  title: 'Volume Profile & Volume Spread Analysis',
  sections: [
    {
      heading: 'Volume Is the Only Truth',
      body: `Price can be manipulated short-term. Volume cannot be faked. Volume Spread Analysis (VSA) compares a candle's SPREAD (high minus low range) to its VOLUME to determine the quality of the move.
High volume + large spread = genuine move
High volume + small spread = absorption (opposite side fighting back)
Low volume  + any spread   = weak, unsustainable move`,
    },
    {
      heading: 'Volume Climax (Exhaustion)',
      body: `A volume climax = 3–5x normal volume on a single candle at the END of a trend. All remaining buyers (top) or sellers (bottom) enter at once.
Key tell: Huge volume BUT the candle body is SMALL relative to that volume. The market absorbed all that pressure and barely moved. This = exhaustion, expect reversal soon.`,
    },
    {
      heading: 'Low Volume Pullback',
      body: `During a trend, when price pulls back on LOW volume (50–70% less than impulse candles), the correction is weak. No one is committed to the retracement.
Pattern: Strong impulse (high vol) → weak pullback (low vol) → next impulse resumes (high vol)
The low-volume pullback zone = your trend continuation entry.`,
    },
    {
      heading: 'VSA Rules Summary',
      body: `Wide spread + high volume = genuine move — trade with it
Narrow spread + high volume = absorption — opposite side is fighting
Wide spread + low volume = trap — will reverse
Narrow spread + low volume = consolidation — wait, no signal yet`,
    },
  ],
  signals: [
    'Compare every candle to the 20-candle volume average — spikes are signals',
    'Climax: volume 3x+ average AND candle closes in middle or against the move (small body)',
    'Low vol pullback: 3+ consecutive candles with volume well below impulse bars',
    'Effort vs. result: massive volume + tiny price movement = institutions absorbing = trap',
    'No-demand bar: small spread, low volume in uptrend on a rally attempt = top forming',
  ],
};

const CHALLENGES = [
  {
    id: 'vol-climax',
    title: 'Challenge 1 — Identify the Volume Climax',
    asset: 'BTC/USDT',
    question: 'Click the Volume Climax candle — abnormally high volume with a disproportionately small body at the end of the uptrend.',
    targetRange: [54, 57],
    buildChart: () => {
      const c = generateCandles({ count: 80, startPrice: 34000, volatility: 320, trend: 0.22 });
      applyDrift(c, 30, 53, 120);
      injectPattern(c, 54, [
        { open: 40800, close: 41100, high: 41600, low: 40500, volume: 9800 },
        { open: 41100, close: 40400, high: 41150, low: 40300, volume: 3800 },
        { open: 40400, close: 39700, high: 40450, low: 39650, volume: 2900 },
      ]);
      return c;
    },
    annotations: [
      { type: 'arrow', candle: 54, dir: 'up', label: 'Volume Climax (9.8K vol)', color: '#f5c842' },
    ],
    explanation: `Candle 54: 9,800 volume — nearly 10x the trend average of ~1,000. Despite massive volume, body = only 300 points (open 40,800 → close 41,100). All that buying was immediately absorbed by institutional sellers. Result: trend ends. Price drops 1,400 points over next two candles. Climax = do not buy here, prepare for short after CHoCH.`,
  },
  {
    id: 'low-vol-pullback',
    title: 'Challenge 2 — Identify the Low Volume Pullback',
    asset: 'NASDAQ:NQ',
    question: 'Click the FIRST candle of the low-volume pullback — where the weak retracement begins.',
    targetRange: [42, 46],
    buildChart: () => {
      const c = generateCandles({ count: 80, startPrice: 17200, volatility: 75, trend: 0.15 });
      injectPattern(c, 36, [
        { open: 18200, close: 18700, high: 18750, low: 18180, volume: 4500 },
        { open: 18700, close: 19100, high: 19150, low: 18680, volume: 3900 },
      ]);
      injectPattern(c, 42, [
        { open: 19100, close: 18920, high: 19120, low: 18900, volume: 480  },
        { open: 18920, close: 18780, high: 18940, low: 18760, volume: 390  },
        { open: 18780, close: 18690, high: 18800, low: 18670, volume: 420  },
        { open: 18690, close: 18820, high: 18840, low: 18670, volume: 510  },
      ]);
      injectPattern(c, 46, [
        { open: 18820, close: 19400, high: 19450, low: 18800, volume: 4200 },
        { open: 19400, close: 19750, high: 19800, low: 19380, volume: 3600 },
      ]);
      return c;
    },
    annotations: [
      { type: 'zone',  startCandle: 42, endCandle: 46, low: 18670, high: 19150, color: '#3d9bff', label: 'Low Volume Pullback Zone' },
      { type: 'arrow', candle: 46, dir: 'up', label: 'High Vol Resumption', color: '#00d17a' },
    ],
    explanation: `Impulse candles: 4,500 and 3,900 volume. Pullback candles (42–45): average 450 volume — just 11% of impulse volume. No sellers are committed. This is profit-taking only, not a real reversal. Resumption candle at 46: 4,200 volume = bulls confirmed. Entry: within the pullback zone (18,670–19,100). Stop: below 18,600. Target: 19,750+.`,
  },
];

export default function Lesson5_VolumeVSA() {
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
    recordAttempt('lesson-5');
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
      completeLesson('lesson-5', totalScore);
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-80 flex-shrink-0 border-r border-border bg-surface overflow-y-auto p-5">
        {phase === 'learn' ? (
          <>
            <div className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">Lesson 5 · {CONCEPT.module}</div>
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
