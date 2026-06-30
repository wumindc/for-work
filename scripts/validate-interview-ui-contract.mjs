// @author codex
import fs from "node:fs";

const appSource = fs.readFileSync("src/app/App.tsx", "utf8");
const drillSource = fs.readFileSync("src/components/interview/InterviewDrill.tsx", "utf8");
const graphSource = fs.readFileSync("src/components/graph/GraphLearning.tsx", "utf8");
const markdownSource = fs.readFileSync("src/components/shared/MarkdownDocument.tsx", "utf8");
const topicDetailSource = fs.readFileSync("src/components/knowledge/TopicDetail.tsx", "utf8");
const errors = [];

const requireSource = (source, needle, message) => {
  if (!source.includes(needle)) {
    errors.push(message);
  }
};
const forbidSource = (source, needle, message) => {
  if (source.includes(needle)) {
    errors.push(message);
  }
};

requireSource(
  drillSource,
  "onSelectQuestion: (questionId: string) => void;",
  "InterviewDrill must expose an onSelectQuestion callback so sidebar clicks update the parent selected question.",
);
requireSource(
  drillSource,
  "onSelectQuestion(questionId)",
  "InterviewDrill selection helper must notify the parent with the clicked question id.",
);
requireSource(
  drillSource,
  "onClick={() => selectQuestion(question.id)}",
  "InterviewDrill sidebar click must route through the selection helper.",
);
requireSource(
  appSource,
  "onSelectQuestion={openQuestion}",
  "App must pass openQuestion into InterviewDrill so selectedQuestionId stays in sync.",
);
requireSource(
  appSource,
  "topicMastery={progress.topicMastery}",
  "App must pass topic mastery progress into GraphLearning.",
);
requireSource(
  appSource,
  "onSetTopicMastery={progress.setTopicMastery}",
  "App must pass topic mastery updates into GraphLearning.",
);
requireSource(
  topicDetailSource,
  "MarkdownDocument",
  "TopicDetail must render authored Markdown content when a topic markdown file exists.",
);
requireSource(
  topicDetailSource,
  "topicMarkdownById",
  "TopicDetail must load topicMarkdownById so right-side knowledge content can come from Markdown files.",
);
requireSource(
  drillSource,
  "MarkdownDocument",
  "InterviewDrill must render authored Markdown content when a question markdown file exists.",
);
requireSource(
  drillSource,
  "questionMarkdownById",
  "InterviewDrill must load questionMarkdownById so right-side interview answers can come from Markdown files.",
);
forbidSource(
  drillSource,
  "继续练习",
  "InterviewDrill should not show the redundant continue-practice action.",
);
requireSource(
  drillSource,
  "studyFilter",
  "InterviewDrill must provide quick filters for all, unlearned, and learned questions.",
);
requireSource(
  drillSource,
  "collapsedCategoryIds",
  "InterviewDrill category headers must be collapsible.",
);
requireSource(
  drillSource,
  "CheckCircle2",
  "InterviewDrill question rows must show a learned status icon.",
);
requireSource(
  drillSource,
  "已学习",
  "InterviewDrill sidebar summary must show learned count and learned filter.",
);
requireSource(
  drillSource,
  "未学习",
  "InterviewDrill sidebar summary must show unlearned count and unlearned filter.",
);
requireSource(
  appSource,
  "appearance-none",
  "App domain selector should use a custom select style instead of the default browser dropdown.",
);
requireSource(
  appSource,
  "ChevronDown",
  "App domain selector should include a dropdown affordance icon.",
);

const actionIndex = drillSource.indexOf("标记掌握");
const titleIndex = drillSource.indexOf("{activeQuestion.title}");
if (actionIndex === -1 || titleIndex === -1 || actionIndex > titleIndex) {
  errors.push("InterviewDrill mastery action should live in the top question header, before the question title content.");
}

requireSource(
  graphSource,
  "studyFilter",
  "GraphLearning must provide quick filters for all, unlearned, and learned topics.",
);
requireSource(
  graphSource,
  "collapsedCategoryIds",
  "GraphLearning category headers must be collapsible.",
);
requireSource(
  graphSource,
  "CheckCircle2",
  "GraphLearning topic rows must show a learned status icon.",
);
requireSource(
  graphSource,
  "已学习",
  "GraphLearning sidebar summary must show learned count and learned filter.",
);
requireSource(
  graphSource,
  "未学习",
  "GraphLearning sidebar summary must show unlearned count and unlearned filter.",
);
requireSource(
  graphSource,
  "topicMastery",
  "GraphLearning must derive knowledge progress from topicMastery.",
);
requireSource(
  topicDetailSource,
  "onSetTopicMastery",
  "TopicDetail must expose a top-right topic learning action.",
);
requireSource(
  topicDetailSource,
  "标记已学",
  "TopicDetail must render a mark-learned action for knowledge topics.",
);
requireSource(
  markdownSource,
  'type: "table"',
  "MarkdownDocument must support table blocks for technical comparison matrices.",
);
requireSource(
  markdownSource,
  'type: "callout"',
  "MarkdownDocument must support callout blocks for interview warnings and technical notes.",
);
requireSource(
  markdownSource,
  'block.language === "mermaid"',
  "MarkdownDocument must render Mermaid code blocks as diagram sections.",
);
requireSource(
  markdownSource,
  "target=\"_blank\"",
  "MarkdownDocument must render external links for source references.",
);

const topicActionIndex = topicDetailSource.indexOf("标记已学");
const topicTitleIndex = topicDetailSource.indexOf("{topic.title}");
if (topicActionIndex === -1 || topicTitleIndex === -1 || topicActionIndex > topicTitleIndex) {
  errors.push("TopicDetail learned action should live in the top topic header, before the topic title content.");
}

if (errors.length > 0) {
  console.error("Interview UI contract validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Interview UI contract validation passed.");
