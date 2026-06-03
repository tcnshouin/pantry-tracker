import { useRef, useEffect, useCallback } from 'react';

const C = {
  bg: '#111318', grid: '#1e2530', green: '#00d17a', red: '#ff3d5a',
  yellow: '#f5c842', blue: '#3d9bff', muted: '#6b7a91', dim: '#3d4a5c', text: '#e8edf5',
};

export default function CandleChart({
  candles = [],
  annotations = [],
  showVolume = true,
  onCandleClick,
  highlightZone,
  selectedCandle,
  height = 420,
}) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const VOL_H = showVolume ? 75 : 0;

  const draw = useCallback(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length === 0) return;

    const W = container.clientWidth || 800;
    canvas.width  = W;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, height);

    const PAD    = { top: 18, right: 56, bottom: 24, left: 8 };
    const chartH = height - VOL_H - PAD.top - PAD.bottom;
    const chartW = W - PAD.left - PAD.right;
    const candleW = chartW / candles.length;
    const bodyW   = Math.max(1, candleW * 0.7);
    const gap     = (candleW - bodyW) / 2;

    const pMax   = Math.max(...candles.map(c => c.high));
    const pMin   = Math.min(...candles.map(c => c.low));
    const pRange = pMax - pMin || 1;
    const pad    = pRange * 0.06;
    const pTop   = pMax + pad;
    const pBot   = pMin - pad;
    const pSpan  = pTop - pBot;

    const toY  = (price) => PAD.top + chartH * (1 - (price - pBot) / pSpan);
    const toX  = (idx)   => PAD.left + idx * candleW + gap;
    const toXc = (idx)   => PAD.left + idx * candleW + candleW / 2;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, height);

    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';
    for (let g = 0; g <= 6; g++) {
      const frac  = g / 6;
      const y     = PAD.top + chartH * frac;
      const price = pTop - frac * pSpan;
      ctx.strokeStyle = C.grid; ctx.lineWidth = 0.5; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
      ctx.fillStyle = C.dim; ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(0), W - 4, y);
    }

    annotations.forEach(ann => {
      if (ann.type === 'zone') {
        const x1 = toX(ann.startCandle);
        const x2 = toX(ann.endCandle) + bodyW + gap * 2;
        const y1 = toY(ann.high);
        const y2 = toY(ann.low);
        ctx.fillStyle = ann.color + '25'; ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
        ctx.strokeStyle = ann.color + '90'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3]);
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1); ctx.setLineDash([]);
        if (ann.label) {
          ctx.fillStyle = ann.color; ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'left'; ctx.fillText(ann.label, x1 + 4, y1 - 6);
        }
      }
      if (ann.type === 'hline') {
        if (ann.price < pBot || ann.price > pTop) return;
        const y = toY(ann.price);
        ctx.strokeStyle = ann.color || C.yellow; ctx.lineWidth = 1.5;
        ctx.setLineDash(ann.dash || [6, 4]);
        ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right - 60, y); ctx.stroke();
        ctx.setLineDash([]);
        if (ann.label) {
          ctx.fillStyle = ann.color || C.yellow; ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'left'; ctx.fillText(ann.label, W - PAD.right - 58, y - 6);
        }
      }
      if (ann.type === 'arrow') {
        const c   = candles[ann.candle]; if (!c) return;
        const x   = toXc(ann.candle);
        const col = ann.color || (ann.dir === 'up' ? C.green : C.red);
        const tipY  = ann.dir === 'up' ? toY(c.low) - 6 : toY(c.high) + 6;
        const tailY = ann.dir === 'up' ? tipY + 30   : tipY - 30;
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(x, tailY); ctx.lineTo(x, tipY + (ann.dir === 'up' ? 10 : -10)); ctx.stroke();
        ctx.fillStyle = col; ctx.beginPath();
        if (ann.dir === 'up') { ctx.moveTo(x, tipY); ctx.lineTo(x - 6, tipY + 12); ctx.lineTo(x + 6, tipY + 12); }
        else { ctx.moveTo(x, tipY); ctx.lineTo(x - 6, tipY - 12); ctx.lineTo(x + 6, tipY - 12); }
        ctx.fill();
        if (ann.label) {
          ctx.fillStyle = col; ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(ann.label, x + 10, ann.dir === 'up' ? tailY + 4 : tailY - 4);
        }
      }
      if (ann.type === 'label') {
        const c = candles[ann.candle]; if (!c) return;
        const y = ann.position === 'above' ? toY(c.high) - 16 : toY(c.low) + 16;
        ctx.fillStyle = ann.color || C.yellow; ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.fillText(ann.text, toXc(ann.candle), y);
      }
    });

    if (highlightZone) {
      const { startCandle: s, endCandle: e } = highlightZone;
      ctx.fillStyle = C.yellow + '18';
      for (let i = s; i <= e; i++) ctx.fillRect(toX(i) - gap, PAD.top, candleW, chartH);
    }
    if (selectedCandle !== undefined && selectedCandle !== null) {
      ctx.fillStyle = C.yellow + '28';
      ctx.fillRect(toX(selectedCandle) - gap, PAD.top, candleW, chartH);
    }

    candles.forEach((c, i) => {
      const x    = toX(i);
      const xc   = toXc(i);
      const bull = c.close >= c.open;
      const col  = bull ? C.green : C.red;
      const bodyTop = Math.min(toY(c.open), toY(c.close));
      const bodyHt  = Math.max(1, Math.abs(toY(c.open) - toY(c.close)));
      ctx.strokeStyle = col + 'cc'; ctx.lineWidth = 1; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(xc, toY(c.high)); ctx.lineTo(xc, toY(c.low)); ctx.stroke();
      ctx.fillStyle = col + 'cc'; ctx.fillRect(x, bodyTop, bodyW, bodyHt);
      ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.strokeRect(x, bodyTop, bodyW, bodyHt);
    });

    if (showVolume && VOL_H > 0) {
      const volTop = height - VOL_H - PAD.bottom + 6;
      const volH   = VOL_H - 14;
      const maxVol = Math.max(...candles.map(c => c.volume));
      ctx.fillStyle = C.dim + '30'; ctx.fillRect(PAD.left, volTop, chartW, volH);
      candles.forEach((c, i) => {
        const vH   = (c.volume / maxVol) * volH;
        const bull = c.close >= c.open;
        ctx.fillStyle = (bull ? C.green : C.red) + '70';
        ctx.fillRect(toX(i), volTop + volH - vH, bodyW, vH);
      });
      ctx.fillStyle = C.dim; ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.fillText('VOL', PAD.left + 4, volTop + 10);
    }
  }, [candles, annotations, highlightZone, selectedCandle, height, VOL_H]);

  useEffect(() => {
    draw();
    const ro = new ResizeObserver(draw);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [draw]);

  const handleClick = (e) => {
    if (!onCandleClick || !canvasRef.current) return;
    const rect  = canvasRef.current.getBoundingClientRect();
    const mx    = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const chartW = canvasRef.current.width - 8 - 56;
    const idx   = Math.floor((mx - 8) / (chartW / candles.length));
    if (idx >= 0 && idx < candles.length) onCandleClick(idx);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height }}>
      <canvas ref={canvasRef} onClick={handleClick}
        style={{ width: '100%', height: '100%', cursor: onCandleClick ? 'crosshair' : 'default' }} />
    </div>
  );
}
