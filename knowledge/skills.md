# Sidharth Singh's skills

## Sidharth's skills at a glance

Sidharth Singh's core stack is Rust and TypeScript for most of what he ships, with Python and Go when the job calls for them. His resume groups his skills as: languages (Rust, TypeScript, JavaScript, Python, Java, SQL, Go); backend and APIs (Actix Web, Tokio, NestJS, FastAPI, Spring Boot, REST APIs, gRPC, WebSockets, hexagonal architecture, modular monoliths, microservices); data and messaging (PostgreSQL, MongoDB, MySQL, Redis, Apache Kafka, etcd, TiKV); infrastructure and cloud (Docker, Kubernetes, AWS EC2, S3 and Lambda, CI/CD, Linux); AI and search (LLM integration with Claude, RAG, Atlas Vector Search, pgvector, AI document parsing); and frontend (React, Next.js).

## How Sidharth rates his own depth

Sidharth Singh's About page carries an expertise matrix with four depth levels: "daily driver" for tools he uses every day at an expert level, "shipped in production" for tools he has used in real production systems, "working knowledge" for tools he can use competently, and "actively learning" for tools he is studying. Daily drivers are Rust, TypeScript, Actix Web, NestJS, hexagonal architecture, event-driven design and MongoDB. Actively learning are Kubernetes, Terraform and HNSW indexing. The ratings are self-assessed and updated as his learning progresses.

## Sidharth and Rust

Rust is Sidharth Singh's daily-driver language, with Actix Web, Tokio, serde, rdkafka and wasm-bindgen. He builds async services on Tokio and Actix Web: backpressure-aware worker pools, serde-typed domain models, and handlers that hold up under peak shipping loads. He lets the type system carry the invariants, with serde-typed domain models, Result-based error handling and Send plus Sync discipline for multi-instance safety. He also uses Rust as a single source of truth: shared crates compiled natively for services and to WebAssembly for TypeScript, with parity tests on both sides. His Kafka deep dive is written in Rust with rdkafka, and a meaningful open-source Rust contribution is on his roadmap.

## Sidharth and TypeScript

TypeScript is one of Sidharth Singh's two daily-driver languages, used with NestJS, Node and React. At 1buy.ai he designs and builds end-to-end backend services on a TypeScript, NestJS and MongoDB stack with hexagonal architecture, and those TypeScript services consume his Rust pricing crate through WebAssembly. At RapidShyp he built the React and Next.js order-lifecycle dashboards and the Warehouse Management System frontend used daily by operations. His personal site is also TypeScript, built on Next.js 16, and his personal RAG chat service is a NestJS application.

## Sidharth and Python

Sidharth Singh uses Python in production with FastAPI, SQLAlchemy 2 async and asyncpg. It is the language of the order-fulfilment backend at 1buy.ai, whose architecture he designed from scratch: a feature-first modular monolith on FastAPI running on the Granian server, with Alembic migrations, asyncio workers that claim jobs from PostgreSQL, and a scheduler that holds a session advisory lock. That service is about 81,000 lines of Python in 390 files with 1,950 test functions, as counted in late October 2026. His final-year university project, a D-MPNN drug property predictor, was also Python with PyTorch.

## Sidharth and Go

Sidharth Singh has shipped Go in production at 1buy.ai, building job handlers on the company's Go job scheduler: goroutine pools, channel semaphores and context deadlines. His alert scanner bounds its fan-out with a buffered channel of permits, which is where his principle "backpressure is a permit count, not a thread count" comes from. He also built the handler registration and boot-time seeding that later handlers follow, and refactored the service into a generic plug-in scheduler. The scheduler stack is Go, MongoDB, Redis, Kafka, Prometheus, chi and zap.

## Sidharth and Java, SQL and Spring Boot

Sidharth Singh has shipped Java in production: at RapidShyp, Java microservices ran alongside his Rust services on the order-processing hot path, and he worked on the Java microservices behind the carrier integrations. He holds a VMware IT Academy certification in Modern Application Development with Java Spring Boot from 2023 and rates Spring Boot as working knowledge. SQL is a production skill for him across PostgreSQL and MySQL: query design, EXPLAIN ANALYZE, compound and partial indexes, and lock-aware DDL on hot tables.

## Sidharth's backend architecture skills

Sidharth Singh's architecture work centres on event-driven services with clean boundaries, built to survive more than one instance. Hexagonal architecture and event-driven design are daily drivers for him. He has shipped a modular monolith in production: one image, three process roles, bounded contexts enforced in CI, and PostgreSQL as the queue. He has also built microservices in Rust and Java at RapidShyp and NestJS services at 1buy.ai. Adapters sit behind ports so that mail, LLM, storage and carrier providers can be swapped by touching one adapter, and tests use fakes instead of the network.

## Sidharth and concurrency

Concurrency and async runtimes are a production skill for Sidharth Singh. At RapidShyp he built on Tokio with backpressure-aware worker pools in Rust. At 1buy.ai he uses goroutine pools and channel semaphores in Go, and asyncio claim loops in Python that take work from PostgreSQL with SELECT … FOR UPDATE SKIP LOCKED so workers never wait on each other. His recurring design rule is that every stage of a system should bound itself: a handler that does not cap its own fan-out is the easiest way to take a shared scheduler down.

## Sidharth and APIs: REST, gRPC and WebSockets

Sidharth Singh has shipped REST APIs, gRPC and WebSockets in production. gRPC he has used for service-to-service APIs with protobuf contracts, and WebSockets for real-time updates to clients. The order-fulfilment backend he designed serves 293 HTTP endpoints from FastAPI, verifies RS256 JWTs locally against the company auth service's public key, and answers 503 with a Retry-After header when a request would otherwise wait on a lock. Every request carries an X-Request-ID and produces exactly one HTTP log line.

## Sidharth and MongoDB

MongoDB is a daily driver for Sidharth Singh: aggregation pipelines, compound indexes and Decimal128 for money. At 1buy.ai he engineers aggregation pipelines and compound-indexing strategies over 100 million or more pricing documents to power real-time component discovery, and his Go alert scanner reads and bulk-writes alert rules in MongoDB. At RapidShyp he tuned MongoDB schemas and queries for high-volume logistics traffic. His personal RAG service uses MongoDB Atlas with Atlas Vector Search for retrieval.

## Sidharth and Apache Kafka

Sidharth Singh has used Kafka in production at two companies. At RapidShyp he designed and ran the Kafka event pipelines between services for real-time order processing, shipment status synchronisation and multi-seller fulfilment. At 1buy.ai, the Go job scheduler he builds handlers for publishes execution events to Kafka, keyed by job id for per-job ordering. He is also running a self-directed deep dive, Kafka from first principles in Rust with rdkafka, which builds one evolving pipeline through nine phases from logs and offsets to a three-broker cluster and failure drills.

## Sidharth and PostgreSQL

PostgreSQL is Sidharth Singh's daily driver at work and his current deep dive. In production he does schema design, SQLAlchemy 2 async with Alembic migrations, pgvector similarity search and append-only event tables. He is fluent at the usage layer: query design, EXPLAIN ANALYZE, compound and partial indexes, lock-aware DDL on hot tables. He also uses Postgres as infrastructure: a job queue claimed with SELECT … FOR UPDATE SKIP LOCKED and a stale-lease reclaim, leader election on a session advisory lock, and SET LOCAL lock_timeout so a stuck request fails fast instead of committing late. Below the surface, he is working through an eight-week internals course on the planner, storage layout, MVCC, WAL and buffer management.

## Sidharth and Redis, MySQL, etcd and TiKV

Sidharth Singh has shipped Redis and MySQL in production and has working knowledge of etcd and TiKV. At RapidShyp he used Redis for low-latency caching, MySQL alongside MongoDB for high-volume logistics data, and TiKV with etcd for distributed key-value storage, service coordination and configuration. At 1buy.ai, Redis caches the auth service's public key for local JWT verification in the fulfilment backend and holds the per-job locks in the Go scheduler, whose SET NX PX lock gives each job at-most-once execution per tick across any number of replicas.

## Sidharth's infrastructure and cloud skills

Sidharth Singh is comfortable shipping containers and is levelling up on provisioning infrastructure from scratch. Docker, Linux and CI/CD are production skills: the fulfilment backend ships as one image whose three roles differ only by command, with import-linter architecture contracts and 1,950 tests in CI. AWS is working knowledge, with EC2, S3 and Lambda; he deployed his personal RAG service to an EC2 instance in ap-south-1 with Docker in May 2026, and S3 backs blob storage in the fulfilment backend with secrets from AWS Secrets Manager. Kubernetes and Terraform are actively learning, with AWS SAA-C03 and the CKA on his roadmap.

## Sidharth's AI and search skills

Sidharth Singh uses LLMs as components inside real workflows, not demos. LLM integration with Claude is a production skill: RFQ and trade-document parsing in 1buy.ai's sourcing and fulfilment backends, and the 17-handler inbound-mail pipeline with per-step model routing between Groq-hosted Llama and Claude. RAG pipelines and vector search are working knowledge: his personal RAG service uses Hugging Face embeddings with MongoDB Atlas Vector Search, and the fulfilment backend uses pgvector. HNSW indexing is on his actively-learning list.

## Sidharth's frontend skills

Sidharth Singh's frontend skills are React and Next.js, both shipped in production, and he describes them as enough to ship the internal tools the backend needs. At RapidShyp he built the React and Next.js order-lifecycle dashboards and the Warehouse Management System frontend that operations teams used daily. His personal site is a Next.js 16 App Router application with React 19, Tailwind 4 and shadcn/ui, with system sketches rendered as inline SVG, light and dark themes, keyboard shortcuts and a command palette.
