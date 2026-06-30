# Markdown Content Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将知识点和面试题的主内容迁移到逐条 Markdown 文件，右侧详情页优先渲染 Markdown，让内容像技术设计文档一样维护。

**Architecture:** 保留现有 TypeScript 结构化数据作为导航、标签、图谱和兼容 fallback；新增 `content/` 目录存放 `topics/<id>.md` 与 `questions/<id>.md`。Vite 运行时通过 `import.meta.glob(..., { query: "?raw", eager: true })` 加载 Markdown，Node 校验脚本通过文件系统读取同一目录，确保每个内容文件可发现、可校验、可渲染。

**Tech Stack:** React 18, TypeScript, Vite raw imports, Node/tsx validation scripts, Markdown subset renderer.

**Current status:** 已全量迁移现有内容：60/60 个知识点、112/112 道面试题都有独立 Markdown 文件。`npm run validate:all`、`npm run build` 和浏览器抽查已通过。构建阶段仍有一个 bundle size 警告，因为当前实现 eager 加载全部 Markdown，后续内容继续扩张时应改为按选中条目懒加载。

---

### Task 1: Markdown 内容契约和红线校验

**Files:**
- Create: `content/topics/agent-definition.md`
- Create: `content/questions/q-ai-eval-observability-structured.md`
- Create: `scripts/validate-markdown-content.mjs`
- Modify: `package.json`

- [x] **Step 1: Write the failing validation**

Add `scripts/validate-markdown-content.mjs` that:

```js
// @author codex
import fs from "node:fs";
import path from "node:path";
import { questions, topics } from "../src/data/index.ts";

const errors = [];
const root = process.cwd();
const topicDir = path.join(root, "content", "topics");
const questionDir = path.join(root, "content", "questions");
const minChars = (value) => value.replace(/\s/g, "").length;

for (const topic of topics) {
  const file = path.join(topicDir, `${topic.id}.md`);
  if (!fs.existsSync(file)) errors.push(`missing topic markdown: ${topic.id}`);
}

for (const question of questions) {
  const file = path.join(questionDir, `${question.id}.md`);
  if (!fs.existsSync(file)) errors.push(`missing question markdown: ${question.id}`);
}

for (const [kind, dir] of [["topic", topicDir], ["question", questionDir]]) {
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir).filter((item) => item.endsWith(".md"))) {
    const text = fs.readFileSync(path.join(dir, name), "utf8");
    if (!text.includes("##")) errors.push(`${kind} markdown ${name} must include second-level sections`);
    if (minChars(text) < 1200) errors.push(`${kind} markdown ${name} is too short`);
  }
}

if (errors.length) {
  console.error("Markdown content validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Markdown content validation passed.");
```

- [x] **Step 2: Run red validation**

Run:

```bash
npm run validate:markdown-content
```

Expected: fails because `validate:markdown-content` is not wired or content files are missing.

- [x] **Step 3: Add the script entry**

Modify `package.json`:

```json
"validate:markdown-content": "tsx scripts/validate-markdown-content.mjs"
```

and include it in `validate:all` after `validate:content-depth`.

- [x] **Step 4: Add representative Markdown files**

Create one topic and one question file with full technical-document structure:

```markdown
# Agent 的定义

## 面试定位
...

## 架构与运行机制
...

## 系统设计案例
...
```

```markdown
# Agent 系统如何做 Eval 和可观测性，才能不是只看 demo？

## 回答框架
...

## 深入追问
...
```

- [x] **Step 5: Run green validation**

Run:

```bash
npm run validate:markdown-content
```

Expected initially for phase 1: pass in migration mode when at least the listed representative files exist and the manifest tracks remaining missing files.

### Task 2: Markdown 内容索引

**Files:**
- Create: `src/data/markdownContent.ts`
- Modify: `src/types/knowledge.ts`

- [x] **Step 1: Write failing data validation**

Extend `scripts/validate-markdown-content.mjs` to require `agent-definition` and `q-ai-eval-observability-structured` are exported by the runtime index.

- [x] **Step 2: Implement runtime raw-import index**

Create:

```ts
// @author codex
const topicModules = import.meta.glob("../../content/topics/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const questionModules = import.meta.glob("../../content/questions/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const idFromPath = (filePath: string) =>
  filePath.split("/").pop()?.replace(/\.md$/, "") ?? filePath;

export const topicMarkdownById = new Map(
  Object.entries(topicModules).map(([filePath, content]) => [
    idFromPath(filePath),
    String(content),
  ]),
);

export const questionMarkdownById = new Map(
  Object.entries(questionModules).map(([filePath, content]) => [
    idFromPath(filePath),
    String(content),
  ]),
);
```

- [x] **Step 3: Run typecheck/build**

Run:

```bash
npm run build
```

Expected: TypeScript accepts raw Markdown imports.

### Task 3: Markdown 渲染组件

**Files:**
- Create: `src/components/shared/MarkdownDocument.tsx`
- Modify: `src/components/knowledge/TopicDetail.tsx`
- Modify: `src/components/interview/InterviewDrill.tsx`

- [x] **Step 1: Write UI contract validation**

Extend `scripts/validate-interview-ui-contract.mjs` or add a new script check that `TopicDetail.tsx` and `InterviewDrill.tsx` import `MarkdownDocument` and the markdown maps.

- [x] **Step 2: Implement a safe Markdown subset renderer**

Support headings, paragraphs, unordered lists, ordered lists, fenced code, inline code, blockquote, and horizontal rule. Do not use `dangerouslySetInnerHTML`.

- [x] **Step 3: Prefer Markdown content in TopicDetail**

If `topicMarkdownById.get(topic.id)` exists, render it below the header and skip the generated field sections. Otherwise keep existing fallback.

- [x] **Step 4: Prefer Markdown content in InterviewDrill**

If `questionMarkdownById.get(activeQuestion.id)` exists, render it below the question header and skip generated answer/follow-up blocks. Otherwise keep existing fallback.

- [x] **Step 5: Browser smoke test**

Open `http://127.0.0.1:5177/`, verify:

```text
Agent 的定义 -> Markdown sections visible
Agent 系统如何做 Eval 和可观测性 -> Markdown answer visible
```

### Task 4: Full migration tracker and execution

**Files:**
- Create: `scripts/generate-markdown-content.mjs`
- Modify: `scripts/validate-markdown-content.mjs`

- [x] **Step 1: Generate current coverage report**

Report total topics/questions, existing markdown count, missing ids by domain/category.

- [x] **Step 2: Generate all missing Markdown files**

Generated missing files without overwriting existing hand-written files:

- Topics: created 57, skipped 3.
- Questions: created 109, skipped 3.

- [x] **Step 3: Enforce full coverage**

`scripts/validate-markdown-content.mjs` now validates every topic and question Markdown file, fails on missing files, fails on orphan files, and checks H1, minimum depth, required technical sections, and key terms.

- [x] **Step 4: Final verification**

Commands passed:

```bash
npm run validate:all
npm run build
```

Browser smoke test passed for:

- ES 分片副本与写入链路
- MQ 消费治理、积压与故障排查
- MQ 消费积压面试题
- AI Agent 边界面试题

---

## Self-Review

- Spec coverage: covers per-topic MD files, per-question MD files, right-side rendering, maintainability, and validation.
- Placeholder scan: implementation examples are concrete; full content migration remains tracked by validation rather than hand-waved.
- Type consistency: `topicMarkdownById` and `questionMarkdownById` are the runtime interfaces consumed by UI components.
