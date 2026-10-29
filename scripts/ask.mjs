// Inspect retrieval for a question, then ask the API.
// Usage: npm run ask -- "What does Sidharth do at 1buy.ai?"   (API_URL overrides http://localhost:3000)
import mongoose from 'mongoose';

const question = process.argv.slice(2).join(' ').trim();
if (!question) {
  console.error('Usage: npm run ask -- "your question"');
  process.exit(1);
}
const { MONGODB_URI, CF_ACCOUNT_ID, CF_API_TOKEN } = process.env;
const API_URL = process.env.API_URL ?? 'http://localhost:3000';

const emb = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/baai/bge-small-en-v1.5`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${CF_API_TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: [question] }),
}).then((r) => r.json());
const vector = emb?.result?.data?.[0];
if (!vector) {
  console.error('Embedding failed:', JSON.stringify(emb).slice(0, 300));
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
const hits = await mongoose.connection.db
  .collection('knowledges')
  .aggregate([
    { $vectorSearch: { index: 'vector_index', path: 'embedding', queryVector: vector, numCandidates: 60, limit: 6 } },
    { $project: { category: 1, 'metadata.title': 1, score: { $meta: 'vectorSearchScore' } } },
  ])
  .toArray();
await mongoose.disconnect();

console.log(`\nRetrieval for: "${question}"`);
for (const h of hits) console.log(`  ${h.score.toFixed(3)}  ${h.category.padEnd(22)} ${h.metadata?.title ?? ''}`);

const res = await fetch(`${API_URL}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: question }),
});
const body = await res.json().catch(() => ({}));
console.log(`\nAPI ${res.status} via ${body.provider ?? '-'} | sources: ${(body.sources ?? []).join(', ') || '-'}\n`);
console.log(body.answer ?? body.message ?? body);
