import { Link } from 'react-router-dom';
import { Lock, CheckCircle, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { LESSONS_META } from '../../data/scenarioLibrary';

export default function CourseDashboard() {
  const { completed, scores } = useAppStore();
  const doneCount  = Object.keys(completed).length;
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  return (
    <div className="p-6 max-w-4xl mx-auto overflow-y-auto h-[calc(100vh-52px)]">
      <h1 className="font-serif text-3xl text-text mb-1">Trading Fundamentals</h1>
      <p className="font-mono text-sm text-muted mb-6">Master order flow, liquidity, volume, and structure — then trade it.</p>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Lessons Done',  value: `${doneCount}/${LESSONS_META.length}`, color: 'text-green'  },
          { label: 'Total Score',   value: `${totalScore}pts`,                    color: 'text-yellow' },
          { label: 'Accuracy',      value: doneCount ? `${Math.round(totalScore/(doneCount*100)*100)}%` : '—', color: 'text-blue' },
          { label: 'Progress',      value: `${Math.round(doneCount/LESSONS_META.length*100)}%`,        color: 'text-muted'  },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface border border-border rounded-lg p-4">
            <div className={`font-mono text-xl font-bold ${color}`}>{value}</div>
            <div className="font-mono text-xs text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden mb-6">
        <div className="h-full bg-green rounded-full transition-all duration-500"
          style={{ width: `${doneCount/LESSONS_META.length*100}%` }} />
      </div>
      <div className="space-y-3">
        {LESSONS_META.map((lesson, index) => {
          const isDone   = !!completed[lesson.id];
          const isLocked = index > 0 && !completed[LESSONS_META[index-1].id];
          const score    = scores[lesson.id] || 0;
          const Icon     = lesson.icon;
          return (
            <Link key={lesson.id} to={isLocked ? '#' : `/lesson/${lesson.id}`}
              onClick={isLocked ? (e) => e.preventDefault() : undefined}
              className={`flex items-center gap-5 p-5 rounded-xl border transition-all
                ${isLocked ? 'bg-surface border-border opacity-40 cursor-not-allowed' :
                  isDone   ? 'bg-surface border-green/30 hover:border-green/60' :
                             'bg-surface border-border hover:border-borderBright cursor-pointer'}`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-green/10' : 'bg-panel'}`}>
                <Icon size={22} className={isDone ? 'text-green' : 'text-muted'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-[10px] text-muted uppercase tracking-widest">{lesson.module}</span>
                  <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full border
                    ${lesson.difficulty === 'Advanced' ? 'border-red/60 text-red' :
                      lesson.difficulty === 'Intermediate' ? 'border-yellow/60 text-yellow' :
                      'border-green/60 text-green'}`}>{lesson.difficulty}</span>
                </div>
                <div className="font-serif text-base text-text font-bold truncate">{lesson.title}</div>
                <div className="font-mono text-xs text-muted mt-0.5">{lesson.subtitle}</div>
              </div>
              <div className="text-right flex-shrink-0 flex items-center gap-4">
                {isDone && <div><div className="font-mono text-lg text-yellow font-bold">{score}</div><div className="font-mono text-[9px] text-muted">pts</div></div>}
                {isLocked ? <Lock size={16} className="text-dim" /> :
                  isDone   ? <CheckCircle size={16} className="text-green" /> :
                             <ChevronRight size={16} className="text-muted" />}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
