// @author codex
const { questions, topics } = await import("../src/data/index.ts");

const errors = [];
const topicById = new Map(topics.map((topic) => [topic.id, topic]));
const questionById = new Map(questions.map((question) => [question.id, question]));

const minTextLength = (items = []) => items.join("").replace(/\s/g, "").length;
const requireTopic = (topicId) => {
  const topic = topicById.get(topicId);
  if (!topic) errors.push(`missing topic: ${topicId}`);
  return topic;
};
const requireQuestion = (questionId) => {
  const question = questionById.get(questionId);
  if (!question) errors.push(`missing question: ${questionId}`);
  return question;
};
const requireArray = (owner, field, min) => {
  const items = owner?.[field];
  if (!Array.isArray(items) || items.length < min) {
    errors.push(`${owner?.id ?? "unknown"}.${field} must include at least ${min} items`);
  }
};
const requireContains = (ownerId, text, terms) => {
  for (const term of terms) {
    if (!text.includes(term)) {
      errors.push(`${ownerId} must mention ${term}`);
    }
  }
};

const deepTopicIds = [
  "llm-foundation",
  "chatgpt-runtime",
  "llm-training-alignment",
  "agent-definition",
  "function-calling",
  "tool-registry",
  "workflow-vs-agent",
  "agent-core-modules",
  "agent-failure-modes",
  "react-loop",
  "planning-methods",
  "reflection-review",
  "tool-schema",
  "tool-error-recovery",
  "state-management",
  "short-term-memory",
  "context-layers",
  "context-compression",
  "rag-pipeline",
  "long-term-memory",
  "memory-decay",
  "component-eval",
  "trace-replay",
  "guardrails",
  "hybrid-search",
  "rerank",
  "citation-grounding",
  "agentic-rag",
  "mcp-fundamentals",
  "multi-agent-roles",
  "handoff-pattern",
  "skills",
  "a2a-acp",
  "trajectory-eval",
  "tool-permissions",
  "prompt-injection",
  "sandbox",
  "browser-observation",
  "playwright-actions",
  "web-agent-eval",
  "coding-harness",
  "context-compaction",
  "swe-bench",
  "framework-selection",
  "langgraph",
  "openai-agents-sdk",
  "project-storytelling",
  "paper-agent-project",
  "travel-agent-project",
  "web-agent-project",
  "es-use-cases-boundary",
  "es-inverted-index-mapping",
  "es-shards-write-path",
  "es-query-aggregation-optimization",
  "es-rag-hybrid-search",
  "mq-use-cases-boundary",
  "mq-reliable-delivery-idempotency",
  "mq-ordering-partitioning",
  "mq-transactional-messaging",
  "mq-consumer-governance",
];

for (const topicId of deepTopicIds) {
  const topic = requireTopic(topicId);
  for (const [field, min] of [
    ["definition", 3],
    ["principles", 4],
    ["industrySolutions", 4],
    ["scenarios", 1],
    ["systemDesignCases", 1],
    ["engineeringDetails", 4],
    ["tradeoffs", 3],
    ["experienceBridge", 2],
  ]) {
    requireArray(topic, field, min);
  }
  const designCase = topic?.systemDesignCases?.[0];
  requireArray(designCase, "architectureDiagram", 5);
  requireArray(designCase, "dataFlow", 5);
  requireArray(designCase, "observability", 4);
  requireArray(designCase, "tradeoffs", 3);
}

const functionCalling = requireTopic("function-calling");
const functionCallingText = JSON.stringify(functionCalling);
requireContains("function-calling", functionCallingText, [
  "tool_call",
  "宿主",
  "schema",
  "状态回写",
  "权限",
  "错误恢复",
  "trace",
  "幂等",
  "并行",
]);

const designCase = functionCalling?.systemDesignCases?.[0];
requireArray(designCase, "architectureDiagram", 5);
requireArray(designCase, "dataFlow", 5);
requireArray(designCase, "observability", 4);
requireArray(designCase, "tradeoffs", 3);

const requiredTopicTerms = {
  "llm-foundation": ["token", "context window", "sampling", "RAG", "hallucination"],
  "chatgpt-runtime": ["Conversation Store", "Context Builder", "Model Gateway", "Safety Layer", "Tool Runtime"],
  "llm-training-alignment": ["pretraining", "SFT", "preference optimization", "RAG", "fine-tune"],
  "agent-definition": ["目标", "状态", "工具", "反馈", "停止条件", "workflow"],
  "react-loop": ["observe", "decide", "act", "state reducer", "stop policy", "恢复"],
  "agent-core-modules": ["Goal", "State", "Context", "Tools", "Loop", "Guardrails", "Eval"],
  "agent-failure-modes": ["目标漂移", "工具误用", "状态污染", "上下文污染", "恢复"],
  "planning-methods": ["CoT", "ToT", "Plan-and-Solve", "planner", "verifier"],
  "reflection-review": ["reflection", "self-critique", "verifier", "retry", "质量"],
  "tool-schema": ["JSON Schema", "required", "enum", "output_schema", "validation"],
  "tool-error-recovery": ["timeout", "retryable", "error_code", "fallback", "compensation"],
  "state-management": ["checkpoint", "state version", "并发", "恢复", "幂等"],
  "short-term-memory": ["working memory", "scratchpad", "context window", "TTL", "state"],
  "context-layers": ["Context Builder", "证据", "预算", "来源", "污染"],
  "context-compression": ["摘要", "state diff", "lossless", "salience", "verifier"],
  "rag-pipeline": ["chunk", "hybrid", "rerank", "citation", "retrieval eval", "权限"],
  "long-term-memory": ["write policy", "TTL", "confidence", "纠错", "隐私"],
  "memory-decay": ["TTL", "confidence", "stale", "污染", "纠错"],
  "component-eval": ["fixture", "retriever", "tool", "断言", "回归"],
  "trace-replay": ["run_id", "step_id", "state diff", "脱敏", "replay"],
  guardrails: ["输入", "输出", "工具权限", "human-in-the-loop", "prompt injection"],
  "hybrid-search": ["BM25", "vector", "metadata filter", "RRF", "recall@k"],
  rerank: ["cross-encoder", "answerability", "citation_precision", "latency", "candidate"],
  "citation-grounding": ["claim-to-evidence", "citation_precision", "unsupported", "冲突证据"],
  "agentic-rag": ["query evolution", "evidence gap", "topic drift", "stop condition"],
  "mcp-fundamentals": ["host", "client", "server", "tools", "resources", "prompts"],
  "multi-agent-roles": ["planner", "executor", "reviewer", "orchestrator", "arbiter"],
  "handoff-pattern": ["handoff payload", "manager pattern", "return_policy", "state_summary", "responsibility"],
  skills: ["trigger", "instructions", "assets", "smoke test", "version"],
  "a2a-acp": ["MCP", "A2A", "ACP", "identity", "message envelope"],
  "trajectory-eval": ["step trace", "tool_selection", "path_quality", "rubric", "unsafe_action_block_rate"],
  "tool-permissions": ["riskLevel", "requiresConfirmation", "preview", "approval", "audit"],
  "prompt-injection": ["untrusted content", "instruction/data separation", "tool permission", "exfiltration", "quarantine"],
  sandbox: ["filesystem", "network", "process", "preview", "rollback"],
  "browser-observation": ["accessibility tree", "DOM", "screenshot", "interactive_elements", "observation diff"],
  "playwright-actions": ["locator", "action schema", "before/after", "verifier", "selector drift"],
  "web-agent-eval": ["task_success_rate", "action_success_rate", "recovery_rate", "screenshot", "trace"],
  "coding-harness": ["read_file", "apply_patch", "run_tests", "git diff", "checkpoint"],
  "context-compaction": ["changed_files", "tests_run", "open_risks", "state diff", "restore checklist"],
  "swe-bench": ["issue", "patch", "test", "human review", "benchmark"],
  "framework-selection": ["baseline", "state graph", "handoff", "tracing", "lock-in"],
  langgraph: ["state schema", "node", "edge", "checkpoint", "reducer"],
  "openai-agents-sdk": ["Agent", "Runner", "handoff", "guardrails", "tracing"],
  "project-storytelling": ["3 分钟", "8 分钟", "15 分钟", "failure taxonomy", "metrics"],
  "paper-agent-project": ["PDF", "page", "claim-to-evidence", "citation_precision", "unsupported"],
  "travel-agent-project": ["constraint", "human-in-the-loop", "budget", "unsafe_action_block_rate"],
  "web-agent-project": ["observe", "action", "verifier", "screenshot", "trace"],
  "es-use-cases-boundary": ["事实源", "搜索读模型", "CDC", "alias", "refresh"],
  "es-inverted-index-mapping": ["倒排索引", "analyzer", "text", "keyword", "doc values"],
  "es-shards-write-path": ["primary shard", "replica", "translog", "refresh", "segment merge"],
  "es-query-aggregation-optimization": ["profile", "slow log", "search_after", "高基数", "query cache"],
  "es-rag-hybrid-search": ["BM25", "metadata filter", "RRF", "rerank", "citation_precision"],
  "mq-use-cases-boundary": ["异步解耦", "削峰填谷", "event-driven", "outbox", "SLA"],
  "mq-reliable-delivery-idempotency": ["producer ack", "consumer ack", "retry", "DLQ", "幂等"],
  "mq-ordering-partitioning": ["partition", "message key", "consumer group", "rebalance", "顺序"],
  "mq-transactional-messaging": ["本地事务", "transaction message", "outbox", "最终一致性", "补偿"],
  "mq-consumer-governance": ["consumer lag", "backpressure", "poison message", "DLQ", "限流"],
};

for (const [topicId, terms] of Object.entries(requiredTopicTerms)) {
  requireContains(topicId, JSON.stringify(requireTopic(topicId)), terms);
}

for (const questionId of [
  "q-ai-llm-foundation-core",
  "q-ai-llm-foundation-deep",
  "q-ai-chatgpt-runtime-core",
  "q-ai-chatgpt-runtime-deep",
  "q-ai-llm-training-core",
  "q-ai-llm-training-deep",
  "q-function-calling-core",
  "q-function-calling-deep",
  "q-tool-registry-core",
  "q-ai-tool-contract-structured",
  "q-ai-agent-boundary-structured",
  "q-agent-core-modules-core",
  "q-agent-core-modules-deep",
  "q-agent-failure-modes-core",
  "q-agent-failure-modes-deep",
  "q-react-loop-core",
  "q-planning-methods-core",
  "q-planning-methods-deep",
  "q-reflection-review-core",
  "q-reflection-review-deep",
  "q-tool-schema-core",
  "q-tool-schema-deep",
  "q-tool-error-recovery-core",
  "q-tool-error-recovery-deep",
  "q-state-management-core",
  "q-short-term-memory-core",
  "q-short-term-memory-deep",
  "q-context-layers-core",
  "q-context-compression-core",
  "q-context-compression-deep",
  "q-rag-pipeline-core",
  "q-long-term-memory-core",
  "q-memory-decay-core",
  "q-memory-decay-deep",
  "q-ai-rag-memory-structured",
  "q-component-eval-core",
  "q-trace-replay-core",
  "q-guardrails-core",
  "q-hybrid-search-core",
  "q-rerank-core",
  "q-citation-grounding-core",
  "q-agentic-rag-core",
  "q-mcp-fundamentals-core",
  "q-multi-agent-roles-core",
  "q-multi-agent-roles-deep",
  "q-handoff-pattern-core",
  "q-handoff-pattern-deep",
  "q-skills-core",
  "q-skills-deep",
  "q-a2a-acp-core",
  "q-a2a-acp-deep",
  "q-trajectory-eval-core",
  "q-trajectory-eval-deep",
  "q-tool-permissions-core",
  "q-tool-permissions-deep",
  "q-prompt-injection-core",
  "q-prompt-injection-deep",
  "q-sandbox-core",
  "q-sandbox-deep",
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
  "q-ai-eval-observability-structured",
  "q-langgraph-core",
  "q-openai-agents-sdk-core",
  "q-project-storytelling-core",
  "q-paper-agent-project-core",
  "q-travel-agent-project-core",
  "q-web-agent-project-core",
  "q-es-boundary-inverted-index",
  "q-es-index-shard-write",
  "q-es-query-optimization",
  "q-es-rag-hybrid-search",
  "q-mq-reliable-delivery",
  "q-mq-ordering",
  "q-mq-transaction-message",
  "q-mq-consumer-lag",
]) {
  const question = requireQuestion(questionId);
  if (!question) continue;
  if (minTextLength(question.answerOutline) < 240) {
    errors.push(`${questionId}.answerOutline is too shallow for interview use`);
  }
  if (!Array.isArray(question.followUpSteps) || question.followUpSteps.length < 3) {
    errors.push(`${questionId} must include structured follow-up answers`);
    continue;
  }
  for (const [index, step] of question.followUpSteps.entries()) {
    if (minTextLength([step.answerHint]) < 80) {
      errors.push(`${questionId}.followUpSteps[${index}].answerHint is too shallow`);
    }
  }
}

const requiredQuestionTerms = {
  "q-ai-llm-foundation-core": ["token", "context window", "sampling", "RAG", "hallucination"],
  "q-ai-llm-foundation-deep": ["token", "context window", "Model Gateway", "RAG", "Verifier"],
  "q-ai-chatgpt-runtime-core": ["Conversation Store", "Context Builder", "Model Gateway", "Safety Layer", "Tool Runtime"],
  "q-ai-chatgpt-runtime-deep": ["metadata filter", "Tool Runtime", "Safety Layer", "audit", "permission"],
  "q-ai-llm-training-core": ["pretraining", "SFT", "preference optimization", "RAG", "fine-tune"],
  "q-ai-llm-training-deep": ["baseline", "golden set", "RAG", "fine-tune", "rollback"],
  "q-agent-core-modules-core": ["Goal", "State", "Context", "Tools", "Loop", "Guardrails", "Eval", "Goal Manager"],
  "q-agent-core-modules-deep": ["Goal", "State", "Context", "Tools", "Loop", "Guardrails", "Eval", "Goal Manager"],
  "q-agent-failure-modes-core": ["目标漂移", "工具误用", "状态污染", "上下文污染", "恢复", "Failure Classifier"],
  "q-agent-failure-modes-deep": ["目标漂移", "工具误用", "状态污染", "上下文污染", "恢复", "Failure Classifier"],
  "q-planning-methods-core": ["CoT", "ToT", "Plan-and-Solve", "planner", "verifier", "Planner-Executor-Verifier"],
  "q-planning-methods-deep": ["CoT", "ToT", "Plan-and-Solve", "planner", "verifier", "Planner-Executor-Verifier"],
  "q-reflection-review-core": ["reflection", "self-critique", "verifier", "retry", "Generator"],
  "q-reflection-review-deep": ["reflection", "self-critique", "verifier", "retry", "Generator"],
  "q-tool-schema-core": ["JSON Schema", "required", "enum", "output_schema", "validation", "Permission Gate", "Tool Dispatcher"],
  "q-tool-schema-deep": ["JSON Schema", "required", "enum", "output_schema", "validation", "Permission Gate", "Tool Dispatcher"],
  "q-tool-error-recovery-core": ["timeout", "retryable", "error_code", "fallback", "compensation", "Recovery Policy"],
  "q-tool-error-recovery-deep": ["timeout", "retryable", "error_code", "fallback", "compensation", "Recovery Policy"],
  "q-short-term-memory-core": ["working memory", "scratchpad", "context window", "TTL", "state"],
  "q-short-term-memory-deep": ["working memory", "scratchpad", "context window", "TTL", "state"],
  "q-context-compression-core": ["摘要", "state diff", "lossless", "salience", "verifier"],
  "q-context-compression-deep": ["摘要", "state diff", "lossless", "salience", "verifier"],
  "q-memory-decay-core": ["TTL", "confidence", "stale", "污染", "纠错"],
  "q-memory-decay-deep": ["TTL", "confidence", "stale", "污染", "纠错"],
  "q-ai-rag-memory-structured": ["RAG", "Memory", "write policy", "TTL", "citation"],
  "q-rag-pipeline-core": ["retrieval_recall@k", "citation_precision", "rerank"],
  "q-long-term-memory-core": ["write policy", "confidence", "TTL"],
  "q-guardrails-core": ["human-in-the-loop", "unsafe_tool_call_block_rate", "prompt injection"],
  "q-hybrid-search-core": ["BM25", "vector", "RRF", "recall@k"],
  "q-rerank-core": ["cross-encoder", "latency", "citation_precision", "answerability"],
  "q-citation-grounding-core": ["claim-to-evidence", "citation_precision", "unsupported"],
  "q-agentic-rag-core": ["query evolution", "evidence gap", "topic drift"],
  "q-mcp-fundamentals-core": ["tools", "resources", "prompts", "server"],
  "q-multi-agent-roles-core": ["planner", "executor", "reviewer", "orchestrator", "arbiter"],
  "q-multi-agent-roles-deep": ["single Agent", "handoff", "shared state", "coordination cost"],
  "q-handoff-pattern-core": ["handoff payload", "manager pattern", "return_policy", "state_summary"],
  "q-handoff-pattern-deep": ["handoff payload", "responsibility", "state_summary", "trace"],
  "q-skills-core": ["Tool", "Skill", "trigger", "instructions", "smoke test"],
  "q-skills-deep": ["trigger", "instructions", "assets", "smoke test", "version"],
  "q-a2a-acp-core": ["MCP", "A2A", "ACP", "identity", "message envelope"],
  "q-a2a-acp-deep": ["identity", "message envelope", "capability discovery", "audit"],
  "q-trajectory-eval-core": ["step trace", "tool_selection", "path_quality", "rubric"],
  "q-trajectory-eval-deep": ["path_quality", "unsafe_action_block_rate", "rubric", "cost_per_success"],
  "q-tool-permissions-core": ["riskLevel", "requiresConfirmation", "preview", "approval", "audit"],
  "q-tool-permissions-deep": ["actor", "approval", "preview", "rollback", "audit"],
  "q-prompt-injection-core": ["untrusted content", "instruction/data separation", "tool permission", "exfiltration"],
  "q-prompt-injection-deep": ["RAG", "untrusted content", "quarantine", "citation"],
  "q-sandbox-core": ["filesystem", "network", "process", "preview", "rollback"],
  "q-sandbox-deep": ["filesystem", "network", "process", "least privilege", "audit"],
  "q-browser-observation-core": ["accessibility tree", "DOM", "screenshot", "interactive_elements"],
  "q-browser-observation-deep": ["DOM-only", "screenshot", "vision", "observation diff"],
  "q-playwright-actions-core": ["locator", "action schema", "before/after", "verifier"],
  "q-playwright-actions-deep": ["selector drift", "retry", "fallback", "verifier"],
  "q-web-agent-eval-core": ["task_success_rate", "action_success_rate", "screenshot", "trace"],
  "q-web-agent-eval-deep": ["recovery_rate", "failure injection", "trace", "verifier"],
  "q-coding-harness-core": ["read_file", "apply_patch", "run_tests", "git diff"],
  "q-coding-harness-deep": ["harness", "checkpoint", "sandbox", "trace"],
  "q-context-compaction-core": ["changed_files", "tests_run", "open_risks", "state diff"],
  "q-context-compaction-deep": ["restore checklist", "lost_constraint_rate", "git diff", "user constraints"],
  "q-swe-bench-core": ["issue", "patch", "test", "benchmark", "harness"],
  "q-swe-bench-deep": ["human review", "test pass", "edge case", "code style"],
  "q-framework-selection-core": ["baseline", "LangGraph", "Agents SDK", "tracing"],
  "q-framework-selection-deep": ["原生 API", "lock-in", "state graph", "framework"],
  "q-ai-eval-observability-structured": ["component eval", "trajectory eval", "trace", "golden set", "regression"],
  "q-langgraph-core": ["state schema", "node", "edge", "checkpoint"],
  "q-openai-agents-sdk-core": ["Agent", "handoff", "guardrails", "tracing"],
  "q-project-storytelling-core": ["3 分钟", "failure taxonomy", "metrics"],
  "q-paper-agent-project-core": ["claim-to-evidence", "citation_precision", "unsupported"],
  "q-travel-agent-project-core": ["constraint", "human-in-the-loop", "unsafe_action_block_rate"],
  "q-web-agent-project-core": ["observe", "action", "verifier", "trace"],
  "q-es-boundary-inverted-index": ["倒排索引", "analyzer", "text", "keyword", "doc values"],
  "q-es-index-shard-write": ["primary shard", "replica", "translog", "refresh", "segment merge"],
  "q-es-query-optimization": ["profile", "slow log", "search_after", "高基数", "query cache"],
  "q-es-rag-hybrid-search": ["BM25", "metadata filter", "RRF", "rerank", "citation_precision"],
  "q-mq-reliable-delivery": ["producer ack", "consumer ack", "retry", "DLQ", "幂等"],
  "q-mq-ordering": ["partition", "message key", "consumer group", "rebalance", "顺序"],
  "q-mq-transaction-message": ["本地事务", "transaction message", "outbox", "最终一致性"],
  "q-mq-consumer-lag": ["consumer lag", "backpressure", "poison message", "DLQ"],
};

for (const [questionId, terms] of Object.entries(requiredQuestionTerms)) {
  const question = requireQuestion(questionId);
  if (!question) continue;
  requireContains(questionId, JSON.stringify(question), terms);
}

if (errors.length > 0) {
  console.error("Content depth validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Content depth validation passed.");
