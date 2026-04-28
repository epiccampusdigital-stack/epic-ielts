import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import ExamGreeting from './pages/ExamGreeting';
import ReadingExam from './pages/ReadingExam';
import Results from './pages/Results';
import AdminDashboard from './pages/AdminDashboard';
import PaperDetail from './pages/PaperDetail';
import CreatePaper from './pages/CreatePaper';
import ImportPaper from './pages/ImportPaper';

import WritingExam from './pages/WritingExam';
import WritingResults from './pages/WritingResults';
import ListeningExam from './pages/ListeningExam';
import SpeakingExam from './pages/SpeakingExam';
import SpeakingResults from './pages/SpeakingResults';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/papers/create" element={<CreatePaper />} />
      <Route path="/admin/papers/import" element={<ImportPaper />} />
      <Route path="/admin/papers/:id" element={<PaperDetail />} />
      <Route path="/exam/:attemptId/greeting" element={<ExamGreeting />} />
      <Route path="/exam/:attemptId/reading" element={<ReadingExam />} />
      <Route path="/exam/:attemptId/results" element={<Results />} />
      <Route path="/exam/:attemptId/writing" element={<WritingExam />} />
      <Route path="/exam/:attemptId/writing-results" element={<WritingResults />} />
      <Route path="/exam/:attemptId/listening" element={<ListeningExam />} />
      <Route path="/exam/:attemptId/speaking" element={<SpeakingExam />} />
      <Route path="/exam/:attemptId/speaking-results" element={<SpeakingResults />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;