// @author codex
import fs from "node:fs";
import path from "node:path";
import { questions, topics } from "../src/data/index.ts";

const root = process.cwd();
const topicDir = path.join(root, "content", "topics");
const questionDir = path.join(root, "content", "questions");

const sampleTopicIds = [
  "rag-pipeline",
  "function-calling",
  "mcp-fundamentals",
  "es-shards-write-path",
  "mq-reliable-delivery-idempotency",
  "redis-cache-consistency",
  "redis-hotkey-breakdown-avalanche",
  "db-index-execution-plan",
  "db-mvcc-transaction-isolation",
  "java-thread-pool-governance",
  "jvm-gc-troubleshooting",
];

const sampleQuestionIds = [
  "q-rag-pipeline-core",
  "q-function-calling-core",
  "q-mcp-fundamentals-core",
  "q-es-index-shard-write",
  "q-mq-reliable-delivery",
  "q-redis-cache-consistency",
  "q-redis-hotkey-breakdown-avalanche",
  "q-db-index-execution-plan",
  "q-db-mvcc-transaction-isolation",
  "q-java-thread-pool-governance",
  "q-jvm-gc-troubleshooting",
];

const readMarkdown = (dir, id) =>
  fs.readFileSync(path.join(dir, `${id}.md`), "utf8");

const compactLength = (text) => text.replace(/\s/g, "").length;
const countMatches = (text, pattern) => text.match(pattern)?.length ?? 0;

const rigorDimensions = {
  numberedFigure: [/图\s*1/, /图\s*2/, /图\s*\d/],
  figureExplanation: ["这张图", "图中", "图里", "图 1", "图1"],
  sourceIntent: ["用于支持", "用于说明", "用于确认", "语义边界", "官方", "文档"],
  dataStructure: ["字段", "schema", "状态字段", "索引字段", "trace", "表结构", "协议"],
  incidentPlaybook: ["影响面", "止血", "根因", "回滚", "降级", "隔离", "回归"],
  counterExample: ["反例", "不适合", "不能", "边界条件", "误用"],
  projectAnswer: ["项目", "指标", "失败案例", "改进", "生产", "上线"],
};

const hasPatternOrTerm = (text, termsOrPatterns) =>
  termsOrPatterns.some((item) =>
    item instanceof RegExp ? item.test(text) : text.includes(item),
  );

const scoreDocument = ({ id, kind, text }) => {
  const issues = [];
  const minChars = kind === "topic" ? 4200 : 2600;
  const chars = compactLength(text);

  if (chars < minChars) {
    issues.push(`too short for rigor: ${chars} < ${minChars}`);
  }

  if (countMatches(text, /```mermaid/g) < 1) {
    issues.push("missing mermaid diagram");
  }

  for (const [dimension, terms] of Object.entries(rigorDimensions)) {
    if (!hasPatternOrTerm(text, terms)) {
      issues.push(`missing rigor dimension: ${dimension}`);
    }
  }

  if (kind === "topic" && countMatches(text, /^\|.*\|$/gm) < 6) {
    issues.push("topic needs a substantial comparison table");
  }

  if (!text.includes("## 来源与延伸阅读") && !text.includes("## 参考资料")) {
    issues.push("missing source/reference section");
  }

  if (kind === "question" && !text.includes("## 30 秒回答")) {
    issues.push("question missing 30-second answer");
  }

  return { id, kind, chars, issues };
};

const topicIds = new Set(topics.map((topic) => topic.id));
const questionIds = new Set(questions.map((question) => question.id));

const reports = [
  ...sampleTopicIds
    .filter((id) => topicIds.has(id))
    .map((id) =>
      scoreDocument({ id, kind: "topic", text: readMarkdown(topicDir, id) }),
    ),
  ...sampleQuestionIds
    .filter((id) => questionIds.has(id))
    .map((id) =>
      scoreDocument({
        id,
        kind: "question",
        text: readMarkdown(questionDir, id),
      }),
    ),
];

const failing = reports.filter((report) => report.issues.length > 0);

console.log(
  JSON.stringify(
    {
      totals: {
        checked: reports.length,
        failing: failing.length,
        passing: reports.length - failing.length,
      },
      failing: failing.sort(
        (left, right) =>
          right.issues.length - left.issues.length ||
          left.chars - right.chars ||
          left.id.localeCompare(right.id),
      ),
    },
    null,
    2,
  ),
);

if (failing.length > 0) {
  process.exit(1);
}
