// @author codex
import { categories, domains, learningPaths, questions, topics } from "../src/data/index.ts";

const errors = [];

const categoryById = new Map(categories.map((category) => [category.id, category]));
const domainById = new Map(domains.map((domain) => [domain.id, domain]));
const pathById = new Map(learningPaths.map((path) => [path.id, path]));
const questionById = new Map(questions.map((question) => [question.id, question]));
const topicById = new Map(topics.map((topic) => [topic.id, topic]));

const topicDomainId = (topic) =>
  topic.domainId ?? categoryById.get(topic.categoryId)?.domainId;

const requiredTopicGroups = {
  "Python AI engineering": [
    "python-runtime-env-dependency-packaging",
    "fastapi-pydantic-async-service",
    "python-http-client-timeout-retry-streaming",
    "ai-provider-sdk-integration-patterns",
    "structured-output-schema-validation",
    "pytest-ai-api-testing-fixtures",
    "async-worker-background-task-cancellation",
    "python-observability-opentelemetry",
    "python-config-secret-deployment",
    "ai-service-rate-limit-quota-cost",
    "java-spring-python-ai-service-integration",
    "python-code-quality-typing-ruff-mypy",
  ],
  "LLMOps eval quality": [
    "eval-fixture-grader-rubric-threshold",
    "golden-dataset-production-sample-loop",
    "llm-as-judge-calibration-drift",
    "rag-eval-retrieval-groundedness",
    "agent-eval-tool-state-task-success",
    "online-shadow-evaluation",
    "trace-driven-failure-clustering",
    "prompt-model-config-registry-release",
    "ai-release-gate-cicd",
    "safety-eval-red-teaming",
    "quality-cost-latency-tradeoff",
    "ai-incident-regression-case",
  ],
  "Production RAG data infra": [
    "document-parsing-pdf-word-html-table-formula",
    "ocr-layout-aware-chunking",
    "chunking-parent-child-semantic-window",
    "rag-metadata-acl-tenant-lineage",
    "embedding-model-selection-dimension-cost",
    "vector-index-hnsw-ivf-pq-diskann",
    "filter-pushdown-hybrid-search",
    "rerank-cross-encoder-llm-judge",
    "incremental-index-delete-reindex-version",
    "no-answer-low-confidence-conflict-evidence",
    "retrieval-observability-ablation",
    "rag-data-security-permission-leakage",
  ],
  "AI career portfolio": [
    "ai-feature-discovery-business-fit",
    "human-in-the-loop-approval-ux",
    "confidence-citation-fallback-ux",
    "ai-product-metrics-adoption-quality-cost",
    "failure-ux-no-answer-uncertainty",
    "demo-to-production-readiness-gap",
    "ai-project-one-pager-architecture-metrics",
    "resume-bullet-ai-project-impact",
    "interview-project-storytelling-5-15-45",
    "takehome-system-design-ai-template",
    "github-portfolio-readme-eval-report",
    "behavioral-interview-ai-failure-tradeoff",
  ],
};

const requiredPathGroups = {
  "python-ai-application-engineering-review": requiredTopicGroups["Python AI engineering"],
  "llmops-eval-quality-review": requiredTopicGroups["LLMOps eval quality"],
  "production-rag-data-infra-review": requiredTopicGroups["Production RAG data infra"],
  "ai-career-portfolio-interview-review": requiredTopicGroups["AI career portfolio"],
};

const requiredDomainMinimums = {
  "python-ai-engineering": {
    categories: 12,
    questions: 24,
    topics: 12,
  },
  "llmops-eval-quality": {
    categories: 12,
    questions: 24,
    topics: 12,
  },
  "production-rag-data-infra": {
    categories: 12,
    questions: 24,
    topics: 12,
  },
  "ai-career-portfolio": {
    categories: 12,
    questions: 24,
    topics: 12,
  },
};

const requireDomain = (domainId) => {
  const domain = domainById.get(domainId);
  if (!domain) {
    errors.push(`missing domain: ${domainId}`);
    return;
  }
  if (domain.status !== "sample_ready") {
    errors.push(`domain ${domainId} must be sample_ready, got ${domain.status}`);
  }
};

const requireTopic = (group, topicId) => {
  const topic = topicById.get(topicId);
  if (!topic) {
    errors.push(`${group} missing topic: ${topicId}`);
    return;
  }
  if (!Array.isArray(topic.questionIds) || topic.questionIds.length < 2) {
    errors.push(`${topicId} must reference at least 2 questions`);
  }
  for (const questionId of topic.questionIds) {
    if (!questionById.has(questionId)) {
      errors.push(`${topicId} references missing question: ${questionId}`);
    }
  }
  if (!topic.deepDive) {
    errors.push(`${topicId} must include deepDive`);
  }
};

const requirePath = (pathId, expectedNodeIds) => {
  const path = pathById.get(pathId);
  if (!path) {
    errors.push(`missing learning path: ${pathId}`);
    return;
  }
  const missingNodes = expectedNodeIds.filter((topicId) => !path.nodeIds.includes(topicId));
  if (missingNodes.length > 0) {
    errors.push(`${pathId} missing nodes: ${missingNodes.join(", ")}`);
  }
  const brokenNodes = path.nodeIds.filter((topicId) => !topicById.has(topicId));
  if (brokenNodes.length > 0) {
    errors.push(`${pathId} references missing topics: ${brokenNodes.join(", ")}`);
  }
};

for (const domainId of Object.keys(requiredDomainMinimums)) {
  requireDomain(domainId);
}

for (const [group, topicIds] of Object.entries(requiredTopicGroups)) {
  for (const topicId of topicIds) {
    requireTopic(group, topicId);
  }
}

for (const [pathId, expectedNodeIds] of Object.entries(requiredPathGroups)) {
  requirePath(pathId, expectedNodeIds);
}

const domainReports = Object.entries(requiredDomainMinimums).map(
  ([domainId, minimums]) => {
    const domainTopics = topics.filter((topic) => topicDomainId(topic) === domainId);
    const domainTopicIds = new Set(domainTopics.map((topic) => topic.id));
    const domainQuestions = questions.filter((question) =>
      question.topicIds.some((topicId) => domainTopicIds.has(topicId)),
    );
    const domainCategoryIds = new Set(domainTopics.map((topic) => topic.categoryId));
    const issues = [];

    if (domainTopics.length < minimums.topics) {
      issues.push(`topics ${domainTopics.length} < ${minimums.topics}`);
    }
    if (domainQuestions.length < minimums.questions) {
      issues.push(`questions ${domainQuestions.length} < ${minimums.questions}`);
    }
    if (domainCategoryIds.size < minimums.categories) {
      issues.push(`categories ${domainCategoryIds.size} < ${minimums.categories}`);
    }

    if (issues.length > 0) {
      errors.push(`${domainId}: ${issues.join("; ")}`);
    }

    return {
      categories: domainCategoryIds.size,
      domain: domainId,
      issues,
      questions: domainQuestions.length,
      topics: domainTopics.length,
    };
  },
);

const report = {
  errors,
  requiredPathIds: Object.keys(requiredPathGroups),
  requiredTopicGroups,
  domainReports,
  totals: {
    domains: domains.length,
    learningPaths: learningPaths.length,
    questions: questions.length,
    topics: topics.length,
  },
};

console.log(JSON.stringify(report, null, 2));

if (errors.length > 0) {
  process.exit(1);
}
