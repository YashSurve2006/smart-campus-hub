import { env } from '../utils/env.js';
import * as contextBuilder from './assistant/contextBuilder.js';
import { openaiChat } from './assistant/providers/openai.js';
import { ollamaChat } from './assistant/providers/ollama.js';
import { buildFallbackReply } from './assistant/fallbackReply.js';

const SYSTEM =
  'You are the Smart Campus Hub assistant. Use only the provided JSON context about this user campus data. Be concise, friendly, and actionable. If data is missing, say so.';

export function getAssistantCapabilities() {
  const openaiEnabled = Boolean(env.assistant.openaiKey && env.assistant.openaiBase);
  const ollamaEnabled = Boolean(env.assistant.ollamaBase && env.assistant.ollamaModel);

  return {
    providers: {
      openai: openaiEnabled,
      ollama: ollamaEnabled,
      local: false,
      contextFallback: true,
    },
    streamingSupported: false,
    models: {
      openai: env.assistant.openaiModel,
      ollama: env.assistant.ollamaModel,
    },
  };
}

export async function answerAssistant({ message, userId, role }) {
  const context = await contextBuilder.buildCampusDataContext(userId, role);
  const openaiEnabled = Boolean(env.assistant.openaiKey && env.assistant.openaiBase);
  const ollamaEnabled = Boolean(env.assistant.ollamaBase && env.assistant.ollamaModel);

  if (openaiEnabled) {
    try {
      const reply = await openaiChat({
        system: SYSTEM,
        userMessage: message,
        context,
      });
      if (reply) {
        return { reply, cards: [], provider: 'openai', contextUsed: true, streaming: false };
      }
    } catch (e) {
      console.warn('[assistant] OpenAI:', e.message);
    }
  }

  try {
    const reply = await ollamaChat({
      system: SYSTEM,
      userMessage: message,
      context,
    });
    if (reply) {
      return { reply, cards: [], provider: 'ollama', contextUsed: true, streaming: false };
    }
  } catch (e) {
    console.warn('[assistant] Ollama:', e.message);
  }

  return buildFallbackReply(message, context);
}
