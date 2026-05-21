import { useEffect, useRef, useState } from 'react';
import API_URL from '../api';

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ fontWeight: 600, color: '#0F172A' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === '') {
      elements.push(<div key={key++} style={{ height: 6 }} />);
      continue;
    }

    if (/^[-•]\s/.test(line)) {
      const content = line.replace(/^[-•]\s/, '');
      elements.push(
        <div key={key++} style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
          <span style={{ color: '#4F46E5', flexShrink: 0 }}>•</span>
          <span>{renderInline(content)}</span>
        </div>
      );
      continue;
    }

    elements.push(
      <div key={key++} style={{ marginBottom: 2 }}>
        {renderInline(line)}
      </div>
    );
  }

  return elements;
}

const WELCOME =
  "Hi there! 👋 I'm the EPIC Campus advisor. I can help you with information about our Korea 🇰🇷, China 🇨🇳, and Japan 🇯🇵 programs, IELTS preparation, scholarships, and more. What would you like to know? 😊";

const WHATSAPP_HREF =
  'https://wa.me/94766528585?text=Hi%20EPIC%20Campus%2C%20I%20found%20you%20on%20EPIC%20IELTS%20and%20I%27m%20interested%20in%20learning%20more%20about%20your%20programs.';

function ChatBubbleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
        fill="white"
      />
    </svg>
  );
}

function CloseIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export default function AgentWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setHasInteracted(true);

    try {
      const res = await fetch(`${API_URL}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      const reply = data.reply ||
        "I'm having trouble right now. Please WhatsApp us: +94 76 652 8585";

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setShowWhatsApp(true);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong. Please WhatsApp us directly: +94 76 652 8585 📲',
      }]);
      setShowWhatsApp(true);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const canSend = input.trim().length > 0 && !loading;

  return (
    <>
      <style>{`
        @keyframes agentPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }
        @keyframes agentSlideIn {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes agentDotPulse {
          0%, 80%, 100% { opacity: 0.35; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1); }
        }
        .agent-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          box-shadow: 0 4px 20px rgba(79, 70, 229, 0.35);
          transition: all 200ms ease;
        }
        .agent-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 28px rgba(79, 70, 229, 0.45);
        }
        .agent-notify-dot {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #EF4444;
          animation: agentPulse 2s ease-in-out infinite;
        }
        .agent-panel {
          position: fixed;
          bottom: 96px;
          right: 24px;
          z-index: 9998;
          width: 380px;
          max-height: 560px;
          background: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.15);
          border: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          animation: agentSlideIn 220ms ease-out;
          font-family: Inter, sans-serif;
        }
        @media (max-width: 480px) {
          .agent-panel {
            width: calc(100vw - 32px);
            right: 16px;
            bottom: 88px;
          }
          .agent-fab {
            right: 16px;
            bottom: 16px;
          }
        }
        .agent-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #F8FAFC;
          min-height: 200px;
          max-height: 380px;
          scroll-behavior: smooth;
        }
        .agent-user-bubble {
          align-self: flex-end;
          background: #4F46E5;
          color: white;
          border-radius: 16px 16px 4px 16px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 400;
          max-width: 80%;
          margin-bottom: 8px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .agent-assist-bubble {
          align-self: flex-start;
          background: white;
          color: #0F172A;
          border: 1px solid #E2E8F0;
          border-radius: 16px 16px 16px 4px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 400;
          max-width: 85%;
          margin-bottom: 8px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .agent-typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #94A3B8;
          animation: agentDotPulse 1.2s ease-in-out infinite;
        }
        .agent-wa-card {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ECFDF5;
          border: 1px solid #D1FAE5;
          border-radius: 12px;
          padding: 10px 14px;
          margin-bottom: 8px;
          text-decoration: none;
          color: inherit;
          transition: background 180ms ease;
        }
        .agent-wa-card:hover {
          background: #D1FAE5;
        }
        .agent-textarea:focus {
          border-color: #4F46E5 !important;
          background: white !important;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.10) !important;
        }
        .agent-send-btn:hover:not(:disabled) {
          background: #4338CA !important;
        }
      `}</style>

      {isOpen && (
        <div className="agent-panel" role="dialog" aria-label="EPIC Advisor chat">
          <div style={{
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            padding: '16px 20px',
            borderRadius: '20px 20px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}>
                🎓
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>
                  EPIC Advisor
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.75)' }}>
                  ● Online
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CloseIcon size={20} />
            </button>
          </div>

          <div className="agent-messages">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {messages.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={msg.role === 'user' ? 'agent-user-bubble' : 'agent-assist-bubble'}
                >
                  {msg.role === 'assistant'
                    ? renderMarkdown(msg.content)
                    : msg.content}
                </div>
              ))}

              {loading && (
                <div className="agent-assist-bubble" style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '14px 16px' }}>
                  <span className="agent-typing-dot" style={{ animationDelay: '0ms' }} />
                  <span className="agent-typing-dot" style={{ animationDelay: '150ms' }} />
                  <span className="agent-typing-dot" style={{ animationDelay: '300ms' }} />
                </div>
              )}

              {showWhatsApp && (
                <a
                  className="agent-wa-card"
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>
                      Chat with us on WhatsApp
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 400, color: '#64748B' }}>
                      Fastest response
                    </div>
                  </div>
                </a>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #E2E8F0',
            padding: '12px 16px',
            background: '#FFFFFF',
            borderRadius: '0 0 20px 20px',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-end',
          }}>
            <textarea
              ref={textareaRef}
              className="agent-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about our programs..."
              rows={1}
              style={{
                flex: 1,
                minHeight: 40,
                maxHeight: 120,
                padding: '10px 14px',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 400,
                fontFamily: 'Inter, sans-serif',
                resize: 'none',
                outline: 'none',
                background: '#F8FAFC',
                color: '#0F172A',
                lineHeight: 1.5,
                transition: 'border-color 180ms, box-shadow 180ms, background 180ms',
              }}
            />
            <button
              type="button"
              className="agent-send-btn"
              onClick={sendMessage}
              disabled={!canSend}
              aria-label="Send message"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: 'none',
                background: canSend ? '#4F46E5' : '#E2E8F0',
                color: '#FFFFFF',
                cursor: canSend ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 180ms ease',
              }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="agent-fab"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
      >
        {!hasInteracted && !isOpen && <span className="agent-notify-dot" />}
        {isOpen ? <CloseIcon size={20} /> : <ChatBubbleIcon />}
      </button>
    </>
  );
}
