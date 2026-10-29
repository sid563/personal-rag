# Sidharth Singh's projects

## Sidharth's projects, listed

Sidharth Singh's site lists seven projects. Four are work at 1buy.ai: the order-fulfilment backend, a modular monolith in three roles whose architecture he designed from scratch; the inbound mail agents, an LLM-assisted pipeline with 17 handlers; the Go job scheduler, where he built the alert scanner and the handler framework; and the Rust-to-WebAssembly shared pricing formulas. One is work at RapidShyp: bulk orders, multi-channel fulfilment and carrier integrations for a shipping platform. Two are personal and academic: a personal RAG assistant deployed on AWS, and a D-MPNN drug property predictor from university. Every project page carries an animated system sketch of its architecture.

## The order-fulfilment backend: overview

The order-fulfilment backend is the architecture behind 1buy.ai's fulfilment platform, designed from scratch by Sidharth Singh, who also wrote its kernel. It is a feature-first FastAPI monolith shipped as one Docker image in three process roles, with PostgreSQL as both the source of truth and the job queue. Workers claim jobs with SELECT … FOR UPDATE SKIP LOCKED, and a scheduler is elected by a PostgreSQL advisory lock. The stack is Python, FastAPI, Granian, PostgreSQL, SQLAlchemy 2, asyncpg, Alembic, Redis, S3, the Claude API, Microsoft Graph, the DHL API and Docker. The project started in August 2026 and is live work in progress.

## Why Sidharth designed the fulfilment backend this way

1buy.ai sources electronic components for B2B buyers and then has to get the goods delivered: supplier readiness, lab testing, shipping, customs, escrow and payment, across several departments and outside parties. Fulfilment needed a backend that a very small team could operate, that could grow for a year without a rewrite, and that would not need a message broker, a secrets service or a fleet of microservices on day one. Sidharth Singh's design came out of deliberate research before the first feature was written: how teams that stayed on a monolith keep it modular, what PostgreSQL can do as a queue, what a transaction pooler breaks, and what actually fails at 3 a.m., such as a worker killed mid-task or a cron that fires twice.

## The fulfilment backend's three roles

Sidharth Singh's fulfilment backend is one codebase and one image that boots in three roles, differing only by command. The api role runs Granian with four worker processes behind one kernel-balanced socket; it serves HTTP, verifies JWTs locally and stays light, because anything slow becomes a queue row. The worker role runs N replicas with four claim loops each and drains the queue: mail, LLM parsing, carrier calls, documents. The scheduler role runs exactly one active leader that turns cron into queue rows and imports only the kernel. API capacity and background capacity are separate knobs, so a burst of HTTP traffic never competes with a backlog of PDF reads, and a long LLM task never holds a request handler.

## The fulfilment backend's module boundaries

Sidharth Singh organised the fulfilment backend into four bounded contexts: order, fulfilment, finance, and platform, which covers identity, mail, notifications, documents, approvals and activity. Every feature module is the same six files: router, schemas, models, repository, service and tasks. The dependency direction runs from roles to features to core and adapters, and it is enforced rather than merely agreed: three import-linter contracts run in CI, so the business contexts stay independent of each other, core imports nothing above it, and no context may import a composition root. Cross-context work never crosses a boundary by import; it goes through the queue. When a module outgrows a file it becomes a folder with the same names and the public import path never changes.

## PostgreSQL as the queue in Sidharth's fulfilment backend

There is no Kafka, no SQS and no Celery broker in Sidharth Singh's fulfilment backend. One table, task_queue, in a service-private schema is the queue. The API and the scheduler insert rows; workers claim them with a single UPDATE … RETURNING statement wrapped around SELECT … FOR UPDATE SKIP LOCKED. Claiming and locking happen in one round trip and the transaction commits immediately, so a five-minute LLM read holds no database lock. SKIP LOCKED means workers never wait on each other: N workers poll the same table with no coordinator and no Redis in the loop. Backoff is a timestamp, not a sleeping worker: a failed job returns to QUEUED with next_run_at pushed out by ten seconds times the attempt count.

## How Sidharth's queue recovers dead workers and avoids duplicates

Sidharth Singh's claim statement has a second arm that reclaims orphans. A worker killed mid-task, by OOM, by a node dying, or by Docker's grace period expiring, leaves a RUNNING row that nothing would otherwise pick up. A RUNNING row older than a fifteen-minute lease is treated as dead and re-claimed with its retry count bumped, so a job that kills its worker walks the backoff instead of crash-looping the fleet. Duplicates are no-ops: an optional idempotency key with ON CONFLICT DO NOTHING makes at-least-once delivery safe, so a retried enqueue never double-fires a side effect. Workers run asyncio with four claim loops per replica and a one-second idle poll; SIGTERM lets loops finish their current job, with a sixty-second drain.

## The transactional outbox and the channel column

The same task_queue table in Sidharth Singh's fulfilment backend is the transactional outbox. When one context needs another to react, it calls publish() inside its own transaction, which inserts a row named after the handler the other context registered. If the domain write rolls back, the event never existed; if it commits, delivery is guaranteed. The event name is the whole contract between contexts, which is why the import-linter rule can be absolute. A channel column makes shared development safe: every row is stamped with the enqueuer's channel, the machine hostname by default and "main" on the server, and a worker claims only its own channel, so a laptop's workers never steal the server's jobs.

## The fulfilment backend's scheduler

Sidharth Singh's fulfilment scheduler is a singleton that does not rely on anyone remembering that. Leadership is a PostgreSQL session advisory lock, taken with pg_try_advisory_lock on a dedicated unpooled connection. The holder is the leader; if it dies, its session ends, the lock releases, and the standby wins on its next retry. There is no heartbeat table and no etcd. Every job is "insert a row": a delta poll per watched mailbox every two minutes, subscription renewal every six hours, and morning jobs that fire once per desk day at a local time, keyed by date, so a redeploy at noon never sends the morning digest twice. A job is tracked by its name and its payload, a lesson from user acceptance testing.

## Kernel details of Sidharth's fulfilment backend

Sidharth Singh's kernel for the fulfilment backend is about 6,000 lines and carries a few deliberate choices. One unit of work per use-case, committed or rolled back as a block, with reader sessions for lag-tolerant reads. Every transaction runs SET LOCAL lock_timeout of ten seconds, so a request stuck behind a lock rolls back cleanly and the API answers 503 with Retry-After. Pooler-safe by configuration: one flag switches between a real pool with prepared statements and a no-pool mode for a transaction pooler. Configuration loads once from a typed settings object, with a secrets bundle from AWS Secrets Manager in staging and production. One logging funnel emits JSON lines with a label allowlist. Adapters for mail, LLMs, blob storage, document text and carriers sit behind Protocol interfaces, so tests use fakes.

## The fulfilment backend in numbers

Counted from the repository in late October 2026, Sidharth Singh's order-fulfilment backend has 4 bounded contexts, about 30 feature modules with the same six files each, 293 HTTP endpoints, 60 background task handlers, 17 inbound-mail classifiers, 4 standing scheduler jobs plus one poll per watched mailbox, a kernel of about 6,000 lines, about 81,000 lines of Python in 390 files, 1,950 test functions in 176 files, and 3 architecture contracts enforced in CI. The one-line version from his write-up: Postgres is the queue, the outbox and the lock; one image, three roles; workers claim with SKIP LOCKED and reclaim what dies.

## Inbound mail agents: overview

Inbound mail agents is an LLM-assisted pipeline Sidharth Singh designed and built for 1buy.ai's fulfilment platform. It reads every email the platform receives, works out which order or shipment it belongs to without trusting the model to decide, routes it to one of 17 plug-in handlers, and dispatches the resulting action through a transactional outbox. Each mail costs zero to two model calls, and every exit records one of four explicit dispositions. The stack is Python, FastAPI, PostgreSQL, Microsoft Graph, the Claude API, Groq and the transactional outbox. The project is dated October 2026 and is in user acceptance testing with the operations team.

## Why the mail pipeline exists

Fulfilment for a B2B procurement platform runs on email: suppliers confirm readiness, carriers and freight forwarders send documents, labs return test reports, customs brokers raise duty, escrow providers ask for consent. Before Sidharth Singh built the inbound mail pipeline, a person read an inbox, worked out what each mail was about, and re-typed the result into the system. The goal was to make the platform read its own mail while keeping a hard line between what a model may read and what the system is willing to believe.

## How the mail pipeline processes a message

Sidharth Singh's mail pipeline runs four steps. Anchor: work out which order, lot or shipment the mail is about, cheapest signal first, from In-Reply-To headers to thread id to the platform's own reference patterns, with a model only as the last resort. Classify: one model call picks a broad category from the registered taxonomy, skipped entirely when the mail answers a template the platform sent. Resolve: the matching handler decides the exact action and builds its payload, sub-classifying with its own model choice if needed. Dispatch: the action is published as an outbox event, and the domain context that owns it subscribes by name and does the real work. Every exit writes a disposition: actioned, no action needed, no rule, or no anchor. Only "no anchor" is a human's problem.

## The mail pipeline's design rules

Sidharth Singh's inbound-mail pipeline follows five rules. The model widens what the system can read, never what it believes: a model may propose candidate references, but code looks each one up and anchors only on an exact, single-row match, so a hallucinated reference matches nothing. Facts already held beat facts a model infers: a reply to a sent template is claimed by its handler with no model call. A handler is one file, declaring a category and a description and implementing resolve; handlers are auto-discovered and a duplicate category fails loud at startup. Actions are event names, not imports, so the mail context stays decoupled from orders, logistics, testing, customs and escrow. And return nothing when unsure: leaving a mail processed-without-action is cheaper than firing the wrong action.

## How the mail pipeline runs in production

In Sidharth Singh's mail pipeline, every step asks a router for its model, and operations map each step to a provider and model in config, so a cheap model routes and a stronger one extracts. Providers are Groq-hosted Llama and Claude, with a stub router for environments without keys. Provider calls back off on throttling and overload responses and honour Retry-After, while ordinary client errors are not retried. Handlers receive a read-only view of the mail and no database handle, which keeps them deterministic to test: inject a fake router that returns canned JSON and run the pipeline end to end with no network. Attachments are flagged at classification time and opened by the subscriber that has both the text and the filenames. Seventeen handlers cover supplier quotes, goods readiness, logistics and customs correspondence, lab testing replies, approval replies and the escrow lifecycle.

## Go job scheduler: overview

The Go job scheduler is 1buy.ai's background-job service, in production since April 2026: a one-second dispatcher, a fixed goroutine pool behind a bounded queue, a per-job Redis lock so a job runs at most once across replicas, and Kafka events for every run. Sidharth Singh built the alert scanner that runs on it, the handler registration and boot-time seeding every later job follows, and the refactor that made it a generic scheduler with handlers as plug-ins. The stack is Go, MongoDB, Redis, Kafka, Prometheus, chi and zap. Jobs are definitions in MongoDB, managed over a small REST API, in three shapes: cron with six fields including seconds, interval, and once.

## How a tick works in the Go scheduler

In the Go job scheduler Sidharth Singh works on, a dispatcher goroutine wakes every second and asks the store for up to 100 jobs whose next run time has passed, oldest first. Each becomes a task submitted to a fixed pool of 30 worker goroutines, fed by a channel buffered to twice the pool size. If every worker is busy and the buffer is full, submission blocks: the dispatcher simply falls behind the clock instead of spawning a goroutine per due job. A job whose handler name is not registered is skipped with a warning rather than crashing the tick. Handlers are registered by name at boot, and a duplicate name panics the process on startup, so a bad deploy fails in seconds.

## A task's five steps in the Go scheduler

A task in 1buy.ai's Go job scheduler, as Sidharth Singh describes it, lives through five steps. Lock: SET NX PX on the job's key in Redis with a TTL of the job's timeout plus five seconds; another replica holding the lock means this run is skipped, which makes "at most once per tick across any number of instances" true without a leader. Record: an execution row is written as running and a started event goes out on Kafka. Run: the handler gets a context already cancelled at the job's timeout, with exponential retries from one second doubling to a thirty-second cap inside that deadline. Finalise: the row becomes success, failed or timeout, the matching event is published, and Prometheus metrics update per handler. Advance: cron jobs get their next fire time, interval jobs get now plus the interval, one-shot jobs are disabled.

## The alert scanner Sidharth built

The alert scanner is the handler Sidharth Singh built on 1buy.ai's Go job scheduler, and the reason the service exists for the product. Users watch electronic parts and set rules: a price change above a percentage, a risk score crossing a level, a compliance flag flipping, a lifecycle stage moving, a new alternate appearing. That is five rule types and seven operators. Every tick reads at most 200 alert documents that still have an active rule, flattens them to rules whose last check is older than a seven-day cooldown, evaluates those concurrently, writes the results back in one BulkWrite, inserts notifications, and sends email for the rules that asked for it. It runs as an always-on system job seeded at boot, every 24 hours by default, with a ten-minute timeout.

## How the alert scanner bounds its fan-out

Sidharth Singh bounds the alert scanner's concurrency with the plainest tool Go has: a buffered channel used as a semaphore of permits. Each evaluation goroutine takes a permit before working and hands it back when done, so at most fifty value lookups and ten SMTP sends run at once. His write-up's line is "permits, not threads", which became the principle "backpressure is a permit count, not a thread count" on his site. The handler's work is capped at every stage, because a handler that does not bound itself is the easiest way to take a shared scheduler down.

## What made the alert scanner correct

Two details carried most of the alert scanner's correctness, according to Sidharth Singh. Normalise before you compare: rules are written by a TypeScript backend and a web UI, and values come from several upstream pipelines, so "10" versus 5, "Low" versus "LOW" and "yes" versus "YES" all arrive; every current value, baseline and threshold is canonicalised to one form per field before any operator runs. Idempotent by construction: the scheduler will retry a handler, and if a lock ever failed open two replicas would run it at once, so the scanner always writes its last-checked time, triggers only on a change since the rule's cursor, and respects a per-rule cooldown, meaning re-running against the same or stale state fires nothing twice.

## The Go scheduler as a plug-in framework

Sidharth Singh built the single RegisterAll that wires handlers into the Go scheduler's registry and the idempotent boot-time seeding of system jobs by name. Those two pieces are the shape the spot-price catalogue walk followed when it was added in August 2026. By then the service was a generic scheduler with handlers as plug-ins: a refactor by Sidharth in May 2026 had taken everything that was not scheduling out of it, so a new handler has nothing to understand first. The one-line version: a one-second tick, a bounded pool, a lock per job, and handlers that cap their own fan-out with a channel of permits.

## The Go scheduler in numbers

The Go job scheduler Sidharth Singh works on runs a one-second dispatcher tick with up to 100 due jobs per tick, a pool of 30 goroutines with a queue buffered to 60, a lock TTL of the job timeout (30 seconds by default) plus 5 seconds, and retry backoff of 1 second doubling to a 30-second cap inside the job deadline. It supports cron, interval and once job types, exposes 9 job endpoints plus liveness, readiness and metrics, and publishes to 2 Kafka topics with 10 event types keyed by job id. The alert scan covers 5 rule types and 7 operators, 200 documents per tick, with 50 and 10 permits. The service is about 7,400 lines of Go.

## Rust to WebAssembly: one pricing formula, two runtimes

At 1buy.ai, pricing logic lived in two places: TypeScript services that serve the product and Rust services that do heavy computation, so every formula change meant two implementations and a slow drift between them. Sidharth Singh wrote the shared pricing and formula logic once in Rust and compiled it to WebAssembly. Rust services call the crate natively; TypeScript services in NestJS call the same crate compiled to WebAssembly with wasm-bindgen. Data crosses the WASM boundary as columnar Float64Array typed arrays rather than per-row objects, which keeps the call cheap for large batches, and a parity test runs the same inputs through both consumers and fails if the outputs differ. The project shipped in September 2026.

## What Sidharth learned from the WebAssembly crate

Sidharth Singh's lesson from the Rust-to-WebAssembly pricing crate: not everything belongs in WASM. Formulas that must run inside a MongoDB aggregation pipeline still have to be expressed in the pipeline language, so the Rust crate is the source of truth for the logic, and the pipeline version is checked against it. The crate has one Rust source of truth, two kinds of consumer (Rust services and TypeScript services), and a columnar Float64Array boundary between them.

## RapidShyp bulk orders and carrier integrations: overview

At RapidShyp, Om Logistics' B2B shipping platform, Sidharth Singh designed and owned the B2B Bulk Orders and Purchase Requisition flows in the Order Management System, taking 20,000 orders in a single upload call, built Rust microservices on Actix Web for the hot paths, and wired Kafka pipelines and carrier integrations so sellers on multiple sales channels ship through one platform. The stack was Rust, Actix Web, Tokio, Java, Kafka, MongoDB, MySQL, Redis, TiKV, etcd, React and Next.js. The work shipped to production in 2025 and was used daily by operations.

## What Sidharth built at RapidShyp

Sidharth Singh's RapidShyp work covered five areas. Bulk Orders end to end: upload and validation of 20,000 orders in a single call, multi-seller shipment creation, orchestration across warehouses, and Purchase Requisition workflows with approval steps for the B2B side. Multi-channel ingestion: orders from marketplaces and storefronts flow into the same Order Management System pipeline. Carrier and logistics integrations: third-party carrier APIs for shipment creation, tracking and status updates behind a service boundary, so a new carrier is an adapter rather than a rewrite. Kafka event streams between services for real-time order processing and shipment status synchronisation. And the Warehouse Management System frontend in React and Next.js, used daily by operations teams.

## Engineering notes from Sidharth's RapidShyp work

The hot-path services Sidharth Singh built at RapidShyp were Rust with Actix Web on the Tokio runtime: async handlers, serde-typed domain models, and backpressure-aware worker pools, which improved API concurrency and throughput while cutting latency under peak shipping loads, with Java services alongside where the ecosystem called for it. Redis provided low-latency caching; TiKV and etcd provided distributed key-value storage, service coordination and configuration; MongoDB and MySQL carried the high-volume logistics read and write paths after schema and query tuning. Along the way he won first place in the 2025 internal hackathon and the Customer Obsession Award.

## Sidharth's personal RAG assistant

Sidharth Singh built a personal retrieval-augmented generation chat service to learn the full build-and-deploy loop: NestJS, MongoDB Atlas Vector Search, Hugging Face embeddings, Groq-hosted Llama, Docker, and a hand-provisioned AWS EC2 instance. It ingests documents, chunks them, embeds them and stores the vectors in MongoDB Atlas, then answers questions over that corpus with a Llama model served by Groq. He first deployed it on 3 May 2026 to a t3.micro in the ap-south-1 region, which is where his hands-on AWS journey begins. The same service is the basis of the chatbot on his site, which answers questions about his work, resume, roadmap and progress.

## Why Sidharth built the RAG service himself

Sidharth Singh built and deployed the personal RAG service to own every step from git init to a public URL, including the parts a platform usually hides: security groups, SSH, running a container on a server, and what breaks when the instance restarts. His progress log records that he learned security groups and SSH the hard way. The deployment gaps he identified, such as a stable address, a domain with TLS and an automated deploy, became items on his cloud and DevOps roadmap rather than loose ends.

## Sidharth's D-MPNN drug property predictor

Sidharth Singh's final-year project at VIT was a D-MPNN drug property predictor: a directed message-passing neural network with ensemble learning for ADME property prediction, trained on 12,859 molecular SMILES entries with substructure features to improve screening accuracy. It reached an R² of 0.9607 on the held-out set. The stack was Python, PyTorch, cheminformatics and ensemble learning, and he was the sole author. In his words, it is the project that taught him how much of machine learning is data plumbing, which turned out to be good preparation for backend work.
