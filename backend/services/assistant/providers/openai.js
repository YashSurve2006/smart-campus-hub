import { env } from '../../../utils/env.js';

export async function openaiChat({ system, userMessage, context }) {
  const base = env.assistant.openaiBase.replace(/\/$/, '');
  const url = `${base}/chat/completions`;
  const ctx = JSON.stringify(context).slice(0, 12000);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.assistant.openaiKey}`,
    },
    body: JSON.stringify({
      model: env.assistant.openaiModel,
      messages: [
        { role: 'system', content: `${system}\nContext (JSON):\n${ctx}` },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.35,
      max_tokens: 900,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI HTTP ${res.status}: ${t.slice(0, 400)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}
