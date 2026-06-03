import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TopNav from './components/ui/TopNav';
import CourseDashboard from './components/course/CourseDashboard';
import LessonShell from './components/course/LessonShell';
import SimulatorPage from './components/simulator/SimulatorPage';
import PlaybookPage from './pages/PlaybookPage';

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
            <Route path="/playbook"   element={<PlaybookPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
