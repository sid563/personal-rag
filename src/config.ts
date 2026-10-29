/**
 * All environment access in one place. Read lazily (a function, not a
 * constant) so values are picked up after ConfigModule has loaded .env.
 */
const num = (v: string | undefined, fallback: number): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};
const list = (v: string | undefined, fallback: string[]): string[] =>
  v ? v.split(',').map((s) => s.trim()).filter(Boolean) : fallback;

export function getConfig() {
  const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  return {
    ownerName: process.env.OWNER_NAME || 'Sidharth Singh',
    ownerEmail: process.env.OWNER_EMAIL || 'sidharthsingh7111@gmail.com',
    siteUrl: process.env.SITE_URL || 'https://sidharthsingh.dev',
    allowedOrigins: list(process.env.ALLOWED_ORIGINS, [
      'https://sidharthsingh.dev',
      'https://www.sidharthsingh.dev',
      'http://localhost:3000',
      'http://localhost:3111',
    ]),
    /** Empty means the knowledge endpoints are disabled. */
    adminToken: process.env.ADMIN_TOKEN || '',
    groq: {
      apiKey: process.env.GROQ_API_KEY || '',
      model: groqModel,
      baseUrl: 'https://api.groq.com/openai/v1',
      /** gpt-oss models reason before answering; keep that short for chat. */
      extra: groqModel.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {},
    },
    cloudflare: {
      accountId: process.env.CF_ACCOUNT_ID || '',
      apiToken: process.env.CF_API_TOKEN || '',
      /** 384 dimensions; must match the Atlas vector index. */
      embeddingModel: '@cf/baai/bge-small-en-v1.5',
      chatModel: process.env.CF_CHAT_MODEL || '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    },
    rag: {
      topK: num(process.env.RAG_TOP_K, 6),
      /** Atlas cosine scores are (1 + cos) / 2. Measured 29 Oct 2026: on-topic top hits 0.86 to 0.92, off-topic 0.70 to 0.78. */
      minScore: Number(process.env.RAG_MIN_SCORE ?? 0.78),
      maxAnswerTokens: num(process.env.RAG_MAX_TOKENS, 600),
    },
    limits: {
      perMinute: num(process.env.CHAT_PER_MINUTE, 8),
      perDay: num(process.env.CHAT_PER_DAY, 60),
      globalPerDay: num(process.env.CHAT_GLOBAL_PER_DAY, 600),
      messageChars: 500,
      historyTurns: 6,
      historyChars: 1500,
    },
  };
}
