import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, User, RefreshCw } from 'lucide-react';

const suggestedPrompts = [
  'What are the critical alerts right now?',
  'Summarize warehouse performance today',
  'Why is delivery SLA breached?',
  'Show top incidents this week',
  'Predict demand for next 24 hours',
];

const botResponses = {
  'critical': {
    text: 'Currently there are **2 critical alerts** active:\n\n🔴 **Payment Gateway Timeout** — 847 orders affected, latency spike at 2:14 AM\n🔴 **Warehouse Picking Delay** — 234 orders delayed >45 min in Mumbai hub\n\nBoth incidents are being tracked. Recommend escalating the payment gateway issue immediately.',
  },
  'warehouse': {
    text: "**Warehouse Performance Summary (Today)**\n\n📦 Pick rate: 94.2% ↑ (+2.1% vs yesterday)\n⏱ Avg pick time: 8.4 min (target: <10 min ✅)\n🚨 Pending backlog: 312 items in Delhi hub\n\nOverall health: **Good** — Mumbai is underperforming slightly. Staff augmentation suggested for evening shift.",
  },
  'delivery': {
    text: "**SLA Breach Analysis**\n\nRoot cause identified with **89% confidence**:\n\n1. ⚡ Payment gateway timeout → Order confirmation delays\n2. 📦 Delayed confirmations → Warehouse pick queue backup\n3. 🚚 Queue backup → Dispatch delays → SLA breach\n\nAffected orders: ~1,240. Recommend: Switch to backup payment processor immediately.",
  },
  'incident': {
    text: "**Top Incidents This Week**\n\n1. 🔴 Payment Gateway Outage — 847 orders, P1\n2. 🟡 Delivery Route Optimization Failure — 156 orders, P2\n3. 🟡 Inventory Sync Mismatch — 89 SKUs affected, P2\n4. 🟢 CS Queue Spike — Resolved in 38 min\n5. 🟢 Warehouse Scanner Offline — Resolved in 12 min\n\nMTTR this week: **34 minutes** (improved from 47 min last week ✅)",
  },
  'demand': {
    text: "**Demand Forecast — Next 24 Hours**\n\n📈 Predicted order volume: **+18% above baseline**\n\nPeak windows:\n• 12 PM – 2 PM: +31% spike (lunch orders)\n• 7 PM – 9 PM: +44% spike (evening peak)\n\n⚠️ Recommendation: Pre-position 2x inventory in Bangalore & Hyderabad hubs. Activate on-call delivery fleet by 6 PM.",
  },
};

function getBotReply(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('critical') || lower.includes('alert')) return botResponses['critical'];
  if (lower.includes('warehouse')) return botResponses['warehouse'];
  if (lower.includes('delivery') || lower.includes('sla')) return botResponses['delivery'];
  if (lower.includes('incident')) return botResponses['incident'];
  if (lower.includes('demand') || lower.includes('predict') || lower.includes('forecast')) return botResponses['demand'];
  return {
    text: "I'm analyzing your query across all operational data streams...\n\nI found **no specific match**, but here's what I can help with:\n• Critical alerts & incidents\n• Warehouse & delivery performance\n• SLA analysis & root cause\n• Demand forecasting\n• Team & integration health\n\nTry one of the suggestions below or rephrase your question!",
  };
}

function MessageBubble({ msg }) {
  const isBot = msg.role === 'bot';
  const isTyping = msg.typing;

  // Simple markdown-like bold renderer
  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'flex-start',
      flexDirection: isBot ? 'row' : 'row-reverse',
      marginBottom: 14,
    }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: isBot
          ? 'linear-gradient(135deg, #4338CA, #6366F1)'
          : 'linear-gradient(135deg, #0F172A, #334155)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isBot ? '0 2px 8px rgba(67,56,202,0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        {isBot ? <Bot size={14} color="#fff" /> : <User size={14} color="#fff" />}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '78%',
        background: isBot ? '#fff' : 'linear-gradient(135deg, #4338CA, #6366F1)',
        border: isBot ? '1px solid var(--border-l)' : 'none',
        borderRadius: isBot ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
        padding: '10px 13px',
        boxShadow: isBot ? 'var(--shadow-sm)' : '0 2px 10px rgba(67,56,202,0.3)',
      }}>
        {isTyping ? (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#94A3B8',
                animation: `typingDot 1.2s ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        ) : (
          <div style={{
            fontSize: 12.5, lineHeight: 1.65,
            color: isBot ? '#1E293B' : '#fff',
            fontWeight: 400,
          }}>
            {renderText(msg.text)}
          </div>
        )}
        <div style={{
          fontSize: 10, color: isBot ? '#94A3B8' : 'rgba(255,255,255,0.6)',
          marginTop: 5, textAlign: 'right',
        }}>{msg.time}</div>
      </div>
    </div>
  );
}

export default function AIChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'bot',
      text: "Hi! I'm **PulseOps Bot** 👋\n\nI have real-time access to all your operational data — warehouse, delivery, inventory, CS, and more.\n\nHow can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const userMsg = { id: Date.now(), role: 'user', text: text.trim(), time: now };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Add typing indicator
    const typingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: typingId, role: 'bot', typing: true, time: now }]);

    // Simulate AI delay
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const reply = getBotReply(text);
    setMessages(prev => prev
      .filter(m => m.id !== typingId)
      .concat({
        id: Date.now() + 2, role: 'bot',
        text: reply.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    );
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(), role: 'bot',
      text: "Chat cleared! I'm ready to help with your operational queries.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  return (
    <div style={{
      width: minimized ? 260 : 320, flexShrink: 0,
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#F8FAFC',
      borderLeft: '1px solid var(--border)',
      transition: 'width 0.25s ease',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Bot size={16} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Sparkles size={11} color="#C4B5FD" />
            OpsBot AI
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ADE80', animation: 'pulse-r 2s infinite' }} />
            Online · PulseOps
          </div>
        </div>
        <button onClick={clearChat} title="Clear chat" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' }}>
          <RefreshCw size={13} />
        </button>
        <button onClick={() => setMinimized(m => !m)} title={minimized ? 'Expand' : 'Minimize'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' }}>
          {minimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
        </button>
        <button onClick={onClose} title="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' }}>
          <X size={14} />
        </button>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px 8px', display: 'flex', flexDirection: 'column' }}>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          <div style={{ padding: '6px 12px', borderTop: '1px solid var(--border-l)' }}>
            <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 4 }}>
              {suggestedPrompts.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p)} style={{
                  flexShrink: 0, fontSize: 10.5, fontWeight: 500,
                  color: '#4338CA', background: '#EEF2FF',
                  border: '1px solid #C4B5FD', borderRadius: 20,
                  padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#E0E7FF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#EEF2FF'; }}
                >{p}</button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px', borderTop: '1px solid var(--border)',
            background: '#fff', display: 'flex', gap: 8, alignItems: 'flex-end',
            flexShrink: 0,
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about ops, alerts, incidents..."
              rows={1}
              style={{
                flex: 1, resize: 'none', border: '1px solid var(--border)',
                borderRadius: 10, padding: '8px 12px', fontSize: 12.5,
                fontFamily: 'inherit', color: 'var(--text)',
                background: 'var(--bg)', outline: 'none', lineHeight: 1.5,
                maxHeight: 80, overflowY: 'auto',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#4338CA'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              style={{
                width: 34, height: 34, borderRadius: 10, border: 'none',
                background: input.trim() && !loading ? '#4338CA' : '#E2E8F0',
                color: input.trim() && !loading ? '#fff' : '#94A3B8',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.15s',
                boxShadow: input.trim() && !loading ? '0 2px 8px rgba(67,56,202,0.3)' : 'none',
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
