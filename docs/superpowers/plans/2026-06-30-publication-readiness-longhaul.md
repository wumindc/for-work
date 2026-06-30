# Publication Readiness Longhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. This is a long-running editorial plan; do not claim completion until every current Markdown article has been reviewed, upgraded, verified, and recorded.

**Goal:** Review and upgrade all published knowledge articles so they are rigorous enough for public readers, not only locally useful as a generated interview notebook.

**Architecture:** Keep `content/topics` and `content/questions` as the source of truth, but add an advisory publication-readiness audit that scores every article. Work in repeatable batches: generate the audit report, pick the highest-priority documents, manually improve the text, rerun the report, and record the next backlog.

**Tech Stack:** Markdown content, Node/tsx audit scripts, React/Vite static site, Mermaid diagrams, existing data files under `src/data`.

---

## Quality Bar

Every public article should eventually satisfy these editorial requirements:

- The article has a clear thesis and does not only list template paragraphs.
- Mechanism is explained through state, data flow, protocol fields, failure paths, or runtime behavior.
- Mermaid diagrams have numbered captions and nearby explanation of nodes, boundaries, and state changes.
- Claims are bounded: the article explains where the method works, where it does not, and what failure looks like.
- Sources are not decorative links; each source states which conclusion it supports.
- Interview answers are speakable: 30-second answer, longer answer, follow-up probes, project answer, counterexamples, and common mistakes.
- Operational detail is present: metrics, trace/log evidence, rollback or mitigation, root cause, and regression checks.
- Tone is professional: no hype words, unsupported ranking claims, or absolute promises without context.

## Files

- Create/modify: `scripts/audit-publication-readiness.mjs`
  Advisory full-site audit with score, issue codes, domain summary, and top revision targets.
- Modify: `package.json`
  Adds `audit:publication-readiness` and `audit:publication-readiness:strict`.
- Generate: `docs/content-audits/publication-readiness-report.md`
  Current scorecard and backlog.
- Modify in batches: `content/topics/*.md`
  Upgrade knowledge articles.
- Modify in batches: `content/questions/*.md`
  Upgrade interview-answer articles.

## Batch Workflow

### Task 1: Refresh Audit Baseline

- [x] Run `npm run audit:publication-readiness`.
- [x] Confirm the report covers all current Markdown documents.
- [x] Use the first 50 revision targets as the default queue.

Expected current baseline:

- 310 documents total.
- 118 topic articles.
- 192 question articles.
- Report path: `docs/content-audits/publication-readiness-report.md`.

### Task 2: Burn Down Blockers First

Priority order:

1. `content/questions/q-ai-chatgpt-runtime-core.md`
2. `content/questions/q-es-query-optimization.md`
3. `content/questions/q-ai-llm-foundation-deep.md`
4. Remaining blocker documents from the latest report.

For each article:

- [x] Remove unsupported performance/ranking claims or add explicit evidence and benchmark scope.
- [x] Add or fix numbered Mermaid caption.
- [x] Add nearby diagram explanation.
- [x] Add missing source intent lines.
- [x] Add missing incident or operational section when relevant.
- [x] Run `npm run audit:publication-readiness` and confirm the article is no longer `blocked`.

### Task 3: Upgrade AI Agent / RAG Question Backlog

The first report shows most low-score items are AI Agent / RAG generated interview answers. Work in five-document batches:

- [x] `q-planning-methods-core`
- [x] `q-ai-llm-training-core`
- [x] `q-react-loop-core`
- [x] `q-playwright-actions-deep`
- [x] `q-agent-definition-deep`
- [x] `q-agent-failure-modes-core`
- [x] `q-agent-failure-modes-deep`
- [x] `q-langgraph-core`
- [x] `q-langgraph-deep`
- [x] `q-planning-methods-deep`
- [x] `q-react-loop-deep`
- [x] `q-reflection-review-core`
- [x] `q-reflection-review-deep`
- [x] `q-browser-observation-core`
- [x] `q-browser-observation-deep`
- [x] `q-context-compression-core`
- [x] `q-handoff-pattern-deep`
- [x] `q-long-term-memory-deep`
- [x] `q-memory-decay-core`
- [x] `q-memory-decay-deep`
- [x] `q-openai-agents-sdk-deep`
- [x] `q-playwright-actions-core`
- [x] `q-state-management-core`
- [x] `q-state-management-deep`
- [x] `q-web-agent-project-core`
- [x] `q-agent-core-modules-core`
- [x] `q-agent-core-modules-deep`
- [x] `q-agent-definition-core`
- [x] `q-ai-agent-boundary-structured`
- [x] `q-ai-tool-contract-structured`
- [x] `q-ai-eval-observability-structured`
- [x] `q-ai-chatgpt-runtime-deep`
- [x] `q-ai-llm-foundation-core`
- [x] `q-ai-llm-training-deep`
- [x] `q-coding-harness-deep`
- [x] `q-context-compaction-deep`
- [x] `q-framework-selection-deep`
- [x] `q-function-calling-deep`
- [x] `q-hybrid-search-core`
- [x] `q-hybrid-search-deep`
- [x] `q-openai-agents-sdk-core`
- [x] `q-paper-agent-project-core`
- [x] `q-project-storytelling-core`
- [x] `q-project-storytelling-deep`
- [x] `q-rerank-deep`
- [x] `q-swe-bench-core`
- [x] `q-swe-bench-deep`
- [x] `q-trajectory-eval-core`
- [x] `q-trajectory-eval-deep`
- [x] `q-travel-agent-project-deep`
- [x] `q-web-agent-eval-deep`
- [x] `q-workflow-vs-agent-deep`
- [x] `q-a2a-acp-deep`
- [x] `q-agentic-rag-deep`
- [x] `q-ai-rag-memory-structured`
- [x] `q-citation-grounding-core`
- [x] `q-citation-grounding-deep`
- [x] `q-coding-harness-core`
- [x] `q-context-compaction-core`
- [x] `q-context-compression-deep`
- [x] `q-context-layers-deep`
- [x] `q-framework-selection-core`
- [x] `q-handoff-pattern-core`
- [x] `q-multi-agent-roles-core`
- [x] `q-paper-agent-project-deep`
- [x] `q-rerank-core`
- [x] `q-sandbox-core`
- [x] `q-sandbox-deep`
- [x] `q-short-term-memory-core`
- [x] `q-short-term-memory-deep`
- [x] `q-tool-permissions-core`
- [x] `q-tool-permissions-deep`
- [x] `q-travel-agent-project-core`
- [x] `q-web-agent-eval-core`
- [x] `q-web-agent-project-deep`
- [x] `q-workflow-vs-agent-core`
- [x] `q-a2a-acp-core`
- [x] `q-agentic-rag-core`
- [x] `q-component-eval-core`
- [x] `q-component-eval-deep`
- [x] `q-context-layers-core`
- [x] `q-guardrails-core`
- [x] `q-guardrails-deep`
- [x] `q-long-term-memory-core`
- [x] `q-mcp-fundamentals-core`
- [x] `q-mcp-fundamentals-deep`
- [x] `q-multi-agent-roles-deep`
- [x] `q-prompt-injection-core`
- [x] `q-prompt-injection-deep`
- [x] `q-rag-pipeline-core`
- [x] `q-rag-pipeline-deep`
- [x] `q-skills-core`
- [x] `q-skills-deep`
- [x] `q-tool-error-recovery-core`
- [x] `q-tool-error-recovery-deep`
- [x] `q-function-calling-core`
- [x] `q-tool-registry-core`
- [x] `q-tool-registry-deep`
- [x] `q-tool-schema-core`
- [x] `q-tool-schema-deep`
- [x] `q-trace-replay-core`
- [x] `q-trace-replay-deep`

AI Agent / RAG topic backlog:

- [x] `a2a-acp`
- [x] `agent-definition`
- [x] `agent-core-modules`
- [x] `agent-failure-modes`
- [x] `agentic-rag`
- [x] `context-compaction`
- [x] `hybrid-search`
- [x] `langgraph`
- [x] `llm-training-alignment`
- [x] `playwright-actions`
- [x] `planning-methods`
- [x] `project-storytelling`
- [x] `react-loop`
- [x] `tool-schema`
- [x] `web-agent-eval`
- [x] `web-agent-project`
- [x] `framework-selection`
- [x] `guardrails`
- [x] `handoff-pattern`
- [x] `multi-agent-roles`
- [x] `browser-observation`
- [x] `citation-grounding`
- [x] `coding-harness`
- [x] `context-compression`
- [x] `llm-foundation`
- [x] `memory-decay`
- [x] `paper-agent-project`
- [x] `swe-bench`
- [x] `tool-error-recovery`
- [x] `tool-permissions`
- [x] `tool-registry`
- [x] `travel-agent-project`
- [x] `reflection-review`
- [x] `rerank`
- [x] `sandbox`
- [x] `skills`
- [x] `chatgpt-runtime`
- [x] `component-eval`
- [x] `context-layers`
- [x] `long-term-memory`
- [x] `openai-agents-sdk`
- [x] `prompt-injection`
- [x] `short-term-memory`
- [x] `state-management`
- [x] `trace-replay`
- [x] `trajectory-eval`
- [x] `workflow-vs-agent`

Post-publish thin-depth deepening:

- [x] `agent-core-modules`
- [x] `agent-failure-modes`
- [x] `agentic-rag`
- [x] `browser-observation`
- [x] `citation-grounding`
- [x] `coding-harness`
- [x] `context-compaction`
- [x] `context-compression`
- [x] `context-layers`
- [x] `framework-selection`
- [x] `guardrails`
- [x] `handoff-pattern`
- [x] `hybrid-search`
- [x] `langgraph`
- [x] `llm-foundation`
- [x] `llm-training-alignment`
- [x] `mcp-fundamentals`
- [x] `memory-decay`
- [x] `multi-agent-roles`
- [x] `paper-agent-project`
- [x] `planning-methods`
- [x] `playwright-actions`
- [x] `project-storytelling`
- [x] `prompt-injection`
- [x] `q-agent-definition-deep`
- [x] `q-ai-chatgpt-runtime-core`
- [x] `q-ai-eval-observability-structured`
- [x] `q-ai-llm-foundation-core`
- [x] `q-ai-llm-foundation-deep`
- [x] `q-ai-llm-training-core`
- [x] `q-ai-llm-training-deep`
- [x] `q-langgraph-deep`
- [x] `q-planning-methods-core`
- [x] `q-planning-methods-deep`
- [x] `q-react-loop-core`
- [x] `q-workflow-vs-agent-core`
- [x] `rag-pipeline`
- [x] `react-loop`
- [x] `reflection-review`
- [x] `rerank`
- [x] `sandbox`
- [x] `short-term-memory`
- [x] `skills`
- [x] `swe-bench`
- [x] `tool-error-recovery`
- [x] `tool-permissions`
- [x] `tool-registry`
- [x] `tool-schema`
- [x] `trace-replay`
- [x] `trajectory-eval`
- [x] `web-agent-eval`
- [x] `web-agent-project`
- [x] `workflow-vs-agent`
- [x] `agent-state-file-verifier`
- [x] `ai-code-review-pipeline`
- [x] `codex-claude-context-workflow`
- [x] `computer-use-agent-benchmark`
- [x] `design-assets-for-ai-coding`
- [x] `enterprise-agent-solution-map`
- [x] `loop-engineering-agent-runtime`
- [x] `rag-document-ingestion-stack`
- [x] `self-growing-knowledge-base`
- [x] `skill-packaging-workflow`
- [x] `db-backup-recovery-migration`
- [x] `db-index-execution-plan`
- [x] `db-lock-deadlock-troubleshooting`
- [x] `db-online-ddl-schema-change`
- [x] `db-replication-read-write-splitting`
- [x] `db-sharding-partitioning`
- [x] `db-sql-join-optimization`
- [x] `es-query-aggregation-optimization`
- [x] `es-rag-hybrid-search`
- [x] `es-shards-write-path`
- [x] `es-use-cases-boundary`
- [x] `q-es-query-optimization`
- [x] `q-es-rag-hybrid-search`
- [x] `java-classloading-spi`
- [x] `java-completablefuture-async-timeout`
- [x] `java-concurrent-collections-cas`
- [x] `java-locks-aqs-synchronized-reentrantlock`
- [x] `java-memory-model-volatile-happens-before`
- [x] `java-thread-pool-governance`
- [x] `jvm-gc-troubleshooting`

For each question:

- [ ] Make the 30-second answer precise and bounded.
- [ ] Add `## 多轮追问模拟` if missing.
- [ ] Make each follow-up include answer points, what it tests, and a trap.
- [ ] Add source intent and at least two credible references when the topic needs factual support.
- [ ] Remove risky absolute wording or explain the condition under which it is true.

### Task 4: Upgrade Traditional Engineering Backlog

Work after the first AI Agent / RAG batch:

- [x] Elasticsearch low-score questions and topics.
  - [x] `q-es-boundary-inverted-index`
  - [x] `q-es-query-optimization`
  - [x] `q-es-rag-hybrid-search`
  - [x] `es-rag-hybrid-search`
  - [x] `es-shards-write-path`
  - [x] `es-query-aggregation-optimization`
  - [x] `es-use-cases-boundary`
  - [x] `es-inverted-index-mapping`
  - [x] `q-es-index-shard-write`
- [ ] MQ transaction and ordering questions.
  - [x] `q-mq-transaction-message`
  - [x] `q-mq-ordering`
  - [x] `mq-transactional-messaging`
  - [x] `mq-consumer-governance`
  - [x] `mq-ordering-partitioning`
  - [x] `mq-use-cases-boundary`
  - [x] `mq-reliable-delivery-idempotency`
  - [x] `q-mq-consumer-lag`
  - [x] `q-mq-reliable-delivery`
- [ ] Database low-score questions.
  - [x] `q-db-index-execution-plan`
  - [x] `q-db-mvcc-transaction-isolation`
  - [x] `db-index-execution-plan`
  - [x] `db-mvcc-transaction-isolation`
- [x] Redis questions with missing sources.
  - [x] `redis-data-types-encoding`
  - [x] `redis-hotkey-breakdown-avalanche`
  - [x] `redis-replication-sentinel-cluster`
  - [x] `q-redis-cache-consistency`
  - [x] `q-redis-hotkey-breakdown-avalanche`
  - [x] `q-redis-data-types-encoding`
  - [x] `q-redis-distributed-lock-rate-limit`
  - [x] `q-redis-lua-transaction-pipeline`
  - [x] `q-redis-persistence-aof-rdb`
  - [x] `redis-cache-consistency`
  - [x] `redis-distributed-lock-rate-limit`
  - [x] `redis-persistence-aof-rdb`
- [ ] Prometheus and observability low-score questions.
  - [x] `prometheus-metrics-promql`
  - [x] `observability-incident-tracing`
  - [x] `q-observability-incident-tracing`
  - [x] `q-prometheus-metrics-promql`
- [x] Java/JVM low-score topics and blocked documents.
  - [x] `java-classloading-spi`
  - [x] `java-completablefuture-async-timeout`
  - [x] `java-concurrent-collections-cas`
  - [x] `java-locks-aqs-synchronized-reentrantlock`
  - [x] `java-memory-model-volatile-happens-before`
  - [x] `java-thread-pool-governance`
  - [x] `jvm-gc-troubleshooting`
  - [x] `q-java-thread-pool-governance`
  - [x] `q-jvm-gc-troubleshooting`
- [ ] System-design blocked documents.
  - [x] `distributed-idempotency-retry-timeout`
  - [x] `distributed-transaction-saga-outbox`
  - [x] `q-distributed-idempotency-retry-timeout`
  - [x] `q-distributed-transaction-saga-outbox`
- [ ] Web engineering low-score questions.
  - [x] `web-api-contract-idempotency-security`
  - [x] `web-http-cache-session-auth`
  - [x] `q-web-api-contract-idempotency-security`
  - [x] `q-web-http-cache-session-auth`
- [x] AI engineering trend documents.
  - [x] `agent-memory-layering-compression`
  - [x] `agent-state-file-verifier`
  - [x] `ai-code-review-pipeline`
  - [x] `codex-claude-context-workflow`
  - [x] `computer-use-agent-benchmark`
  - [x] `design-assets-for-ai-coding`
  - [x] `enterprise-agent-solution-map`
  - [x] `loop-engineering-agent-runtime`
  - [x] `local-ai-inference-stack`
  - [x] `q-local-ai-inference-stack-core`
  - [x] `q-local-ai-inference-stack-deep`
  - [x] `rag-document-ingestion-stack`
  - [x] `self-growing-knowledge-base`
  - [x] `skill-packaging-workflow`

Each batch should preserve domain terminology and avoid importing AI-specific phrases where traditional engineering terms are more precise.

### Task 5: Verification After Every Batch

Run:

```bash
npm run validate:all
npm run audit:technical-depth
npm run audit:content-rigor
npm run audit:publication-readiness
npm run build
```

Expected:

- Existing blocking validations pass.
- Publication readiness backlog decreases or becomes more accurate.
- Build succeeds; Vite chunk warning is acceptable unless unrelated changes make it worse.

### Task 6: Promotion Criteria

Only consider the long-running objective complete when:

- `audit:publication-readiness:strict` passes.
- Every article has been manually reviewed or intentionally exempted with a written reason.
- `validate:all`, `audit:technical-depth`, `audit:content-rigor`, and `build` pass after the final batch.
- A browser preview confirms at least one topic and one question from every domain render correctly.
