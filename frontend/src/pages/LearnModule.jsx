import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import StudentNav from '../components/StudentNav';

const api = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function LearnModule() {
  const { moduleId } = useParams();
  const [mod, setMod] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/learn/modules`, api())
      .then(res => {
        const found = res.data.find(m => m.id === parseInt(moduleId));
        setMod(found || null);
      })
      .catch(err => console.error(err.message))
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC',
      fontFamily: 'Inter, sans-serif' }}>
      <StudentNav active="learn" />
      <div style={{ display: 'flex', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh',
        color: '#94A3B8' }}>Loading...</div>
    </div>
  );

  if (!mod) return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC',
      fontFamily: 'Inter, sans-serif' }}>
      <StudentNav active="learn" />
      <div style={{ textAlign: 'center', padding: 80,
        color: '#94A3B8' }}>
        Module not found.{' '}
        <button onClick={() => navigate('/learn')}
          style={{ color: '#4F46E5', background: 'none',
            border: 'none', cursor: 'pointer' }}>
          Back to Learn
        </button>
      </div>
    </div>
  );

  const pct = mod.totalLessons > 0
    ? Math.round((mod.completedLessons / mod.totalLessons) * 100)
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC',
      fontFamily: 'Inter, sans-serif' }}>
      <StudentNav active="learn" />

      <div style={{ maxWidth: 760, margin: '0 auto',
        padding: '32px 24px 80px' }}>

        {/* Breadcrumb */}
        <button onClick={() => navigate('/learn')}
          style={{ background: 'none', border: 'none',
            color: '#4F46E5', cursor: 'pointer', fontSize: 13,
            padding: 0, marginBottom: 24, fontFamily: 'Inter' }}>
          ← Back to Learn
        </button>

        {/* Module header */}
        <div style={{
          background: 'white', borderRadius: 16,
          padding: '28px 32px', border: '1px solid #E2E8F0',
          borderTop: `4px solid ${mod.color}`,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center',
            gap: 16, marginBottom: 12 }}>
            <span style={{ fontSize: 36 }}>{mod.icon}</span>
            <div>
              <h1 style={{ margin: '0 0 4px', fontSize: 22,
                fontWeight: 700, color: '#0F172A' }}>
                {mod.title}
              </h1>
              <p style={{ margin: 0, fontSize: 14,
                color: '#475569' }}>
                {mod.description}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginTop: 16 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: 6, fontSize: 12,
            }}>
              <span style={{ color: '#94A3B8' }}>
                {mod.completedLessons}/{mod.totalLessons} lessons completed
              </span>
              <span style={{ fontWeight: 600, color: mod.color }}>
                {pct}%
              </span>
            </div>
            <div style={{ height: 6, background: '#F1F5F9',
              borderRadius: 9999 }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: mod.color, borderRadius: 9999,
                transition: 'width 400ms ease',
              }} />
            </div>
          </div>
        </div>

        {/* Lesson list */}
        <div style={{ display: 'flex', flexDirection: 'column',
          gap: 12 }}>
          {mod.lessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/learn/${moduleId}/${lesson.id}`)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/learn/${moduleId}/${lesson.id}`);
                }
              }}
              style={{
                background: 'white', borderRadius: 12,
                padding: '16px 20px', border: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', gap: 16,
                cursor: 'pointer', outline: 'none',
                transition: 'all 180ms ease',
                boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = mod.color;
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              {/* Completion circle */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: lesson.isCompleted ? mod.color : '#F1F5F9',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
                fontSize: lesson.isCompleted ? 14 : 13,
                fontWeight: 700,
                color: lesson.isCompleted ? 'white' : '#94A3B8',
              }}>
                {lesson.isCompleted ? '✓' : idx + 1}
              </div>

              {/* Lesson info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 600,
                  color: '#0F172A', marginBottom: 2,
                }}>
                  {lesson.title}
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>
                  {lesson.estimatedMin} min read
                  {lesson.isCompleted && (
                    <span style={{ color: '#059669', marginLeft: 8 }}>
                      · Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <span style={{ color: '#94A3B8', fontSize: 18 }}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
