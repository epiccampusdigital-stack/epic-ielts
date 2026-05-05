import { Routes, Route, Navigate } from 'react-router-dom';
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
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancelled from './pages/PaymentCancelled';
import UpgradePrompt from './pages/UpgradePrompt';
import FeedbackPage from './pages/FeedbackPage';

// ─── Auth helpers ──────────────────────────────────────────────────────────

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!localStorage.getItem('token') && !!getUser();
}

function isAdmin() {
  const u = getUser();
  return u?.role === 'ADMIN' || u?.role === 'TEACHER';
}

// ─── Route guards ──────────────────────────────────────────────────────────

function RequireAuth({ children }) {
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  return children;
}

function RequireAdmin({ children }) {
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  if (!isAdmin()) return <Navigate to="/student/dashboard" replace />;
  return children;
}

function RequireStudentAccess({ children }) {
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  if (isAdmin()) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />

      {/* Student routes */}
      <Route path="/student/dashboard" element={
        <RequireStudentAccess><StudentDashboard /></RequireStudentAccess>
      } />
      <Route path="/student/feedback" element={
        <RequireStudentAccess><FeedbackPage /></RequireStudentAccess>
      } />
      <Route path="/upgrade" element={
        <RequireStudentAccess><UpgradePrompt /></RequireStudentAccess>
      } />
      <Route path="/payment/success" element={
        <RequireStudentAccess><PaymentSuccess /></RequireStudentAccess>
      } />
      <Route path="/payment/cancelled" element={
        <RequireStudentAccess><PaymentCancelled /></RequireStudentAccess>
      } />

      {/* Exam routes */}
      <Route path="/exam/:attemptId/greeting" element={
        <RequireStudentAccess><ExamGreeting /></RequireStudentAccess>
      } />
      <Route path="/exam/:attemptId/reading" element={
        <RequireStudentAccess><ReadingExam /></RequireStudentAccess>
      } />
      <Route path="/exam/:attemptId/results" element={
        <RequireStudentAccess><Results /></RequireStudentAccess>
      } />
      <Route path="/exam/:attemptId/writing" element={
        <RequireStudentAccess><WritingExam /></RequireStudentAccess>
      } />
      <Route path="/exam/:attemptId/writing-results" element={
        <RequireStudentAccess><WritingResults /></RequireStudentAccess>
      } />
      <Route path="/exam/:attemptId/listening" element={
        <RequireStudentAccess><ListeningExam /></RequireStudentAccess>
      } />
      <Route path="/exam/:attemptId/speaking" element={
        <RequireStudentAccess><SpeakingExam /></RequireStudentAccess>
      } />
      <Route path="/exam/:attemptId/speaking-results" element={
        <RequireStudentAccess><SpeakingResults /></RequireStudentAccess>
      } />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <RequireAdmin><AdminDashboard /></RequireAdmin>
      } />
      <Route path="/admin/papers/create" element={
        <RequireAdmin><CreatePaper /></RequireAdmin>
      } />
      <Route path="/admin/papers/import" element={
        <RequireAdmin><ImportPaper /></RequireAdmin>
      } />
      <Route path="/admin/papers/:id" element={
        <RequireAdmin><PaperDetail /></RequireAdmin>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
