// @author codex
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const topicDir = path.join(root, "content", "topics");
const questionDir = path.join(root, "content", "questions");
const errors = [];

const activeSampleTopicIds = [
  "agent-definition",
  "workflow-vs-agent",
  "function-calling",
  "rag-pipeline",
  "mcp-fundamentals",
  "openai-agents-sdk",
  "mq-reliable-delivery-idempotency",
  "es-inverted-index-mapping",
  "agent-core-modules",
  "agent-failure-modes",
  "react-loop",
  "planning-methods",
  "reflection-review",
  "tool-schema",
  "tool-registry",
  "tool-error-recovery",
  "state-management",
  "short-term-memory",
  "context-layers",
  "component-eval",
  "trajectory-eval",
  "trace-replay",
  "guardrails",
  "tool-permissions",
  "browser-observation",
  "playwright-actions",
  "web-agent-eval",
  "coding-harness",
  "context-compaction",
  "swe-bench",
  "framework-selection",
  "langgraph",
  "long-term-memory",
  "memory-decay",
  "multi-agent-roles",
  "handoff-pattern",
  "skills",
  "a2a-acp",
  "prompt-injection",
  "sandbox",
  "context-compression",
  "hybrid-search",
  "rerank",
  "citation-grounding",
  "agentic-rag",
  "project-storytelling",
  "paper-agent-project",
  "travel-agent-project",
  "web-agent-project",
  "llm-foundation",
  "chatgpt-runtime",
  "llm-training-alignment",
  "es-use-cases-boundary",
  "es-shards-write-path",
  "es-query-aggregation-optimization",
  "es-rag-hybrid-search",
  "mq-use-cases-boundary",
  "mq-ordering-partitioning",
  "mq-transactional-messaging",
  "mq-consumer-governance",
];
const activeSampleQuestionIds = [
  "q-agent-definition-core",
  "q-agent-definition-deep",
  "q-workflow-vs-agent-core",
  "q-workflow-vs-agent-deep",
  "q-function-calling-core",
  "q-function-calling-deep",
  "q-rag-pipeline-core",
  "q-rag-pipeline-deep",
  "q-mcp-fundamentals-core",
  "q-mcp-fundamentals-deep",
  "q-openai-agents-sdk-core",
  "q-openai-agents-sdk-deep",
  "q-mq-reliable-delivery",
  "q-mq-consumer-lag",
  "q-es-boundary-inverted-index",
  "q-agent-core-modules-core",
  "q-agent-core-modules-deep",
  "q-agent-failure-modes-core",
  "q-agent-failure-modes-deep",
  "q-react-loop-core",
  "q-react-loop-deep",
  "q-planning-methods-core",
  "q-planning-methods-deep",
  "q-reflection-review-core",
  "q-reflection-review-deep",
  "q-tool-schema-core",
  "q-tool-schema-deep",
  "q-ai-tool-contract-structured",
  "q-tool-registry-core",
  "q-tool-registry-deep",
  "q-tool-error-recovery-core",
  "q-tool-error-recovery-deep",
  "q-state-management-core",
  "q-state-management-deep",
  "q-short-term-memory-core",
  "q-short-term-memory-deep",
  "q-context-layers-core",
  "q-context-layers-deep",
  "q-component-eval-core",
  "q-component-eval-deep",
  "q-trajectory-eval-core",
  "q-trajectory-eval-deep",
  "q-trace-replay-core",
  "q-trace-replay-deep",
  "q-guardrails-core",
  "q-guardrails-deep",
  "q-tool-permissions-core",
  "q-tool-permissions-deep",
  "q-browser-observation-core",
  "q-browser-observation-deep",
  "q-playwright-actions-core",
  "q-playwright-actions-deep",
  "q-web-agent-eval-core",
  "q-web-agent-eval-deep",
  "q-coding-harness-core",
  "q-coding-harness-deep",
  "q-context-compaction-core",
  "q-context-compaction-deep",
  "q-swe-bench-core",
  "q-swe-bench-deep",
  "q-framework-selection-core",
  "q-framework-selection-deep",
  "q-langgraph-core",
  "q-langgraph-deep",
  "q-long-term-memory-core",
  "q-long-term-memory-deep",
  "q-memory-decay-core",
  "q-memory-decay-deep",
  "q-multi-agent-roles-core",
  "q-multi-agent-roles-deep",
  "q-handoff-pattern-core",
  "q-handoff-pattern-deep",
  "q-skills-core",
  "q-skills-deep",
  "q-a2a-acp-core",
  "q-a2a-acp-deep",
  "q-prompt-injection-core",
  "q-prompt-injection-deep",
  "q-sandbox-core",
  "q-sandbox-deep",
  "q-context-compression-core",
  "q-context-compression-deep",
  "q-hybrid-search-core",
  "q-hybrid-search-deep",
  "q-rerank-core",
  "q-rerank-deep",
  "q-citation-grounding-core",
  "q-citation-grounding-deep",
  "q-agentic-rag-core",
  "q-agentic-rag-deep",
  "q-project-storytelling-core",
  "q-project-storytelling-deep",
  "q-paper-agent-project-core",
  "q-paper-agent-project-deep",
  "q-travel-agent-project-core",
  "q-travel-agent-project-deep",
  "q-web-agent-project-core",
  "q-web-agent-project-deep",
  "q-ai-llm-foundation-core",
  "q-ai-llm-foundation-deep",
  "q-ai-chatgpt-runtime-core",
  "q-ai-chatgpt-runtime-deep",
  "q-ai-llm-training-core",
  "q-ai-llm-training-deep",
  "q-ai-agent-boundary-structured",
  "q-ai-rag-memory-structured",
  "q-ai-eval-observability-structured",
  "q-es-index-shard-write",
  "q-es-query-optimization",
  "q-es-rag-hybrid-search",
  "q-mq-ordering",
  "q-mq-transaction-message",
];

const requiredTopicSections = [
  "## 一句话定义",
  "## 为什么需要它",
  "## 核心架构",
  "## 运行机制",
  "## 关键设计取舍",
  "## 生产落地细节",
  "## 常见误区与排障",
  "## 面试追问",
  "## 项目化表达",
  "## 来源与延伸阅读",
];

const requiredQuestionSections = [
  "## 30 秒回答",
  "## 标准回答",
  "## 可画图",
  "## 面试官追问",
  "## 项目化回答",
  "## 常见错误",
];

const requiredTermsByTopic = {
  "agent-definition": [
    "Goal",
    "State",
    "Tools",
    "Feedback",
    "Guardrails",
    "Eval",
    "workflow",
  ],
  "workflow-vs-agent": [
    "workflow",
    "agent",
    "deterministic",
    "动态决策",
    "baseline",
    "评测",
  ],
  "function-calling": [
    "schema",
    "permission",
    "tool_call",
    "observation",
    "trace",
    "幂等",
    "宿主",
  ],
  "rag-pipeline": [
    "ingest",
    "chunk",
    "retrieve",
    "rerank",
    "citation",
    "eval",
  ],
  "mcp-fundamentals": [
    "Host",
    "Client",
    "Server",
    "Resources",
    "Prompts",
    "Tools",
  ],
  "openai-agents-sdk": [
    "Agent",
    "Runner",
    "tools",
    "handoff",
    "guardrails",
    "tracing",
  ],
  "mq-reliable-delivery-idempotency": [
    "outbox",
    "ack",
    "DLQ",
    "幂等",
    "补偿",
  ],
  "es-inverted-index-mapping": [
    "倒排索引",
    "analyzer",
    "mapping",
    "keyword",
    "doc values",
  ],
  "agent-core-modules": [
    "Goal",
    "State",
    "Context",
    "Tools",
    "Loop",
    "Guardrails",
    "Eval",
  ],
  "agent-failure-modes": [
    "目标漂移",
    "上下文污染",
    "工具误用",
    "状态污染",
    "恢复",
  ],
  "react-loop": [
    "observe",
    "reason",
    "act",
    "observation",
    "stop policy",
  ],
  "planning-methods": [
    "CoT",
    "ToT",
    "Plan-and-Solve",
    "planner",
    "verifier",
  ],
  "reflection-review": [
    "reflection",
    "reviewer",
    "verdict",
    "rubric",
    "停止条件",
  ],
  "tool-schema": [
    "JSON Schema",
    "required",
    "enum",
    "output schema",
    "validation",
  ],
  "tool-registry": [
    "registry",
    "dispatcher",
    "version",
    "owner",
    "permission",
  ],
  "tool-error-recovery": [
    "timeout",
    "retryable",
    "error_code",
    "fallback",
    "compensation",
  ],
  "state-management": [
    "State Store",
    "checkpoint",
    "state version",
    "idempotencyKey",
    "replay",
  ],
  "short-term-memory": [
    "working memory",
    "scratchpad",
    "TTL",
    "state projection",
    "context window",
  ],
  "context-layers": [
    "system",
    "task",
    "state",
    "evidence",
    "trustLevel",
    "prompt injection",
  ],
  "component-eval": [
    "fixture",
    "expected_behavior",
    "forbidden_behavior",
    "threshold",
    "regression",
  ],
  "trajectory-eval": [
    "step trace",
    "tool_selection",
    "state_update",
    "safety",
    "cost_per_success",
  ],
  "trace-replay": [
    "run_id",
    "step_id",
    "span",
    "artifact",
    "redaction",
    "Replay Harness",
  ],
  guardrails: [
    "input guardrail",
    "context guardrail",
    "Tool Permission Gate",
    "Output Validator",
    "human-in-the-loop",
  ],
  "tool-permissions": [
    "riskLevel",
    "requiresConfirmation",
    "preview",
    "approval",
    "audit",
    "rollback",
  ],
  "browser-observation": [
    "accessibility tree",
    "interactive_elements",
    "screenshot",
    "observation diff",
    "untrusted content",
  ],
  "playwright-actions": [
    "action schema",
    "locator",
    "auto-wait",
    "expected_state",
    "verifier",
    "Recovery Policy",
  ],
  "web-agent-eval": [
    "fixture",
    "task_success_rate",
    "step_success_rate",
    "recovery_success_rate",
    "safety",
    "Trace Replay",
  ],
  "coding-harness": [
    "workspace sandbox",
    "Patch Engine",
    "Test Runner",
    "diff",
    "approval",
    "rollback",
  ],
  "context-compaction": [
    "compaction trigger",
    "state projection",
    "constraint retention",
    "evidence refs",
    "resume",
    "lost constraint",
  ],
  "swe-bench": [
    "issue",
    "repository",
    "patch",
    "unit tests",
    "harness",
    "trajectory",
  ],
  "framework-selection": [
    "baseline",
    "StateGraph",
    "Agents SDK",
    "Adapter Layer",
    "lock-in",
    "eval",
  ],
  langgraph: [
    "state schema",
    "node",
    "edge",
    "checkpoint",
    "interrupt",
    "reducer",
  ],
  "long-term-memory": [
    "Memory Store",
    "embedding",
    "metadata",
    "scope",
    "TTL",
    "retrieval",
  ],
  "memory-decay": [
    "TTL",
    "confidence",
    "staleness",
    "correction",
    "quarantine",
    "version",
  ],
  "multi-agent-roles": [
    "Orchestrator",
    "Agent Registry",
    "role",
    "handoff",
    "shared state",
    "arbiter",
  ],
  "handoff-pattern": [
    "handoff payload",
    "capability",
    "state_summary",
    "ownership",
    "return_policy",
    "trace",
  ],
  skills: [
    "trigger",
    "instruction",
    "tool contract",
    "scope",
    "version",
    "eval",
  ],
  "a2a-acp": [
    "message envelope",
    "capability discovery",
    "task_id",
    "correlation_id",
    "auth",
    "protocol boundary",
  ],
  "prompt-injection": [
    "untrusted content",
    "instruction/data separation",
    "quarantine",
    "Tool Permission Gate",
    "exfiltration",
    "eval",
  ],
  sandbox: [
    "filesystem",
    "network",
    "process",
    "credential",
    "policy",
    "audit",
    "rollback",
  ],
  "context-compression": [
    "context window",
    "compression artifact",
    "state projection",
    "loss budget",
    "verifier",
    "retrieval fallback",
  ],
  "hybrid-search": [
    "BM25",
    "vector search",
    "RRF",
    "lexical",
    "semantic",
    "recall",
    "precision",
  ],
  rerank: [
    "candidate set",
    "cross-encoder",
    "relevance score",
    "top_k",
    "latency",
    "cost",
  ],
  "citation-grounding": [
    "citation",
    "evidence span",
    "claim",
    "grounding",
    "unsupported claim",
    "precision",
  ],
  "agentic-rag": [
    "query planner",
    "retrieval tool",
    "relevance grader",
    "query rewrite",
    "loop",
    "drift",
  ],
  "project-storytelling": [
    "STAR",
    "problem framing",
    "architecture",
    "metrics",
    "failure case",
    "tradeoff",
  ],
  "paper-agent-project": [
    "paper parser",
    "citation graph",
    "claim extraction",
    "retrieval eval",
    "hallucination rate",
    "annotation",
  ],
  "travel-agent-project": [
    "constraint solver",
    "itinerary",
    "availability",
    "budget",
    "preference",
    "fallback",
  ],
  "web-agent-project": [
    "observation",
    "action",
    "selector",
    "trace",
    "fixture",
    "recovery",
  ],
  "llm-foundation": [
    "token",
    "context window",
    "sampling",
    "embedding",
    "hallucination",
    "verifier",
  ],
  "chatgpt-runtime": [
    "API Gateway",
    "Context Builder",
    "Model Gateway",
    "safety filter",
    "streaming",
    "trace",
  ],
  "llm-training-alignment": [
    "pretraining",
    "supervised fine-tuning",
    "RLHF",
    "DPO",
    "alignment",
    "eval",
  ],
  "es-use-cases-boundary": [
    "inverted index",
    "near real-time",
    "search",
    "aggregation",
    "shard",
    "mapping",
  ],
  "es-shards-write-path": [
    "primary shard",
    "replica",
    "translog",
    "refresh",
    "segment",
    "in-sync copies",
  ],
  "es-query-aggregation-optimization": [
    "query DSL",
    "filter context",
    "search_after",
    "PIT",
    "composite aggregation",
    "circuit breaker",
  ],
  "es-rag-hybrid-search": [
    "BM25",
    "dense_vector",
    "kNN",
    "RRF",
    "rerank",
    "metadata filter",
  ],
  "mq-use-cases-boundary": [
    "asynchronous",
    "decoupling",
    "peak shaving",
    "at-least-once",
    "idempotency",
    "DLQ",
  ],
  "mq-ordering-partitioning": [
    "partition",
    "message key",
    "consumer group",
    "rebalance",
    "offset",
    "ordering",
  ],
  "mq-transactional-messaging": [
    "local transaction",
    "outbox",
    "transaction message",
    "half message",
    "compensation",
    "idempotency",
  ],
  "mq-consumer-governance": [
    "consumer lag",
    "ack",
    "retry",
    "DLQ",
    "backpressure",
    "poison message",
  ],
};

const readMarkdown = (dir, id) => {
  const filePath = path.join(dir, `${id}.md`);
  if (!fs.existsSync(filePath)) {
    errors.push(`missing markdown file: ${id}`);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
};

const hasMarkdownTable = (text) => {
  const lines = text.split("\n");
  return lines.some((line, index) => {
    const next = lines[index + 1] ?? "";
    return (
      line.trim().startsWith("|") &&
      line.trim().endsWith("|") &&
      /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(next.trim())
    );
  });
};

const normalizedSentences = (text) =>
  text
    .replace(/```[\s\S]*?```/g, "")
    .split(/[。！？\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 18);

const repeatedSentences = (text) => {
  const seen = new Set();
  const repeated = new Set();
  for (const sentence of normalizedSentences(text)) {
    if (seen.has(sentence)) repeated.add(sentence);
    seen.add(sentence);
  }
  return [...repeated];
};

const validateSharedQuality = ({ id, kind, text }) => {
  if (!text.startsWith("# ")) {
    errors.push(`${kind} ${id} must start with an H1 title`);
  }
  if (!text.includes("```mermaid")) {
    errors.push(`${kind} ${id} must include at least one Mermaid diagram`);
  }
  const repeats = repeatedSentences(text);
  if (repeats.length > 0) {
    errors.push(`${kind} ${id} has repeated long sentences: ${repeats.slice(0, 2).join(" | ")}`);
  }
};

for (const topicId of activeSampleTopicIds) {
  const text = readMarkdown(topicDir, topicId);
  validateSharedQuality({ id: topicId, kind: "topic", text });

  for (const section of requiredTopicSections) {
    if (!text.includes(section)) {
      errors.push(`topic ${topicId} must include section: ${section}`);
    }
  }
  if (!hasMarkdownTable(text)) {
    errors.push(`topic ${topicId} must include at least one Markdown comparison table`);
  }
  for (const term of requiredTermsByTopic[topicId] ?? []) {
    if (!text.includes(term)) {
      errors.push(`topic ${topicId} must mention ${term}`);
    }
  }
}

for (const questionId of activeSampleQuestionIds) {
  const text = readMarkdown(questionDir, questionId);
  validateSharedQuality({ id: questionId, kind: "question", text });

  for (const section of requiredQuestionSections) {
    if (!text.includes(section)) {
      errors.push(`question ${questionId} must include section: ${section}`);
    }
  }
  const semicolonCount = (text.match(/；/g) ?? []).length;
  if (semicolonCount > 20) {
    errors.push(`question ${questionId} has too many Chinese semicolon joins: ${semicolonCount}`);
  }
}

if (errors.length > 0) {
  console.error("Content quality validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Content quality validation passed.");
console.log(
  JSON.stringify(
    {
      activeSampleTopicIds,
      activeSampleQuestionIds,
    },
    null,
    2,
  ),
);
