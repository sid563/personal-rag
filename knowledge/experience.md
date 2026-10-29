# Sidharth Singh's work experience

## Sidharth's career timeline

Sidharth Singh has worked at two companies since graduating in June 2024. He joined RapidShyp, the B2B shipping platform of Om Logistics Limited in Gurugram, as an Associate Software Engineer in July 2024, straight out of university. He was promoted to Software Engineer in April 2025, the month after winning first place in the company's internal hackathon, and stayed in that role until February 2026. In March 2026 he joined 1buy.ai in Okhla, Delhi, as a Software Engineer, where he works today. In total that is a little over two years of production experience across procurement, logistics and supply-chain platforms.

## Sidharth's current role at 1buy.ai

Sidharth Singh has been a Software Engineer at 1buy.ai since March 2026. 1buy.ai, legally Sharpbuy Global Solutions Pvt. Ltd., is an AI-powered B2B electronic component intelligence, sourcing and procurement platform based in Okhla, Delhi. Sidharth works on an ultra-small engineering team that owns core platform flows end to end. His work there spans the order-fulfilment backend whose architecture he designed from scratch, the inbound-mail pipeline, MongoDB aggregation pipelines over 100 million or more pricing documents, background jobs on 1buy.ai's Go job scheduler, a Rust-to-WebAssembly pricing crate, and RFQ ingestion pipelines with LLM APIs in the sourcing workflow.

## Sidharth designed the order-fulfilment backend's architecture

At 1buy.ai, Sidharth Singh designs and runs the architecture of the order-fulfilment backend, which he built from scratch after deliberate research. It is a feature-first modular monolith in Python with FastAPI, shipped as one Docker image in three process roles: a four-process API, N background workers, and a leader-elected scheduler. PostgreSQL is both the source of truth and the job queue. Workers claim jobs with SELECT … FOR UPDATE SKIP LOCKED, a stale-lease reclaim recovers jobs whose worker died, a transactional outbox carries events between bounded contexts, and import-linter contracts in CI enforce the module boundaries. There is no message broker in the design; Postgres does that job.

## Sidharth builds the fulfilment workflows

On the fulfilment backend at 1buy.ai, Sidharth Singh builds the business workflows that take a purchase order through lab testing, shipment, customs and escrow. That includes DHL shipment booking and tracking, FedEx tracking, and Claude-based parsing of trade documents such as packing lists, Bills of Entry and provider invoices. The platform sources electronic components for B2B buyers and then has to get the goods delivered across several departments and outside parties, so the workflows coordinate supplier readiness, testing labs, carriers, customs brokers and escrow providers from one backend that a very small team can operate.

## Sidharth owns the inbound-mail pipeline

Sidharth Singh owns 1buy.ai's inbound-mail pipeline, which lets the fulfilment platform read its own email. Every incoming mail is anchored to its order, lot or shipment using the cheapest signal first: reply headers, thread ids, then the platform's own reference patterns, and only last a model. A two-stage classify-then-act flow routes each mail to one of 17 LLM handlers in a plug-in registry, with per-step model routing so a cheap model classifies and a stronger one extracts. The resulting action is dispatched through the transactional outbox. The pipeline has deterministic no-network tests, so the whole flow can run end to end with a fake model router.

## Sidharth's NestJS and MongoDB work at 1buy.ai

At 1buy.ai, Sidharth Singh designs and builds end-to-end backend services on a TypeScript, NestJS and MongoDB stack using hexagonal architecture, on an ultra-small engineering team. He engineers MongoDB aggregation pipelines and compound-indexing strategies over 100 million or more pricing documents to power real-time electronic component discovery. He also develops automated RFQ (request for quotation) ingestion pipelines and multi-currency calculation engines that use Decimal128 precision for money, and integrates LLM APIs into the sourcing workflows.

## Sidharth's Go scheduler work at 1buy.ai

Sidharth Singh builds background jobs on 1buy.ai's Go job scheduler, a service with a goroutine worker pool, a per-job Redis lock and Kafka execution events. He built the alert scanner that runs on it: a handler that evaluates five rule types over MongoDB with semaphore-bounded checks and emails, per-rule cooldowns and idempotent write-backs. He also built the handler registration and boot-time seeding that every later handler follows, and the refactor that turned the service into a generic plug-in scheduler. The alert scanner is the reason the service exists for the product: users watch electronic parts and set rules on price, risk, compliance, lifecycle and alternates.

## Sidharth's Rust-to-WebAssembly work at 1buy.ai

At 1buy.ai, Sidharth Singh shares pricing and formula logic between TypeScript and Rust through one Rust crate compiled to WebAssembly with wasm-bindgen. Rust services call the crate natively; TypeScript services call the same crate compiled to WebAssembly. Batches cross the boundary as columnar Float64Array data rather than per-row objects, which keeps the call cheap for large inputs, and parity tests on both sides fail if the two consumers ever disagree on a number. The result is one source of truth for the numbers that matter most to the product.

## Sidharth's technology stack at 1buy.ai

Sidharth Singh's stack at 1buy.ai, as listed on his resume, is Python, FastAPI, PostgreSQL, Redis, Kafka, TypeScript, NestJS, MongoDB, Go, Rust, WebAssembly and the Claude API. Python and FastAPI carry the order-fulfilment backend on PostgreSQL and Redis. TypeScript and NestJS carry the component-discovery services on MongoDB. Go carries the job scheduler handlers, with Redis locks and Kafka events. Rust compiled to WebAssembly carries the shared pricing formulas. The Claude API parses trade documents and powers the inbound-mail handlers.

## Sidharth's time at RapidShyp

Sidharth Singh worked at RapidShyp, the B2B logistics and shipping platform of Om Logistics Limited, in Gurugram from July 2024 to February 2026. RapidShyp lets sellers bring orders from marketplaces and their own storefronts, ship from several warehouses, and hand parcels to multiple carriers, and the platform's job is to make that look like one order lifecycle: ingest, validate, create shipments, book carriers, track, and keep every system in agreement about the current status. Sidharth held two roles there: Associate Software Engineer from July 2024 to March 2025, then Software Engineer from April 2025 to February 2026, after a promotion.

## Sidharth owned RapidShyp's order-processing hot path

As a Software Engineer at RapidShyp from April 2025 to February 2026, Sidharth Singh owned the order-processing hot path end to end. He built Rust microservices on Actix Web and the Tokio runtime, with async handlers, serde-typed domain models and backpressure-aware worker pools, which raised API concurrency and throughput and cut latency under peak shipping loads. Java services ran alongside where the ecosystem called for it. The shipping platform's hot path is where every order, shipment and status update flows, so correctness under load was the first requirement and speed the second.

## Sidharth's 20,000-order bulk upload at RapidShyp

At RapidShyp, Sidharth Singh hardened the Bulk Orders pipeline to take 20,000 orders in a single upload call. Validation and shipment creation were kept off the request path, so one large upload never blocks the API for other sellers. The flow covers upload and validation, multi-seller shipment creation, and orchestration across warehouses, with Purchase Requisition workflows and approval steps for the B2B side. The 20,000-orders-per-call figure is one of the headline numbers on his site.

## Sidharth's Kafka pipelines at RapidShyp

Sidharth Singh designed and ran the Kafka event pipelines between RapidShyp's services for real-time order processing, shipment status synchronisation and multi-seller fulfilment across marketplace and storefront channels. Downstream systems react to events instead of polling. This is where his production Kafka experience comes from, and it is also why he later chose Kafka from first principles, in Rust, as one of his self-directed deep dives: he had used the knobs he needed and wanted to understand every one of them.

## Sidharth led RapidShyp's carrier integrations

At RapidShyp, Sidharth Singh led the carrier and logistics partner integrations: third-party carrier APIs for shipment creation, tracking and status updates, placed behind one service boundary. Because of that boundary a new carrier is an adapter rather than a rewrite, and sellers on every sales channel ship through one platform. The same adapter approach later shows up in his 1buy.ai work, where DHL booking and tracking and FedEx tracking sit behind a port so that swapping a provider touches one adapter.

## Sidharth scaled RapidShyp's data layer

Sidharth Singh scaled RapidShyp's data layer for high-volume logistics traffic. He tuned schemas and queries across MongoDB and MySQL for high-volume read and write paths, used Redis for low-latency caching, and used TiKV with etcd for distributed key-value storage, service coordination and configuration. That mix of MongoDB, MySQL, Redis, TiKV and etcd is listed on his resume for the role, and it is where his working knowledge of etcd and TiKV comes from.

## Sidharth's ownership and recognition at RapidShyp

On a small team at RapidShyp, Sidharth Singh carried features from design through release and production support. He was recognised with the Customer Obsession Award in May 2025 for exceptional feature ownership, rapid execution, going the extra mile and reliable production delivery. Two months earlier, in March 2025, he had won first place across all engineering teams in RapidShyp's internal hackathon for an innovative prototype built under tight time constraints, and he was promoted to Software Engineer the following month. The certificates for both are available on his site.

## Sidharth's first role: Associate Software Engineer at RapidShyp

Sidharth Singh joined RapidShyp as an Associate Software Engineer in July 2024, straight out of university, and took end-to-end ownership of the B2B Bulk Orders and Purchase Requisition flows in the Order Management System: bulk upload and validation, multi-seller shipment creation, approval workflows and order orchestration at scale. He also brought marketplace and multi-channel seller orders into one fulfilment pipeline, so every sales channel flows through the same order lifecycle and logistics integrations. He held the role until March 2025.

## Sidharth learned Rust on the job

Sidharth Singh learned Rust on the job at RapidShyp. He started on the React and Next.js order-lifecycle dashboards and the Warehouse Management System frontend used daily by operations, then moved onto the Actix Web and Java microservices and the third-party carrier integrations behind them. Along the way he went one layer deeper than each ticket required: async Rust and the Tokio runtime, Kafka's consumer model, MongoDB and MySQL indexing, and Docker for reproducible local environments. That groundwork set up the hot-path Rust work of the following year, and Rust is now his daily-driver language.

## Sidharth's resume

Sidharth Singh's resume is available at https://sidharthsingh.dev/resume as a web page, as a downloadable PDF generated from the same data, and as the original PDF at https://sidharthsingh.dev/cv. Its headline is "Backend engineer building high-throughput distributed systems and AI-powered platforms". It lists his two employers, 1buy.ai and RapidShyp, his B.Tech from VIT Vellore, two awards, three certifications, and his skills grouped into languages, backend and APIs, data and messaging, infrastructure and cloud, AI and search, and frontend. His LinkedIn profile is https://www.linkedin.com/in/sidharthsingh-ss563.
