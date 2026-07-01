<!-- @author codex -->
# Foundation And DevOps Learning Ladder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a learning-ladder slice that fills AI/LLM foundations, Prometheus mechanism, and Docker/Kubernetes/DevOps coverage.

**Architecture:** Keep the existing static data model. Add a new audit gate for required learning ladders, then extend sources, domains, categories, topic seeds, learning paths and generated Markdown.

**Tech Stack:** React, TypeScript, Vite, static data modules, Node/tsx validation scripts, generated Markdown content.

---

### Task 1: Add Learning Ladder Audit Gate

**Files:**
- Create: `scripts/audit-learning-ladders.mjs`
- Modify: `package.json`

- [x] **Step 1: Write the audit script**

Create `scripts/audit-learning-ladders.mjs` with required topic/path checks for:

- AI foundation topic IDs: `llm-tokenization-embedding`, `llm-transformer-attention`, `llm-kv-cache-inference`, `llm-decoding-runtime-tradeoffs`
- Prometheus mechanism topic IDs: `prometheus-scrape-service-discovery`, `prometheus-tsdb-rules-alertmanager`
- DevOps domain topic IDs: `docker-container-image-foundation`, `dockerfile-buildkit-image-layer`, `container-runtime-resource-isolation`, `docker-compose-local-dev`, `kubernetes-pod-workload-controller`, `kubernetes-service-ingress-networking`, `kubernetes-config-secret-storage`, `kubernetes-observability-release`
- Learning paths: `llm-foundations-learning-ladder`, `prometheus-mechanism-learning-ladder`, `devops-docker-kubernetes-review`

- [x] **Step 2: Run the audit and confirm RED**

Run:

```bash
npx tsx scripts/audit-learning-ladders.mjs
```

Expected: fail with missing topic IDs and path IDs.

- [x] **Step 3: Add npm script**

Modify `package.json`:

```json
"audit:learning-ladders": "tsx scripts/audit-learning-ladders.mjs"
```

Add it to `validate:all` after `validate:data`.

### Task 2: Add Official Sources

**Files:**
- Modify: `src/data/sources.ts`

- [x] **Step 1: Add source IDs**

Add source records for:

- `transformer-attention-paper`
- `openai-text-generation`
- `prometheus-configuration`
- `prometheus-storage`
- `prometheus-recording-rules`
- `docker-containers`
- `docker-images`
- `dockerfile-reference`
- `docker-compose`
- `kubernetes-pods`
- `kubernetes-deployments`
- `kubernetes-services`
- `kubernetes-ingress`
- `kubernetes-configmaps`
- `kubernetes-secrets`
- `kubernetes-probes`

- [x] **Step 2: Run data validation**

Run:

```bash
npm run validate:data
```

Expected: still pass because no topic references the new sources yet.

### Task 3: Add DevOps Domain And Categories

**Files:**
- Modify: `src/data/domains.ts`
- Modify: `src/data/categories.ts`

- [x] **Step 1: Add domain**

Add:

```ts
{
  id: "devops-docker-kubernetes",
  title: "Docker / Kubernetes / DevOps",
  description: "容器、镜像、运行时隔离、Compose、本地开发、Kubernetes 工作负载、服务网络、配置、发布和可观测性。",
  status: "sample_ready",
  priority: "important",
}
```

- [x] **Step 2: Add categories**

Add categories for Docker basics, image build, runtime isolation, local orchestration, Kubernetes workloads, Kubernetes networking, Kubernetes configuration and DevOps release/observability.

### Task 4: Add Topic Seeds

**Files:**
- Modify: `src/data/deepSamples.ts`
- Modify: `src/data/topics.ts`

- [x] **Step 1: Add AI foundation topic seeds**

Create an exported array `llmFoundationLadderTopics` with four topics:

- `llm-tokenization-embedding`
- `llm-transformer-attention`
- `llm-kv-cache-inference`
- `llm-decoding-runtime-tradeoffs`

- [x] **Step 2: Add Prometheus mechanism topic seeds**

Create an exported array `prometheusMechanismTopics` with two topics:

- `prometheus-scrape-service-discovery`
- `prometheus-tsdb-rules-alertmanager`

- [x] **Step 3: Add DevOps topic seeds**

Create an exported array `devopsTopics` with eight topics:

- `docker-container-image-foundation`
- `dockerfile-buildkit-image-layer`
- `container-runtime-resource-isolation`
- `docker-compose-local-dev`
- `kubernetes-pod-workload-controller`
- `kubernetes-service-ingress-networking`
- `kubernetes-config-secret-storage`
- `kubernetes-observability-release`

- [x] **Step 4: Wire arrays into `src/data/topics.ts`**

Import and append the new arrays after the related existing domains.

### Task 5: Add Learning Paths And Coverage Minimum

**Files:**
- Modify: `src/data/learningPaths.ts`
- Modify: `scripts/audit-coverage-map.mjs`

- [x] **Step 1: Add learning paths**

Add:

- `llm-foundations-learning-ladder`
- `prometheus-mechanism-learning-ladder`
- `devops-docker-kubernetes-review`

- [x] **Step 2: Add coverage minimum**

Add `devops-docker-kubernetes` to `minimumsByDomain` with at least 8 topics, 8 questions and 8 categories.

- [x] **Step 3: Run audit and confirm GREEN**

Run:

```bash
npm run audit:learning-ladders
npm run audit:coverage-map
```

Expected: both pass.

### Task 6: Generate Markdown And Validate

**Files:**
- Generated: `content/topics/*.md`
- Generated: `content/questions/*.md`
- Runtime: `src/data/markdownContent.ts` imports Markdown through `import.meta.glob`

- [x] **Step 1: Regenerate Markdown**

Run:

```bash
npm run generate:markdown-content
```

- [x] **Step 2: Run full validation**

Run:

```bash
npm run validate:all
npm run audit:technical-depth
npm run build
```

Expected: all pass.

### Task 7: Manual Content Spot Check

**Files:**
- Inspect generated Markdown in `content/topics/`

- [x] **Step 1: Read generated foundation pages**

Inspect:

- `content/topics/llm-transformer-attention.md`
- `content/topics/prometheus-scrape-service-discovery.md`
- `content/topics/kubernetes-pod-workload-controller.md`

- [x] **Step 2: Confirm learning-order behavior**

Verify the pages explain:

- Definition and boundary.
- Internal mechanism.
- Production implementation.
- Failure modes and metrics.
- Interview follow-up angles.

### Task 8: Browser Verification

**Files:**
- Modify: `src/components/graph/GraphLearning.tsx`

- [x] **Step 1: Expose review paths in the knowledge page**

Add a `复习路径` block that shows topic-specific path count, mode/focus window, progress and current node. Clicking a path jumps to the current unfinished node.

- [x] **Step 2: Start dev server**

Run:

```bash
npm run dev -- --port 5173
```

- [x] **Step 3: Open local site**

Verify the new DevOps domain and new learning paths render in the app.

### Self-Review Checklist

- [x] No required topic IDs missing.
- [x] Every new topic has at least two generated questions.
- [x] New sources are referenced by at least one topic.
- [x] Markdown generated for every new topic and question.
- [x] `validate:all`, `audit:technical-depth` and `build` pass.
