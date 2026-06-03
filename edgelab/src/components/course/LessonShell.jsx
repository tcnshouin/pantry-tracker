import { useParams, useNavigate } from 'react-router-dom';
import { LESSONS_MAP } from '../../data/scenarioLibrary';
import { ArrowLeft } from 'lucide-react';

export default function LessonShell() {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const LessonComponent = LESSONS_MAP[id];
  if (!LessonComponent) return <div className="p-8 font-mono text-muted">Lesson not found: {id}</div>;
  return (
    <div className="flex flex-col h-[calc(100vh-52px)]">
      <div className="px-4 py-2 border-b border-border bg-surface flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 font-mono text-xs text-muted hover:text-text transition-colors">
          <ArrowLeft size={14} /> Dashboard
        </button>
      </div>
      <div className="flex-1 overflow-auto"><LessonComponent /></div>
    </div>
  );
}
