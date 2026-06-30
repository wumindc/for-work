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
