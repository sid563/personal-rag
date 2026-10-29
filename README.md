# Personal RAG chatbot API

The assistant behind the chat button on [sidharthsingh.dev](https://sidharthsingh.dev). A NestJS service that answers questions about Sidharth from a curated knowledge base: retrieval-augmented generation over MongoDB Atlas Vector Search, embeddings from Cloudflare Workers AI, answers from Groq with Cloudflare as the fallback.

```
POST /api/chat            → { answer, sources, provider }
POST /api/chat/stream     → server-sent events: {type:"sources"} · {type:"token"}… · {type:"done"} | {type:"error"}
GET  /api/health          → { ok: true }

POST /api/knowledge       ┐
POST /api/knowledge/bulk  │ admin only: header x-admin-token (disabled when ADMIN_TOKEN is unset)
GET  /api/knowledge       │
PUT  /api/knowledge/:id   │
DELETE /api/knowledge/:id ┘
```

## How a question is answered

1. The question is embedded with `@cf/baai/bge-small-en-v1.5` (384 dimensions) on Cloudflare Workers AI.
2. Atlas `$vectorSearch` returns the top 6 chunks; only chunks scoring at least `RAG_MIN_SCORE` are kept. If none pass, the API answers "I don't have that" without calling an LLM.
3. The kept chunks go into a system prompt that allows answers only from them.
4. Groq generates the answer (`openai/gpt-oss-120b`, low reasoning effort). If Groq fails or is out of quota, Cloudflare's Llama 3.3 70B answers instead, using the same token as the embeddings.

Guard rails: an optional shared key on the chat routes (`CHAT_API_KEY`, sent by the site as `x-chat-key`; it is visible in the site's bundle, so treat it as a deterrent), CORS allow-list (`ALLOWED_ORIGINS`), message capped at 500 characters and six history turns, per-visitor limits per minute and per day plus a daily budget for everyone, all counted in a MongoDB TTL collection so every serverless instance shares them. 429 responses carry `Retry-After`.

## Setup

Keys, all free tiers:

- **MongoDB Atlas** (M0): connection string → `MONGODB_URI`, database `personal-rag`.
- **Groq**: console.groq.com → API Keys → `GROQ_API_KEY`.
- **Cloudflare Workers AI**: Account ID from any domain's Overview page → `CF_ACCOUNT_ID`; My Profile → API Tokens → Create Custom Token with permission *Workers AI: Read* → `CF_API_TOKEN`.

```bash
cp .env.example .env     # fill the three keys above
npm install
npm run seed             # embeds knowledge/*.md and rebuilds the collection (creates the vector index if it can)
npm run start:dev        # http://localhost:3000/api/health
npm run ask -- "What does Sidharth do at 1buy.ai?"   # prints retrieval scores, then the API's answer
```

If the seed cannot create the vector index itself, create it in Atlas: cluster → Search → Create Search Index → Atlas Vector Search → collection `knowledges`, name `vector_index`:

```json
{ "fields": [
  { "type": "vector", "path": "embedding", "numDimensions": 384, "similarity": "cosine" },
  { "type": "filter", "path": "category" } ] }
```

## Knowledge base

`knowledge/*.md`, one file per category. Every `## Heading` is one chunk (heading plus the text under it), self-contained, 60 to 180 words. A chunk whose body starts with `TODO` is skipped, so unanswered questions can stay in the file. Edit, then `npm run seed`; the seed replaces the whole collection in one pass (new batch inserted first, previous batch removed after).

## Deploy on Vercel

Zero configuration: Vercel detects NestJS from `src/main.ts`, builds it into one Function on Fluid compute, and streams responses. Import the repository at vercel.com/new (or `vercel --prod`), add the `.env` values as environment variables, and point a subdomain at it. Node 20 or newer.

The `Dockerfile` still builds a standalone container for any host that runs one.
