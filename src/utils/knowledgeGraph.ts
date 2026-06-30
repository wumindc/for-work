// @author codex
import {
  graphEdges,
  learningPaths,
  projectEvidenceById,
  questionById,
  topics,
} from "../data";
import type {
  InterviewQuestion,
  KnowledgeEdge,
  LearningPath,
  Mastery,
  ProjectEvidence,
  QuestionStatus,
  Topic,
} from "../types/knowledge";
import { masteryRank } from "./labels";

export type KnowledgeGraphInput = {
  questionStatus: Record<string, QuestionStatus>;
  selectedPathId?: string;
  selectedTopicId?: string | null;
  topicMastery: Record<string, Mastery>;
};

export type PathProgress = {
  path: LearningPath;
  completed: number;
  total: number;
  currentIndex: number;
  currentTopic: Topic;
  nextTopic: Topic | null;
};

export type TopicNodeView = {
  topic: Topic;
  mastery: Mastery;
  pathIds: string[];
  pathIndexByPathId: Record<string, number>;
  isCurrentPathNode: boolean;
  isSelected: boolean;
  isBlocked: boolean;
};

export type SelectedNodeView = {
  topic: Topic;
  mastery: Mastery;
  incomingEdges: KnowledgeEdge[];
  outgoingEdges: KnowledgeEdge[];
  relatedEdges: KnowledgeEdge[];
  blockers: Topic[];
  questions: InterviewQuestion[];
  projectEvidence: ProjectEvidence[];
  followupEdges: KnowledgeEdge[];
};

export type KnowledgeGraphView = {
  currentPath: LearningPath;
  currentPathProgress: PathProgress;
  edges: KnowledgeEdge[];
  nextNode: Topic;
  pathProgress: PathProgress[];
  paths: LearningPath[];
  riskNodes: Topic[];
  selectedNode: SelectedNodeView;
  topicNodes: TopicNodeView[];
};

const topicById = new Map(topics.map((topic) => [topic.id, topic]));

const masteryOf = (
  topicMastery: Record<string, Mastery>,
  topicId: string,
): Mastery => topicMastery[topicId] ?? "new";

const isTopicReady = (
  topicMastery: Record<string, Mastery>,
  topicId: string,
  minimum: Mastery = "can_explain",
) => masteryRank[masteryOf(topicMastery, topicId)] >= masteryRank[minimum];

const topicFromId = (topicId: string): Topic => {
  const topic = topicById.get(topicId);
  if (!topic) {
    throw new Error(`Unknown topic id: ${topicId}`);
  }
  return topic;
};

const buildTopicPathIndex = () => {
  const pathIdsByTopicId = new Map<string, string[]>();
  const pathIndexByTopicId = new Map<string, Record<string, number>>();

  for (const path of learningPaths) {
    path.nodeIds.forEach((topicId, index) => {
      const pathIds = pathIdsByTopicId.get(topicId) ?? [];
      pathIdsByTopicId.set(topicId, [...pathIds, path.id]);
      pathIndexByTopicId.set(topicId, {
        ...(pathIndexByTopicId.get(topicId) ?? {}),
        [path.id]: index,
      });
    });
  }

  return { pathIdsByTopicId, pathIndexByTopicId };
};

const { pathIdsByTopicId, pathIndexByTopicId } = buildTopicPathIndex();

const buildPathProgress = (
  path: LearningPath,
  topicMastery: Record<string, Mastery>,
): PathProgress => {
  const pathTopics = path.nodeIds.map(topicFromId);
  const currentIndex = pathTopics.findIndex(
    (topic) => !isTopicReady(topicMastery, topic.id),
  );
  const normalizedIndex = currentIndex === -1 ? pathTopics.length - 1 : currentIndex;
  const completed = pathTopics.filter((topic) =>
    isTopicReady(topicMastery, topic.id),
  ).length;
  const currentTopic = pathTopics[normalizedIndex] ?? pathTopics[0];
  const nextTopic =
    pathTopics.find(
      (topic, index) =>
        index > normalizedIndex && !isTopicReady(topicMastery, topic.id),
    ) ?? null;

  return {
    path,
    completed,
    total: pathTopics.length,
    currentIndex: normalizedIndex,
    currentTopic,
    nextTopic,
  };
};

const buildRiskNodes = (topicMastery: Record<string, Mastery>) =>
  [...topics]
    .filter((topic) => topic.interviewFrequency === "high")
    .filter((topic) => !isTopicReady(topicMastery, topic.id))
    .sort((a, b) => {
      if (a.priority === b.priority) {
        return a.title.localeCompare(b.title, "zh-Hans-CN");
      }
      if (a.priority === "must") return -1;
      if (b.priority === "must") return 1;
      return 0;
    })
    .slice(0, 8);

const pickSelectedTopic = ({
  currentPathProgress,
  selectedTopicId,
  topicMastery,
}: {
  currentPathProgress: PathProgress;
  selectedTopicId?: string | null;
  topicMastery: Record<string, Mastery>;
}) => {
  if (selectedTopicId && topicById.has(selectedTopicId)) {
    return topicFromId(selectedTopicId);
  }

  return (
    currentPathProgress.currentTopic ??
    currentPathProgress.path.nodeIds
      .map(topicFromId)
      .find((topic) => !isTopicReady(topicMastery, topic.id)) ??
    topicFromId(currentPathProgress.path.nodeIds[0])
  );
};

const collectProjectEvidence = (topic: Topic, outgoingEdges: KnowledgeEdge[]) => {
  const evidenceIds = new Set([
    ...topic.projectEvidenceIds,
    ...outgoingEdges
      .filter((edge) => edge.kind === "project_evidence")
      .map((edge) => edge.to),
  ]);

  return [...evidenceIds]
    .map((id) => projectEvidenceById.get(id))
    .filter((item): item is ProjectEvidence => Boolean(item));
};

const collectQuestions = (topic: Topic) =>
  topic.questionIds
    .map((questionId) => questionById.get(questionId))
    .filter((question): question is InterviewQuestion => Boolean(question));

export const buildKnowledgeGraph = ({
  questionStatus,
  selectedPathId,
  selectedTopicId,
  topicMastery,
}: KnowledgeGraphInput): KnowledgeGraphView => {
  const currentPath =
    learningPaths.find((path) => path.id === selectedPathId) ?? learningPaths[0];
  const pathProgress = learningPaths.map((path) =>
    buildPathProgress(path, topicMastery),
  );
  const currentPathProgress =
    pathProgress.find((item) => item.path.id === currentPath.id) ??
    pathProgress[0];
  const nextNode = currentPathProgress.currentTopic;
  const selectedTopic = pickSelectedTopic({
    currentPathProgress,
    selectedTopicId,
    topicMastery,
  });

  const incomingEdges = graphEdges.filter((edge) => edge.to === selectedTopic.id);
  const outgoingEdges = graphEdges.filter((edge) => edge.from === selectedTopic.id);
  const relatedEdges = graphEdges.filter(
    (edge) =>
      edge.from === selectedTopic.id ||
      edge.to === selectedTopic.id ||
      (edge.kind === "contrasts" &&
        (edge.from === selectedTopic.id || edge.to === selectedTopic.id)),
  );
  const blockers = selectedTopic.prerequisites
    .filter((topicId) => !isTopicReady(topicMastery, topicId))
    .map(topicFromId);
  const followupEdges = outgoingEdges
    .filter((edge) => edge.kind === "interview_followup")
    .slice(0, 6);

  const topicNodes = topics.map((topic) => {
    const pathIds = pathIdsByTopicId.get(topic.id) ?? [];
    return {
      topic,
      mastery: masteryOf(topicMastery, topic.id),
      pathIds,
      pathIndexByPathId: pathIndexByTopicId.get(topic.id) ?? {},
      isCurrentPathNode: pathIds.includes(currentPath.id),
      isSelected: topic.id === selectedTopic.id,
      isBlocked: topic.prerequisites.some(
        (topicId) => !isTopicReady(topicMastery, topicId),
      ),
    };
  });

  const passedQuestionIds = new Set(
    Object.entries(questionStatus)
      .filter(([, status]) => status === "passed")
      .map(([questionId]) => questionId),
  );

  const selectedQuestions = collectQuestions(selectedTopic).sort((a, b) => {
    const aPassed = passedQuestionIds.has(a.id);
    const bPassed = passedQuestionIds.has(b.id);
    if (aPassed === bPassed) return b.difficulty - a.difficulty;
    return aPassed ? 1 : -1;
  });

  return {
    currentPath,
    currentPathProgress,
    edges: graphEdges,
    nextNode,
    pathProgress,
    paths: learningPaths,
    riskNodes: buildRiskNodes(topicMastery),
    selectedNode: {
      topic: selectedTopic,
      mastery: masteryOf(topicMastery, selectedTopic.id),
      incomingEdges,
      outgoingEdges,
      relatedEdges,
      blockers,
      questions: selectedQuestions,
      projectEvidence: collectProjectEvidence(selectedTopic, outgoingEdges),
      followupEdges,
    },
    topicNodes,
  };
};
