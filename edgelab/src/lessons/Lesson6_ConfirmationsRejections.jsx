import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CandleChart from '../components/chart/CandleChart';
import { generateCandles, injectPattern } from '../data/candleGenerator';
import { useAppStore } from '../store/useAppStore';
import { CheckCircle, XCircle } from 'lucide-react';

const SETUP_PAIRS = [
  {
    id: 'fvg-pair',
    title: 'FVG Retest — Valid vs. Invalid',
    concept: 'Fair Value Gap',
    valid: {
      label: 'VALID — FVG Holds as Support',
      asset: 'BTC/USDT',
      description: 'Price creates a bullish FVG, pulls back INTO the gap, then prints a bullish rejection wick (closes above FVG low). Volume on reaction candle expands. Price continues up.',
      why: 'The FVG zone acts as support. Price enters but buyers DEFEND it — shown by the wick rejection and volume expansion on the reversal candle.',
      buildChart: () => {
        const c = generateCandles({ count: 60, startPrice: 40000, volatility: 300 });
        injectPattern(c, 18, [
          { open: 41000, close: 41400, high: 41500, low: 40950, volume: 1100 },
          { open: 41400, close: 43200, high: 43350, low: 41380, volume: 4100 },
          { open: 43200, close: 42800, high: 43250, low: 42500, volume: 1800 },
        ]);
        injectPattern(c, 24, [
          { open: 42800, close: 42000, high: 42850, low: 41800, volume: 900  },
          { open: 42000, close: 41700, high: 42050, low: 41600, volume: 700  },
          { open: 41700, close: 42600, high: 42650, low: 41550, volume: 3200 },
          { open: 42600, close: 43100, high: 43150, low: 42550, volume: 2800 },
        ]);
        return c;
      },
      annotations: [
        { type: 'zone',  startCandle: 18, endCandle: 20, low: 41500, high: 42500, color: '#3d9bff', label: 'FVG Zone' },
        { type: 'arrow', candle: 26, dir: 'up', label: '✓ Rejection at FVG', color: '#00d17a' },
      ],
    },
    invalid: {
      label: 'INVALID — FVG Closed Through',
      asset: 'BTC/USDT',
      description: 'Same FVG forms. Price returns but the candle BODY closes fully below the FVG low. Volume on the breakdown is higher than the original impulse. The FVG is invalidated.',
      why: 'Invalidation = candle body closes through the FVG zone entirely. When price closes below the FVG low, the imbalance has been resolved — there are no more institutional buyers defending it.',
      reasons: [
        'Candle body closes below FVG low (41,500) — imbalance fully resolved',
        'No rejection wick — buyers are not defending the zone',
        'Volume on the breakdown EXCEEDS the original impulse (aggressive sellers)',
      ],
      buildChart: () => {
        const c = generateCandles({ count: 60, startPrice: 40000, volatility: 300 });
        injectPattern(c, 18, [
          { open: 41000, close: 41400, high: 41500, low: 40950, volume: 1100 },
          { open: 41400, close: 43200, high: 43350, low: 41380, volume: 4100 },
          { open: 43200, close: 42800, high: 43250, low: 42500, volume: 1800 },
        ]);
        injectPattern(c, 24, [
          { open: 42800, close: 42000, high: 42850, low: 41800, volume: 900  },
          { open: 42000, close: 41200, high: 42050, low: 41000, volume: 4800 },
          { open: 41200, close: 40600, high: 41250, low: 40550, volume: 3800 },
          { open: 40600, close: 40100, high: 40650, low: 40050, volume: 2900 },
        ]);
        return c;
      },
      annotations: [
        { type: 'zone',  startCandle: 18, endCandle: 20, low: 41500, high: 42500, color: '#ff3d5a', label: 'FVG — INVALIDATED' },
        { type: 'arrow', candle: 25, dir: 'down', label: '✗ Closes Through FVG', color: '#ff3d5a' },
      ],
    },
    quizQuestion: 'You see price retest an FVG zone. The candle wicks into the zone but closes ABOVE it. Volume is 2x average on the rejection. Do you TRADE or SKIP?',
    correctAnswer: 'trade',
    quizExplanation: 'Trade it. Wick into zone + close above + volume expansion = textbook FVG confirmation. All three criteria met.',
  },
  {
    id: 'sweep-pair',
    title: 'Liquidity Sweep — Valid vs. Invalid',
    concept: 'Liquidity Sweep',
    valid: {
      label: 'VALID — Sweep and Reverse',
      asset: 'NASDAQ:NQ',
      description: 'Price sweeps above resistance with a wick, candle CLOSES BACK BELOW the level. Immediate bearish reversal candle follows with expanding volume.',
      why: 'Sweep confirmed: wick through level + close below = stops triggered + institutions sold. The decisive reversal candle with volume = confirmation to enter short.',
      buildChart: () => {
        const c = generateCandles({ count: 60, startPrice: 18400, volatility: 80 });
        injectPattern(c, 14, [{ open: 18900, close: 19200, high: 19280, low: 18880, volume: 1900 }]);
        injectPattern(c, 20, [{ open: 18950, close: 19150, high: 19260, low: 18930, volume: 1400 }]);
        injectPattern(c, 32, [
          { open: 19050, close: 18780, high: 19520, low: 18760, volume: 5100 },
          { open: 18780, close: 18300, high: 18800, low: 18280, volume: 4200 },
          { open: 18300, close: 17900, high: 18320, low: 17880, volume: 3400 },
        ]);
        return c;
      },
      annotations: [
        { type: 'hline', price: 19280, color: '#f5c842', label: 'Resistance / Liquidity' },
        { type: 'arrow', candle: 32, dir: 'down', label: '✓ Sweep Close Below', color: '#00d17a' },
      ],
    },
    invalid: {
      label: 'INVALID — Real Breakout, Not a Sweep',
      asset: 'NASDAQ:NQ',
      description: 'Price breaks above resistance and the candle BODY closes ABOVE the level. Volume stays elevated after the break. Price consolidates above, then continues higher.',
      why: 'If the candle BODY closes above resistance = breakout, not a sweep. Shorting here is fading a genuine breakout — extremely high risk. The close ABOVE the level means buyers have absorbed all supply.',
      reasons: [
        'Candle body closes ABOVE resistance — this is a breakout, not a sweep',
        'Volume remains elevated after the break (momentum, not exhaustion)',
        'Price consolidates ABOVE the old resistance (it becomes support)',
      ],
      buildChart: () => {
        const c = generateCandles({ count: 60, startPrice: 18400, volatility: 80 });
        injectPattern(c, 14, [{ open: 18900, close: 19200, high: 19280, low: 18880, volume: 1900 }]);
        injectPattern(c, 32, [
          { open: 19050, close: 19450, high: 19500, low: 19030, volume: 5400 },
          { open: 19450, close: 19380, high: 19480, low: 19340, volume: 2100 },
          { open: 19380, close: 19650, high: 19700, low: 19360, volume: 3800 },
          { open: 19650, close: 19900, high: 19950, low: 19630, volume: 3200 },
        ]);
        return c;
      },
      annotations: [
        { type: 'hline', price: 19280, color: '#f5c842', label: 'Resistance Level' },
        { type: 'arrow', candle: 32, dir: 'up', label: '✗ Closed ABOVE = Breakout', color: '#ff3d5a' },
      ],
    },
    quizQuestion: 'Price wicks above resistance but closes BELOW it with 4x volume. The next candle opens lower. Do you TRADE (short) or SKIP?',
    correctAnswer: 'trade',
    quizExplanation: 'Trade it short. Classic sweep: wick above + close below + high volume + immediate follow-through = all confirmation criteria met.',
  },
  {
    id: 'ob-pair',
    title: 'Order Block Retest — Valid vs. Invalid',
    concept: 'Order Block',
    valid: {
      label: 'VALID — OB Holds as Resistance',
      asset: 'BTC/USDT',
      description: 'Bearish OB forms. Price drops, pulls back to the OB zone, prints a bearish wick rejection (wick into OB, body closes below), then continues down.',
      why: 'OB defended: price enters the zone but bears reject it — shown by the wick into the OB with the close below. This is the institutional order fill completing.',
      buildChart: () => {
        const c = generateCandles({ count: 60, startPrice: 44000, volatility: 350 });
        injectPattern(c, 18, [
          { open: 45200, close: 45700, high: 45800, low: 45150, volume: 1300 },
          { open: 45700, close: 44000, high: 45750, low: 43950, volume: 5000 },
          { open: 44000, close: 43400, high: 44050, low: 43350, volume: 3800 },
        ]);
        injectPattern(c, 26, [
          { open: 43600, close: 44200, high: 44300, low: 43550, volume: 1100 },
          { open: 44200, close: 45400, high: 45600, low: 44180, volume: 1800 },
          { open: 45400, close: 44600, high: 45650, low: 44500, volume: 3200 },
          { open: 44600, close: 43800, high: 44650, low: 43750, volume: 2900 },
        ]);
        return c;
      },
      annotations: [
        { type: 'zone',  startCandle: 18, endCandle: 19, low: 45200, high: 45800, color: '#ff3d5a', label: 'Bearish OB Zone' },
        { type: 'arrow', candle: 28, dir: 'down', label: '✓ Rejected at OB', color: '#00d17a' },
      ],
    },
    invalid: {
      label: 'INVALID — OB Violated',
      asset: 'BTC/USDT',
      description: 'Price pulls back to the OB zone but the candle closes FULLY ABOVE the OB high with strong volume. The OB has been violated — institutional sellers have been absorbed.',
      why: 'An OB is invalidated when price closes above the OB high (bearish OB). All the institutional sell orders have been absorbed by buyers. There is no more defense at this level.',
      reasons: [
        'Candle closes fully above OB high (45,800) — invalidation complete',
        'Strong bullish close with expanding volume = buyer dominance',
        'Original institutional sell orders fully absorbed — no defense remaining',
      ],
      buildChart: () => {
        const c = generateCandles({ count: 60, startPrice: 44000, volatility: 350 });
        injectPattern(c, 18, [
          { open: 45200, close: 45700, high: 45800, low: 45150, volume: 1300 },
          { open: 45700, close: 44000, high: 45750, low: 43950, volume: 5000 },
          { open: 44000, close: 43400, high: 44050, low: 43350, volume: 3800 },
        ]);
        injectPattern(c, 26, [
          { open: 43600, close: 44400, high: 44500, low: 43550, volume: 1100 },
          { open: 44400, close: 46100, high: 46200, low: 44380, volume: 5800 },
          { open: 46100, close: 46400, high: 46450, low: 46050, volume: 3600 },
          { open: 46400, close: 46700, high: 46750, low: 46380, volume: 2900 },
        ]);
        return c;
      },
      annotations: [
        { type: 'zone',  startCandle: 18, endCandle: 19, low: 45200, high: 45800, color: '#ff3d5a', label: 'Bearish OB — VIOLATED' },
        { type: 'arrow', candle: 27, dir: 'up', label: '✗ OB Violated — Continue Up', color: '#ff3d5a' },
      ],
    },
    quizQuestion: 'Price pulls back to a bearish OB zone. The candle wicks into the OB but CLOSES below it. Volume on the rejection is 2.5x average. Do you TRADE (short) or SKIP?',
    correctAnswer: 'trade',
    quizExplanation: 'Trade it short. Wick into OB + close below + volume confirmation = textbook OB defense. Enter short on next candle open.',
  },
];

export default function Lesson6_ConfirmationsRejections() {
  const navigate = useNavigate();
  const { completeLesson } = useAppStore();
  const [pairIdx,      setPairIdx]     = useState(0);
  const [view,         setView]        = useState('valid');
  const [quizAnswers,  setQuizAnswers] = useState({});

  const pair         = SETUP_PAIRS[pairIdx];
  const currentSetup = view === 'invalid' ? pair.invalid : pair.valid;

  const validChart   = useMemo(() => pair.valid.buildChart(),   [pairIdx]);
  const invalidChart = useMemo(() => pair.invalid.buildChart(), [pairIdx]);

  const allAnswered  = SETUP_PAIRS.every(p => quizAnswers[p.id] !== undefined);

  const handleAnswer = (pairId, answer) => {
    const correct = answer === pair.correctAnswer;
    setQuizAnswers(prev => ({ ...prev, [pairId]: { answer, correct } }));
  };

  const finish = () => {
    const score = Object.values(quizAnswers).filter(r => r.correct).length * 33;
    completeLesson('lesson-6', score);
    navigate('/dashboard');
  };

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-96 flex-shrink-0 border-r border-border bg-surface overflow-y-auto p-5">
        <div className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">Lesson 6 · Confirmations</div>
        <h2 className="font-serif text-xl text-text font-bold mb-2">Valid Setups vs. Traps</h2>
        <p className="font-mono text-xs text-muted mb-5 leading-relaxed">
          A setup that LOOKS right but lacks confirmation is a losing trade. Learn exactly what separates a valid entry from a trap.
        </p>
        {/* Pair selector */}
        <div className="space-y-2 mb-5">
          {SETUP_PAIRS.map((p, i) => (
            <button key={p.id} onClick={() => { setPairIdx(i); setView('valid'); }}
              className={`w-full text-left p-3 rounded-lg border transition-colors
                ${pairIdx === i ? 'border-blue/60 bg-blue/10' : 'border-border hover:border-borderBright'}`}>
              <div className="font-mono text-xs font-bold text-text">{p.title}</div>
              <div className="font-mono text-[10px] text-muted">{p.concept}</div>
            </button>
          ))}
        </div>
        {/* Valid / Invalid toggle */}
        <div className="flex rounded-lg overflow-hidden border border-border mb-4">
          {['valid', 'invalid'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`flex-1 py-2 font-mono text-xs font-bold transition-colors
                ${view === v ? (v === 'valid' ? 'bg-green/20 text-green' : 'bg-red/20 text-red') : 'bg-surface text-muted'}`}>
              {v === 'valid' ? '✓ VALID' : '✗ INVALID'}
            </button>
          ))}
        </div>
        {/* Setup description */}
        <div className={`rounded-lg p-4 mb-4 border ${view === 'valid' ? 'border-green/30 bg-green/5' : 'border-red/30 bg-red/5'}`}>
          <div className={`font-mono text-xs font-bold mb-2 ${view === 'valid' ? 'text-green' : 'text-red'}`}>
            {currentSetup.label}
          </div>
          <p className="font-mono text-xs text-muted leading-relaxed mb-3">{currentSetup.description}</p>
          <div className={`font-mono text-xs font-semibold mb-1 ${view === 'valid' ? 'text-green' : 'text-red'}`}>
            {view === 'valid' ? '✓ Why it works:' : '✗ Why it fails:'}
          </div>
          <p className="font-mono text-xs text-muted leading-relaxed">{currentSetup.why}</p>
          {currentSetup.reasons && (
            <div className="mt-3 space-y-1.5">
              {currentSetup.reasons.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-red font-mono text-xs flex-shrink-0">✗</span>
                  <span className="font-mono text-xs text-muted">{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Quiz */}
        {!quizAnswers[pair.id] ? (
          <div className="bg-panel border border-borderBright rounded-lg p-4">
            <div className="font-mono text-[10px] text-yellow uppercase tracking-widest mb-2">Quick Check</div>
            <p className="font-mono text-xs text-muted mb-3 leading-relaxed">{pair.quizQuestion}</p>
            <div className="flex gap-2">
              <button onClick={() => handleAnswer(pair.id, 'trade')}
                className="flex-1 py-2 rounded border border-green bg-green/10 text-green font-mono text-xs font-bold">TRADE</button>
              <button onClick={() => handleAnswer(pair.id, 'skip')}
                className="flex-1 py-2 rounded border border-red bg-red/10 text-red font-mono text-xs font-bold">SKIP</button>
            </div>
          </div>
        ) : (
          <div className={`rounded-lg p-4 border ${quizAnswers[pair.id].correct ? 'border-green/40 bg-green/10' : 'border-red/40 bg-red/10'}`}>
            <div className={`font-mono text-xs font-bold mb-1 ${quizAnswers[pair.id].correct ? 'text-green' : 'text-red'}`}>
              {quizAnswers[pair.id].correct ? '✓ Correct.' : '✗ Incorrect.'}
            </div>
            <p className="font-mono text-xs text-muted leading-relaxed">{pair.quizExplanation}</p>
          </div>
        )}
        {allAnswered && (
          <button onClick={finish}
            className="w-full mt-4 py-3 rounded-lg border border-green bg-green/10 text-green font-mono text-sm font-bold">
            COMPLETE LESSON →
          </button>
        )}
      </div>
      {/* Dual chart */}
      <div className="flex-1 grid grid-cols-2 gap-0">
        <div className="border-r border-border flex flex-col">
          <div className="px-4 py-2 bg-surface border-b border-border flex items-center gap-2">
            <CheckCircle size={14} className="text-green" />
            <span className="font-mono text-xs font-bold text-green">VALID</span>
            <span className="font-mono text-[10px] text-muted ml-auto">{pair.valid.asset}</span>
          </div>
          <CandleChart candles={validChart} annotations={pair.valid.annotations} showVolume height={480} />
        </div>
        <div className="flex flex-col">
          <div className="px-4 py-2 bg-surface border-b border-border flex items-center gap-2">
            <XCircle size={14} className="text-red" />
            <span className="font-mono text-xs font-bold text-red">REJECTED</span>
            <span className="font-mono text-[10px] text-muted ml-auto">{pair.invalid.asset}</span>
          </div>
          <CandleChart candles={invalidChart} annotations={pair.invalid.annotations} showVolume height={480} />
        </div>
      </div>
    </div>
  );
}
