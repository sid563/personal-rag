# About Sidharth Singh

## Who Sidharth Singh is

Sidharth Singh is a backend engineer based in Delhi, India, currently a Software Engineer at 1buy.ai. He builds backends that stay correct under load: event-driven services, job orchestration and data pipelines for platforms that move physical goods. His production work spans procurement, logistics and supply-chain platforms, where the interesting problems are throughput, correctness under concurrency, and keeping many services in agreement about what just happened. His main languages are Rust and TypeScript, with Python and Go used where the job calls for them, and Kafka, PostgreSQL and MongoDB as the data and messaging backbone. His personal site is https://sidharthsingh.dev and his code is at https://github.com/sid563.

## Sidharth's one-line positioning

Sidharth Singh describes himself as a backend engineer building high-throughput distributed systems and AI-powered platforms. The shortest version of what he does is "backends that stay correct under load". The slightly longer version from his site: event-driven services, Kafka pipelines and Rust on the hot paths, for platforms that move physical goods, built by a backend engineer at 1buy.ai in Delhi who is learning PostgreSQL internals and Kafka from first principles, in public. He treats AI coding tools as part of design, implementation and review rather than as a novelty.

## Sidharth's experience in numbers

Sidharth Singh has a little over two years of production experience, across Rust, TypeScript and Python. Four numbers summarise that work. He has engineered MongoDB aggregation pipelines over 100 million or more pricing documents for real-time component discovery at 1buy.ai. He hardened RapidShyp's Bulk Orders pipeline to take 20,000 orders in a single upload call. He built an inbound-mail pipeline with 17 LLM-driven handlers that anchor, classify and act on every email a fulfilment platform receives. And he designed, from scratch, the architecture of an order-fulfilment backend that today serves 293 HTTP endpoints with 60 background task handlers. Every number on his site is meant to be verifiable.

## Where Sidharth lives and works

Sidharth Singh lives in Delhi, India. He works at 1buy.ai, whose office is in Okhla, Delhi, and has been there as a Software Engineer since March 2026. Before that he worked in Gurugram at RapidShyp, the B2B shipping platform of Om Logistics Limited, from July 2024 to February 2026. He studied at Vellore Institute of Technology in Vellore, Tamil Nadu, graduating in June 2024. His site shows Delhi local time in the footer, which is a small hint about where to find him. He is 24 years old as of 2026.

## Sidharth's working principles

Sidharth Singh keeps six working principles on the front page of his site, each one quoted from a project write-up of his. They are: "Correct under load first, then fast." "Backpressure is a permit count, not a thread count." "Facts we already have beat facts a model infers." "Return nothing when unsure; the gap stays visible." "Every number verifiable, every status honest." And "One layer deeper than the job requires." The second comes from his Go alert scanner, which bounds fan-out with a channel of permits; the third and fourth from his inbound-mail pipeline, which lets a model read what nothing else can but verifies everything it says against the database.

## How Sidharth learns

Sidharth Singh's approach to learning is to go one layer deeper than the job requires. At work that has meant async Rust and the Tokio runtime, Kafka's consumer model, MongoDB and MySQL indexing, PostgreSQL locking and queueing behaviour, and Docker for reproducible environments. Outside work it means PostgreSQL query planners, async runtimes, HNSW vector indexing, and the ways distributed systems fail. He prefers a deep "how it works" mental model over surface-level tool usage, and he tracks that learning publicly on his site's roadmap and progress pages so the numbers stay honest. He enjoys hard engineering problems that take weeks to solve and likes exploring new stacks and tools.

## What Sidharth is doing now

As of late October 2026, Sidharth Singh is living in Delhi and working at 1buy.ai on the backend of an AI-powered procurement platform. His main work is the order-fulfilment backend, which takes purchase orders through testing, shipment, customs and escrow on FastAPI and PostgreSQL, a modular monolith he designed as one image in three process roles with Postgres as the queue. Alongside it he keeps 1buy.ai's Go job scheduler handlers and a Rust-to-WebAssembly formula crate healthy in production. He is learning PostgreSQL internals through an eight-week course, currently in its first phase, and Kafka from first principles in Rust.

## What Sidharth is reading and thinking about

Sidharth Singh is currently reading two PostgreSQL books: "PostgreSQL 14 Internals" by Egor Rogov and "The Internals of PostgreSQL" by Hironobu Suzuki. They are the core texts of the internals course he set up for himself. The question he is thinking about, from his now page: how much of "distributed systems knowledge" is really just knowing what a failure looks like from the outside. That thought is also the seed of a roadmap idea he calls the failure-mode lab, where he would build a small three-node system and break it on purpose to learn each failure by its silhouette.

## Sidharth's career goals

Sidharth Singh is focused on building strong engineering fundamentals alongside AI-assisted development. His stated targets, as of 2026, are to operate at an intermediate engineer level within one to one and a half years and at a senior engineer level within two to three years. The path he has chosen for that is depth: PostgreSQL internals, Kafka from first principles, hands-on cloud provisioning with Terraform, and eventually a meaningful open-source contribution in Rust. He is open to conversations about distributed backends and hard infrastructure problems.

## Sidharth's website

Sidharth Singh's personal site, https://sidharthsingh.dev, holds the things a resume cannot: what he is working on now, what he is learning, what he plans to build, and how far along each of those is. It was built as a pilot on 27 October 2026 with Next.js 16, Tailwind 4 and shadcn/ui, and is refined in public. Projects, posts, roadmap items and progress journeys are MDX files with frontmatter validated by Zod, so a bad field fails the build. The site has light and dark themes, keyboard shortcuts, a command palette, system sketches on every project, a printable resume, and its source is public at https://github.com/sid563/sidharthsingh.dev.

## How Sidharth uses AI in his work

Sidharth Singh treats AI coding tools as part of design, implementation and review, not as a replacement for understanding. In production he integrates LLMs as components inside real workflows: Claude parses trade documents such as packing lists, Bills of Entry and provider invoices in the fulfilment backend, and an LLM-assisted pipeline reads the platform's inbound mail. His rule for those systems is that a model may widen what the software can read but never what it is willing to believe; every reference a model proposes is verified against the database before anything acts on it. He also built a personal retrieval-augmented chat service, the basis of the chatbot on his site.
