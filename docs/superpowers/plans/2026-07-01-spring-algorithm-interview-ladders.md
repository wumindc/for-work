<!-- @author codex -->
# Spring And Algorithm Interview Ladders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add large, professional Spring Java backend and algorithm interview learning ladders to the interview knowledge site.

**Architecture:** Keep the existing static content architecture. Add a focused audit gate first, then wire sources, domains, categories, topic arrays, generated questions, learning paths, coverage minimums and Markdown generation.

**Tech Stack:** React, TypeScript, Vite, static TS data modules, Node/tsx validation scripts, generated Markdown content.

---

### Task 1: Add Career Ladder Audit Gate

**Files:**
- Create: `scripts/audit-career-ladders.mjs`
- Modify: `package.json`

- [x] **Step 1: Create failing audit script**

Check required domains, topic IDs and learning path IDs for:

- `spring-java-backend`
- `coding-algorithms-interview`
- `spring-java-backend-review`
- `coding-algorithms-interview-review`

Run:

```bash
npm run audit:career-ladders
```

Expected before implementation: fail with missing domains, topics and paths.

- [x] **Step 2: Add script to `validate:all`**

Add `npm run audit:career-ladders` after `audit:learning-ladders`.

### Task 2: Add Sources, Domains And Categories

**Files:**
- Modify: `src/data/sources.ts`
- Modify: `src/data/domains.ts`
- Modify: `src/data/categories.ts`

- [x] **Step 1: Add Spring/MyBatis sources**

Add official source IDs for Spring Framework, Spring Boot, Spring Cloud, Spring Cloud Gateway, Spring Cloud OpenFeign, Spring Security, MyBatis and MyBatis Plus.

- [x] **Step 2: Add algorithm sources**

Add source IDs for LeetCode Explore, CP-Algorithms, OI Wiki and MIT 6.006.

- [x] **Step 3: Add two sample-ready domains**

Add `spring-java-backend` and `coding-algorithms-interview`.

- [x] **Step 4: Add 24 categories**

Add 12 Spring categories and 12 algorithm categories from the design spec.

### Task 3: Add Topic Arrays And Generated Questions

**Files:**
- Modify: `src/data/deepSamples.ts`
- Modify: `src/data/topics.ts`

- [x] **Step 1: Add Spring topic array**

Create `springJavaBackendTopics` with 16 required topics plus a testing/contract topic. Each topic must include definitions, principles, industry solutions, engineering details, tradeoffs and experience bridges.

- [x] **Step 2: Add algorithm topic array**

Create `algorithmInterviewTopics` with 16 required topics. Each topic must include algorithm pattern, Java implementation notes, common pitfalls and interview recovery strategy.

- [x] **Step 3: Generate questions**

Add both arrays to the existing generated-question topic list so each topic gets core/deep questions.

- [x] **Step 4: Wire topics**

Import and spread the two arrays in `src/data/topics.ts`.

### Task 4: Add Learning Paths And Coverage Minimums

**Files:**
- Modify: `src/data/learningPaths.ts`
- Modify: `scripts/audit-coverage-map.mjs`

- [x] **Step 1: Add learning paths**

Add:

- `spring-java-backend-review`
- `coding-algorithms-interview-review`

- [x] **Step 2: Add coverage minimums**

Set both new domains to at least 12 categories, 16 topics and 32 questions.

- [x] **Step 3: Verify audit turns green**

Run:

```bash
npm run audit:career-ladders
npm run audit:coverage-map
```

Expected after implementation: both pass.

### Task 5: Extend Markdown Generator And Generate Content

**Files:**
- Modify: `scripts/generate-markdown-content.mjs`
- Generate: `content/topics/*.md`
- Generate: `content/questions/*.md`

- [x] **Step 1: Add Spring scaffold**

Add domain-specific architecture, data flow, troubleshooting and key-row copy for `spring-java-backend`.

- [x] **Step 2: Add algorithm scaffold**

Add domain-specific problem-pattern, complexity, Java template, dry-run and mistake-review copy for `coding-algorithms-interview`.

- [x] **Step 3: Generate Markdown**

Run:

```bash
npm run generate:markdown-content
```

Expected: create 33 topic Markdown files and 66 question Markdown files for the two domains.

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

Open local Vite app and verify:

- `Spring Java 后端体系` appears in the domain selector.
- `算法题与编码面试` appears in the domain selector.
- Both domains show `复习路径`.
- Spring shows 17 topic pages, algorithms show 16 topic pages, and both show generated Markdown details.
- Desktop and mobile viewports have no obvious overlap or horizontal overflow.
