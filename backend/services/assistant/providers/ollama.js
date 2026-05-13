import { env } from '../../../utils/env.js';

export async function ollamaChat({ system, userMessage, context }) {
  const base = env.assistant.ollamaBase.replace(/\/$/, '');
  const ctx = JSON.stringify(context).slice(0, 12000);
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.assistant.ollamaModel,
      messages: [
        { role: 'system', content: `${system}\nContext (JSON):\n${ctx}` },
        { role: 'user', content: userMessage },
      ],
      stream: false,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Ollama HTTP ${res.status}: ${t.slice(0, 400)}`);
  }
  const data = await res.json();
  return data.message?.content?.trim() || '';
}
