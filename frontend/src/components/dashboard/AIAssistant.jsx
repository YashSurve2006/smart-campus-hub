import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, History, MessageCircle, Send, Sparkles, X, Zap } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const QUICK = [
  { label: 'Today timetable', message: 'Show today timetable' },
  { label: 'Latest notices', message: 'Latest notices' },
  { label: 'Upcoming events', message: 'Upcoming events' },
  { label: 'Attendance summary', message: 'Attendance summary' },
];

export function AIAssistant({ dark }) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [sessions, setSessions] = useState([{ id: '1', title: 'Current', messages: [] }]);
  const [activeId, setActiveId] = useState('1');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [caps, setCaps] = useState(null);
  const endRef = useRef(null);
  const user = useAuthStore((s) => s.user);

  const active = sessions.find((s) => s.id === activeId) || sessions[0];

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/assistant/capabilities');
        setCaps(data);
      } catch {
        /* */
      }
    })();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages, loading]);

  function pushMessage(role, text, cards, provider) {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeId
          ? { ...s, messages: [...s.messages, { role, text, cards, provider, at: Date.now() }] }
          : s
      )
    );
  }

  async function send(prefill) {
    const t = (prefill || input).trim();
    if (!t || loading) return;
    setInput('');
    pushMessage('user', t);
    setLoading(true);
    try {
      const { data } = await api.post('/api/assistant/chat', { message: t });
      pushMessage('assistant', data.reply, data.cards, data.provider);
    } catch {
      pushMessage('assistant', 'Request failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    const id = `${Date.now()}`;
    setSessions((s) => [{ id, title: 'New chat', messages: [] }, ...s]);
    setActiveId(id);
  }

  const shell = dark
    ? 'border-white/10 bg-slate-900/95 text-slate-100'
    : 'border-white/60 bg-white/95 text-slate-900';

  return (
    <>
      <AnimatePresence>
        {panel && (
          <motion.aside
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`fixed bottom-0 right-0 top-0 z-[90] flex w-full max-w-lg flex-col border-l shadow-2xl backdrop-blur-2xl sm:top-16 ${shell}`}
          >
            <div
              className={`flex items-center justify-between border-b px-4 py-3 ${
                dark ? 'border-white/10' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-hub-purple" />
                <div>
                  <span className="font-semibold">Campus AI</span>
                  <p className="text-[10px] text-slate-500">
                    {caps?.providers?.openai
                      ? 'OpenAI'
                      : caps?.providers?.ollama
                        ? 'Ollama'
                        : 'Live campus data'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  title="Toggle sessions"
                  onClick={() => setShowHistory((v) => !v)}
                  className="rounded-lg p-2 hover:bg-white/10"
                >
                  <History className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => setPanel(false)} className="rounded-lg p-2 hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1">
              {showHistory && (
                <div
                  className={`w-36 shrink-0 space-y-1 border-r p-2 text-xs ${
                    dark ? 'border-white/10 bg-slate-950/50' : 'border-slate-100 bg-slate-50/80'
                  }`}
                >
                  <button
                    type="button"
                    onClick={newChat}
                    className="w-full rounded-lg bg-hub-purple/20 py-2 font-semibold text-hub-purple"
                  >
                    + New
                  </button>
                  {sessions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveId(s.id)}
                      className={`w-full truncate rounded-lg px-2 py-1.5 text-left ${
                        s.id === activeId ? 'bg-white/10 font-semibold' : 'opacity-80 hover:bg-white/5'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
                  {!active.messages.length && (
                    <p className="text-xs text-slate-500">
                      Answers use your live campus snapshot. Configure <code>OPENAI_API_KEY</code> or{' '}
                      <code>OLLAMA_BASE_URL</code> on the API for full LLM reasoning.
                    </p>
                  )}
                  {active.messages.map((msg, i) => (
                    <div
                      key={`${msg.at}-${i}`}
                      className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? dark
                            ? 'ml-6 bg-hub-blue/20'
                            : 'ml-6 bg-hub-blue/10'
                          : dark
                            ? 'mr-2 bg-white/5'
                            : 'mr-2 bg-slate-100/80'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {msg.cards?.length > 0 && (
                        <div className="mt-2 grid gap-2">
                          {msg.cards.map((c) => (
                            <div
                              key={c.title}
                              className={`rounded-xl border px-2 py-2 text-xs ${
                                dark ? 'border-white/10 bg-slate-950/60' : 'border-slate-200 bg-white'
                              }`}
                            >
                              <p className="font-semibold text-hub-teal">{c.title}</p>
                              <ul className="mt-1 space-y-0.5 text-[11px] opacity-90">
                                {c.items?.map((it, j) => (
                                  <li key={j}>
                                    <span className="font-medium">{it.line}</span>
                                    {it.sub && <span className="text-slate-500"> · {it.sub}</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.provider && (
                        <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">via {msg.provider}</p>
                      )}
                    </div>
                  ))}
                  {loading && <p className="text-xs text-slate-500">Thinking…</p>}
                  <div ref={endRef} />
                </div>

                <div className={`border-t p-3 ${dark ? 'border-white/10' : 'border-slate-100'}`}>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {QUICK.map((q) => (
                      <button
                        key={q.label}
                        type="button"
                        onClick={() => send(q.message)}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                          dark ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Zap className="h-3 w-3" />
                        {q.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && send()}
                      placeholder="Ask the assistant…"
                      className={`flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-hub-purple/40 ${
                        dark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => send()}
                      disabled={loading}
                      className="rounded-xl bg-gradient-to-r from-hub-blue to-hub-purple px-3 py-2 text-white shadow-lg disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500">
                    {user?.firstName} · {user?.role}
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-[80] flex flex-col items-end gap-3">
        <AnimatePresence>
          {open && !panel && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              type="button"
              onClick={() => setPanel(true)}
              className="flex items-center gap-2 rounded-full border border-white/40 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/90 dark:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Open assistant
            </motion.button>
          )}
        </AnimatePresence>
        <motion.button
          type="button"
          layout
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setOpen((v) => !v);
            if (panel) setPanel(false);
          }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-hub-blue via-hub-purple to-hub-teal text-white shadow-2xl shadow-hub-purple/30"
          aria-label="AI assistant"
        >
          <Bot className="h-7 w-7" />
        </motion.button>
      </div>
    </>
  );
}
