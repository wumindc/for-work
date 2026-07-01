<!-- @author codex -->
# AI Career P0 Knowledge Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first P0 AI-career knowledge expansion domains identified in `docs/superpowers/specs/2026-07-01-ai-career-knowledge-gap-analysis.md`.

**Architecture:** Keep the existing static TypeScript data architecture. Add an AI-career coverage audit first, then wire sources, domains, categories, generated topic specs, learning paths, coverage minimums, Markdown generation scaffolds and generated content.

**Tech Stack:** React, TypeScript, Vite, static data modules, Node/tsx scripts, generated Markdown content.

---

## Scope

This plan implements the first four P0 domains:

- `python-ai-engineering`: Python AI 工程与 API 服务。
- `llmops-eval-quality`: LLMOps、Eval 与 AI 质量工程。
- `production-rag-data-infra`: 生产级 RAG 数据工程与向量检索基础设施。
- `ai-career-portfolio`: AI 求职作品集与项目表达。

The P1/P2 domains from the analysis document remain follow-up work:

- `llm-serving-inference-infra`
- `model-customization-finetuning`
- `multimodal-document-voice-ai`
- `ai-security-governance`
- `ai-platform-vendor-ecosystem`

## Files

- Create: `scripts/audit-ai-career-coverage.mjs`
- Modify: `package.json`
- Modify: `scripts/audit-coverage-map.mjs`
- Modify: `scripts/generate-markdown-content.mjs`
- Modify: `src/data/sources.ts`
- Modify: `src/data/domains.ts`
- Modify: `src/data/categories.ts`
- Modify: `src/data/deepSamples.ts`
- Modify: `src/data/topics.ts`
- Modify: `src/data/learningPaths.ts`
- Generate: `content/topics/*.md`
- Generate: `content/questions/*.md`

## Required P0 Topics

### Python AI Engineering

- `python-runtime-env-dependency-packaging`
- `fastapi-pydantic-async-service`
- `python-http-client-timeout-retry-streaming`
- `ai-provider-sdk-integration-patterns`
- `structured-output-schema-validation`
- `pytest-ai-api-testing-fixtures`
- `async-worker-background-task-cancellation`
- `python-observability-opentelemetry`
- `python-config-secret-deployment`
- `ai-service-rate-limit-quota-cost`
- `java-spring-python-ai-service-integration`
- `python-code-quality-typing-ruff-mypy`

### LLMOps Eval Quality

- `eval-fixture-grader-rubric-threshold`
- `golden-dataset-production-sample-loop`
- `llm-as-judge-calibration-drift`
- `rag-eval-retrieval-groundedness`
- `agent-eval-tool-state-task-success`
- `online-shadow-evaluation`
- `trace-driven-failure-clustering`
- `prompt-model-config-registry-release`
- `ai-release-gate-cicd`
- `safety-eval-red-teaming`
- `quality-cost-latency-tradeoff`
- `ai-incident-regression-case`

### Production RAG Data Infra

- `document-parsing-pdf-word-html-table-formula`
- `ocr-layout-aware-chunking`
- `chunking-parent-child-semantic-window`
- `rag-metadata-acl-tenant-lineage`
- `embedding-model-selection-dimension-cost`
- `vector-index-hnsw-ivf-pq-diskann`
- `filter-pushdown-hybrid-search`
- `rerank-cross-encoder-llm-judge`
- `incremental-index-delete-reindex-version`
- `no-answer-low-confidence-conflict-evidence`
- `retrieval-observability-ablation`
- `rag-data-security-permission-leakage`

### AI Career Portfolio

- `ai-feature-discovery-business-fit`
- `human-in-the-loop-approval-ux`
- `confidence-citation-fallback-ux`
- `ai-product-metrics-adoption-quality-cost`
- `failure-ux-no-answer-uncertainty`
- `demo-to-production-readiness-gap`
- `ai-project-one-pager-architecture-metrics`
- `resume-bullet-ai-project-impact`
- `interview-project-storytelling-5-15-45`
- `takehome-system-design-ai-template`
- `github-portfolio-readme-eval-report`
- `behavioral-interview-ai-failure-tradeoff`

## Tasks

### Task 1: Add Red Coverage Gate

**Files:**
- Create: `scripts/audit-ai-career-coverage.mjs`
- Modify: `package.json`

- [x] **Step 1: Create failing audit**

Create `scripts/audit-ai-career-coverage.mjs` that validates:

- All four P0 domains exist and are `sample_ready`.
- Each P0 domain has at least 12 categories, 12 topics and 24 questions.
- Each required topic exists, has at least 2 questions and has `deepDive`.
- Each required learning path exists and contains every required topic.

- [x] **Step 2: Verify red**

Run:

```bash
npm run audit:ai-career-coverage
```

Expected before implementation: fail with missing domains, topics and learning paths.

- [x] **Step 3: Wire script**

Add:

```json
"audit:ai-career-coverage": "tsx scripts/audit-ai-career-coverage.mjs"
```

Add `npm run audit:ai-career-coverage` to `validate:all` after `audit:career-ladders`.

### Task 2: Add Domains, Categories, Sources And Coverage Minimums

**Files:**
- Modify: `src/data/sources.ts`
- Modify: `src/data/domains.ts`
- Modify: `src/data/categories.ts`
- Modify: `scripts/audit-coverage-map.mjs`

- [x] **Step 1: Add sources**

Add official or authoritative sources for Python, FastAPI, Pydantic, pytest, OpenTelemetry Python, OpenAI production/evals/fine-tuning docs, Anthropic agent/eval/context engineering articles, LangSmith observability/eval docs, LlamaIndex production RAG, Milvus/OpenSearch vector search, vLLM/NVIDIA NIM, and Microsoft/Google/AWS AI platform docs.

- [x] **Step 2: Add domains**

Add `sample_ready` domains:

- `python-ai-engineering`
- `llmops-eval-quality`
- `production-rag-data-infra`
- `ai-career-portfolio`

- [x] **Step 3: Add categories**

Add 12 categories per P0 domain. Category IDs must align with the topic grouping in this plan.

- [x] **Step 4: Add coverage minimums**

Update `scripts/audit-coverage-map.mjs` so each new P0 domain requires:

- 12 categories
- 12 topics
- 24 questions

### Task 3: Add Generated Topic Specs And Questions

**Files:**
- Modify: `src/data/deepSamples.ts`
- Modify: `src/data/topics.ts`

- [x] **Step 1: Add deep-dive wrapper**

In `src/data/deepSamples.ts`, add `aiCareerDeepDive(...)` following the existing generated-topic wrapper pattern.

- [x] **Step 2: Add four topic spec arrays**

Add:

- `pythonAiEngineeringTopicSpecs`
- `llmopsEvalQualityTopicSpecs`
- `productionRagDataInfraTopicSpecs`
- `aiCareerPortfolioTopicSpecs`

Each topic must include summary, mustRemember, details, engineeringNotes, commonPitfalls, sourceIds, projectEvidenceIds, definition, principles, industrySolutions, engineeringDetails, tradeoffs, experienceBridge, hooks and metrics.

- [x] **Step 3: Export generated topic arrays**

Export:

- `pythonAiEngineeringTopics`
- `llmopsEvalQualityTopics`
- `productionRagDataInfraTopics`
- `aiCareerPortfolioTopics`

Each topic must be built with `buildGeneratedTopic(...)`, producing `q-<topic-id>-core` and `q-<topic-id>-deep`.

- [x] **Step 4: Add generated questions**

Add the four arrays to `ladderQuestionTopics`.

- [x] **Step 5: Wire `topics.ts`**

Import and spread the four arrays in `src/data/topics.ts`.

### Task 4: Add Learning Paths

**Files:**
- Modify: `src/data/learningPaths.ts`

- [x] **Step 1: Add P0 paths**

Add:

- `python-ai-application-engineering-review`
- `llmops-eval-quality-review`
- `production-rag-data-infra-review`
- `ai-career-portfolio-interview-review`

Each path must include all required topics in the same conceptual order as the analysis document.

- [x] **Step 2: Run green audit checks**

Run:

```bash
npm run validate:data
npm run audit:ai-career-coverage
npm run audit:coverage-map
```

Expected after implementation: all pass.

### Task 5: Extend Markdown Generator And Generate Content

**Files:**
- Modify: `scripts/generate-markdown-content.mjs`
- Generate: `content/topics/*.md`
- Generate: `content/questions/*.md`

- [x] **Step 1: Add generator playbooks**

Add `playbookFor(...)` branches for:

- `python-ai-engineering`
- `llmops-eval-quality`
- `production-rag-data-infra`
- `ai-career-portfolio`

- [x] **Step 2: Add generator scaffolds**

Add `domainScaffoldFor(...)` branches for the four P0 domains.

- [x] **Step 3: Generate Markdown**

Run:

```bash
npm run generate:markdown-content
```

Expected: create 48 topic Markdown files and 96 question Markdown files for P0 domains.

### Task 6: Verify End To End

**Files:**
- No source files expected.

- [x] **Step 1: Run full gates**

Run:

```bash
npm run validate:all
npm run audit:coverage-map
npm run audit:technical-depth
npm run build
git diff --check
```

- [x] **Step 2: Browser QA**

Open the local Vite app and verify:

- All four P0 domains appear in the domain selector.
- Each P0 domain shows one learning path.
- Each P0 domain shows 12 topic pages and generated Markdown details.
- Desktop and 390px mobile viewport have no obvious overlap or horizontal overflow.

## Self Review

- Spec coverage: Covers the first four P0 recommendations from the AI career gap analysis. P1/P2 domains are explicitly left for later batches.
- Placeholder scan: No `TBD`, `TODO`, or unspecified implementation slots remain.
- Type consistency: Domain IDs, path IDs and topic IDs are fixed in this plan and must match the audit script.
