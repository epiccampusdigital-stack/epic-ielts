import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import StudentNav from '../components/StudentNav';

const api = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function LearnPage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/learn/modules`, api())
      .then(res => setModules(res.data))
      .catch(err => console.error('Learn load error:', err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC',
      fontFamily: 'Inter, sans-serif' }}>
      <StudentNav active="learn" />
      <div style={{ display: 'flex', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh',
        color: '#94A3B8', fontSize: 15 }}>
        Loading lessons...
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC',
      fontFamily: 'Inter, sans-serif' }}>
      <StudentNav active="learn" />

      <div style={{ maxWidth: 1100, margin: '0 auto',
        padding: '40px 24px 80px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700,
            color: '#0F172A', letterSpacing: '-0.01em' }}>
            📚 EPIC Learn
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: '#475569' }}>
            Build the skills behind your band score. Work through lessons
            at your own pace.
          </p>
        </div>

        {/* Module grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {modules.map(mod => {
            const pct = mod.totalLessons > 0
              ? Math.round((mod.completedLessons / mod.totalLessons) * 100)
              : 0;
            const allDone = mod.completedLessons === mod.totalLessons
              && mod.totalLessons > 0;

            return (
              <div
                key={mod.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/learn/${mod.id}`)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/learn/${mod.id}`);
                  }
                }}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: 24,
                  border: '1px solid #E2E8F0',
                  borderTop: `4px solid ${mod.color}`,
                  cursor: 'pointer',
                  transition: 'all 180ms ease',
                  outline: 'none',
                  boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 16px rgba(15,23,42,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 1px 3px rgba(15,23,42,0.04)';
                }}
              >
                {/* Icon + title */}
                <div style={{ display: 'flex', alignItems: 'center',
                  gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{mod.icon}</span>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700,
                      color: '#0F172A' }}>
                      {mod.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8',
                      marginTop: 2 }}>
                      {mod.totalLessons} lesson{mod.totalLessons !== 1
                        ? 's' : ''}
                    </div>
                  </div>
                  {allDone && (
                    <span style={{
                      marginLeft: 'auto',
                      background: '#ECFDF5',
                      color: '#059669',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 9999,
                    }}>
                      ✓ Complete
                    </span>
                  )}
                </div>

                {/* Description */}
                <p style={{ margin: '0 0 20px', fontSize: 13,
                  color: '#475569', lineHeight: 1.5 }}>
                  {mod.description}
                </p>

                {/* Progress bar */}
                <div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 6,
                  }}>
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>
                      {mod.completedLessons}/{mod.totalLessons} completed
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600,
                      color: mod.color }}>
                      {pct}%
                    </span>
                  </div>
                  <div style={{
                    height: 6, background: '#F1F5F9',
                    borderRadius: 9999, overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: mod.color,
                      borderRadius: 9999,
                      transition: 'width 400ms ease',
                    }} />
                  </div>
                </div>

                {/* Lesson list preview */}
                <div style={{ marginTop: 16 }}>
                  {mod.lessons.slice(0, 3).map(lesson => (
                    <div key={lesson.id} style={{
                      display: 'flex', alignItems: 'center',
                      gap: 8, padding: '6px 0',
                      borderTop: '1px solid #F8FAFC',
                      fontSize: 13,
                    }}>
                      <span style={{
                        width: 18, height: 18,
                        borderRadius: '50%',
                        background: lesson.isCompleted
                          ? mod.color : '#F1F5F9',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        color: lesson.isCompleted ? 'white' : '#94A3B8',
                        flexShrink: 0,
                        fontWeight: 700,
                      }}>
                        {lesson.isCompleted ? '✓' : lesson.order}
                      </span>
                      <span style={{
                        color: lesson.isCompleted
                          ? '#475569' : '#0F172A',
                        textDecoration: lesson.isCompleted
                          ? 'none' : 'none',
                      }}>
                        {lesson.title}
                      </span>
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: 11,
                        color: '#94A3B8',
                      }}>
                        {lesson.estimatedMin} min
                      </span>
                    </div>
                  ))}
                  {mod.lessons.length > 3 && (
                    <div style={{
                      fontSize: 12, color: '#94A3B8',
                      marginTop: 8, textAlign: 'center',
                    }}>
                      +{mod.lessons.length - 3} more lessons
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {modules.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 0',
            color: '#94A3B8' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <div style={{ fontSize: 16 }}>No lessons available yet.</div>
          </div>
        )}
      </div>
    </div>
  );
}
