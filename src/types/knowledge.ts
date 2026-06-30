// @author codex
export type Priority = "must" | "follow_up" | "extension";
export type Frequency = "high" | "medium" | "low";
export type RoleTag = "development" | "algorithm" | "general";
export type Mastery =
  | "new"
  | "learning"
  | "can_explain"
  | "can_answer_followups"
  | "project_ready";
export type QuestionStatus = "new" | "practicing" | "missed" | "passed";
export type ProjectId =
  | "paper-agent"
  | "travel-agent"
  | "web-agent"
  | "coding-agent";
export type DomainStatus = "sample_ready" | "planned" | "draft";
export type DomainPriority = "core" | "important" | "later";

export type Domain = {
  id: string;
  title: string;
  description: string;
  status: DomainStatus;
  priority: DomainPriority;
};

export type ScenarioCase = {
  id: string;
  title: string;
  context: string;
  problem: string;
  design: string[];
  failureModes: string[];
  metrics: string[];
};

export type SystemDesignCase = {
  id: string;
  title: string;
  requirements: string[];
  architecture: string[];
  architectureDiagram?: string[];
  dataFlow: string[];
  scalingPoints: string[];
  observability: string[];
  tradeoffs: string[];
};

export type FollowUpStep = {
  question: string;
  answerHint: string;
  probes: string[];
  relatedTopicIds: string[];
};

export type Category = {
  id: string;
  domainId: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
};

export type Source = {
  id: string;
  title: string;
  url: string;
  kind: "github" | "official" | "paper" | "benchmark" | "doc";
};

export type Topic = {
  id: string;
  domainId?: string;
  title: string;
  categoryId: string;
  priority: Priority;
  interviewFrequency: Frequency;
  roleTags: RoleTag[];
  prerequisites: string[];
  summary: string;
  mustRemember: string[];
  details: string[];
  engineeringNotes: string[];
  commonPitfalls: string[];
  questionIds: string[];
  projectEvidenceIds: string[];
  sourceIds: string[];
  deepDive?: TopicDeepDive;
  definition?: string[];
  principles?: string[];
  industrySolutions?: string[];
  scenarios?: ScenarioCase[];
  systemDesignCases?: SystemDesignCase[];
  engineeringDetails?: string[];
  tradeoffs?: string[];
  experienceBridge?: string[];
};

export type TopicDeepDive = {
  mentalModel: string[];
  interviewAngles: string[];
  implementationChecklist: string[];
  metrics: string[];
  projectHooks: string[];
};

export type InterviewQuestion = {
  id: string;
  topicIds: string[];
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  roleTags: RoleTag[];
  companyTags: string[];
  frequency: Frequency;
  answerOutline: string[];
  followUps: string[];
  projectAnswerHints: string[];
  commonMistakes: string[];
  examFocus?: string[];
  keyDetails?: string[];
  scenarioExtension?: string[];
  followUpSteps?: FollowUpStep[];
};

export type ProjectEvidence = {
  id: string;
  project: ProjectId;
  title: string;
  scenario: string;
  architecturePoints: string[];
  tools: string[];
  evalPoints: string[];
  safetyPoints: string[];
  resumeBullet: string;
  relatedTopicIds: string[];
};

export type GraphNodeKind = "topic" | "question" | "project" | "milestone";

export type KnowledgeEdgeKind =
  | "prerequisite"
  | "builds_on"
  | "contrasts"
  | "extends"
  | "interview_followup"
  | "project_evidence"
  | "same_path"
  | "review_after";

export type KnowledgeEdge = {
  id: string;
  from: string;
  to: string;
  kind: KnowledgeEdgeKind;
  label: string;
  strength: 1 | 2 | 3;
  reason: string;
  pathIds?: string[];
};

export type LearningPathMode = "foundation" | "interview" | "project" | "intensive";

export type LearningPath = {
  id: string;
  title: string;
  mode: LearningPathMode;
  description: string;
  nodeIds: string[];
  focusWindow?: string;
  exitCriteria: string[];
};
