# personal-rag

NestJS API behind the chat widget on sidharthsingh.dev (that repo: `~/Developer/personal/sidharthsingh.dev`). Read `README.md` first; it describes the request flow, env vars, seeding and deployment.

## Facts that must stay true (29 Oct 2026)
- Embeddings: Cloudflare Workers AI `@cf/baai/bge-small-en-v1.5`, 384 dims, matching the Atlas index `vector_index` on collection `knowledges`. Hugging Face is gone: the account's inference credits were exhausted (HTTP 402) and the free allowance is not reliable for a public bot.
- Answers: Groq `openai/gpt-oss-120b` with `reasoning_effort: low` (Groq retired `llama-3.3-70b-versatile`; the model list on this key is gpt-oss-120b/20b, qwen3.8-27b and allam-2-7b). Fallback: Cloudflare `@cf/meta/llama-3.3-70b-instruct-fp8-fast` through the OpenAI-compatible endpoint, same token as the embeddings.
- Public surface is `/api/chat`, `/api/chat/stream` (SSE) and `/api/health`. `/api/knowledge/*` needs `x-admin-token` and is disabled when `ADMIN_TOKEN` is empty. CORS allow-list in `ALLOWED_ORIGINS`.
- Rate limits live in the MongoDB `ratelimits` collection (fixed windows, TTL index), so they hold across Vercel instances.
- Knowledge is `knowledge/*.md` (one file per category, one `## heading` per chunk, TODO bodies skipped) plus git-ignored `knowledge/private/*.md`. `npm run seed` replaces the whole collection. The chunk text is written from the portfolio's content, under the same tone rule as the site: marketing, verifiable, no teammate attributions, no secrets, no Kafka on the fulfilment backend.
- Vercel runs this with zero configuration from `src/main.ts` (keep `bootstrap()` + `app.listen`). Target host: chat.sidharthsingh.dev. Never push without Sidharth's word; commit locally.

## Verify
```bash
npm run build && PORT=3999 node dist/main   # then:
curl -s localhost:3999/api/health
npm run ask -- "What does Sidharth do at 1buy.ai?"   # retrieval scores + answer (API_URL=http://localhost:3999)
```
