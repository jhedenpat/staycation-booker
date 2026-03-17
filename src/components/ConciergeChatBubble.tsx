import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Paperclip, Check, CheckCheck } from 'lucide-react';

interface Message {
  id: number;
  from: 'user' | 'staff';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    from: 'staff',
    text: '👋 Hi there! Welcome to RR Twins MOA Staycation. How can I help you today?',
    time: 'Just now',
  },
];

const AUTO_REPLY = "Thanks for reaching out! We'll get back to you shortly. If this is urgent, you can also call +63 917 123 4567. 😊";

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      {/* Staff avatar */}
      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white shadow">
        RR
      </div>
      <div
        className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-400"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ConciergeChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [isOnline] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now(), from: 'user', text, time: now(), status: 'sent' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate read receipt
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'read' } : m));
    }, 800);

    // Simulate staff typing then reply
    setTimeout(() => setTyping(true), 1000);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'staff', text: AUTO_REPLY, time: now() }]);
    }, 3500);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="fixed bottom-[44px] md:bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 24 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="w-[350px] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            style={{
              background: 'var(--chat-bg, #fff)',
              border: '1px solid rgba(99,102,241,0.18)',
              maxHeight: '520px',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)' }}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/40">
                  RR
                </div>
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white" />
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm leading-tight truncate">RR Twins Support</p>
                <p className="text-indigo-200 text-[11px] leading-tight">
                  {isOnline ? '● Online · Typically replies in minutes' : 'Away · Usually responds within 1hr'}
                </p>
              </div>
              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[260px]"
              style={{ background: 'rgb(var(--chat-msg-bg, 248 250 252))' }}
            >
              {messages.map(msg => (
                <div key={msg.id} className={`flex items-end gap-2 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Staff avatar */}
                  {msg.from === 'staff' && (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white shadow">
                      RR
                    </div>
                  )}

                  <div className={`flex flex-col ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[240px] px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl shadow-sm ${
                        msg.from === 'user'
                          ? 'rounded-br-sm text-white'
                          : 'rounded-bl-sm text-slate-800 dark:text-slate-100'
                      }`}
                      style={
                        msg.from === 'user'
                          ? { background: 'linear-gradient(135deg, #4338ca, #6366f1)' }
                          : { background: 'white', border: '1px solid rgba(99,102,241,0.12)' }
                      }
                    >
                      {msg.text}
                    </div>
                    {/* Timestamp + status */}
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[10px] text-slate-400">{msg.time}</span>
                      {msg.from === 'user' && msg.status === 'read' && (
                        <CheckCheck className="h-3 w-3 text-indigo-400" />
                      )}
                      {msg.from === 'user' && msg.status === 'sent' && (
                        <Check className="h-3 w-3 text-slate-300" />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TypingIndicator />
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Footer Input */}
            <div
              className="flex items-center gap-2 px-3 py-3 border-t"
              style={{ borderColor: 'rgba(99,102,241,0.12)', background: 'white' }}
            >
              {/* File attach */}
              <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf" />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors flex-shrink-0"
                title="Attach screenshot"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              {/* Text input */}
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a message…"
                className="flex-1 text-[13px] bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl px-3 py-2 outline-none border border-slate-200 dark:border-slate-700 focus:border-indigo-400 transition-colors"
              />

              {/* Send */}
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger Button ── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-xl transition-colors"
        style={{
          background: open ? '#4338ca' : 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
          boxShadow: '0 8px 32px rgba(99,102,241,0.45), 0 2px 8px rgba(0,0,0,0.2)',
        }}
        aria-label="Open support chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.span>
          ) : (
            <motion.span key="open"
              initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <MessageCircle className="h-6 w-6 text-white" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Online dot */}
        {isOnline && !open && (
          <motion.span
            className="absolute top-0.5 right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          />
        )}
      </motion.button>
    </div>
  );
}
