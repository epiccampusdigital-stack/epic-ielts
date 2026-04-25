import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import ExamGreeting from './pages/ExamGreeting';
import ReadingExam from './pages/ReadingExam';
import Results from './pages/Results';
import AdminDashboard from './pages/AdminDashboard';
import PaperDetail from './pages/PaperDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/papers/:id" element={<PaperDetail />} />
      <Route path="/exam/:attemptId/greeting" element={<ExamGreeting />} />
      <Route path="/exam/:attemptId/reading" element={<ReadingExam />} />
      <Route path="/exam/:attemptId/results" element={<Results />} />
    </Routes>
  );
}

export default App;