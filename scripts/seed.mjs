// Rebuild the knowledge collection from knowledge/*.md.
// Usage: npm run seed   (reads .env via node --env-file)
import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import mongoose from 'mongoose';

const { MONGODB_URI, CF_ACCOUNT_ID, CF_API_TOKEN } = process.env;
const MODEL = '@cf/baai/bge-small-en-v1.5';
const DIMS = 384;
const INDEX = 'vector_index';
const COLLECTION = 'knowledges';
const KNOWLEDGE_DIR = fileURLToPath(new URL('../knowledge/', import.meta.url));

function fail(msg) {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}
if (!MONGODB_URI) fail('MONGODB_URI is missing from .env');
if (!CF_ACCOUNT_ID || !CF_API_TOKEN) fail('CF_ACCOUNT_ID and CF_API_TOKEN are needed to embed (Cloudflare Workers AI).');

/** `## Heading` starts a chunk; the H1 is ignored; bodies starting with TODO are skipped. */
function parseChunks(category, text) {
  const chunks = [];
  let skipped = 0;
  let title = null;
  let body = [];
  const flush = () => {
    if (title === null) return;
    const content = body.join('\n').trim();
    if (!content || /^TODO/i.test(content)) skipped += 1;
    else chunks.push({ category, title, content: `${title}\n${content}` });
  };
  for (const line of text.split(/\r?\n/)) {
    if (/^# /.test(line)) continue;
    const m = /^## (.+)/.exec(line);
    if (m) {
      flush();
      title = m[1].trim();
      body = [];
    } else if (title !== null) body.push(line);
  }
  flush();
  return { chunks, skipped };
}

async function embedAll(texts) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${MODEL}`;
  const vectors = [];
  for (let i = 0; i < texts.length; i += 50) {
    const batch = texts.slice(i, i + 50);
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${CF_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: batch }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) fail(`Embedding call failed (${res.status}): ${JSON.stringify(json?.errors ?? json).slice(0, 300)}`);
    for (const v of json.result.data) {
      if (!Array.isArray(v) || v.length !== DIMS) fail(`Unexpected embedding shape (${v?.length}); expected ${DIMS}`);
      vectors.push(v);
    }
    process.stdout.write(`  embedded ${Math.min(i + 50, texts.length)}/${texts.length}\r`);
  }
  process.stdout.write('\n');
  return vectors;
}

async function ensureIndex(col) {
  let existing = [];
  try {
    existing = await col.listSearchIndexes().toArray();
  } catch (err) {
    console.warn(`  could not list search indexes (${err.message}); assuming "${INDEX}" exists`);
    return;
  }
  const idx = existing.find((i) => i.name === INDEX);
  if (idx) {
    console.log(`  index "${INDEX}" present (${idx.status ?? 'status unknown'}${idx.queryable ? ', queryable' : ''})`);
    return;
  }
  console.log(`  creating vector index "${INDEX}" (${DIMS} dims, cosine)…`);
  try {
    await col.createSearchIndex({
      name: INDEX,
      type: 'vectorSearch',
      definition: {
        fields: [
          { type: 'vector', path: 'embedding', numDimensions: DIMS, similarity: 'cosine' },
          { type: 'filter', path: 'category' },
        ],
      },
    });
  } catch (err) {
    console.warn(`  automatic creation failed (${err.message}).`);
    console.warn('  Create it in Atlas: cluster → Search → Create Search Index → Atlas Vector Search → JSON:');
    console.warn(JSON.stringify({ fields: [{ type: 'vector', path: 'embedding', numDimensions: DIMS, similarity: 'cosine' }, { type: 'filter', path: 'category' }] }));
    return;
  }
  for (let i = 0; i < 36; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const now = (await col.listSearchIndexes().toArray()).find((i) => i.name === INDEX);
    if (now?.queryable) {
      console.log('  index is queryable');
      return;
    }
    process.stdout.write(`  waiting for the index (${now?.status ?? '…'})\r`);
  }
  console.warn('\n  index still building; queries will work once Atlas finishes.');
}

/** knowledge/*.md plus knowledge/private/*.md (git-ignored, for answers that should not be in the public repo). */
async function listKnowledgeFiles() {
  const out = [];
  for (const sub of ['', 'private']) {
    const dir = path.join(KNOWLEDGE_DIR, sub);
    let names = [];
    try {
      names = await readdir(dir);
    } catch {
      continue;
    }
    for (const f of names.sort()) {
      if (f.endsWith('.md') && f.toLowerCase() !== 'readme.md') out.push({ file: path.join(sub, f), full: path.join(dir, f) });
    }
  }
  return out;
}

async function main() {
  const files = await listKnowledgeFiles();
  if (files.length === 0) fail(`No knowledge files in ${KNOWLEDGE_DIR}`);

  const all = [];
  const perFile = [];
  for (const { file, full } of files) {
    const category = path.basename(file, '.md');
    const { chunks, skipped } = parseChunks(category, await readFile(full, 'utf8'));
    perFile.push({ file, chunks: chunks.length, skipped });
    all.push(...chunks.map((c) => ({ ...c, source: file })));
  }
  console.log('Knowledge files:');
  for (const f of perFile) console.log(`  ${f.file.padEnd(28)} ${String(f.chunks).padStart(3)} chunks${f.skipped ? `  (${f.skipped} TODO skipped)` : ''}`);
  console.log(`  total ${all.length} chunks\n`);
  if (all.length === 0) fail('Nothing to seed');

  const longest = all.reduce((m, c) => Math.max(m, c.content.split(/\s+/).length), 0);
  console.log(`Embedding with ${MODEL} (longest chunk ${longest} words)…`);
  const vectors = await embedAll(all.map((c) => c.content));

  console.log('Writing to MongoDB…');
  await mongoose.connect(MONGODB_URI);
  const col = mongoose.connection.db.collection(COLLECTION);
  const batch = new Date().toISOString();
  const now = new Date();
  const docs = all.map((c, i) => ({
    category: c.category,
    content: c.content,
    embedding: vectors[i],
    metadata: { title: c.title, source: c.source, hash: createHash('sha256').update(c.content).digest('hex').slice(0, 16), batch },
    createdAt: now,
    updatedAt: now,
  }));
  await col.insertMany(docs);
  const { deletedCount } = await col.deleteMany({ 'metadata.batch': { $ne: batch } });
  console.log(`  inserted ${docs.length}, removed ${deletedCount} old entries`);

  await ensureIndex(col);
  await mongoose.disconnect();
  console.log('\n✓ Seed complete');
}

main().catch((err) => fail(err.stack ?? err.message));
