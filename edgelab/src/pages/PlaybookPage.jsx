import { STRATEGY_PLAYBOOK } from '../data/strategyPlaybook';

export default function PlaybookPage() {
  const p = STRATEGY_PLAYBOOK;
  return (
    <div className="p-6 max-w-4xl mx-auto overflow-y-auto h-[calc(100vh-52px)]">
      <h1 className="font-serif text-3xl text-text mb-1">{p.name}</h1>
      <p className="font-mono text-xs text-muted mb-8">v{p.version} — Full strategy reference</p>
      <Section title="Core Philosophy">
        {p.philosophy.map((ph, i) => (
          <div key={i} className="flex gap-3 mb-2">
            <span className="text-green font-mono text-xs flex-shrink-0">{i + 1}.</span>
            <span className="font-mono text-xs text-muted leading-relaxed">{ph}</span>
          </div>
        ))}
      </Section>
      <Section title="4 Setup Types">
        <div className="grid grid-cols-2 gap-4">
          {p.setupTypes.map((s, i) => (
            <div key={i} className="bg-panel border border-border rounded-lg p-4">
              <div className="font-mono text-xs font-bold text-blue mb-1">{s.name}</div>
              <div className="font-mono text-[10px] text-muted mb-3">{s.type} · {s.direction}</div>
              <div className="space-y-1.5">
                {[['Entry', s.entry], ['Stop', s.stop], ['T1', s.t1], ['T2', s.t2], ['Invalid', s.invalidation]].map(([label, val]) => (
                  <div key={label} className="flex gap-2">
                    <span className={`font-mono text-[10px] font-bold flex-shrink-0 w-14
                      ${label === 'Invalid' ? 'text-red' : label === 'Entry' ? 'text-green' : 'text-muted'}`}>
                      {label}:
                    </span>
                    <span className="font-mono text-[10px] text-muted leading-relaxed">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Confluence Scoring System">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="font-mono text-[10px] text-muted mb-3">Score your setup before every entry:</div>
            {p.confluenceScoring.factors.map((f, i) => (
              <div key={i} className="flex justify-between mb-1.5">
                <span className="font-mono text-xs text-muted">{f.factor}</span>
                <span className="font-mono text-xs text-yellow font-bold">+{f.points} pt</span>
              </div>
            ))}
          </div>
          <div>
            <div className="font-mono text-[10px] text-muted mb-3">Position sizing by score:</div>
            {p.confluenceScoring.sizing.map((s, i) => (
              <div key={i} className="flex gap-3 mb-1.5">
                <span className="font-mono text-xs text-yellow font-bold w-6">{s.score}</span>
                <span className="font-mono text-xs text-muted">{s.action}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <Section title="Risk Management">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            ['Max Risk / Trade', p.riskManagement.maxRiskPerTrade],
            ['Minimum R/R',      p.riskManagement.minRR],
            ['Partials',         p.riskManagement.partialProfits],
            ['Max Daily Loss',   p.riskManagement.maxDailyLoss],
          ].map(([label, val]) => (
            <div key={label} className="bg-panel border border-border rounded-lg p-3">
              <div className="font-mono text-[10px] text-muted mb-1">{label}</div>
              <div className="font-mono text-xs text-text">{val}</div>
            </div>
          ))}
        </div>
        <div className="bg-red/5 border border-red/30 rounded-lg p-4">
          <div className="font-mono text-[10px] text-red uppercase tracking-widest mb-2">No-Trade Zones</div>
          {p.riskManagement.noTradeZones.map((z, i) => (
            <div key={i} className="flex gap-2 mb-1.5">
              <span className="text-red font-mono text-xs flex-shrink-0">✗</span>
              <span className="font-mono text-xs text-muted">{z}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Daily Trading Routine">
        {p.dailyRoutine.map((step, i) => (
          <div key={i} className="flex gap-3 mb-2">
            <span className="font-mono text-xs text-green flex-shrink-0 font-bold">{i + 1}.</span>
            <span className="font-mono text-xs text-muted leading-relaxed">{step}</span>
          </div>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <div className="font-mono text-[10px] text-muted uppercase tracking-widest mb-4 pb-2 border-b border-border">{title}</div>
      {children}
    </div>
  );
}
