export function generateCandles({
  count = 80,
  startPrice = 42000,
  volatility = 400,
  trend = 0,
  volBase = 800,
}) {
  const candles = [];
  let price = startPrice;
  for (let i = 0; i < count; i++) {
    const biasFactor = trend * 0.04;
    const move  = (Math.random() - 0.5 + biasFactor) * volatility;
    const open  = price;
    const close = price + move;
    const wick  = volatility * 0.5;
    const high  = Math.max(open, close) + Math.random() * wick;
    const low   = Math.min(open, close) - Math.random() * wick;
    const volume = Math.floor(volBase + Math.random() * volBase * 1.2 + Math.abs(move) * 0.5);
    candles.push({ i, open, close, high, low, volume });
    price = close;
  }
  return candles;
}

export function injectPattern(candles, start, pattern) {
  pattern.forEach((p, offset) => {
    const idx = start + offset;
    if (idx < candles.length) candles[idx] = { ...p, i: idx };
  });
  return candles;
}

export function applyDrift(candles, fromIdx, toIdx, driftPerCandle) {
  let acc = 0;
  for (let i = fromIdx; i <= toIdx && i < candles.length; i++) {
    acc += driftPerCandle;
    candles[i] = {
      ...candles[i],
      open:  candles[i].open  + acc,
      close: candles[i].close + acc,
      high:  candles[i].high  + acc,
      low:   candles[i].low   + acc,
    };
  }
  return candles;
}
