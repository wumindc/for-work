# 研发面试知识体系 C 方案 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把当前单一 AI Agent 学习站升级为“知识体系 + 面试训练”的研发面试知识体系，并用 AI Agent/RAG 与 Elasticsearch 做第一批深度样板。

**Architecture:** 保留现有 React + Vite + 静态 TypeScript 数据架构，兼容旧 `Topic` / `InterviewQuestion` 字段，在类型层新增 `Domain`、深度知识字段、场景案例、系统设计案例和结构化追问。UI 先做信息架构和内容密度改造，不引入后端、账号、AI 自动生成或复杂图布局。

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, lucide-react, localStorage progress store, Node/tsx validation scripts.

**Repository Constraint:** `/Users/wumin/workspace/github/for-work` 当前没有 `.git` 目录，所有 commit 步骤替换为运行 `git -C /Users/wumin/workspace/github/for-work rev-parse --show-toplevel` 并确认输出 `fatal: not a git repository`。不要尝试初始化仓库或伪造提交。

---

## File Structure

- Modify: `src/types/knowledge.ts`
  - Add `Domain`, `ScenarioCase`, `SystemDesignCase`, `FollowUpStep`, domain-aware `Category`, optional deep-topic fields on `Topic`, and optional structured fields on `InterviewQuestion`.
- Create: `src/data/domains.ts`
  - Define first-level domains: AI Agent/RAG and Elasticsearch as `sample_ready`, MQ/Redis/Database/Prometheus/Java/System Design as `planned`.
- Modify: `src/data/categories.ts`
  - Add `domainId` to existing AI categories and add Elasticsearch module categories.
- Create: `src/data/deepSamples.ts`
  - Add at least 3 AI deep sample topic patches and at least 5 Elasticsearch deep sample topics plus 8 handwritten interview questions.
- Modify: `src/data/topics.ts`
  - Apply deep sample patches to existing AI topics and append ES topics.
- Modify: `src/data/questions.ts`
  - Keep generated legacy questions and append handwritten AI/ES interview questions.
- Modify: `src/data/index.ts`
  - Export `domains`, `domainById`, and existing maps.
- Modify: `scripts/validate-data.mjs`
  - Validate domain references, AI/ES sample counts, deep-topic fields, scenario/system-design coverage, and structured follow-up depth.
- Modify: `src/app/App.tsx`
  - Rename shell to “研发面试知识体系”, expose `知识体系` and `面试训练`, keep graph/topic/project flows available.
- Modify: `src/components/graph/GraphLearning.tsx`
  - Reframe homepage as knowledge-system entry with AI/ES sample domain cards and planned-domain empty states.
- Modify: `src/components/knowledge/TopicDetail.tsx`
  - Render new deep fields when present: definition/boundary, principles, industry solutions, scenarios, system design cases, engineering details, tradeoffs, pitfalls, experience bridge.
- Modify: `src/components/interview/InterviewDrill.tsx`
  - Add domain filter and render structured `followUpSteps`.
- Modify: `src/components/search/SearchPanel.tsx`
  - Include domains, deep-topic fields, scenario/system-design text, and structured follow-up text in search.

## Task 1: Extend Types And Domain Data

**Files:**
- Modify: `src/types/knowledge.ts`
- Create: `src/data/domains.ts`
- Modify: `src/data/categories.ts`
- Modify: `src/data/index.ts`
- Test: `scripts/validate-data.mjs`

- [ ] **Step 1: Write failing validator checks**

Add checks in `scripts/validate-data.mjs` so it imports `domains`, verifies every category has a valid `domainId`, and requires at least two `sample_ready` domains:

```js
const { categories, domains } = await import("../src/data/index.ts");
const domainIds = new Set(domains.map((domain) => domain.id));
for (const category of categories) {
  if (!domainIds.has(category.domainId)) {
    errors.push(`category ${category.id} references missing domain: ${category.domainId}`);
  }
}
if (domains.filter((domain) => domain.status === "sample_ready").length < 2) {
  errors.push("expected at least 2 sample-ready domains");
}
```

- [ ] **Step 2: Run validator to verify failure**

Run:

```bash
npm run validate:data
```

Expected: FAIL because `domains` is not exported and categories do not yet have `domainId`.

- [ ] **Step 3: Add domain-aware types**

Update `src/types/knowledge.ts` with these exports:

```ts
export type DomainStatus = "sample_ready" | "planned" | "draft";
export type DomainPriority = "core" | "important" | "later";

export type Domain = {
  id: string;
  title: string;
  description: string;
  status: DomainStatus;
  priority: DomainPriority;
};

export type ScenarioCase = {
  id: string;
  title: string;
  context: string;
  problem: string;
  design: string[];
  failureModes: string[];
  metrics: string[];
};

export type SystemDesignCase = {
  id: string;
  title: string;
  requirements: string[];
  architecture: string[];
  dataFlow: string[];
  scalingPoints: string[];
  observability: string[];
  tradeoffs: string[];
};

export type FollowUpStep = {
  question: string;
  answerHint: string;
  probes: string[];
  relatedTopicIds: string[];
};
```

Also add `domainId: string` to `Category`, optional `domainId`, `definition`, `principles`, `industrySolutions`, `scenarios`, `systemDesignCases`, `engineeringDetails`, `tradeoffs`, `experienceBridge` to `Topic`, and optional `examFocus`, `keyDetails`, `scenarioExtension`, `followUpSteps` to `InterviewQuestion`.

- [ ] **Step 4: Create domain data**

Create `src/data/domains.ts`:

```ts
// @author codex
import type { Domain } from "../types/knowledge";

export const domains = [
  {
    id: "ai-agent-rag",
    title: "AI Agent 与 RAG",
    description: "Agent、RAG、Memory、Context、Tool、Eval 和可观测性。",
    status: "sample_ready",
    priority: "core",
  },
  {
    id: "elasticsearch",
    title: "Elasticsearch",
    description: "搜索、日志检索、索引设计、查询优化、稳定性和 RAG 检索连接。",
    status: "sample_ready",
    priority: "core",
  },
  {
    id: "mq",
    title: "MQ",
    description: "异步解耦、削峰填谷、可靠投递、顺序消息、事务消息和消费治理。",
    status: "planned",
    priority: "important",
  }
] satisfies Domain[];
```

The implementation should include Redis, Database, Prometheus, Java, System Design, and Engineering Quality planned domains as well.

- [ ] **Step 5: Add `domainId` to categories**

Assign every existing AI category to `ai-agent-rag`. Add ES categories `es-basics`, `es-indexing`, `es-query`, `es-operations`, and `es-rag`.

- [ ] **Step 6: Export domains**

Update `src/data/index.ts` to export `domains` and `domainById`.

- [ ] **Step 7: Run validator**

Run:

```bash
npm run validate:data
```

Expected: PASS for domain reference checks while preserving existing legacy validation.

## Task 2: Add Deep AI/ES Sample Content

**Files:**
- Create: `src/data/deepSamples.ts`
- Modify: `src/data/topics.ts`
- Modify: `src/data/questions.ts`
- Test: `scripts/validate-data.mjs`

- [ ] **Step 1: Add failing sample-depth validator**

Add validator checks requiring:

```js
const aiDeepTopics = topics.filter((topic) => topic.domainId === "ai-agent-rag" && topic.scenarios?.length);
const esDeepTopics = topics.filter((topic) => topic.domainId === "elasticsearch" && topic.scenarios?.length);
const structuredQuestions = questions.filter((question) => question.followUpSteps?.length >= 3);
if (aiDeepTopics.length < 3) errors.push(`expected at least 3 AI deep sample topics, got ${aiDeepTopics.length}`);
if (esDeepTopics.length < 5) errors.push(`expected at least 5 Elasticsearch deep sample topics, got ${esDeepTopics.length}`);
if (structuredQuestions.filter((question) => question.topicIds.some((id) => topics.find((topic) => topic.id === id)?.domainId === "ai-agent-rag")).length < 4) errors.push("expected at least 4 AI handwritten structured questions");
if (structuredQuestions.filter((question) => question.topicIds.some((id) => topics.find((topic) => topic.id === id)?.domainId === "elasticsearch")).length < 4) errors.push("expected at least 4 Elasticsearch handwritten structured questions");
```

- [ ] **Step 2: Run validator to verify failure**

Run:

```bash
npm run validate:data
```

Expected: FAIL because deep sample fields and handwritten questions are not added yet.

- [ ] **Step 3: Create deep sample data**

Create `src/data/deepSamples.ts` exporting:

```ts
// @author codex
import type { InterviewQuestion, Topic } from "../types/knowledge";

export const deepTopicPatches = {
  "agent-definition": {
    domainId: "ai-agent-rag",
    definition: ["Agent 是模型参与多步控制流的工程系统，而不是单轮聊天或一次工具调用。"],
    principles: ["先判断任务是否真的需要动态决策；固定路径优先 workflow。"],
    industrySolutions: ["Workflow baseline、ReAct loop、planner-executor、tool registry、trace/eval 分层治理。"],
    scenarios: [],
    systemDesignCases: [],
    engineeringDetails: [],
    tradeoffs: [],
    experienceBridge: [],
  },
} satisfies Record<string, Partial<Topic>>;

export const esTopics = [] satisfies Topic[];
export const handwrittenQuestions = [] satisfies InterviewQuestion[];
```

Then fill the arrays so AI has at least 3 deep patches, ES has at least 5 full topics, and handwritten questions include 4 AI + 4 ES structured questions.

- [ ] **Step 4: Apply deep patches and append ES topics**

In `src/data/topics.ts`, import `deepTopicPatches` and `esTopics`; merge patches into generated `topics`; append `esTopics`.

- [ ] **Step 5: Append handwritten questions**

In `src/data/questions.ts`, import `handwrittenQuestions`; export generated questions plus handwritten questions.

- [ ] **Step 6: Run validator**

Run:

```bash
npm run validate:data
```

Expected: PASS with at least 3 AI deep samples, 5 ES deep samples, and 8 structured handwritten questions.

## Task 3: Reframe App Shell And Knowledge Home

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/components/graph/GraphLearning.tsx`

- [ ] **Step 1: Update app shell copy and navigation**

Rename the header title to `研发面试知识体系`, subtitle to `知识体系 · 深度样板 · 面试追问`, and add nav items for `知识体系` and `面试训练`.

- [ ] **Step 2: Render domain-oriented home**

In `GraphLearning.tsx`, import `domains`, `categories`, and `topics`; show:

- AI Agent/RAG and Elasticsearch as sample-ready domain cards.
- Planned domains as compact empty-state cards.
- Existing 5-node Agent path as a focused AI sample lane.

- [ ] **Step 3: Run build typecheck**

Run:

```bash
npm run build
```

Expected: PASS or reveal exact TypeScript errors to fix before moving on.

## Task 4: Render Deep Topic Fields And Structured Interview Follow-Ups

**Files:**
- Modify: `src/components/knowledge/TopicDetail.tsx`
- Modify: `src/components/interview/InterviewDrill.tsx`
- Modify: `src/components/search/SearchPanel.tsx`

- [ ] **Step 1: Add deep sections to Topic Detail**

If `topic.definition` exists, render the new sections before legacy fallback sections:

```tsx
const deepSections = [
  { title: "定义和边界", items: topic.definition },
  { title: "核心原理", items: topic.principles },
  { title: "业界方案", items: topic.industrySolutions },
  { title: "工程落地细节", items: topic.engineeringDetails },
  { title: "性能、稳定性和成本取舍", items: topic.tradeoffs },
  { title: "Java 后端经验迁移", items: topic.experienceBridge },
].filter((section) => section.items && section.items.length > 0);
```

Render scenario cards and system-design cards when present.

- [ ] **Step 2: Add domain filter and structured追问 rendering**

In `InterviewDrill.tsx`, add a domain filter derived from `domains`; filter questions by any linked topic domain; if `followUpSteps` exists, render each step with `question`, `answerHint`, `probes`, and topic links.

- [ ] **Step 3: Extend search index**

In `SearchPanel.tsx`, include `definition`, `principles`, `industrySolutions`, `engineeringDetails`, `tradeoffs`, `experienceBridge`, scenario fields, system design fields, and `followUpSteps` text.

- [ ] **Step 4: Run validation and build**

Run:

```bash
npm run validate:all
npm run build
```

Expected: both commands PASS.

## Task 5: Browser Verification

**Files:**
- No file edits expected after this task unless verification finds defects.

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev -- --port 5173
```

Expected: Vite starts on `http://127.0.0.1:5173/`.

- [ ] **Step 2: Verify key flows manually or with browser automation**

Check:

- Home shows `研发面试知识体系`.
- AI Agent/RAG and Elasticsearch are visible as sample-ready topics.
- MQ/Redis/Database/Prometheus/Java/System Design appear as planned, not fake-complete.
- Search for `ES` or `倒排索引` returns Elasticsearch content.
- Open an ES topic and confirm scenarios, system design, tradeoffs, and Java experience bridge are visible.
- Open 面试训练 and confirm AI/ES questions show multi-step follow-up chains.

- [ ] **Step 3: Stop dev server**

Stop the Vite process cleanly. Do not leave required sessions running.

## Self-Review

- Spec coverage: Tasks 1-4 cover data model, domain IA, AI/ES deep samples, handwritten questions, topic detail, interview drill, search, and validation. Task 5 covers rendered verification.
- Deferred-work scan: Executable steps do not contain deferred-work markers. Planned domains are intentional product state, not implementation gaps.
- Type consistency: `Domain`, `ScenarioCase`, `SystemDesignCase`, `FollowUpStep`, optional `Topic` deep fields, and optional `InterviewQuestion.followUpSteps` are introduced before use.
- Constraint coverage: Commit steps are replaced because the current project directory is not a git repository.
