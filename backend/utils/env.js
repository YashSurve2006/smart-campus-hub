function envStr(name, fallback = undefined) {
  const v = process.env[name];
  if (v === undefined || v === '') return fallback;
  return v;
}

export const env = {
  port: Number(envStr('PORT', '5000')),
  nodeEnv: envStr('NODE_ENV', 'development'),
  clientOrigin: envStr('CLIENT_ORIGIN', 'http://localhost:5173'),
  trustProxy:
    envStr('TRUST_PROXY', '0') === '1' || envStr('TRUST_PROXY', '') === 'true',
  db: {
    host: envStr('DB_HOST', 'localhost'),
    port: Number(envStr('DB_PORT', '3306')),
    user: envStr('DB_USER', 'root'),
    password: envStr('DB_PASSWORD', ''),
    database: envStr('DB_NAME', 'smart_campus'),
  },
  jwt: {
    secret: envStr('JWT_SECRET', ''),
    expires: envStr('JWT_EXPIRES', '7d'),
  },
  assistant: {
    openaiKey: envStr('OPENAI_API_KEY', ''),
    openaiModel: envStr('OPENAI_MODEL', 'gpt-4o-mini'),
    openaiBase: envStr('OPENAI_API_BASE', 'https://api.openai.com/v1'),
    ollamaBase: envStr('OLLAMA_BASE_URL', 'http://127.0.0.1:11434'),
    ollamaModel: envStr('OLLAMA_MODEL', 'llama3.2'),
  },
};

export function validateEnv() {
  if (!env.jwt.secret) {
    throw new Error('[env] JWT_SECRET is required.');
  }
  if (env.jwt.secret.length < 32) {
    if (env.nodeEnv === 'production') {
      throw new Error('[env] JWT_SECRET must be at least 32 characters in production.');
    }
    console.warn('[env] JWT_SECRET should be a long random string (32+ chars).');
  }
  if (env.nodeEnv === 'production') {
    // no-op: production checks are enforced above
  }
}
