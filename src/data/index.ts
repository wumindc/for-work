// @author codex
import { categories } from "./categories";
import { domains } from "./domains";
import { graphEdges } from "./graphEdges";
import { learningPaths } from "./learningPaths";
import { projectEvidence } from "./projects";
import { questions } from "./questions";
import { sources } from "./sources";
import { topics } from "./topics";

export {
  categories,
  domains,
  graphEdges,
  learningPaths,
  projectEvidence,
  questions,
  sources,
  topics,
};

export const topicById = new Map(topics.map((topic) => [topic.id, topic]));
export const questionById = new Map(
  questions.map((question) => [question.id, question]),
);
export const projectEvidenceById = new Map(
  projectEvidence.map((item) => [item.id, item]),
);
export const categoryById = new Map(
  categories.map((category) => [category.id, category]),
);
export const domainById = new Map(domains.map((domain) => [domain.id, domain]));
export const sourceById = new Map(sources.map((source) => [source.id, source]));
export const learningPathById = new Map(
  learningPaths.map((path) => [path.id, path]),
);
export const graphEdgeById = new Map(graphEdges.map((edge) => [edge.id, edge]));
