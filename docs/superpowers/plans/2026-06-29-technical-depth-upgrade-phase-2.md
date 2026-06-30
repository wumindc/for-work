# Technical Depth Upgrade Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把现有 60 篇知识点和 112 道面试题从“结构完整、图文并茂”继续升级到“技术细节足够支撑深问、排障和项目化表达”。

**Architecture:** 保留 `content/topics` 与 `content/questions` 作为内容源，新增一个确定性的技术深度审计脚本，先输出全量缺口和优先级，再按主题域分批补强内容。旧的 `validate:all` 继续作为基础门禁，新脚本先作为独立审计命令运行，待所有内容完成后再接入 `validate:all`。

**Tech Stack:** Node/tsx validation scripts, raw Markdown content, React Markdown renderer, Mermaid SVG rendering, npm scripts.

---

### Task 1: 建立技术深度审计脚本

**Files:**
- Create: `scripts/audit-technical-depth.mjs`
- Modify: `package.json`

- [ ] **Step 1: 新建审计脚本头部和文件读取工具**

Create `scripts/audit-technical-depth.mjs` with this header and common helpers:

```js
// @author codex
import fs from "node:fs";
import path from "node:path";
import { questions, topics } from "../src/data/index.ts";

const root = process.cwd();
const topicDir = path.join(root, "content", "topics");
const questionDir = path.join(root, "content", "questions");

const readMarkdown = (dir, id) => fs.readFileSync(path.join(dir, `${id}.md`), "utf8");
const compactLength = (text) => text.replace(/\s/g, "").length;
const countMatches = (text, pattern) => text.match(pattern)?.length ?? 0;
const hasAny = (text, terms) => terms.some((term) => text.includes(term));
const missingTerms = (text, terms) => terms.filter((term) => !text.includes(term));
```

- [ ] **Step 2: 定义深度维度**

Add these dimensions to the script:

```js
const sharedDepthSignals = {
  mechanism: ["机制", "链路", "状态", "协议", "数据流", "执行", "调度"],
  boundary: ["边界", "反例", "不适合", "失败", "降级", "限制"],
  operations: ["指标", "p95", "latency", "error", "retry", "trace", "排障"],
  tradeoff: ["取舍", "成本", "延迟", "吞吐", "准确率", "一致性", "可观测"],
  project: ["项目", "生产", "上线", "SLA", "回滚", "审计", "权限"],
};

const requiredTopicSections = [
  "## 深入技术细节",
  "## 关键数据结构与协议",
  "## 深问准备",
];

const requiredQuestionSections = [
  "## 深挖技术细节",
  "## 边界条件与反例",
  "## 深问准备",
];
```

- [ ] **Step 3: 实现单篇评分**

Add this scoring function:

```js
const scoreDocument = ({ id, kind, text }) => {
  const minChars = kind === "topic" ? 3600 : 2200;
  const requiredSections = kind === "topic" ? requiredTopicSections : requiredQuestionSections;
  const issues = [];

  if (compactLength(text) < minChars) {
    issues.push(`too short: ${compactLength(text)} < ${minChars}`);
  }

  for (const section of requiredSections) {
    if (!text.includes(section)) issues.push(`missing section: ${section}`);
  }

  for (const [dimension, terms] of Object.entries(sharedDepthSignals)) {
    if (!hasAny(text, terms)) issues.push(`missing depth signal: ${dimension}`);
  }

  if (countMatches(text, /```mermaid/g) < 1) issues.push("missing mermaid diagram");
  if (kind === "topic" && countMatches(text, /^\|.*\|$/gm) < 6) {
    issues.push("topic needs at least one substantial table");
  }
  if (!text.includes("## 来源与延伸阅读") && !text.includes("参考资料")) {
    issues.push("missing source/reference section");
  }

  return { id, kind, chars: compactLength(text), issues };
};
```

- [ ] **Step 4: 输出全量报告和失败摘要**

Add report generation:

```js
const topicReports = topics.map((topic) =>
  scoreDocument({ id: topic.id, kind: "topic", text: readMarkdown(topicDir, topic.id) }),
);
const questionReports = questions.map((question) =>
  scoreDocument({ id: question.id, kind: "question", text: readMarkdown(questionDir, question.id) }),
);
const failing = [...topicReports, ...questionReports].filter((report) => report.issues.length > 0);

console.log(
  JSON.stringify(
    {
      totals: {
        topics: topicReports.length,
        questions: questionReports.length,
        failing: failing.length,
      },
      topFailing: failing
        .sort((a, b) => b.issues.length - a.issues.length || a.chars - b.chars)
        .slice(0, 40),
    },
    null,
    2,
  ),
);

if (failing.length > 0) process.exit(1);
```

- [ ] **Step 5: 接入 npm script**

Modify `package.json`:

```json
"audit:technical-depth": "tsx scripts/audit-technical-depth.mjs"
```

Keep it out of `validate:all` until the full 172-document upgrade is complete.

- [ ] **Step 6: Run baseline**

Run:

```bash
npm run audit:technical-depth
```

Expected: FAIL. The output should list the current thin articles and the missing depth sections.

### Task 2: 第一批补强 AI 基础与训练题

**Files:**
- Modify: `content/topics/llm-foundation.md`
- Modify: `content/topics/chatgpt-runtime.md`
- Modify: `content/topics/llm-training-alignment.md`
- Modify: `content/questions/q-ai-llm-foundation-core.md`
- Modify: `content/questions/q-ai-llm-foundation-deep.md`
- Modify: `content/questions/q-ai-chatgpt-runtime-core.md`
- Modify: `content/questions/q-ai-chatgpt-runtime-deep.md`
- Modify: `content/questions/q-ai-llm-training-core.md`
- Modify: `content/questions/q-ai-llm-training-deep.md`

- [ ] **Step 1: Topic 增加深度三段**

For each topic file, add:

```markdown
## 深入技术细节

写清核心执行机制、关键路径、常见实现细节、失败模式和可观测指标。

## 关键数据结构与协议

列出请求对象、状态字段、索引字段、trace 字段、schema 或协议约束。

## 深问准备

补充 4-6 个面试官会继续追问的问题，并给出能展开的回答方向。
```

- [ ] **Step 2: Question 增加深挖三段**

For each question file, add:

```markdown
## 深挖技术细节

把标准回答中的关键机制拆开，说明真实系统里的参数、状态、执行顺序、失败分支和指标。

## 边界条件与反例

说明什么场景不适合这样做，什么回答会被追问打穿。

## 深问准备

列出追问点和回答要点。
```

- [ ] **Step 3: Run focused audit**

Run:

```bash
npm run audit:technical-depth
```

Expected: Overall command still fails, but the nine files in this batch no longer appear in `topFailing`.

### Task 3: 第二批补强 ES 和 MQ 基础链路

**Files:**
- Modify: `content/topics/es-use-cases-boundary.md`
- Modify: `content/topics/es-shards-write-path.md`
- Modify: `content/topics/es-query-aggregation-optimization.md`
- Modify: `content/topics/es-rag-hybrid-search.md`
- Modify: `content/topics/mq-use-cases-boundary.md`
- Modify: `content/topics/mq-ordering-partitioning.md`
- Modify: `content/topics/mq-transactional-messaging.md`
- Modify: `content/topics/mq-consumer-governance.md`
- Modify: `content/questions/q-es-index-shard-write.md`
- Modify: `content/questions/q-es-query-optimization.md`
- Modify: `content/questions/q-es-rag-hybrid-search.md`
- Modify: `content/questions/q-mq-ordering.md`
- Modify: `content/questions/q-mq-transaction-message.md`

- [ ] **Step 1: ES content deepening**

Add details for shard routing, translog, refresh, segment merge, query/fetch phase, circuit breaker, profile API, search_after/PIT, composite aggregation, BM25/kNN/RRF/rerank, and permissions.

- [ ] **Step 2: MQ content deepening**

Add details for at-least-once, idempotency key, offset/ack timing, retry/DLQ, poison message, outbox relay, half message, compensation, rebalance, partition lag, and ordering boundaries.

- [ ] **Step 3: Run focused audit**

Run:

```bash
npm run audit:technical-depth
```

Expected: Overall command still fails, but these ES/MQ files no longer appear in `topFailing`.

### Task 4: 逐批补强其余 Agent/RAG/项目类内容

**Files:**
- Modify remaining `content/topics/*.md`
- Modify remaining `content/questions/*.md`

- [ ] **Step 1: Use audit output as queue**

Run:

```bash
npm run audit:technical-depth
```

Pick the next 15-25 highest-priority failing documents from `topFailing`.

- [ ] **Step 2: Deepen each selected document**

For every selected topic, add or strengthen mechanism, protocol/data structure, operations, tradeoff, project, and deep-question sections.

For every selected question, add or strengthen deep technical details, boundary/anti-example, and deep-question preparation.

- [ ] **Step 3: Repeat until clean**

Repeat Step 1 and Step 2 until:

```bash
npm run audit:technical-depth
```

Expected: PASS with `failing: 0`.

### Task 5: Final verification and UI QA

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Promote depth audit into validate:all**

When `npm run audit:technical-depth` passes, add it to `validate:all` after `validate:content-quality`:

```json
"validate:all": "npm run validate:data && npm run validate:graph && npm run validate:content-depth && npm run validate:markdown-content && npm run validate:content-quality && npm run audit:technical-depth && npm run validate:interview-ui"
```

- [ ] **Step 2: Run full verification**

Run:

```bash
npm run validate:all
npm run build
```

Expected: both pass. Vite chunk warnings are acceptable if build exits `0`.

- [ ] **Step 3: Browser QA**

Start:

```bash
npm run dev -- --host 127.0.0.1 --port 5179
```

Verify at mobile `390x844`:
- One deepened topic from AI.
- One deepened ES/MQ question.
- One remaining Agent/RAG question.
- Mermaid SVG renders.
- No horizontal overflow.
- Console has no app warn/error.
- `标记掌握` toggles and can be restored.

- [ ] **Step 4: Complete audit**

Only mark the goal complete when current evidence proves:
- `60/60` topics pass the depth audit.
- `112/112` questions pass the depth audit.
- `validate:all` passes with the depth audit included.
- `build` passes.
- Browser QA passes on representative pages.
