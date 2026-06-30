# Graph Guided Learning Phase 1 Implementation Plan

> **2026-06-29 direction update:** 用户反馈“网站看着太复杂了，不要搞得这么复杂，专注核心内容”。本计划中的三栏式 `PathRail / GraphCanvas / NodeInspector` 实现已降级为历史方案；当前落地版本保留 Graph Guided Learning 的路径和关系数据，但首页呈现为更简洁的“当前路径 + 当前知识点 + 必须记住 + 答题骨架 + 练题/追问/项目”核心学习页。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Graph Guided Learning the default learning experience for the AI Agent interview prep app without deleting the existing review, drill, mock, cheat-sheet, and project tools.

**Architecture:** Add a typed static knowledge graph layer on top of existing `Topic`, `InterviewQuestion`, `ProjectEvidence`, and `SprintTask` data. Build a three-column `GraphLearning` view: path rail, fixed-layout graph canvas, and node inspector. Keep existing pages as auxiliary tools and route node actions into them.

**Tech Stack:** Vite, React, TypeScript, Tailwind CSS, lucide-react, localStorage, `tsx` validation scripts, SVG/HTML fixed graph layout.

---

## Current Constraints

- Workspace root: `/Users/wumin/workspace/github/for-work`
- Current app is not a git repository; commit steps should be skipped unless a `.git` directory is later created.
- User requested: pause menu/list-style expansion and avoid rushing into broad code changes.
- This plan implements the first minimal Graph Mode slice only.
- Generated code comments must include `@author codex`.
- Do not move or delete the existing `images/` directory.

## File Structure

Create:

- `scripts/validate-graph.mjs`: graph/path relationship validator and minimal behavior checks.
- `src/data/graphEdges.ts`: explicit and derived graph edges.
- `src/data/learningPaths.ts`: four main learning paths covering all 47 topics.
- `src/utils/knowledgeGraph.ts`: derived graph view model, next-node recommendation, node inspector data.
- `src/components/graph/GraphLearning.tsx`: top-level Graph Mode view.
- `src/components/graph/PathRail.tsx`: left column path and utility navigation.
- `src/components/graph/GraphCanvas.tsx`: center fixed-layout graph.
- `src/components/graph/NodeInspector.tsx`: right column node details and actions.

Modify:

- `src/types/knowledge.ts`: add graph and learning path types.
- `src/data/index.ts`: export graph/path data and lookup maps.
- `scripts/validate-data.mjs`: include graph validation by importing the new validator helpers or duplicate checks.
- `package.json`: add `validate:graph` and `validate:all`.
- `src/app/App.tsx`: add `graph` view as default, reduce old pages to auxiliary navigation.

Do not modify in Phase 1:

- Existing content seed files except for exports.
- `ReviewQueue`, `InterviewDrill`, `MockInterview`, `CheatSheet`, and `ProjectTrack` internals.
- Any backend, auth, persistence, account, or deployment code.

## Task 1: Add Graph Validation Harness

**Files:**

- Create: `scripts/validate-graph.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing validation script**

Create `scripts/validate-graph.mjs`:

```js
// @author codex
import assert from "node:assert/strict";
import {
  graphEdges,
  learningPaths,
  projectEvidence,
  topics,
} from "../src/data/index.ts";
import { buildKnowledgeGraph } from "../src/utils/knowledgeGraph.ts";

const topicIds = new Set(topics.map((topic) => topic.id));
const projectEvidenceIds = new Set(projectEvidence.map((item) => item.id));
const graphNodeIds = new Set([...topicIds, ...projectEvidenceIds]);
const errors = [];

const requireRef = (kind, ownerId, ref, targetIds, targetKind) => {
  if (!targetIds.has(ref)) {
    errors.push(`${kind} ${ownerId} references missing ${targetKind}: ${ref}`);
  }
};

for (const edge of graphEdges) {
  requireRef("edge", edge.id, edge.from, graphNodeIds, "graph node");
  requireRef("edge", edge.id, edge.to, graphNodeIds, "graph node");
  if (!edge.label.trim()) errors.push(`edge ${edge.id} must include label`);
  if (!edge.reason.trim()) errors.push(`edge ${edge.id} must include reason`);
  if (![1, 2, 3].includes(edge.strength)) {
    errors.push(`edge ${edge.id} must use strength 1, 2, or 3`);
  }
}

for (const path of learningPaths) {
  if (path.nodeIds.length < 5) {
    errors.push(`path ${path.id} must include at least 5 nodes`);
  }
  if (path.exitCriteria.length < 2) {
    errors.push(`path ${path.id} must include at least 2 exit criteria`);
  }
  for (const nodeId of path.nodeIds) {
    requireRef("path", path.id, nodeId, topicIds, "topic");
  }
}

const pathTopicIds = new Set(learningPaths.flatMap((path) => path.nodeIds));
for (const topic of topics) {
  if (!pathTopicIds.has(topic.id)) {
    errors.push(`topic ${topic.id} is not covered by any learning path`);
  }
}

if (graphEdges.length < 100) {
  errors.push(`expected at least 100 graph edges, got ${graphEdges.length}`);
}

const graph = buildKnowledgeGraph({
  completedSprintTaskIds: [],
  questionStatus: {},
  selectedPathId: "agent-engineering-mainline",
  topicMastery: {},
});

assert.equal(graph.paths.length, learningPaths.length);
assert.equal(graph.currentPath.id, "agent-engineering-mainline");
assert.equal(graph.selectedNode.topic.id, "agent-definition");
assert.ok(graph.selectedNode.outgoingEdges.length > 0);
assert.ok(graph.nextNode);

if (errors.length > 0) {
  console.error("Graph validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Graph validation passed: ${topics.length} topics, ${learningPaths.length} paths, ${graphEdges.length} edges.`,
);
```

- [ ] **Step 2: Run validation to verify it fails**

Run:

```bash
npx tsx scripts/validate-graph.mjs
```

Expected: FAIL with module-not-found errors for `graphEdges`, `learningPaths`, or `knowledgeGraph`.

- [ ] **Step 3: Add package scripts**

Modify `package.json` scripts:

```json
{
  "dev": "vite --host 127.0.0.1",
  "build": "tsc -b && vite build",
  "preview": "vite preview --host 127.0.0.1",
  "validate:data": "tsx scripts/validate-data.mjs",
  "validate:graph": "tsx scripts/validate-graph.mjs",
  "validate:all": "npm run validate:data && npm run validate:graph"
}
```

- [ ] **Step 4: Run validation again**

Run:

```bash
npm run validate:graph
```

Expected: still FAIL because graph data and utility do not exist. This confirms the script is wired into npm.

## Task 2: Add Graph Types, Edges, and Learning Paths

**Files:**

- Modify: `src/types/knowledge.ts`
- Create: `src/data/learningPaths.ts`
- Create: `src/data/graphEdges.ts`
- Modify: `src/data/index.ts`

- [ ] **Step 1: Add graph domain types**

Append to `src/types/knowledge.ts`:

```ts
export type GraphNodeKind = "topic" | "question" | "project" | "milestone";

export type KnowledgeEdgeKind =
  | "prerequisite"
  | "builds_on"
  | "contrasts"
  | "extends"
  | "interview_followup"
  | "project_evidence"
  | "same_path"
  | "review_after";

export type KnowledgeEdge = {
  id: string;
  from: string;
  to: string;
  kind: KnowledgeEdgeKind;
  label: string;
  strength: 1 | 2 | 3;
  reason: string;
  pathIds?: string[];
};

export type LearningPathMode = "foundation" | "interview" | "project" | "sprint";

export type LearningPath = {
  id: string;
  title: string;
  mode: LearningPathMode;
  description: string;
  nodeIds: string[];
  dayRange?: [number, number];
  exitCriteria: string[];
};
```

- [ ] **Step 2: Create learning paths covering all 47 topics**

Create `src/data/learningPaths.ts`:

```ts
// @author codex
import type { LearningPath } from "../types/knowledge";

export const learningPaths: LearningPath[] = [
  {
    id: "agent-engineering-mainline",
    title: "Agent 工程主干",
    mode: "foundation",
    description: "两周冲刺的主骨架：先建立 Agent 边界、执行闭环、工具、状态、上下文、评测和安全的全局框架。",
    dayRange: [1, 4],
    nodeIds: [
      "agent-definition",
      "workflow-vs-agent",
      "agent-core-modules",
      "agent-failure-modes",
      "react-loop",
      "planning-methods",
      "reflection-review",
      "tool-schema",
      "tool-registry",
      "tool-error-recovery",
      "function-calling",
      "state-management",
      "short-term-memory",
      "context-layers",
      "component-eval",
      "guardrails",
    ],
    exitCriteria: [
      "能用七模块框架解释一个 Agent 是否值得做",
      "能说明 workflow、agent loop、tool use、state、eval、安全之间的关系",
      "至少通过本路径 6 道高频题",
    ],
  },
  {
    id: "rag-memory-context",
    title: "RAG / Memory / Context 深挖",
    mode: "interview",
    description: "面试高频深挖线：把 RAG、检索、引用、长期记忆、记忆污染和上下文压缩串成一条可追问路径。",
    dayRange: [5, 8],
    nodeIds: [
      "long-term-memory",
      "memory-decay",
      "context-compression",
      "rag-pipeline",
      "hybrid-search",
      "rerank",
      "citation-grounding",
      "agentic-rag",
      "trajectory-eval",
      "trace-replay",
    ],
    exitCriteria: [
      "能从 RAG 错误答案反推出检索、重排、上下文或生成问题",
      "能解释长期记忆写入、读取、衰退和污染控制",
      "能用 Paper Agent 项目承接引用准确率和幻觉控制追问",
    ],
  },
  {
    id: "tool-protocol-multi-agent",
    title: "Tool / MCP / Multi-Agent 工程",
    mode: "sprint",
    description: "工程落地线：从 function calling 到 MCP、Skills、handoff、多 Agent 协调和权限边界。",
    dayRange: [9, 11],
    nodeIds: [
      "mcp-fundamentals",
      "skills",
      "a2a-acp",
      "multi-agent-roles",
      "handoff-pattern",
      "tool-permissions",
      "prompt-injection",
      "sandbox",
      "framework-selection",
      "langgraph",
      "openai-agents-sdk",
    ],
    exitCriteria: [
      "能区分 tool schema、MCP、Skills、A2A/ACP 和框架能力",
      "能设计多 Agent handoff payload、权限和审计策略",
      "能说明 prompt injection、tool permission、sandbox 如何组合防护",
    ],
  },
  {
    id: "web-coding-project-story",
    title: "Web/Coding Agent 与项目表达",
    mode: "project",
    description: "项目和简历线：把 Browser Agent、Coding Agent、评测和四条项目故事串成能面试表达的证据链。",
    dayRange: [12, 14],
    nodeIds: [
      "browser-observation",
      "playwright-actions",
      "web-agent-eval",
      "coding-harness",
      "context-compaction",
      "swe-bench",
      "project-storytelling",
      "paper-agent-project",
      "travel-agent-project",
      "web-agent-project",
    ],
    exitCriteria: [
      "能用 Web Agent 讲观察、动作、验证、恢复和安全边界",
      "能用 Coding Agent 讲 harness、sandbox、测试反馈和 SWE-bench 思路",
      "能准备 2 分钟、8 分钟、15 分钟三档项目表达",
    ],
  },
];
```

- [ ] **Step 3: Create graph edges with derived and manual relationships**

Create `src/data/graphEdges.ts`:

```ts
// @author codex
import type { KnowledgeEdge, ProjectId } from "../types/knowledge";
import { learningPaths } from "./learningPaths";
import { projectEvidence } from "./projects";
import { sprintTasks } from "./sprint";
import { topics } from "./topics";

const edgeKey = (kind: KnowledgeEdge["kind"], from: string, to: string) =>
  `${kind}:${from}->${to}`;

const projectTopicByProject: Record<ProjectId, string> = {
  "paper-agent": "paper-agent-project",
  "travel-agent": "travel-agent-project",
  "web-agent": "web-agent-project",
  "coding-agent": "coding-harness",
};

const prerequisiteEdges: KnowledgeEdge[] = topics.flatMap((topic) =>
  topic.prerequisites.map((sourceId) => ({
    id: edgeKey("prerequisite", sourceId, topic.id),
    from: sourceId,
    to: topic.id,
    kind: "prerequisite",
    label: "前置",
    strength: 3,
    reason: `${topic.title} 需要先理解前置知识点 ${sourceId}。`,
  })),
);

const samePathEdges: KnowledgeEdge[] = learningPaths.flatMap((path) =>
  path.nodeIds.slice(0, -1).map((from, index) => {
    const to = path.nodeIds[index + 1];
    return {
      id: `${path.id}:${edgeKey("same_path", from, to)}`,
      from,
      to,
      kind: "same_path",
      label: "路径下一步",
      strength: 2,
      reason: `${path.title} 中 ${from} 之后应学习 ${to}。`,
      pathIds: [path.id],
    };
  }),
);

const sprintEdges: KnowledgeEdge[] = sprintTasks.flatMap((task) =>
  task.topicIds.slice(0, -1).map((from, index) => {
    const to = task.topicIds[index + 1];
    return {
      id: `day-${task.day}:${edgeKey("same_path", from, to)}`,
      from,
      to,
      kind: "same_path",
      label: `Day ${task.day}`,
      strength: 2,
      reason: `Day ${task.day} 冲刺任务中 ${from} 与 ${to} 连续出现。`,
    };
  }),
);

const projectEvidenceEdges: KnowledgeEdge[] = projectEvidence.flatMap((item) =>
  item.relatedTopicIds.flatMap((topicId) => {
    const projectTopic = projectTopicByProject[item.project];
    return [
      {
        id: `${item.id}:${edgeKey("project_evidence", topicId, item.id)}`,
        from: topicId,
        to: item.id,
        kind: "project_evidence",
        label: "项目证据",
        strength: 2,
        reason: `${topicId} 可以落到项目证据 ${item.title}。`,
      },
      {
        id: `${item.id}:${edgeKey("project_evidence", topicId, projectTopic)}`,
        from: topicId,
        to: projectTopic,
        kind: "project_evidence",
        label: "项目表达",
        strength: 2,
        reason: `${topicId} 可以在 ${item.title} 中形成面试话术。`,
      },
    ];
  }),
);

const manualEdges: KnowledgeEdge[] = [
  {
    id: "manual:workflow-vs-agent->react-loop",
    from: "workflow-vs-agent",
    to: "react-loop",
    kind: "contrasts",
    label: "控制权差异",
    strength: 3,
    reason: "workflow 与 agent loop 的核心差异是控制权由代码还是模型掌握。",
  },
  {
    id: "manual:react-loop->tool-schema",
    from: "react-loop",
    to: "tool-schema",
    kind: "builds_on",
    label: "行动接口",
    strength: 3,
    reason: "Agent loop 中的 act 阶段必须通过稳定工具 schema 执行。",
  },
  {
    id: "manual:tool-schema->function-calling",
    from: "tool-schema",
    to: "function-calling",
    kind: "builds_on",
    label: "结构化调用",
    strength: 3,
    reason: "Function calling 是工具 schema 在模型输出层的结构化体现。",
  },
  {
    id: "manual:function-calling->tool-permissions",
    from: "function-calling",
    to: "tool-permissions",
    kind: "interview_followup",
    label: "调用安全",
    strength: 3,
    reason: "面试常从 function calling 追问到宿主校验、权限和高风险动作确认。",
  },
  {
    id: "manual:state-management->context-compression",
    from: "state-management",
    to: "context-compression",
    kind: "builds_on",
    label: "长任务恢复",
    strength: 3,
    reason: "上下文压缩后能否恢复任务，取决于 state 是否结构化保存。",
  },
  {
    id: "manual:rag-pipeline->hybrid-search",
    from: "rag-pipeline",
    to: "hybrid-search",
    kind: "extends",
    label: "召回增强",
    strength: 2,
    reason: "混合检索是 RAG 召回阶段的关键增强方式。",
  },
  {
    id: "manual:hybrid-search->rerank",
    from: "hybrid-search",
    to: "rerank",
    kind: "builds_on",
    label: "筛选证据",
    strength: 2,
    reason: "初召回后需要 rerank 把真正能支撑答案的证据放前面。",
  },
  {
    id: "manual:rerank->citation-grounding",
    from: "rerank",
    to: "citation-grounding",
    kind: "builds_on",
    label: "引用可信",
    strength: 3,
    reason: "引用准确性依赖被选入上下文的证据真正支撑 claim。",
  },
  {
    id: "manual:citation-grounding->agentic-rag",
    from: "citation-grounding",
    to: "agentic-rag",
    kind: "extends",
    label: "主动补证据",
    strength: 2,
    reason: "Agentic RAG 会根据 citation gap 主动继续查证。",
  },
  {
    id: "manual:long-term-memory->memory-decay",
    from: "long-term-memory",
    to: "memory-decay",
    kind: "interview_followup",
    label: "记忆污染",
    strength: 3,
    reason: "长期记忆面试追问经常转向过期、冲突和污染控制。",
  },
  {
    id: "manual:mcp-fundamentals->skills",
    from: "mcp-fundamentals",
    to: "skills",
    kind: "contrasts",
    label: "协议与流程",
    strength: 2,
    reason: "MCP 更偏能力接入协议，Skills 更偏流程知识封装。",
  },
  {
    id: "manual:mcp-fundamentals->a2a-acp",
    from: "mcp-fundamentals",
    to: "a2a-acp",
    kind: "contrasts",
    label: "协议边界",
    strength: 2,
    reason: "MCP、A2A、ACP 的边界是协议类面试题的核心。",
  },
  {
    id: "manual:multi-agent-roles->handoff-pattern",
    from: "multi-agent-roles",
    to: "handoff-pattern",
    kind: "builds_on",
    label: "角色交接",
    strength: 3,
    reason: "多 Agent 角色分工必须通过清晰 handoff 保持任务所有权。",
  },
  {
    id: "manual:prompt-injection->tool-permissions",
    from: "prompt-injection",
    to: "tool-permissions",
    kind: "builds_on",
    label: "注入后的动作边界",
    strength: 3,
    reason: "prompt injection 的危害会通过工具权限扩大成外部副作用。",
  },
  {
    id: "manual:sandbox->coding-harness",
    from: "sandbox",
    to: "coding-harness",
    kind: "builds_on",
    label: "执行隔离",
    strength: 3,
    reason: "Coding Agent harness 必须依赖 sandbox 控制 shell、文件和网络动作。",
  },
  {
    id: "manual:browser-observation->playwright-actions",
    from: "browser-observation",
    to: "playwright-actions",
    kind: "builds_on",
    label: "观察到动作",
    strength: 3,
    reason: "Browser Agent 先把页面观察成状态，再执行 Playwright 动作。",
  },
  {
    id: "manual:playwright-actions->web-agent-eval",
    from: "playwright-actions",
    to: "web-agent-eval",
    kind: "builds_on",
    label: "动作验证",
    strength: 3,
    reason: "浏览器动作必须用 verifier 验证，才能进入 Web Agent 评测。",
  },
  {
    id: "manual:coding-harness->swe-bench",
    from: "coding-harness",
    to: "swe-bench",
    kind: "extends",
    label: "真实代码评测",
    strength: 2,
    reason: "SWE-bench 是 coding harness 能力的 benchmark 化表达。",
  },
  {
    id: "manual:project-storytelling->paper-agent-project",
    from: "project-storytelling",
    to: "paper-agent-project",
    kind: "project_evidence",
    label: "项目故事",
    strength: 2,
    reason: "Paper Agent 是 RAG、引用、评测和幻觉控制的项目证据线。",
  },
  {
    id: "manual:project-storytelling->travel-agent-project",
    from: "project-storytelling",
    to: "travel-agent-project",
    kind: "project_evidence",
    label: "项目故事",
    strength: 2,
    reason: "Travel Agent 是多约束规划、工具编排和人机确认的项目证据线。",
  },
  {
    id: "manual:project-storytelling->web-agent-project",
    from: "project-storytelling",
    to: "web-agent-project",
    kind: "project_evidence",
    label: "项目故事",
    strength: 2,
    reason: "Web Agent 是观察、动作、验证、恢复和安全边界的项目证据线。",
  },
];

const dedupeEdges = (edges: KnowledgeEdge[]) => {
  const seen = new Set<string>();
  return edges.filter((edge) => {
    if (seen.has(edge.id)) return false;
    seen.add(edge.id);
    return true;
  });
};

export const graphEdges: KnowledgeEdge[] = dedupeEdges([
  ...prerequisiteEdges,
  ...samePathEdges,
  ...sprintEdges,
  ...projectEvidenceEdges,
  ...manualEdges,
]);
```

- [ ] **Step 4: Export graph data**

Modify `src/data/index.ts`:

```ts
import { graphEdges } from "./graphEdges";
import { learningPaths } from "./learningPaths";

export {
  categories,
  graphEdges,
  learningPaths,
  projectEvidence,
  questions,
  sources,
  sprintTasks,
  topics,
};

export const learningPathById = new Map(
  learningPaths.map((path) => [path.id, path]),
);
export const graphEdgeById = new Map(graphEdges.map((edge) => [edge.id, edge]));
```

Keep the existing exports and maps in the same file.

- [ ] **Step 5: Run graph validation and observe the next failure**

Run:

```bash
npm run validate:graph
```

Expected: FAIL because `src/utils/knowledgeGraph.ts` does not exist.

## Task 3: Build Knowledge Graph View Model

**Files:**

- Create: `src/utils/knowledgeGraph.ts`
- Test: `scripts/validate-graph.mjs`

- [ ] **Step 1: Implement the graph view model**

Create `src/utils/knowledgeGraph.ts`:

```ts
// @author codex
import {
  graphEdges,
  learningPaths,
  projectEvidenceById,
  questionById,
  topicById,
  topics,
} from "../data";
import type {
  KnowledgeEdge,
  LearningPath,
  Mastery,
  ProjectEvidence,
  QuestionStatus,
  Topic,
} from "../types/knowledge";
import { masteryRank } from "./labels";

export type GraphMode = "learn" | "interview" | "project" | "review";

export type KnowledgeGraphNode = {
  topic: Topic;
  pathIds: string[];
  mastery: Mastery;
  isCurrentPathNode: boolean;
  isBlocked: boolean;
  x: number;
  y: number;
};

export type SelectedGraphNode = {
  topic: Topic;
  prerequisites: Topic[];
  outgoingEdges: KnowledgeEdge[];
  incomingEdges: KnowledgeEdge[];
  questions: NonNullable<ReturnType<typeof questionById.get>>[];
  projectEvidence: ProjectEvidence[];
  mastery: Mastery;
  whyNow: string[];
};

export type KnowledgeGraphView = {
  paths: LearningPath[];
  currentPath: LearningPath;
  nodes: KnowledgeGraphNode[];
  visibleEdges: KnowledgeEdge[];
  selectedNode: SelectedGraphNode;
  nextNode: Topic | null;
  blockedNodeIds: string[];
};

const defaultMastery = (
  topicMastery: Record<string, Mastery>,
  topicId: string,
): Mastery => topicMastery[topicId] ?? "new";

const isMasteredForPath = (mastery: Mastery) =>
  masteryRank[mastery] >= masteryRank.can_explain;

const edgeMatchesMode = (edge: KnowledgeEdge, mode: GraphMode) => {
  if (mode === "learn") {
    return ["prerequisite", "builds_on", "same_path", "contrasts"].includes(edge.kind);
  }
  if (mode === "interview") {
    return ["interview_followup", "contrasts", "extends"].includes(edge.kind);
  }
  if (mode === "project") {
    return edge.kind === "project_evidence";
  }
  return ["review_after", "prerequisite", "interview_followup"].includes(edge.kind);
};

const layoutNodes = ({
  currentPath,
  topicMastery,
}: {
  currentPath: LearningPath;
  topicMastery: Record<string, Mastery>;
}) =>
  topics.map<KnowledgeGraphNode>((topic) => {
    const pathIndex = currentPath.nodeIds.indexOf(topic.id);
    const isCurrentPathNode = pathIndex >= 0;
    const prerequisites = topic.prerequisites
      .map((id) => topicById.get(id))
      .filter((item): item is Topic => Boolean(item));
    const isBlocked = prerequisites.some(
      (item) => !isMasteredForPath(defaultMastery(topicMastery, item.id)),
    );
    const column = isCurrentPathNode ? pathIndex % 6 : 6 + (topics.indexOf(topic) % 3);
    const row = isCurrentPathNode ? Math.floor(pathIndex / 6) : Math.floor(topics.indexOf(topic) / 3);

    return {
      topic,
      pathIds: learningPaths
        .filter((path) => path.nodeIds.includes(topic.id))
        .map((path) => path.id),
      mastery: defaultMastery(topicMastery, topic.id),
      isCurrentPathNode,
      isBlocked,
      x: 120 + column * 180,
      y: 90 + row * 130,
    };
  });

const selectNextNode = (
  currentPath: LearningPath,
  topicMastery: Record<string, Mastery>,
) => {
  for (const topicId of currentPath.nodeIds) {
    const topic = topicById.get(topicId);
    if (!topic) continue;
    if (!isMasteredForPath(defaultMastery(topicMastery, topic.id))) return topic;
  }
  return null;
};

const buildWhyNow = ({
  currentPath,
  selectedTopic,
  topicMastery,
}: {
  currentPath: LearningPath;
  selectedTopic: Topic;
  topicMastery: Record<string, Mastery>;
}) => {
  const reasons: string[] = [];
  if (currentPath.nodeIds.includes(selectedTopic.id)) {
    reasons.push(`属于当前路径「${currentPath.title}」。`);
  }
  if (selectedTopic.interviewFrequency === "high") {
    reasons.push("这是高频面试节点，应优先进入能接追问状态。");
  }
  const missingPrerequisites = selectedTopic.prerequisites.filter(
    (topicId) => !isMasteredForPath(defaultMastery(topicMastery, topicId)),
  );
  if (missingPrerequisites.length > 0) {
    reasons.push(`还有 ${missingPrerequisites.length} 个前置节点未到能复述。`);
  }
  if (selectedTopic.projectEvidenceIds.length > 0) {
    reasons.push("这个节点可以直接落到项目证据，适合准备项目化表达。");
  }
  return reasons.length > 0 ? reasons : ["这是当前图谱中可继续推进的知识节点。"];
};

export const buildKnowledgeGraph = ({
  completedSprintTaskIds,
  mode = "learn",
  questionStatus,
  selectedPathId,
  selectedTopicId,
  topicMastery,
}: {
  completedSprintTaskIds: string[];
  mode?: GraphMode;
  questionStatus: Record<string, QuestionStatus>;
  selectedPathId: string;
  selectedTopicId?: string | null;
  topicMastery: Record<string, Mastery>;
}): KnowledgeGraphView => {
  void completedSprintTaskIds;
  void questionStatus;

  const currentPath = learningPaths.find((path) => path.id === selectedPathId) ?? learningPaths[0];
  const nextNode = selectNextNode(currentPath, topicMastery);
  const selectedTopic =
    (selectedTopicId ? topicById.get(selectedTopicId) : undefined) ??
    nextNode ??
    topicById.get(currentPath.nodeIds[0]) ??
    topics[0];
  const nodes = layoutNodes({ currentPath, topicMastery });
  const currentPathNodeIds = new Set(currentPath.nodeIds);
  const visibleEdges = graphEdges.filter((edge) => {
    const belongsToCurrentPath =
      currentPathNodeIds.has(edge.from) || currentPathNodeIds.has(edge.to);
    return belongsToCurrentPath && edgeMatchesMode(edge, mode);
  });
  const incomingEdges = graphEdges.filter((edge) => edge.to === selectedTopic.id);
  const outgoingEdges = graphEdges.filter((edge) => edge.from === selectedTopic.id);
  const prerequisites = selectedTopic.prerequisites
    .map((id) => topicById.get(id))
    .filter((item): item is Topic => Boolean(item));
  const questions = selectedTopic.questionIds
    .map((id) => questionById.get(id))
    .filter((item): item is NonNullable<ReturnType<typeof questionById.get>> => Boolean(item));
  const projectEvidence = selectedTopic.projectEvidenceIds
    .map((id) => projectEvidenceById.get(id))
    .filter((item): item is ProjectEvidence => Boolean(item));

  return {
    paths: learningPaths,
    currentPath,
    nodes,
    visibleEdges,
    selectedNode: {
      topic: selectedTopic,
      prerequisites,
      outgoingEdges,
      incomingEdges,
      questions,
      projectEvidence,
      mastery: defaultMastery(topicMastery, selectedTopic.id),
      whyNow: buildWhyNow({ currentPath, selectedTopic, topicMastery }),
    },
    nextNode,
    blockedNodeIds: nodes
      .filter((node) => node.isBlocked)
      .map((node) => node.topic.id),
  };
};
```

- [ ] **Step 2: Run graph validation**

Run:

```bash
npm run validate:graph
```

Expected: PASS and output like:

```text
Graph validation passed: 47 topics, 4 paths, 100+ edges.
```

- [ ] **Step 3: Run existing data validation**

Run:

```bash
npm run validate:data
```

Expected: PASS with 47 topics, 94 questions, 4 project evidence tracks, 14 sprint days, 47 deep dives.

- [ ] **Step 4: Run TypeScript build**

Run:

```bash
npm run build
```

Expected: PASS.

## Task 4: Build Three-Column GraphLearning View

**Files:**

- Create: `src/components/graph/GraphLearning.tsx`
- Create: `src/components/graph/PathRail.tsx`
- Create: `src/components/graph/GraphCanvas.tsx`
- Create: `src/components/graph/NodeInspector.tsx`

- [ ] **Step 1: Create `PathRail`**

Create `src/components/graph/PathRail.tsx`:

```tsx
// @author codex
import { BookOpenCheck, FileText, MessageSquareText, Route } from "lucide-react";
import type { LearningPath, Mastery } from "../../types/knowledge";
import { masteryLabels } from "../../utils/labels";
import { Badge } from "../shared/Badge";
import { Button } from "../shared/Button";

export function PathRail({
  currentPathId,
  onOpenCheatSheet,
  onOpenMock,
  onOpenReview,
  onSelectPath,
  pathProgress,
  paths,
}: {
  currentPathId: string;
  onOpenCheatSheet: () => void;
  onOpenMock: () => void;
  onOpenReview: () => void;
  onSelectPath: (pathId: string) => void;
  pathProgress: Record<string, { ready: number; total: number; nextMastery: Mastery }>;
  paths: LearningPath[];
}) {
  return (
    <aside className="space-y-4 border-r border-slate-200 bg-white p-4">
      <div>
        <p className="text-xs font-semibold text-teal-700">Graph Guided Learning</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">路径控制台</h2>
      </div>
      <div className="space-y-2">
        {paths.map((path) => {
          const progress = pathProgress[path.id];
          return (
            <button
              className={`w-full rounded-lg border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
                currentPathId === path.id
                  ? "border-teal-300 bg-teal-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
              key={path.id}
              onClick={() => onSelectPath(path.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-slate-950">{path.title}</p>
                <Badge tone={currentPathId === path.id ? "green" : "neutral"}>
                  {progress.ready}/{progress.total}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                {path.description}
              </p>
              <p className="mt-2 text-xs font-semibold text-slate-500">
                下一层级：{masteryLabels[progress.nextMastery]}
              </p>
            </button>
          );
        })}
      </div>
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <Button className="w-full justify-start" onClick={onOpenReview} size="sm">
          <BookOpenCheck className="h-4 w-4" />
          Review Queue
        </Button>
        <Button className="w-full justify-start" onClick={onOpenMock} size="sm">
          <MessageSquareText className="h-4 w-4" />
          Mock Interview
        </Button>
        <Button className="w-full justify-start" onClick={onOpenCheatSheet} size="sm">
          <FileText className="h-4 w-4" />
          Cheat Sheet
        </Button>
        <div className="rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
          <Route className="mb-2 h-4 w-4 text-teal-700" />
          列表页保留为工具箱，默认学习动作从路径节点进入。
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create `GraphCanvas`**

Create `src/components/graph/GraphCanvas.tsx`:

```tsx
// @author codex
import type { KnowledgeGraphNode } from "../../utils/knowledgeGraph";
import type { KnowledgeEdge } from "../../types/knowledge";
import { Badge } from "../shared/Badge";

const nodeTone = (node: KnowledgeGraphNode) => {
  if (node.isBlocked) return "border-amber-300 bg-amber-50 text-amber-950";
  if (node.mastery === "project_ready") return "border-emerald-300 bg-emerald-50 text-emerald-950";
  if (node.isCurrentPathNode) return "border-teal-300 bg-teal-50 text-teal-950";
  return "border-slate-200 bg-white text-slate-800";
};

export function GraphCanvas({
  edges,
  nodes,
  onSelectNode,
  selectedTopicId,
}: {
  edges: KnowledgeEdge[];
  nodes: KnowledgeGraphNode[];
  onSelectNode: (topicId: string) => void;
  selectedTopicId: string;
}) {
  const nodeById = new Map(nodes.map((node) => [node.topic.id, node]));
  const width = Math.max(1180, Math.max(...nodes.map((node) => node.x)) + 220);
  const height = Math.max(720, Math.max(...nodes.map((node) => node.y)) + 180);

  return (
    <section className="relative min-h-[720px] overflow-auto bg-slate-50">
      <div className="relative" style={{ width, height }}>
        <svg className="absolute inset-0 h-full w-full" role="img">
          <title>AI Agent knowledge graph</title>
          {edges.map((edge) => {
            const from = nodeById.get(edge.from);
            const to = nodeById.get(edge.to);
            if (!from || !to) return null;
            return (
              <line
                key={edge.id}
                stroke={edge.strength === 3 ? "#0f766e" : "#94a3b8"}
                strokeDasharray={edge.kind === "interview_followup" ? "6 6" : undefined}
                strokeWidth={edge.strength}
                x1={from.x + 72}
                x2={to.x + 72}
                y1={from.y + 32}
                y2={to.y + 32}
              />
            );
          })}
        </svg>
        {nodes.map((node) => (
          <button
            className={`absolute w-40 rounded-lg border p-3 text-left shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${nodeTone(node)} ${
              selectedTopicId === node.topic.id ? "ring-2 ring-teal-500" : ""
            }`}
            key={node.topic.id}
            onClick={() => onSelectNode(node.topic.id)}
            style={{ left: node.x, top: node.y }}
            type="button"
          >
            <p className="line-clamp-2 text-sm font-bold leading-5">
              {node.topic.title}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {node.topic.interviewFrequency === "high" ? (
                <Badge tone="red">高频</Badge>
              ) : null}
              {node.isBlocked ? <Badge tone="amber">前置缺口</Badge> : null}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `NodeInspector`**

Create `src/components/graph/NodeInspector.tsx`:

```tsx
// @author codex
import { ArrowRight, Briefcase, GraduationCap } from "lucide-react";
import type { Mastery, ProjectId } from "../../types/knowledge";
import type { SelectedGraphNode } from "../../utils/knowledgeGraph";
import {
  frequencyLabels,
  masteryLabels,
  masteryTone,
  priorityLabels,
} from "../../utils/labels";
import { Badge } from "../shared/Badge";
import { Button } from "../shared/Button";

export function NodeInspector({
  node,
  onOpenQuestion,
  onOpenProject,
  onSelectTopic,
  onSetTopicMastery,
}: {
  node: SelectedGraphNode;
  onOpenQuestion: (questionId: string) => void;
  onOpenProject: (projectId: ProjectId) => void;
  onSelectTopic: (topicId: string) => void;
  onSetTopicMastery: (topicId: string, mastery: Mastery) => void;
}) {
  const primaryQuestion = node.questions[0];
  const primaryProject = node.projectEvidence[0];

  return (
    <aside className="space-y-4 border-l border-slate-200 bg-white p-4">
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={masteryTone(node.mastery)}>{masteryLabels[node.mastery]}</Badge>
          <Badge tone={node.topic.interviewFrequency === "high" ? "red" : "blue"}>
            {frequencyLabels[node.topic.interviewFrequency]}
          </Badge>
          <Badge>{priorityLabels[node.topic.priority]}</Badge>
        </div>
        <h2 className="mt-3 text-xl font-bold leading-7 text-slate-950">
          {node.topic.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{node.topic.summary}</p>
      </div>

      <section className="rounded-lg bg-teal-50 p-3">
        <p className="text-xs font-bold text-teal-800">为什么现在学它</p>
        <ul className="mt-2 space-y-1 text-xs leading-5 text-teal-950">
          {node.whyNow.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </section>

      <section>
        <p className="text-sm font-bold text-slate-950">必背结论</p>
        <ul className="mt-2 space-y-2">
          {node.topic.mustRemember.map((item) => (
            <li className="rounded-lg bg-slate-50 p-2 text-xs leading-5 text-slate-600" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {node.topic.deepDive ? (
        <section>
          <p className="text-sm font-bold text-slate-950">速查</p>
          <div className="mt-2 space-y-2">
            {node.topic.deepDive.interviewAngles.slice(0, 3).map((item) => (
              <p className="rounded-lg bg-amber-50 p-2 text-xs leading-5 text-amber-900" key={item}>
                {item}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-2">
        <Button
          onClick={() => onSetTopicMastery(node.topic.id, "can_explain")}
          size="sm"
          variant="primary"
        >
          标记能复述
        </Button>
        <Button
          onClick={() => onSetTopicMastery(node.topic.id, "can_answer_followups")}
          size="sm"
        >
          标记能接追问
        </Button>
        <Button
          onClick={() => onSetTopicMastery(node.topic.id, "project_ready")}
          size="sm"
        >
          标记能项目化
        </Button>
      </section>

      <section className="grid gap-2 border-t border-slate-100 pt-4">
        {primaryQuestion ? (
          <Button onClick={() => onOpenQuestion(primaryQuestion.id)} size="sm">
            <GraduationCap className="h-4 w-4" />
            练关联题
          </Button>
        ) : null}
        {primaryProject ? (
          <Button onClick={() => onOpenProject(primaryProject.project)} size="sm">
            <Briefcase className="h-4 w-4" />
            看项目表达
          </Button>
        ) : null}
      </section>

      {node.prerequisites.length > 0 ? (
        <section className="border-t border-slate-100 pt-4">
          <p className="text-sm font-bold text-slate-950">前置节点</p>
          <div className="mt-2 space-y-2">
            {node.prerequisites.map((topic) => (
              <button
                className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-2 text-left text-xs font-semibold text-slate-700 hover:bg-teal-50"
                key={topic.id}
                onClick={() => onSelectTopic(topic.id)}
                type="button"
              >
                {topic.title}
                <ArrowRight className="h-3 w-3" />
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </aside>
  );
}
```

- [ ] **Step 4: Create `GraphLearning` composition**

Create `src/components/graph/GraphLearning.tsx`:

```tsx
// @author codex
import { useMemo, useState } from "react";
import type { Mastery, ProjectId, QuestionStatus } from "../../types/knowledge";
import { buildKnowledgeGraph, type GraphMode } from "../../utils/knowledgeGraph";
import { masteryRank } from "../../utils/labels";
import { GraphCanvas } from "./GraphCanvas";
import { NodeInspector } from "./NodeInspector";
import { PathRail } from "./PathRail";

export function GraphLearning({
  completedSprintTaskIds,
  onOpenCheatSheet,
  onOpenMock,
  onOpenQuestion,
  onOpenProject,
  onOpenReview,
  onSetTopicMastery,
  questionStatus,
  topicMastery,
}: {
  completedSprintTaskIds: string[];
  onOpenCheatSheet: () => void;
  onOpenMock: () => void;
  onOpenQuestion: (questionId: string) => void;
  onOpenProject: (projectId: ProjectId) => void;
  onOpenReview: () => void;
  onSetTopicMastery: (topicId: string, mastery: Mastery) => void;
  questionStatus: Record<string, QuestionStatus>;
  topicMastery: Record<string, Mastery>;
}) {
  const [selectedPathId, setSelectedPathId] = useState("agent-engineering-mainline");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [mode] = useState<GraphMode>("learn");
  const graph = useMemo(
    () =>
      buildKnowledgeGraph({
        completedSprintTaskIds,
        mode,
        questionStatus,
        selectedPathId,
        selectedTopicId,
        topicMastery,
      }),
    [
      completedSprintTaskIds,
      mode,
      questionStatus,
      selectedPathId,
      selectedTopicId,
      topicMastery,
    ],
  );
  const pathProgress = Object.fromEntries(
    graph.paths.map((path) => {
      const ready = path.nodeIds.filter(
        (topicId) =>
          masteryRank[topicMastery[topicId] ?? "new"] >= masteryRank.can_explain,
      ).length;
      return [
        path.id,
        {
          ready,
          total: path.nodeIds.length,
          nextMastery: ready === path.nodeIds.length ? "project_ready" : "can_explain",
        },
      ];
    }),
  );

  return (
    <div className="grid min-h-[calc(100vh-96px)] grid-cols-[300px_minmax(520px,1fr)_360px] overflow-hidden rounded-lg border border-slate-200 bg-white">
      <PathRail
        currentPathId={graph.currentPath.id}
        onOpenCheatSheet={onOpenCheatSheet}
        onOpenMock={onOpenMock}
        onOpenReview={onOpenReview}
        onSelectPath={(pathId) => {
          setSelectedPathId(pathId);
          setSelectedTopicId(null);
        }}
        pathProgress={pathProgress}
        paths={graph.paths}
      />
      <GraphCanvas
        edges={graph.visibleEdges}
        nodes={graph.nodes}
        onSelectNode={setSelectedTopicId}
        selectedTopicId={graph.selectedNode.topic.id}
      />
      <NodeInspector
        node={graph.selectedNode}
        onOpenQuestion={onOpenQuestion}
        onOpenProject={onOpenProject}
        onSelectTopic={setSelectedTopicId}
        onSetTopicMastery={onSetTopicMastery}
      />
    </div>
  );
}
```

- [ ] **Step 5: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

## Task 5: Make GraphLearning the Default App Entry

**Files:**

- Modify: `src/app/App.tsx`
- Test: browser verification

- [ ] **Step 1: Import GraphLearning and add graph view**

Modify imports in `src/app/App.tsx`:

```tsx
import { Network } from "lucide-react";
import { GraphLearning } from "../components/graph/GraphLearning";
```

Add `"graph"` to `View`.

Set default:

```tsx
const [view, setView] = useState<View>("graph");
```

Add nav item at the top:

```tsx
{ id: "graph", label: "Graph Learning", icon: Network },
```

Set title:

```tsx
graph: "Graph Guided Learning",
```

- [ ] **Step 2: Render GraphLearning**

Add before the dashboard render:

```tsx
{view === "graph" ? (
  <GraphLearning
    completedSprintTaskIds={progress.completedSprintTaskIds}
    onOpenCheatSheet={() => setView("cheatsheet")}
    onOpenMock={() => setView("mock")}
    onOpenProject={openProject}
    onOpenQuestion={openQuestion}
    onOpenReview={() => setView("review")}
    onSetTopicMastery={progress.setTopicMastery}
    questionStatus={progress.questionStatus}
    topicMastery={progress.topicMastery}
  />
) : null}
```

- [ ] **Step 3: Keep old pages as auxiliary views**

Keep existing renders for:

- Dashboard
- Review Queue
- Cheat Sheet
- Knowledge Map
- Topic Detail
- Interview Drill
- Mock Interview
- Project Track

Do not delete them in Phase 1.

- [ ] **Step 4: Run full validation**

Run:

```bash
npm run validate:all
npm run build
```

Expected: both commands PASS.

## Task 6: Browser Verification

**Files:**

- No source file changes.

- [ ] **Step 1: Ensure dev server is running**

Run:

```bash
npm run dev
```

Expected: Vite serves on `http://127.0.0.1:5173/`.

If another dev server is already running on the same port, reuse it.

- [ ] **Step 2: Verify default Graph view**

Open `http://127.0.0.1:5173/` in the in-app browser.

Expected visible text:

- `Graph Guided Learning`
- `路径控制台`
- `Agent 工程主干`
- `Agent 的定义`
- `为什么现在学它`

- [ ] **Step 3: Verify path switching**

Click `RAG / Memory / Context 深挖`.

Expected:

- Graph canvas highlights path nodes from that path.
- Node inspector switches to `长期记忆` or the first incomplete node in that path.
- No console errors or warnings.

- [ ] **Step 4: Verify node selection and mastery update**

Click `RAG 全流程` node in the graph.

Expected:

- Right inspector title becomes `RAG 全流程`.

Click `标记能复述`.

Expected:

- Node badge/progress updates.
- Local progress persists in the current session.
- No console errors or warnings.

- [ ] **Step 5: Verify auxiliary tool routing**

From Graph view:

- Click `Review Queue`; expected page title `今日复习队列`.
- Return to `Graph Learning`.
- Click `Mock Interview`; expected page title `模拟面试`.
- Return to `Graph Learning`.
- In Node Inspector click `练关联题`; expected page title `面试追问训练`.

- [ ] **Step 6: Capture screenshot and visually inspect**

Capture a desktop screenshot.

Inspect:

- Three columns are visible.
- Graph canvas content is not blank.
- Node cards do not overlap incoherently.
- Right inspector text is readable.
- Left rail does not look like the old menu-first design.

## Task 7: Final Verification Checklist

**Files:**

- No source file changes unless verification exposes a defect.

- [ ] **Step 1: Run all commands**

Run:

```bash
npm run validate:all
npm run build
```

Expected: both pass.

- [ ] **Step 2: Check author comments**

Run:

```bash
missing=0
while IFS= read -r -d '' file; do
  if ! rg -q "@author codex" "$file"; then
    printf '%s\n' "$file"
    missing=1
  fi
done < <(find src scripts -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.css' -o -name '*.mjs' \) -print0)
exit "$missing"
```

Expected: no output, exit 0.

- [ ] **Step 3: Confirm no accidental old-direction files**

Run:

```bash
rg -n "dailyFlow|validate-daily-flow|今日学习闭环" src scripts
```

Expected: no matches.

- [ ] **Step 4: Verify no Git assumptions**

Run:

```bash
git status --short 2>/dev/null || printf 'not a git repository\n'
```

Expected in current workspace: `not a git repository`.

If the workspace later becomes a git repo, run `git diff --check` and commit each completed task separately.

## Self-Review

Spec coverage:

- Data structure for knowledge edges: Tasks 1-3.
- Learning paths: Task 2.
- Guided Home / graph-first entry: Task 5.
- Three-column main UI: Task 4.
- Existing page retention and demotion: Task 5 and Task 6 routing checks.
- Phase 1 minimal slice: Tasks 1-6.

No placeholders:

- This plan contains no unfinished marker text, unfinished code blocks, or vague implementation steps.
- Manual edges include concrete examples; derived edges provide the full edge count.
- Learning paths list all 47 topic ids exactly once or more.

Type consistency:

- `KnowledgeEdge`, `LearningPath`, `GraphMode`, `KnowledgeGraphView`, `SelectedGraphNode`, and component props are defined before use.
- `GraphLearning` uses existing `Mastery`, `QuestionStatus`, and `ProjectId` types.

Execution choice:

Plan complete and saved to `docs/superpowers/plans/2026-06-29-graph-guided-learning-phase-1.md`.

Two execution options:

1. **Subagent-Driven (recommended)** - dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - execute tasks in this session using executing-plans, with checkpoints before each major UI integration.
