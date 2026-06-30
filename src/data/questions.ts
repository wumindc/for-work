// @author codex
import type { InterviewQuestion } from "../types/knowledge";
import { deepTopicPatches, handwrittenQuestions } from "./deepSamples";
import { topicDeepDives } from "./deepDives";
import { topicSeeds } from "./topics";

const companyTagsByFrequency = {
  high: ["字节", "阿里", "腾讯", "通用"],
  medium: ["字节", "阿里", "通用"],
  low: ["通用"],
} as const;

const compact = (items: Array<string | undefined>) =>
  items.filter((item): item is string => Boolean(item?.trim()));

const joinItems = (items: string[], limit: number) => items.slice(0, limit).join("；");

const enrichTopic = (topic: (typeof topicSeeds)[number]) => ({
  ...topic,
  ...(deepTopicPatches[topic.id] ?? {}),
  deepDive: topicDeepDives[topic.id],
});

const buildAnswerOutline = (topic: ReturnType<typeof enrichTopic>) =>
  compact([
    `我会先划边界：${joinItems(
      compact([...(topic.definition ?? []), topic.summary, ...topic.mustRemember]),
      4,
    )}。`,
    `再讲运行机制：${joinItems(
      compact([...(topic.principles ?? []), ...topic.details]),
      4,
    )}。`,
    `工程实现要落到可执行设计：${joinItems(
      compact([
        ...(topic.industrySolutions ?? []),
        ...(topic.engineeringDetails ?? []),
        ...topic.engineeringNotes,
      ]),
      5,
    )}。`,
    `如果被要求画设计，可以按这个结构展开：${joinItems(
      compact([
        ...(topic.systemDesignCases ?? []).flatMap((caseItem) => [
          caseItem.title,
          ...caseItem.architecture,
          ...(caseItem.architectureDiagram ?? []),
          ...caseItem.dataFlow,
        ]),
      ]),
      14,
    )}。`,
    `最后补风险、指标和取舍：${joinItems(
      compact([
        ...(topic.tradeoffs ?? []),
        ...topic.commonPitfalls,
        ...(topic.scenarios ?? []).flatMap((scenario) =>
          scenario.metrics.map((metric) => `跟踪 ${metric}`),
        ),
        ...(topic.systemDesignCases ?? []).flatMap((caseItem) =>
          caseItem.observability.map((item) => `观测 ${item}`),
        ),
        ...(topic.deepDive?.metrics ?? []).map((metric) => `跟踪 ${metric}`),
      ]),
      12,
    )}。`,
  ]);

const buildFollowUpSteps = (
  topic: ReturnType<typeof enrichTopic>,
  primaryQuestion: string,
) => [
  {
    question: primaryQuestion,
    answerHint: `我会先回到适用边界，再解释机制和工程代价：${joinItems(
      compact([...(topic.principles ?? []), ...(topic.tradeoffs ?? [])]),
      5,
    )}。回答时不能只说概念，要把选择标准、失败模式和可观测指标一起讲出来。`,
    probes: ["边界判断", "工程取舍"],
    relatedTopicIds: [topic.id],
  },
  {
    question: `如果把它落到 ${topic.projectEvidenceIds.join(" / ")} 项目里，你会怎么设计？`,
    answerHint: `我会按输入、状态、执行、验证和指标展开：${joinItems(
      compact([
        ...(topic.engineeringDetails ?? []),
        ...topic.engineeringNotes,
        ...(topic.systemDesignCases ?? []).flatMap((caseItem) => [
          caseItem.title,
          ...caseItem.architecture,
          ...caseItem.dataFlow,
        ]),
        ...(topic.deepDive?.implementationChecklist ?? []),
      ]),
      17,
    )}。项目表达里要说明模块边界、数据流、错误恢复和上线后的指标，而不是只说用了某个框架。`,
    probes: ["系统设计", "项目证据"],
    relatedTopicIds: [topic.id],
  },
  {
    question: "线上出问题时，你会看哪些日志、trace 或指标？",
    answerHint: `我会先按失败类型归因，再看 trace 中的输入、状态、工具参数、返回结果、耗时、成本和 verdict；重点指标包括 ${joinItems(
      topic.deepDive?.metrics ?? [],
      6,
    )}。如果问题来自设计边界，还要回到 schema、权限、上下文和评测集，而不是只调 prompt。`,
    probes: ["trace", "指标归因"],
    relatedTopicIds: [topic.id],
  },
];

const generatedQuestions = topicSeeds.flatMap((topic) => {
  const enrichedTopic = enrichTopic(topic);
  const coreQuestion: InterviewQuestion = {
    id: `q-${topic.id}-core`,
    topicIds: [topic.id],
    title: topic.coreQuestion,
    difficulty: topic.questionDifficulty,
    roleTags: topic.roleTags,
    companyTags: [...companyTagsByFrequency[topic.interviewFrequency]],
    frequency: topic.interviewFrequency,
    answerOutline: buildAnswerOutline(enrichedTopic),
    followUps: [
      topic.deepQuestion,
      `如果把它落到 ${topic.projectEvidenceIds.join(" / ")} 项目里，你会怎么讲？`,
      "这个点最常见的失败模式是什么，怎么用 eval 或 trace 证明？",
    ],
    projectAnswerHints: [
      `可以关联项目证据：${topic.projectEvidenceIds.join("、")}`,
      topic.engineeringNotes[0],
      topic.engineeringNotes[1],
    ],
    commonMistakes: topic.commonPitfalls,
    followUpSteps: buildFollowUpSteps(enrichedTopic, topic.deepQuestion),
  };

  const deepQuestion: InterviewQuestion = {
    id: `q-${topic.id}-deep`,
    topicIds: [topic.id],
    title: topic.deepQuestion,
    difficulty: Math.min(5, topic.questionDifficulty + 1) as 1 | 2 | 3 | 4 | 5,
    roleTags: topic.roleTags,
    companyTags: [...companyTagsByFrequency[topic.interviewFrequency]],
    frequency: topic.interviewFrequency,
    answerOutline: buildAnswerOutline(enrichedTopic),
    followUps: [
      topic.coreQuestion,
      "如果线上出现这个问题，你会看哪些日志、trace 或指标？",
      "如果成本、延迟和准确率发生冲突，你会怎么取舍？",
    ],
    projectAnswerHints: [
      `把回答落到 ${topic.projectEvidenceIds.join("、")} 的工具、状态、评测或安全设计中。`,
      "用架构、业务、结果三段式回答，避免只背概念。",
      "补一个失败案例和改进动作，可信度会明显更高。",
    ],
    commonMistakes: [
      ...topic.commonPitfalls,
      "只给名词解释，不讲边界、指标和工程证据",
    ],
    followUpSteps: buildFollowUpSteps(enrichedTopic, topic.coreQuestion),
  };

  return [coreQuestion, deepQuestion];
}) satisfies InterviewQuestion[];

export const questions = [
  ...generatedQuestions,
  ...handwrittenQuestions,
] satisfies InterviewQuestion[];
