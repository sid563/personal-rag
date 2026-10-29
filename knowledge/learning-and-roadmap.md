# Sidharth Singh's learning, roadmap and writing

## Sidharth's roadmap at a glance

Sidharth Singh keeps a public roadmap at https://sidharthsingh.dev/roadmap with seven items across five themes. In progress: PostgreSQL internals, properly (Q4 2026); Kafka from first principles (2026 to 2027); and this site, version one (November 2026). Planned: a chatbot that knows the site (November 2026), and cloud and DevOps hands on (2027). Ideas: a failure-mode lab and a meaningful open-source contribution in Rust. Three of them have progress journeys with milestones, percentages and dated logs at https://sidharthsingh.dev/progress, and the progress page also shows his GitHub activity calendar.

## Sidharth is learning PostgreSQL internals

Sidharth Singh is working through an eight-week, self-directed PostgreSQL internals course, started on 26 September 2026 and self-rated at about ten percent in late October 2026. The goal is to go from writing SQL to explaining what the planner, storage engine and MVCC are doing underneath it, and to be the person on the team who can read an EXPLAIN (ANALYZE, BUFFERS) and say exactly why it looks like that. The phases are lab setup and system catalogs; architecture and the life of a query; storage with pages, tuples and TOAST; MVCC and locks; indexes; the planner; WAL, memory and durability; features; and observability and operations. He runs experiments on a local Postgres 18 container and ships one improvement to a real project per phase.

## Why Sidharth chose internals first for Postgres

For two years most of Sidharth Singh's production data work was MongoDB: aggregation pipelines, compound indexes, Decimal128 wherever money shows up. Then the order-fulfilment service he works on landed on PostgreSQL, and he noticed he could write the SQL but could not explain what the planner would do with it. So he set up an eight-week course for himself, with a tutor that writes the assignments and reviews the notes, ordered internals first. His bet: if he understands how a tuple is laid out on a page and how MVCC decides what a transaction can see, every feature on top becomes a consequence rather than a fact to memorise. His two core texts are Egor Rogov's "PostgreSQL 14 Internals" and Hironobu Suzuki's "The Internals of PostgreSQL".

## Sidharth is learning Kafka from first principles

Sidharth Singh has used Kafka in production at two companies, and his Kafka mastery journey is about understanding every knob rather than the ones he happened to need. Started on 22 June 2026 and self-rated at about twenty percent, it is one evolving pipeline built from scratch in Rust with rdkafka: order events become validated events, then priced events, then customer totals, with a dead-letter topic. It grows through nine phases: a KRaft cluster in Docker with the Rust toolchain (done); the log, offset and partition model; producers with batching, acks and idempotence; consumer groups and rebalancing; delivery semantics, exactly-once and dead-letter queues; schemas and a registry; three-broker internals and operations; stream-processing patterns; and performance, lag tuning, failure drills and a capstone.

## Sidharth's cloud and DevOps roadmap

Sidharth Singh has deployed containers to servers and restarted services after deploys, but has never built the network and IAM underneath from nothing, and his cloud and DevOps roadmap closes that gap. The plan: provision real infrastructure from scratch with VPCs, subnets, IAM and security groups; put a Dockerised Rust service on ECS Fargate behind an ALB; rebuild all of it with Terraform; and wire up CI/CD with GitHub Actions, secrets and CloudWatch. Certifications along the way: AWS Solutions Architect Associate (SAA-C03), then DVA-C02 or SOA-C02, then the Certified Kubernetes Administrator (CKA). The journey started on 3 May 2026 when he deployed his personal RAG service to EC2 by hand, and is self-rated at about ten percent. His rule: never click something in the console without asking whether it could have been Terraform.

## Sidharth's failure-mode lab idea

The failure-mode lab is a roadmap idea of Sidharth Singh's, filed under distributed systems with a "someday" timeframe. The plan is to build a small three-node system with a queue, a database and a cache, then break it on purpose: partitions, clock skew, slow disks, split brain, and write up what each failure looks like from the outside. His reasoning: most of what he knows about distributed-systems failure modes comes from reading, and he wants the scar tissue. It connects to the question on his now page, how much of distributed-systems knowledge is really knowing what a failure looks like from the outside.

## Sidharth's open-source Rust goal

A meaningful open-source contribution in Rust is on Sidharth Singh's roadmap for 2027, under the theme of craft. The goal is to land a non-trivial change in a crate he depends on at work, most likely in the Kafka or async-database space, and to write up the review process. His reasoning: reading other people's production Rust is the fastest way he knows to get better at writing it. Rust is his daily-driver language, with Actix Web, Tokio, serde, rdkafka and wasm-bindgen in regular use.

## The chatbot on Sidharth's site

Sidharth Singh's roadmap includes a chatbot that knows his site, with a November 2026 timeframe: an assistant in the corner of every page that answers questions about his work, resume, roadmap and progress, grounded in the same content that renders the site. The plan calls for retrieval over the content, an API, and an honest "I don't know" when the files do not say. It runs on his personal RAG service, a NestJS application with MongoDB Atlas Vector Search for retrieval and a Groq-hosted Llama model for answers. The assistant answers only from Sidharth's published content and will say so when a question falls outside it.

## Sidharth's site, version one

"This site, version one" is an in-progress roadmap item of Sidharth Singh's. The pilot shipped on 27 October 2026 and everything since is refinement: design passes, resume PDF export, OG images per page, GitHub activity on the progress page, and a proper domain at https://sidharthsingh.dev. He wrote about it in "Building this site in public": he wanted one place that holds the things a resume cannot, what he is working on now, what he is learning, what he plans to build, and how far along each of those is. The design decisions were Next.js 16, Tailwind 4 and shadcn/ui; content as typed MDX files validated by Zod; calm by default, typography first with one accent colour; and light and dark from day one.

## Sidharth's writing

Sidharth Singh writes at https://sidharthsingh.dev/writing. Two posts are published as of late October 2026. "Building this site in public" (27 October 2026) is the changelog and decision record for his site's pilot. "Why I am learning Postgres from the inside out" (27 October 2026) explains his internals-first plan for PostgreSQL after two years of shipping on MongoDB. Posts come as articles, notes and essays, and tags link related pieces. The themes he writes about are PostgreSQL, Kafka, distributed-systems failure modes, and learning in public, and he keeps the numbers in his posts honest by tracking them on the progress page.

## How Sidharth learns in public

Sidharth Singh describes his site as the place where he keeps his learning honest and in public. Each roadmap item that becomes a journey gets a progress page with a target, milestones, a self-rated percentage and a dated log, so anyone can see what he has actually done rather than what he intends to do. The progress page also shows his GitHub contribution calendar for the account sid563. His stated principle is "every number verifiable, every status honest", and the same rule applies to the numbers on his project pages, which are counted from the repositories and dated.
