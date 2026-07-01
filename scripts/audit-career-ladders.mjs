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
  "Spring Java backend": [
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
  "Algorithm coding interview": [
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
};

const requiredPathGroups = {
  "spring-java-backend-review": requiredTopicGroups["Spring Java backend"],
  "coding-algorithms-interview-review": requiredTopicGroups["Algorithm coding interview"],
};

const requiredDomainMinimums = {
  "spring-java-backend": {
    categories: 12,
    questions: 32,
    topics: 16,
  },
  "coding-algorithms-interview": {
    categories: 12,
    questions: 32,
    topics: 16,
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
