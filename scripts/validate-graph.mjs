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
const edgeIds = new Set();
const errors = [];

const requireRef = (kind, ownerId, ref, targetIds, targetKind) => {
  if (!targetIds.has(ref)) {
    errors.push(`${kind} ${ownerId} references missing ${targetKind}: ${ref}`);
  }
};

for (const edge of graphEdges) {
  if (edgeIds.has(edge.id)) {
    errors.push(`duplicate edge id: ${edge.id}`);
  }
  edgeIds.add(edge.id);
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

const requiredKinds = [
  "prerequisite",
  "same_path",
  "builds_on",
  "contrasts",
  "extends",
  "interview_followup",
  "project_evidence",
];

for (const kind of requiredKinds) {
  if (!graphEdges.some((edge) => edge.kind === kind)) {
    errors.push(`expected at least one ${kind} edge`);
  }
}

if (graphEdges.length < 100) {
  errors.push(`expected at least 100 graph edges, got ${graphEdges.length}`);
}

const graph = buildKnowledgeGraph({
  questionStatus: {},
  selectedPathId: "agent-engineering-mainline",
  selectedTopicId: null,
  topicMastery: {},
});

assert.equal(graph.paths.length, learningPaths.length);
assert.equal(graph.currentPath.id, "agent-engineering-mainline");
assert.equal(graph.selectedNode.topic.id, "llm-foundation");
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
