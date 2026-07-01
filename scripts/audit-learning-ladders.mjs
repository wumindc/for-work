// @author codex
import { categories, domains, learningPaths, questions, topics } from "../src/data/index.ts";

const errors = [];

const topicById = new Map(topics.map((topic) => [topic.id, topic]));
const questionById = new Map(questions.map((question) => [question.id, question]));
const domainById = new Map(domains.map((domain) => [domain.id, domain]));
const categoryById = new Map(categories.map((category) => [category.id, category]));
const pathById = new Map(learningPaths.map((path) => [path.id, path]));

const requiredTopicGroups = {
  "LLM foundations": [
    "llm-tokenization-embedding",
    "llm-transformer-attention",
    "llm-kv-cache-inference",
    "llm-decoding-runtime-tradeoffs",
  ],
  "Prometheus mechanism": [
    "prometheus-scrape-service-discovery",
    "prometheus-tsdb-rules-alertmanager",
  ],
  "Docker Kubernetes DevOps": [
    "docker-container-image-foundation",
    "dockerfile-buildkit-image-layer",
    "container-runtime-resource-isolation",
    "docker-compose-local-dev",
    "kubernetes-pod-workload-controller",
    "kubernetes-service-ingress-networking",
    "kubernetes-config-secret-storage",
    "kubernetes-observability-release",
  ],
};

const requiredPathGroups = {
  "llm-foundations-learning-ladder": [
    "llm-foundation",
    ...requiredTopicGroups["LLM foundations"],
    "chatgpt-runtime",
    "llm-training-alignment",
  ],
  "prometheus-mechanism-learning-ladder": [
    "prometheus-scrape-service-discovery",
    "prometheus-tsdb-rules-alertmanager",
    "prometheus-metrics-promql",
    "observability-alerting-slo-burn-rate",
    "observability-cardinality-capacity-cost",
  ],
  "devops-docker-kubernetes-review": requiredTopicGroups["Docker Kubernetes DevOps"],
};

const topicDomainId = (topic) =>
  topic.domainId ?? categoryById.get(topic.categoryId)?.domainId;

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

requireDomain("devops-docker-kubernetes");

for (const [group, topicIds] of Object.entries(requiredTopicGroups)) {
  for (const topicId of topicIds) {
    requireTopic(group, topicId);
  }
}

for (const [pathId, expectedNodeIds] of Object.entries(requiredPathGroups)) {
  requirePath(pathId, expectedNodeIds);
}

const devopsTopics = topics.filter(
  (topic) => topicDomainId(topic) === "devops-docker-kubernetes",
);
const devopsCategoryIds = new Set(devopsTopics.map((topic) => topic.categoryId));
if (devopsTopics.length < 8) {
  errors.push(`devops-docker-kubernetes topics ${devopsTopics.length} < 8`);
}
if (devopsCategoryIds.size < 8) {
  errors.push(`devops-docker-kubernetes categories ${devopsCategoryIds.size} < 8`);
}

const report = {
  errors,
  requiredPathIds: Object.keys(requiredPathGroups),
  requiredTopicGroups,
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
