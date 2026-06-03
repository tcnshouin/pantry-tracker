import { useState, useEffect, useRef, useCallback } from 'react';
import CandleChart from '../chart/CandleChart';
import { ASSETS, TIMEFRAMES } from '../../data/assets';
import { generateCandles } from '../../data/candleGenerator';

export default function SimulatorPage() {
  const [assetIdx,  setAssetIdx]  = useState(0);
  const [candles,   setCandles]   = useState([]);
  const [tfIdx,     setTfIdx]     = useState(2);
  const [playing,   setPlaying]   = useState(false);
  const [balance,   setBalance]   = useState(10000);
  const [position,  setPosition]  = useState(null);
  const [orderSize, setOrderSize] = useState(500);
  const [trades,    setTrades]    = useState([]);
  const intervalRef = useRef(null);
  const asset = ASSETS[assetIdx];

  const reset = useCallback((idx = assetIdx) => {
    const a = ASSETS[idx];
    setCandles(generateCandles({ count: 80, ...a }));
    setPosition(null); setPlaying(false);
  }, [assetIdx]);

  useEffect(() => { reset(assetIdx); }, [assetIdx]);

  const addCandle = useCallback(() => {
    setCandles(prev => {
      const last  = prev[prev.length - 1];
      const move  = (Math.random() - 0.48 + asset.trend * 0.04) * asset.volatility;
      const open  = last.close;
      const close = open + move;
      const high  = Math.max(open, close) + Math.random() * asset.volatility * 0.4;
      const low   = Math.min(open, close) - Math.random() * asset.volatility * 0.4;
      const vol   = Math.floor(asset.volBase + Math.random() * asset.volBase * 1.5);
      return [...prev.slice(-119), { i: prev.length, open, close, high, low, volume: vol }];
    });
  }, [asset]);

  useEffect(() => {
    if (playing) intervalRef.current = setInterval(addCandle, 1000);
    else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [playing, addCandle]);

  const currentPrice = candles[candles.length - 1]?.close || 0;
  const openPnL = position
    ? (position.type === 'LONG' ? 1 : -1) * (currentPrice - position.entry) / position.entry * position.size
    : 0;

  const openLong  = () => { if (!position) setPosition({ type: 'LONG',  entry: currentPrice, size: orderSize }); };
  const openShort = () => { if (!position) setPosition({ type: 'SHORT', entry: currentPrice, size: orderSize }); };
  const closePos  = () => {
    if (!position) return;
    const pnl = (position.type === 'LONG' ? 1 : -1) * (currentPrice - position.entry) / position.entry * position.size;
    setBalance(b => b + pnl);
    setTrades(t => [{ ...position, exit: currentPrice, pnl, id: Date.now() }, ...t.slice(0, 19)]);
    setPosition(null);
  };

  const winRate = trades.length ? Math.round(trades.filter(t => t.pnl > 0).length / trades.length * 100) : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-52px)] p-4 gap-3">
      <div className="flex gap-2 items-center flex-wrap">
        {ASSETS.map((a, i) => (
          <button key={a.id} onClick={() => { setAssetIdx(i); reset(i); }}
            className={`px-3 py-1.5 rounded font-mono text-[11px] font-semibold border transition-colors
              ${assetIdx === i ? 'border-green bg-green/10 text-green' : 'border-border bg-surface text-muted hover:text-text'}`}>
            {a.name}
          </button>
        ))}
        <div className="ml-auto flex gap-1.5">
          {TIMEFRAMES.map((tf, i) => (
            <button key={tf} onClick={() => setTfIdx(i)}
              className={`px-2.5 py-1 rounded font-mono text-[10px] border transition-colors
                ${tfIdx === i ? 'border-yellow/60 bg-yellow/10 text-yellow' : 'border-border text-muted hover:text-text'}`}>
              {tf}
            </button>
          ))}
        </div>
        <button onClick={() => setPlaying(p => !p)}
          className={`px-4 py-1.5 rounded font-mono text-[11px] font-bold border transition-colors
            ${playing ? 'border-red bg-red/10 text-red' : 'border-green bg-green/10 text-green'}`}>
          {playing ? '⏸ PAUSE' : '▶ PLAY'}
        </button>
        <button onClick={() => reset()}
          className="px-3 py-1.5 rounded font-mono text-[11px] border border-border text-muted hover:text-text">↺</button>
      </div>
      <div className="bg-surface border border-border rounded-lg overflow-hidden flex-1">
        <div className="px-4 py-2 border-b border-border flex items-center gap-4">
          <span className="font-mono font-bold text-sm text-text">{asset.name}</span>
          <span className="font-mono text-lg font-black text-green">{currentPrice.toFixed(asset.decimals)}</span>
          {position && (
            <span className={`ml-auto font-mono text-sm font-bold ${openPnL >= 0 ? 'text-green' : 'text-red'}`}>
              {position.type} @ {position.entry.toFixed(asset.decimals)} | P&L: {openPnL >= 0 ? '+' : ''}{openPnL.toFixed(2)}
            </span>
          )}
        </div>
        <CandleChart candles={candles} showVolume height={340} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">Order Entry</div>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-xs text-muted">Size $</span>
            <input type="number" value={orderSize} onChange={e => setOrderSize(Number(e.target.value))}
              className="w-24 bg-panel border border-border text-text px-2 py-1 rounded font-mono text-xs" />
          </div>
          <div className="flex gap-2">
            <button onClick={openLong}  disabled={!!position}
              className="flex-1 py-2 rounded border border-green bg-green/10 text-green font-mono text-xs font-bold disabled:opacity-40">▲ LONG</button>
            <button onClick={openShort} disabled={!!position}
              className="flex-1 py-2 rounded border border-red bg-red/10 text-red font-mono text-xs font-bold disabled:opacity-40">▼ SHORT</button>
          </div>
          {position && (
            <button onClick={closePos}
              className="w-full mt-2 py-2 rounded border border-yellow bg-yellow/10 text-yellow font-mono text-xs font-bold">✕ CLOSE</button>
          )}
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">Account</div>
          <div className="space-y-2">
            {[
              ['Balance',  `$${balance.toFixed(2)}`,                              'text-text'  ],
              ['Open P&L', `${openPnL >= 0?'+':''}$${openPnL.toFixed(2)}`,        openPnL >= 0 ? 'text-green' : 'text-red'],
              ['Equity',   `$${(balance+openPnL).toFixed(2)}`,                    'text-blue'  ],
              ['Win Rate', `${winRate}%`,                                          'text-yellow'],
              ['Trades',   `${trades.length}`,                                    'text-muted' ],
            ].map(([label, val, col]) => (
              <div key={label} className="flex justify-between">
                <span className="font-mono text-xs text-muted">{label}</span>
                <span className={`font-mono text-xs font-bold ${col}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">Trade Log</div>
          {trades.length === 0
            ? <p className="font-mono text-xs text-dim">No trades yet.</p>
            : <div className="space-y-1.5 max-h-24 overflow-y-auto">
                {trades.map(t => (
                  <div key={t.id} className="flex justify-between items-center">
                    <span className={`font-mono text-[10px] font-bold ${t.type==='LONG'?'text-green':'text-red'}`}>{t.type}</span>
                    <span className="font-mono text-[10px] text-muted">{t.entry.toFixed(0)}→{t.exit.toFixed(0)}</span>
                    <span className={`font-mono text-[10px] font-bold ${t.pnl>=0?'text-green':'text-red'}`}>{t.pnl>=0?'+':''}{t.pnl.toFixed(2)}</span>
                  </div>
                ))}
              </div>}
        </div>
      </div>
    </div>
  );
}
