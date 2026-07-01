// @author codex
import { categories, domains, questions, topics } from "../src/data/index.ts";

const categoryDomainById = new Map(
  categories.map((category) => [category.id, category.domainId]),
);

const domainOfTopic = (topic) =>
  topic.domainId ?? categoryDomainById.get(topic.categoryId);

const minimumsByDomain = {
  "ai-agent-rag": {
    categories: 12,
    questions: 90,
    topics: 45,
  },
  elasticsearch: {
    categories: 4,
    questions: 5,
    topics: 5,
  },
  mq: {
    categories: 5,
    questions: 7,
    topics: 5,
  },
  redis: {
    categories: 4,
    questions: 10,
    requiredTopicIds: [
      "redis-data-types-encoding",
      "redis-cache-consistency",
      "redis-hotkey-breakdown-avalanche",
      "redis-expiration-eviction-memory",
      "redis-persistence-aof-rdb",
      "redis-replication-sentinel-cluster",
      "redis-distributed-lock-rate-limit",
      "redis-lua-transaction-pipeline",
    ],
    topics: 8,
  },
  database: {
    categories: 4,
    questions: 10,
    requiredTopicIds: [
      "db-index-execution-plan",
      "db-sql-join-optimization",
      "db-mvcc-transaction-isolation",
      "db-lock-deadlock-troubleshooting",
      "db-replication-read-write-splitting",
      "db-sharding-partitioning",
      "db-backup-recovery-migration",
      "db-online-ddl-schema-change",
    ],
    topics: 8,
  },
  "prometheus-observability": {
    categories: 4,
    questions: 8,
    requiredTopicIds: [
      "prometheus-metrics-promql",
      "observability-incident-tracing",
      "observability-structured-logging-correlation",
      "observability-alerting-slo-burn-rate",
      "observability-dashboard-runbook-incident",
      "observability-cardinality-capacity-cost",
    ],
    topics: 6,
  },
  "java-jvm": {
    categories: 4,
    questions: 10,
    requiredTopicIds: [
      "java-thread-pool-governance",
      "jvm-gc-troubleshooting",
      "java-memory-model-volatile-happens-before",
      "java-locks-aqs-synchronized-reentrantlock",
      "java-concurrent-collections-cas",
      "java-completablefuture-async-timeout",
      "java-classloading-spi",
      "java-jvm-memory-diagnostics",
    ],
    topics: 8,
  },
  "system-design": {
    categories: 4,
    questions: 10,
    requiredTopicIds: [
      "distributed-idempotency-retry-timeout",
      "distributed-transaction-saga-outbox",
      "system-load-balancing-routing",
      "system-rate-limit-circuit-breaker-bulkhead",
      "system-service-discovery-config",
      "system-consistency-consensus-leader-election",
      "system-disaster-recovery-multi-region",
      "system-capacity-planning-hotspot",
    ],
    topics: 8,
  },
  "web-engineering": {
    categories: 4,
    questions: 10,
    requiredTopicIds: [
      "web-http-cache-session-auth",
      "web-api-contract-idempotency-security",
      "web-browser-security-cors-csrf-xss",
      "web-auth-session-token-oauth",
      "web-cdn-cache-upload-download",
      "web-websocket-sse-realtime",
      "web-gateway-bff-api-versioning",
      "web-frontend-backend-contract-observability",
    ],
    topics: 8,
  },
  "ai-engineering-trends": {
    categories: 8,
    questions: 12,
    requiredTopicIds: [
      "loop-engineering-agent-runtime",
      "agent-state-file-verifier",
      "codex-claude-context-workflow",
      "ai-code-review-pipeline",
      "rag-document-ingestion-stack",
      "self-growing-knowledge-base",
      "agent-memory-layering-compression",
      "skill-packaging-workflow",
      "design-assets-for-ai-coding",
      "computer-use-agent-benchmark",
      "local-ai-inference-stack",
      "enterprise-agent-solution-map",
    ],
    topics: 12,
  },
  "devops-docker-kubernetes": {
    categories: 8,
    questions: 16,
    requiredTopicIds: [
      "docker-container-image-foundation",
      "dockerfile-buildkit-image-layer",
      "container-runtime-resource-isolation",
      "docker-compose-local-dev",
      "kubernetes-pod-workload-controller",
      "kubernetes-service-ingress-networking",
      "kubernetes-config-secret-storage",
      "kubernetes-observability-release",
    ],
    topics: 8,
  },
  "spring-java-backend": {
    categories: 12,
    questions: 32,
    requiredTopicIds: [
      "spring-ioc-bean-lifecycle",
      "spring-aop-proxy-transaction-boundary",
      "spring-boot-autoconfiguration-starter",
      "spring-boot-configuration-properties-profile",
      "spring-mvc-rest-controller-validation",
      "spring-web-exception-handler-contract",
      "spring-transaction-propagation-isolation",
      "spring-mybatis-sqlsession-mapper",
      "mybatis-dynamic-sql-resultmap-cache",
      "mybatis-plus-crud-wrapper-pagination",
      "spring-cloud-service-discovery-config",
      "spring-cloud-openfeign-loadbalancer",
      "spring-cloud-gateway-filter-routing",
      "spring-cloud-resilience4j-circuitbreaker",
      "spring-security-authentication-authorization",
      "spring-boot-actuator-observability-troubleshooting",
    ],
    topics: 16,
  },
  "coding-algorithms-interview": {
    categories: 12,
    questions: 32,
    requiredTopicIds: [
      "algorithm-complexity-java-template",
      "array-two-pointers-sliding-window",
      "string-pattern-matching",
      "hash-map-set-frequency",
      "stack-queue-monotonic-structure",
      "linked-list-fast-slow-pointer",
      "binary-search-boundary-answer",
      "sorting-selection-topk-heap",
      "recursion-backtracking-subsets-permutation",
      "tree-traversal-depth-recursion",
      "binary-tree-bst-lca",
      "dynamic-programming-state-transition",
      "greedy-interval-sweep-line",
      "graph-bfs-dfs-shortest-path",
      "union-find-topological-sort",
      "coding-interview-simulation-debugging",
    ],
    topics: 16,
  },
  "python-ai-engineering": {
    categories: 12,
    questions: 24,
    requiredTopicIds: [
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
    topics: 12,
  },
  "llmops-eval-quality": {
    categories: 12,
    questions: 24,
    requiredTopicIds: [
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
    topics: 12,
  },
  "production-rag-data-infra": {
    categories: 12,
    questions: 24,
    requiredTopicIds: [
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
    topics: 12,
  },
  "ai-career-portfolio": {
    categories: 12,
    questions: 24,
    requiredTopicIds: [
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
    topics: 12,
  },
};

const topicIds = new Set(topics.map((topic) => topic.id));

const domainReports = domains
  .filter((domain) => domain.status !== "planned")
  .map((domain) => {
    const domainTopics = topics.filter((topic) => domainOfTopic(topic) === domain.id);
    const domainTopicIds = new Set(domainTopics.map((topic) => topic.id));
    const domainQuestions = questions.filter((question) =>
      question.topicIds.some((topicId) => domainTopicIds.has(topicId)),
    );
    const domainCategoryIds = new Set(domainTopics.map((topic) => topic.categoryId));
    const minimums = minimumsByDomain[domain.id];
    const issues = [];
    const missingRequiredTopicIds = (minimums?.requiredTopicIds ?? []).filter(
      (topicId) => !topicIds.has(topicId),
    );

    if (!minimums) {
      issues.push("missing coverage minimum definition");
    } else {
      if (domainTopics.length < minimums.topics) {
        issues.push(`topics ${domainTopics.length} < ${minimums.topics}`);
      }
      if (domainQuestions.length < minimums.questions) {
        issues.push(`questions ${domainQuestions.length} < ${minimums.questions}`);
      }
      if (domainCategoryIds.size < minimums.categories) {
        issues.push(`categories ${domainCategoryIds.size} < ${minimums.categories}`);
      }
      if (missingRequiredTopicIds.length > 0) {
        issues.push(`missing required topics: ${missingRequiredTopicIds.join(", ")}`);
      }
    }

    return {
      categories: domainCategoryIds.size,
      domain: domain.id,
      issues,
      questions: domainQuestions.length,
      topics: domainTopics.length,
    };
  });

const failing = domainReports.filter((report) => report.issues.length > 0);

console.log(
  JSON.stringify(
    {
      failing,
      reports: domainReports,
      totals: {
        domains: domainReports.length,
        failing: failing.length,
        passing: domainReports.length - failing.length,
      },
    },
    null,
    2,
  ),
);

if (failing.length > 0) {
  process.exit(1);
}
