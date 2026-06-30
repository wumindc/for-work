# Interview Coverage Expansion Roadmap

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to expand one domain at a time. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the site from a sample-ready knowledge base into a comprehensive interview review system, where every non-planned domain has enough high-frequency topics, questions, diagrams, tables, sources, and troubleshooting material for real review.

**Architecture:** Use `scripts/audit-coverage-map.mjs` as the red-light coverage gate. Expand one domain per batch by adding categories, topic data, handwritten interview questions, learning path nodes, generated Markdown, and verification evidence.

**Tech Stack:** Vite, React, TypeScript data modules, Markdown content files, Mermaid rendering, Node/tsx validation scripts.

---

## Coverage Gate

Run:

```bash
npm run audit:coverage-map
```

Current meaning:

- Passing domains have enough breadth for this phase.
- Failing domains still need more topic/question/category coverage before the full goal can close.
- The command is expected to fail while any traditional domain remains under-covered.

## Batch Status

- [x] **Batch 1: Redis coverage**
  - Added Redis data structures, memory/expiration/eviction, persistence, high availability, distributed lock/rate limiting, Lua/transaction/pipeline.
  - Redis now has 8 topics, 10 questions, and 6 categories.
  - Redis passes `audit:coverage-map`.

- [x] **Batch 2: Database coverage**
  - Added SQL Join/query optimization, lock/deadlock troubleshooting, replication/read-write splitting, sharding/partitioning, backup/recovery/migration, and Online DDL/schema evolution.
  - Database now has 8 topics, 10 questions, and 5 categories.
  - Database passes `audit:coverage-map`.

- [x] **Batch 3: Java/JVM coverage**
  - Added JMM/volatile/happens-before, synchronized/ReentrantLock/AQS, ConcurrentHashMap/CAS, CompletableFuture async orchestration, ClassLoader/SPI, and JVM memory diagnostics.
  - Java/JVM now has 8 topics, 12 questions, and 5 categories.
  - Java/JVM passes `audit:coverage-map`.

- [x] **Batch 4: Observability coverage**
  - Added structured logging/correlation, SLO burn-rate alerting, Dashboard/Runbook/incident review, and cardinality/capacity/cost governance.
  - Observability now has 6 topics, 8 questions, and 5 categories.
  - Observability passes `audit:coverage-map`.

- [x] **Batch 5: Distributed systems coverage**
  - Added load balancing/routing, rate limiting/circuit breaking/bulkheads, service discovery/config, consistency/consensus/leader election, multi-region disaster recovery, and capacity/hotspot planning.
  - System Design now has 8 topics, 10 questions, and 5 categories.
  - System Design passes `audit:coverage-map`.

- [x] **Batch 6: Web engineering coverage**
  - Added browser security/CORS/CSRF/XSS/CSP, session/token/OAuth, CDN/cache/upload/download, WebSocket/SSE, gateway/BFF/API versioning, and frontend-backend contract observability.
  - Web Engineering now has 8 topics, 11 questions, and 5 categories.
  - Web Engineering passes `audit:coverage-map`.

## Per-Batch Definition Of Done

Each domain batch must:

- Add enough categories, topics, and questions for `audit:coverage-map` to pass that domain.
- Keep `npm run validate:all` passing.
- Keep `npm run audit:technical-depth` passing for every Markdown file.
- Keep `npm run audit:content-rigor` passing for high-frequency samples.
- Run `npm run build`; the known Vite chunk warning is acceptable while the build exits successfully.
- Inspect at least one new knowledge page and one new question page in the browser when UI or Markdown rendering behavior changes.

## Latest Verification

Batch 6 finished with:

- `npm run validate:data` passing for 106 topics, 168 questions, 4 project evidence tracks, and 106 deep dives.
- `npm run generate:markdown-content` created 6 Web Engineering topic documents and 8 Web Engineering question documents.
- `npm run audit:technical-depth` passing for 106 topics and 168 questions.
- `npm run validate:all` passing, including graph, Markdown, content quality, and interview UI contract checks.
- `npm run audit:coverage-map` passing for all 9 non-planned domains.
- `npm run audit:content-rigor` passing for 22 sampled documents.
- `npm run build` passing with the existing Vite large-chunk warning.
