# AI Agent 面试知识脑 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first React learning dashboard for two-week AI Agent interview preparation with a knowledge map, topic detail view, interview drills, project evidence tracks, and persisted progress.

**Architecture:** A Vite + React + TypeScript single-page app stores seed knowledge in typed data modules and user progress in `localStorage`. The UI is organized around five app views with shared selectors and derived stats, so content can grow without rewriting components.

**Tech Stack:** Vite, React, TypeScript, Tailwind CSS, lucide-react, localStorage, Node validation script.

---

## Current Workspace

- Root: `/Users/wumin/workspace/github/for-work`
- Existing files to preserve: `images/` and `.DS_Store`
- Existing spec: `docs/superpowers/specs/2026-06-29-agent-interview-knowledge-brain-design.md`
- Git state: not currently a git repository

The implementation must only create or modify app and docs files. Do not move or delete existing images.

## File Structure

Create the following files:

- `package.json`: scripts and dependencies.
- `index.html`: Vite app entry.
- `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `postcss.config.js`, `tailwind.config.js`: build and styling config.
- `src/main.tsx`: React root.
- `src/app/App.tsx`: top-level state, routing-by-tab, page composition.
- `src/styles/index.css`: Tailwind entry and global theme rules.
- `src/types/knowledge.ts`: shared domain types.
- `src/data/categories.ts`: knowledge module definitions.
- `src/data/sources.ts`: source metadata.
- `src/data/topics.ts`: at least 40 typed topic records.
- `src/data/questions.ts`: at least 80 typed interview question/follow-up records.
- `src/data/projects.ts`: four project evidence tracks.
- `src/data/sprint.ts`: 14-day sprint plan.
- `src/data/index.ts`: derived exports and lookup helpers.
- `src/hooks/useProgressStore.ts`: localStorage-backed progress state.
- `src/components/shared/*.tsx`: reusable UI primitives.
- `src/components/dashboard/Dashboard.tsx`: two-week dashboard.
- `src/components/knowledge/KnowledgeMap.tsx`: module/topic map.
- `src/components/knowledge/TopicDetail.tsx`: topic learning/interview/project detail.
- `src/components/interview/InterviewDrill.tsx`: question filter and answer reveal.
- `src/components/project/ProjectTrack.tsx`: project evidence view.
- `scripts/validate-data.mjs`: data relationship checker.
- `docs/superpowers/plans/2026-06-29-agent-interview-knowledge-brain.md`: this plan.

## Implementation Tasks

### Task 1: Scaffold Vite React App

**Files:**

- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `postcss.config.js`
- Create: `tailwind.config.js`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/styles/index.css`

- [ ] **Step 1: Create package and build config**

Write `package.json` with these scripts:

```json
{
  "name": "agent-interview-knowledge-brain",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "validate:data": "node scripts/validate-data.mjs"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "lucide-react": "^0.468.0",
    "vite": "^6.0.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.17",
    "@types/react-dom": "^18.3.5",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2"
  }
}
```

Write Vite, TypeScript, PostCSS, and Tailwind config using standard React + TS settings.

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install
```

Expected: `node_modules/` and `package-lock.json` are created.

- [ ] **Step 3: Create minimal React entry**

Create `index.html`, `src/main.tsx`, `src/app/App.tsx`, and `src/styles/index.css`.

`src/app/App.tsx` starts with a minimal layout:

```tsx
export function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <h1>AI Agent 面试知识脑</h1>
    </main>
  );
}
```

- [ ] **Step 4: Verify scaffold**

Run:

```bash
npm run build
```

Expected: TypeScript compiles and Vite emits `dist/`.

### Task 2: Define Domain Types and Seed Data Shape

**Files:**

- Create: `src/types/knowledge.ts`
- Create: `src/data/categories.ts`
- Create: `src/data/sources.ts`
- Create: `src/data/index.ts`

- [ ] **Step 1: Define domain types**

Create `src/types/knowledge.ts` with exported types:

```ts
export type Priority = "must" | "follow_up" | "extension";
export type Frequency = "high" | "medium" | "low";
export type RoleTag = "development" | "algorithm" | "general";
export type Mastery = "new" | "learning" | "can_explain" | "can_answer_followups" | "project_ready";
export type QuestionStatus = "new" | "practicing" | "missed" | "passed";
export type ProjectId = "paper-agent" | "travel-agent" | "web-agent" | "coding-agent";

export type Category = {
  id: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
};

export type Source = {
  id: string;
  title: string;
  url: string;
  kind: "github" | "official" | "paper" | "benchmark" | "doc";
};

export type Topic = {
  id: string;
  title: string;
  categoryId: string;
  priority: Priority;
  interviewFrequency: Frequency;
  roleTags: RoleTag[];
  prerequisites: string[];
  summary: string;
  mustRemember: string[];
  details: string[];
  engineeringNotes: string[];
  commonPitfalls: string[];
  questionIds: string[];
  projectEvidenceIds: string[];
  sourceIds: string[];
};

export type InterviewQuestion = {
  id: string;
  topicIds: string[];
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  roleTags: RoleTag[];
  companyTags: string[];
  frequency: Frequency;
  answerOutline: string[];
  followUps: string[];
  projectAnswerHints: string[];
  commonMistakes: string[];
};

export type ProjectEvidence = {
  id: string;
  project: ProjectId;
  title: string;
  scenario: string;
  architecturePoints: string[];
  tools: string[];
  evalPoints: string[];
  safetyPoints: string[];
  resumeBullet: string;
  relatedTopicIds: string[];
};

export type SprintTask = {
  id: string;
  day: number;
  title: string;
  topicIds: string[];
  questionIds: string[];
  projectEvidenceIds: string[];
  expectedOutcome: string;
};
```

- [ ] **Step 2: Create categories and sources**

Create 15 categories matching the design document modules. Create source metadata for AgentGuide, Anthropic, OpenAI, MCP, LangGraph, OpenAI Agents SDK, Promptfoo, DeepEval, Inspect, WebArena, OSWorld, BrowserGym, and Playwright.

- [ ] **Step 3: Create data index helpers**

Create `src/data/index.ts` exporting typed arrays and lookup maps:

```ts
import { categories } from "./categories";
import { projectEvidence } from "./projects";
import { questions } from "./questions";
import { sources } from "./sources";
import { sprintTasks } from "./sprint";
import { topics } from "./topics";

export { categories, projectEvidence, questions, sources, sprintTasks, topics };

export const topicById = new Map(topics.map((topic) => [topic.id, topic]));
export const questionById = new Map(questions.map((question) => [question.id, question]));
export const projectEvidenceById = new Map(projectEvidence.map((item) => [item.id, item]));
export const categoryById = new Map(categories.map((category) => [category.id, category]));
export const sourceById = new Map(sources.map((source) => [source.id, source]));
```

The imports for `projects`, `questions`, `sprint`, and `topics` will resolve after later tasks add those files.

### Task 3: Add Core Topics, Questions, Projects, and Sprint Data

**Files:**

- Create: `src/data/topics.ts`
- Create: `src/data/questions.ts`
- Create: `src/data/projects.ts`
- Create: `src/data/sprint.ts`

- [ ] **Step 1: Create at least 40 core topics**

Create `topics.ts` with `export const topics = [...] satisfies Topic[];`.

Include topics covering:

- Agent definition and boundaries
- Workflow vs Agent
- Agent core modules
- ReAct
- Planning methods
- Tool schema
- Tool registry
- Tool error handling
- Function calling
- State management
- Short-term memory
- Long-term memory
- Memory decay
- Context engineering
- Context compression
- RAG pipeline
- Hybrid search
- Rerank
- Citation grounding
- Agentic RAG
- Multi-agent roles
- Handoff
- MCP fundamentals
- Skills
- A2A / ACP
- Component eval
- Trajectory eval
- Trace and replay
- Guardrails
- Tool permissions
- Prompt injection
- Sandbox
- Browser observation
- Playwright actions
- Web Agent eval
- Coding agent harness
- Context compaction
- SWE-bench
- Framework selection
- Project storytelling

Each topic must include at least 3 `mustRemember` items, 2 `engineeringNotes`, 2 `commonPitfalls`, and source IDs.

- [ ] **Step 2: Create at least 80 interview question records**

Create `questions.ts` with `export const questions = [...] satisfies InterviewQuestion[];`.

Use a mix of:

- AgentGuide high-frequency questions
- follow-up questions from the design
- system design questions
- engineering detail questions

Each question must include non-empty `answerOutline`, `followUps`, `projectAnswerHints`, and `commonMistakes`.

- [ ] **Step 3: Create four project evidence tracks**

Create `projects.ts` with project evidence for:

- Paper Agent
- Travel Agent
- Web Agent
- Coding Agent

Each track must include architecture points, tools, eval points, safety points, a resume bullet, and related topic IDs.

- [ ] **Step 4: Create 14-day sprint plan**

Create `sprint.ts` with 14 `SprintTask` records matching the design document. Each day must have topic IDs, question IDs, project evidence IDs, and an expected outcome.

### Task 4: Add Progress Store

**Files:**

- Create: `src/hooks/useProgressStore.ts`

- [ ] **Step 1: Implement localStorage-backed progress**

Create a hook that stores:

- topic mastery by topic ID
- question status by question ID
- completed sprint task IDs
- selected sprint day

The hook API:

```ts
export type ProgressState = {
  topicMastery: Record<string, Mastery>;
  questionStatus: Record<string, QuestionStatus>;
  completedSprintTaskIds: string[];
  selectedDay: number;
};

export type ProgressActions = {
  setTopicMastery: (topicId: string, mastery: Mastery) => void;
  setQuestionStatus: (questionId: string, status: QuestionStatus) => void;
  toggleSprintTask: (taskId: string) => void;
  setSelectedDay: (day: number) => void;
  resetProgress: () => void;
};
```

Use `useEffect` to persist to `localStorage` under key `agent-interview-progress-v1`.

- [ ] **Step 2: Verify persistence manually**

After UI exists, change a status, refresh the page, and confirm the state remains.

### Task 5: Build Shared UI Components

**Files:**

- Create: `src/components/shared/Badge.tsx`
- Create: `src/components/shared/Button.tsx`
- Create: `src/components/shared/FilterButton.tsx`
- Create: `src/components/shared/ProgressBar.tsx`
- Create: `src/components/shared/StatCard.tsx`
- Create: `src/components/shared/EmptyState.tsx`
- Create: `src/components/shared/Section.tsx`

- [ ] **Step 1: Create small reusable components**

Components should be typed, focused, and styling-only. Use Tailwind utility classes and lucide icons where useful.

`Button` props:

```ts
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};
```

`ProgressBar` props:

```ts
type ProgressBarProps = {
  value: number;
  max: number;
  label?: string;
};
```

- [ ] **Step 2: Keep components layout-stable**

Use fixed icon button dimensions, responsive wrapping, and no viewport-width font scaling.

### Task 6: Build App Shell and Dashboard

**Files:**

- Modify: `src/app/App.tsx`
- Create: `src/components/dashboard/Dashboard.tsx`

- [ ] **Step 1: Implement top-level navigation**

`App.tsx` should maintain:

```ts
type View = "dashboard" | "map" | "topic" | "drill" | "projects";
```

It should pass selected topic/question/project callbacks to child pages.

- [ ] **Step 2: Build Dashboard**

Dashboard must show:

- two-week progress
- selected day task list
- mastery overview
- high-frequency questions due
- weak topics
- project evidence gaps

Use data from `topics`, `questions`, `projectEvidence`, `sprintTasks`, and `useProgressStore`.

- [ ] **Step 3: Verify Dashboard path**

Run:

```bash
npm run build
```

Expected: build passes and dashboard renders with seed data.

### Task 7: Build Knowledge Map and Topic Detail

**Files:**

- Create: `src/components/knowledge/KnowledgeMap.tsx`
- Create: `src/components/knowledge/TopicDetail.tsx`
- Modify: `src/app/App.tsx`

- [ ] **Step 1: Implement Knowledge Map**

Knowledge Map must support filters:

- priority: all / must / follow_up / extension
- role: all / development / algorithm / general

Each category section displays topic counts, mastered counts, high-frequency question counts, and project evidence counts.

- [ ] **Step 2: Implement Topic Detail**

Topic Detail must show tabs:

- 学习
- 面试
- 项目
- 资料

It must render summary, must-remember bullets, details, engineering notes, pitfalls, linked questions, linked project evidence, linked sources, and mastery controls.

- [ ] **Step 3: Verify map-to-detail flow**

Click a topic in Knowledge Map and confirm Topic Detail opens for the selected topic.

### Task 8: Build Interview Drill

**Files:**

- Create: `src/components/interview/InterviewDrill.tsx`
- Modify: `src/app/App.tsx`

- [ ] **Step 1: Implement filters and question list**

Support filters:

- module/topic category
- role
- difficulty
- frequency
- status

Render one selected question at a time with answer hidden by default.

- [ ] **Step 2: Implement answer reveal and status update**

After clicking reveal, show answer outline, follow-ups, project hints, and common mistakes. Provide controls for `passed`, `practicing`, and `missed`.

- [ ] **Step 3: Verify answer is hidden initially**

Reload the page, open Interview Drill, select a question, and confirm answer content is not visible until reveal.

### Task 9: Build Project Track

**Files:**

- Create: `src/components/project/ProjectTrack.tsx`
- Modify: `src/app/App.tsx`

- [ ] **Step 1: Implement project selector**

Support four tracks:

- Paper Agent
- Travel Agent
- Web Agent
- Coding Agent

Render scenario, architecture points, tools, eval points, safety points, resume bullet, and related topics.

- [ ] **Step 2: Link project topics back to Topic Detail**

Clicking a related topic opens Topic Detail.

### Task 10: Add Data Validation Script

**Files:**

- Create: `scripts/validate-data.mjs`
- Modify: `package.json`

- [ ] **Step 1: Implement reference validation**

The script must import built data after TypeScript compilation or use a lightweight static parser over source text.

Validate:

- every `topic.categoryId` exists
- every topic prerequisite exists
- every `topic.questionIds` exists
- every `topic.projectEvidenceIds` exists
- every `topic.sourceIds` exists
- every `question.topicIds` exists
- every `projectEvidence.relatedTopicIds` exists
- every `sprint.topicIds`, `sprint.questionIds`, and `sprint.projectEvidenceIds` exists
- topic count is at least 40
- question count is at least 80
- sprint task count is exactly 14
- four project IDs are present

- [ ] **Step 2: Add validation to build flow**

Keep `npm run build` as TypeScript + Vite build. Run validation separately with:

```bash
npm run validate:data
```

### Task 11: Polish Responsive UI and Accessibility

**Files:**

- Modify: `src/styles/index.css`
- Modify: `src/app/App.tsx`
- Modify: relevant component files

- [ ] **Step 1: Ensure no marketing landing page**

The first screen must be the Dashboard, with current sprint tasks visible.

- [ ] **Step 2: Ensure mobile readability**

At a narrow viewport, navigation must collapse or wrap without overlapping content. Buttons and cards must keep text inside their containers.

- [ ] **Step 3: Ensure keyboard-visible controls**

Buttons, filter chips, and status controls must have focus-visible styles.

### Task 12: Verify, Run, and Browser Check

**Files:**

- Modify only if verification reveals issues.

- [ ] **Step 1: Run data validation**

Run:

```bash
npm run validate:data
```

Expected: all checks pass.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build pass.

- [ ] **Step 3: Start dev server**

Run:

```bash
npm run dev
```

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`.

- [ ] **Step 4: Browser smoke test**

Open the local URL and verify:

- Dashboard shows two-week sprint tasks.
- Knowledge Map opens and topic cards are clickable.
- Topic Detail has 学习、面试、项目、资料 tabs.
- Interview Drill hides answers until reveal.
- Project Track shows four project routes.
- Status changes survive refresh.

- [ ] **Step 5: Final cleanup**

Run:

```bash
git status --short
```

If the directory is still not a git repository, report the changed files instead with:

```bash
find . -maxdepth 3 -type f | sort
```

## Self-Review

### Spec Coverage

- Five pages are covered by Tasks 6-9.
- Local-first data and progress are covered by Tasks 2-4.
- At least 40 topics, 80 questions, four project tracks, and 14 sprint days are covered by Task 3 and validated by Task 10.
- Desktop-first responsive learning workspace is covered by Tasks 5 and 11.
- Build, data validation, dev server, and browser smoke test are covered by Task 12.

### Known Scope Boundaries

- No login, cloud sync, backend, AI auto-generation, public portfolio landing page, or real Agent execution environment in MVP.
- The workspace is not a git repository, so commit steps are intentionally omitted from this plan. If a git repository is initialized later, commit after each task using only files changed by that task.

