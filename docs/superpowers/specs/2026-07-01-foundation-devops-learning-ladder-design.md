<!-- @author codex -->
# Foundation And DevOps Learning Ladder Design

## Context

The site already passes the existing numeric gates: 118 topics, 192 questions, 118 topic Markdown files, 192 question Markdown files, and all current coverage minimums. That proves the knowledge base is broad, but it does not prove that a learner can review each domain from first principles to production troubleshooting.

The current content has three visible gaps:

- AI/LLM content starts with useful engineering summaries, but core primitives such as tokenizer, embeddings, Transformer attention, KV cache, inference, decoding, context window, pretraining and alignment are not separated into a step-by-step ladder.
- Prometheus content explains metrics, PromQL, SLO and cardinality, but does not teach Prometheus itself as a system: scrape/pull model, target discovery, exporter, TSDB/WAL/head block, rules, Alertmanager and remote write.
- Docker, Kubernetes and the broader DevOps delivery chain are not a formal domain. They appear only as scattered references in Java, sandbox and system design topics.

## Goal

Add a first production-ready learning-ladder slice that makes the site usable as a from-basic-to-advanced review system, while keeping the existing data model and Markdown generation pipeline intact.

## Design Principles

1. Keep the first slice focused and testable.
   The first implementation should add enough structure to prove the ladder model works, not rewrite every existing article in one pass.

2. Make learning order explicit.
   New paths should read as beginner -> mechanism -> engineering -> troubleshooting -> interview/project expression.

3. Treat foundations as first-class topics.
   Basic concepts are not filler. Tokenization, attention, KV cache, Prometheus scrape/TSDB, Docker image layers and Kubernetes control loops must be reviewable as independent topics.

4. Use official sources for new technical domains.
   New DevOps topics should cite Docker and Kubernetes official documentation. Prometheus mechanism content should cite Prometheus official docs. LLM primitives should cite OpenAI docs and the Transformer paper where appropriate.

5. Add a content gate for learning ladders.
   Current gates check counts and per-topic depth. A new audit should check that required foundational ladders and topic IDs exist.

## Scope

### In Scope

- Add a new audit script for learning ladders.
- Add new source IDs for LLM primitives, Prometheus mechanism and DevOps official sources.
- Add a DevOps / Docker / Kubernetes domain with 8 topics.
- Add foundational LLM topics for tokenizer/embedding, Transformer attention, KV cache/inference and decoding/runtime tradeoffs.
- Add Prometheus mechanism topics for scrape/service discovery and TSDB/rules/Alertmanager.
- Add learning paths that make the staged review order explicit.
- Regenerate Markdown content and run the full validation/build suite.

### Out Of Scope

- Redesigning the UI layout.
- Rewriting all 310 Markdown files by hand in this slice.
- Adding user accounts, quizzes, spaced repetition scheduling or server-side persistence.
- Publishing to GitHub Pages in this slice unless explicitly requested after local validation.

## Content Model

### Learning Ladder Stages

Every future domain should be auditable against these stages:

- `concept`: basic terms, boundaries and mental model.
- `mechanism`: how the system actually works internally.
- `implementation`: production design, data flow and configuration.
- `operations`: troubleshooting, metrics, capacity and failure recovery.
- `interview`: questions, follow-ups, project evidence and tradeoffs.

The first implementation will encode this through required topic IDs and learning paths rather than a new TypeScript type. That keeps the change conservative and compatible with the current UI.

### Required First Slice

AI/LLM foundations:

- `llm-tokenization-embedding`
- `llm-transformer-attention`
- `llm-kv-cache-inference`
- `llm-decoding-runtime-tradeoffs`

Prometheus mechanism:

- `prometheus-scrape-service-discovery`
- `prometheus-tsdb-rules-alertmanager`

DevOps/Docker/Kubernetes:

- `docker-container-image-foundation`
- `dockerfile-buildkit-image-layer`
- `container-runtime-resource-isolation`
- `docker-compose-local-dev`
- `kubernetes-pod-workload-controller`
- `kubernetes-service-ingress-networking`
- `kubernetes-config-secret-storage`
- `kubernetes-observability-release`

## Data Changes

Files to modify:

- `src/data/sources.ts`: add official source IDs for Transformer, tokenization/inference references, Prometheus storage/configuration, Docker docs and Kubernetes docs.
- `src/data/domains.ts`: add `devops-docker-kubernetes`.
- `src/data/categories.ts`: add DevOps categories.
- `src/data/deepSamples.ts`: add topic seed arrays and any handwritten question seeds that need extra precision.
- `src/data/topics.ts`: import and append the new topic arrays.
- `src/data/learningPaths.ts`: add explicit foundation ladder paths.
- `scripts/audit-coverage-map.mjs`: add coverage minimums for the new domain.
- `scripts/audit-learning-ladders.mjs`: new audit gate for required ladder slices.
- `package.json`: add `audit:learning-ladders` and include it in `validate:all`.

Generated files:

- `content/topics/*.md`
- `content/questions/*.md`
- `src/data/markdownContent.ts`

## Validation

The implementation is complete only when all of these pass:

- `npm run audit:learning-ladders`
- `npm run audit:coverage-map`
- `npm run generate:markdown-content`
- `npm run validate:all`
- `npm run audit:technical-depth`
- `npm run build`

## Review Notes

This design intentionally uses the current topic/question/Markdown system. A richer future version can add first-class `LearningStage` metadata and UI filters, but the immediate user value is to make the missing foundations visible and reviewable inside the current site.
