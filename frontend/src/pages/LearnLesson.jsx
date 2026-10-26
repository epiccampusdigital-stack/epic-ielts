import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import StudentNav from '../components/StudentNav';

const api = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Simple markdown renderer (same pattern as AgentWidget)
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === '') {
      elements.push(<div key={key++} style={{ height: 12 }} />);
      continue;
    }

    // H2 heading
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} style={{
          fontSize: 18, fontWeight: 700, color: '#0f1114',
          margin: '24px 0 12px', letterSpacing: '-0.01em',
        }}>
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    // H3 heading
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} style={{
          fontSize: 15, fontWeight: 700, color: '#0f1114',
          margin: '20px 0 8px',
        }}>
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    // Bullet line
    if (/^[-•]\s/.test(line)) {
      const content = line.replace(/^[-•]\s/, '');
      elements.push(
        <div key={key++} style={{
          display: 'flex', gap: 8,
          marginBottom: 6, alignItems: 'flex-start',
        }}>
          <span style={{
            color: '#0056d2', flexShrink: 0,
            marginTop: 2, fontSize: 14,
          }}>•</span>
          <span style={{ fontSize: 15, color: '#1e2229',
            lineHeight: 1.6 }}>
            {renderInline(content)}
          </span>
        </div>
      );
      continue;
    }

    // Table row (starts with |)
    if (line.startsWith('|') && line.endsWith('|')) {
      // Skip separator rows
      if (line.includes('---')) continue;
      const cells = line.split('|')
        .filter((_, idx) => idx > 0 && idx < line.split('|').length - 1)
        .map(c => c.trim());
      const isHeader = lines[i + 1]?.includes('---');
      elements.push(
        <div key={key++} style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
          borderBottom: '1px solid #dae1ed',
          background: isHeader ? '#f7f9fc' : 'transparent',
        }}>
          {cells.map((cell, ci) => (
            <div key={ci} style={{
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: isHeader ? 600 : 400,
              color: '#0f1114',
              borderRight: ci < cells.length - 1
                ? '1px solid #dae1ed' : 'none',
            }}>
              {renderInline(cell)}
            </div>
          ))}
        </div>
      );
      continue;
    }

    // Regular line
    elements.push(
      <p key={key++} style={{
        margin: '0 0 8px', fontSize: 15,
        color: '#1e2229', lineHeight: 1.7,
      }}>
        {renderInline(line)}
      </p>
    );
  }

  return elements;
}

function renderInline(text) {
  // Handle **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ fontWeight: 600, color: '#0f1114' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Handle ❌ and ✅ lines — give them colour
    return part;
  });
}

export default function LearnLesson() {
  const { moduleId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);
  const navigate = useNavigate();
  const topRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setMarked(false);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });

    axios.get(`${API_URL}/api/learn/lessons/${lessonId}`, api())
      .then(res => {
        setLesson(res.data);
        setMarked(res.data.isCompleted);
      })
      .catch(err => console.error('Lesson load error:', err.message))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const markComplete = async () => {
    if (marking || marked) return;
    setMarking(true);
    try {
      await axios.post(
        `${API_URL}/api/learn/progress/${lessonId}`, {}, api()
      );
      setMarked(true);
    } catch (err) {
      console.error('Mark complete error:', err.message);
    } finally {
      setMarking(false);
    }
  };

  const goNext = () => {
    if (lesson?.next) {
      navigate(`/learn/${moduleId}/${lesson.next.id}`);
    } else {
      navigate(`/learn/${moduleId}`);
    }
  };

  const goPrev = () => {
    if (lesson?.prev) {
      navigate(`/learn/${moduleId}/${lesson.prev.id}`);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f7f9fc',
      fontFamily: 'Source Sans Pro, sans-serif' }}>
      <StudentNav active="learn" />
      <div style={{ display: 'flex', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh',
        color: '#8495b0' }}>
        Loading lesson...
      </div>
    </div>
  );

  if (!lesson) return (
    <div style={{ minHeight: '100vh', background: '#f7f9fc',
      fontFamily: 'Source Sans Pro, sans-serif' }}>
      <StudentNav active="learn" />
      <div style={{ textAlign: 'center', padding: '80px 24px',
        color: '#8495b0' }}>
        Lesson not found.{' '}
        <button onClick={() => navigate('/learn')}
          style={{ color: '#0056d2', background: 'none',
            border: 'none', cursor: 'pointer', fontSize: 15 }}>
          Back to Learn
        </button>
      </div>
    </div>
  );

  return (
    <div ref={topRef} style={{ minHeight: '100vh',
      background: '#f7f9fc', fontFamily: 'Source Sans Pro, sans-serif' }}>
      <StudentNav active="learn" />

      <div style={{ maxWidth: 760, margin: '0 auto',
        padding: '32px 24px 80px' }}>

        {/* Breadcrumb */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 24, fontSize: 13, color: '#8495b0',
        }}>
          <button onClick={() => navigate('/learn')}
            style={{ background: 'none', border: 'none',
              color: '#0056d2', cursor: 'pointer',
              fontSize: 13, padding: 0, fontFamily: 'Source Sans Pro' }}>
            Learn
          </button>
          <span>›</span>
          <button onClick={() => navigate(`/learn/${moduleId}`)}
            style={{ background: 'none', border: 'none',
              color: '#0056d2', cursor: 'pointer',
              fontSize: 13, padding: 0, fontFamily: 'Source Sans Pro' }}>
            {lesson.module.icon} {lesson.module.title}
          </button>
          <span>›</span>
          <span style={{ color: '#0f1114' }}>{lesson.title}</span>
        </div>

        {/* Lesson header */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '28px 32px',
          border: '1px solid #dae1ed',
          borderTop: `4px solid ${lesson.module.color}`,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', gap: 16, marginBottom: 8,
          }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, color: lesson.module.color,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 6,
              }}>
                {lesson.module.title} · Lesson {lesson.lessonNumber}
                {' '}of {lesson.totalLessons}
              </div>
              <h1 style={{
                margin: 0, fontSize: 24, fontWeight: 700,
                color: '#0f1114', letterSpacing: '-0.01em',
              }}>
                {lesson.title}
              </h1>
            </div>
            <div style={{
              flexShrink: 0, fontSize: 12, color: '#8495b0',
              textAlign: 'right',
            }}>
              ⏱ {lesson.estimatedMin} min
              {marked && (
                <div style={{
                  marginTop: 6, color: '#059669',
                  fontWeight: 600, fontSize: 12,
                }}>
                  ✓ Completed
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lesson content */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '32px',
          border: '1px solid #dae1ed',
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
          lineHeight: 1.7,
        }}>
          {renderMarkdown(lesson.content)}
        </div>

        {/* Bottom actions */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          {/* Previous */}
          <button
            onClick={goPrev}
            disabled={!lesson.prev}
            style={{
              padding: '12px 20px',
              background: lesson.prev ? 'white' : '#f7f9fc',
              color: lesson.prev ? '#0f1114' : '#8495b0',
              border: '1px solid #dae1ed',
              borderRadius: 12,
              cursor: lesson.prev ? 'pointer' : 'not-allowed',
              fontSize: 14, fontWeight: 400,
              fontFamily: 'Source Sans Pro',
            }}
          >
            ← {lesson.prev ? lesson.prev.title : 'Previous'}
          </button>

          {/* Mark complete */}
          <button
            onClick={markComplete}
            disabled={marking || marked}
            style={{
              padding: '12px 24px',
              background: marked ? '#ECFDF5' : '#0056d2',
              color: marked ? '#059669' : 'white',
              border: marked ? '1px solid #BBF7D0' : 'none',
              borderRadius: 12,
              cursor: marking || marked ? 'default' : 'pointer',
              fontSize: 14, fontWeight: 600,
              fontFamily: 'Source Sans Pro',
              transition: 'all 180ms ease',
            }}
          >
            {marked ? '✓ Completed' : marking ? 'Saving...' : '✓ Mark as complete'}
          </button>

          {/* Next */}
          <button
            onClick={goNext}
            style={{
              padding: '12px 20px',
              background: '#0056d2',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
              fontFamily: 'Source Sans Pro',
            }}
          >
            {lesson.next ? `${lesson.next.title} →` : 'Back to module →'}
          </button>
        </div>
      </div>
    </div>
  );
}
