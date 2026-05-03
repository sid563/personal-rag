# Personal RAG Chatbot API

A NestJS backend that answers questions about you using RAG —
Retrieval-Augmented Generation with MongoDB Atlas Vector Search + Groq (Llama 3).

## Architecture

```
POST /api/chat
  → embed question (HuggingFace BGE model, free)
  → vector search MongoDB Atlas (top 5 relevant chunks)
  → build prompt with retrieved context
  → Groq Llama 3.3 70B generates answer
  → return { answer, sources }

POST /api/knowledge       → add one entry (auto-embeds)
POST /api/knowledge/bulk  → seed multiple entries
GET  /api/knowledge       → list all entries
PUT  /api/knowledge/:id   → update entry (re-embeds if content changed)
DELETE /api/knowledge/:id → remove entry
```

---

## Step 1 — Get Free API Keys

### Groq (LLM — Llama 3.3 70B)
1. Go to https://console.groq.com
2. Sign up → API Keys → Create Key
3. Copy key → `GROQ_API_KEY`

### HuggingFace (Embeddings — BGE small)
1. Go to https://huggingface.co
2. Sign up → Settings → Access Tokens → New token (read)
3. Copy key → `HF_API_KEY`

### MongoDB Atlas (Vector DB)
1. Go to https://cloud.mongodb.com
2. Create free M0 cluster
3. Get connection string → `MONGODB_URI`

---

## Step 2 — Create Vector Search Index in Atlas

After creating your cluster:

1. Go to Atlas UI → Your Cluster → Search → Create Search Index
2. Choose **Atlas Vector Search** (not regular search)
3. Select your database: `personal-rag`, collection: `knowledges`
4. Use this JSON config:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "category"
    }
  ]
}
```

5. Name the index: `vector_index`
6. Save — takes ~1 minute to build

---

## Step 3 — Local Setup

```bash
# Clone and install
npm install

# Copy env file
cp .env.example .env
# Fill in MONGODB_URI, GROQ_API_KEY, HF_API_KEY, OWNER_NAME

# Run dev
npm run start:dev
```

---

## Step 4 — Seed Your Personal Data

Edit `seed.json` with your actual info, then:

```bash
curl -X POST http://localhost:3000/api/knowledge/bulk \
  -H "Content-Type: application/json" \
  -d @seed.json
```

---

## Step 5 — Test the Chat

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are Sidharth skills?"}'

# With conversation history (multi-turn)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me more about his Rust experience",
    "history": [
      {"role": "user", "content": "What does Sidharth do?"},
      {"role": "assistant", "content": "Sidharth is a Full Stack Engineer..."}
    ]
  }'
```

---

## Step 6 — Manage Knowledge

```bash
# Add one entry
curl -X POST http://localhost:3000/api/knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "category": "hobbies",
    "content": "Sidharth enjoys exploring distributed systems and learning Go in his free time.",
    "metadata": {"tags": ["hobbies"]}
  }'

# List all entries
curl http://localhost:3000/api/knowledge

# List by category
curl http://localhost:3000/api/knowledge?category=skills

# Update an entry
curl -X PUT http://localhost:3000/api/knowledge/<id> \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated content here — embedding auto-regenerates"}'

# Delete an entry
curl -X DELETE http://localhost:3000/api/knowledge/<id>
```

---

## Step 7 — Deploy on AWS EC2

```bash
# 1. Launch EC2 — t2.micro (free tier) or t3.small (~$15/mo)
#    AMI: Ubuntu 22.04, open port 3000 in security group

# 2. SSH in and install Docker
sudo apt update && sudo apt install -y docker.io
sudo systemctl start docker

# 3. Build and run
git clone <your-repo>
cd personal-rag
cp .env.example .env   # fill in your keys

docker build -t personal-rag .
docker run -d \
  --env-file .env \
  -p 3000:3000 \
  --restart unless-stopped \
  --name personal-rag \
  personal-rag

# 4. Optional: Nginx reverse proxy + SSL with Certbot
sudo apt install -y nginx certbot python3-certbot-nginx
# Point your domain to EC2 IP, then:
sudo certbot --nginx -d yourdomain.com
```

---

## Categories (suggested)

Use consistent categories so you can filter:
- `personal` — basic info, location, education
- `experience` — work history
- `skills` — tech skills
- `projects` — side projects
- `achievements` — awards, certifications
- `personality` — interests, working style, goals

---

## Integrating with your Profile Website

```javascript
// In your profile website frontend
const response = await fetch('https://your-ec2-domain.com/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userQuestion,
    history: conversationHistory  // keep last 6 messages
  })
});
const { answer, sources } = await response.json();
```
