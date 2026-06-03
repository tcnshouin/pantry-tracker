import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TopNav from './components/ui/TopNav';
import CourseDashboard from './components/course/CourseDashboard';
import LessonShell from './components/course/LessonShell';

const SimulatorPage = () => <div style={{padding:24,color:'#e8edf5',fontFamily:'monospace'}}>Simulator — Coming Soon</div>;

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg flex flex-col">
        <TopNav />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/"           element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"  element={<CourseDashboard />} />
            <Route path="/simulator"  element={<SimulatorPage />} />
            <Route path="/lesson/:id" element={<LessonShell />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
