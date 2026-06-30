// @author codex
import fs from "node:fs";
import path from "node:path";
import { questions, topics } from "../src/data/index.ts";

const root = process.cwd();
const topicDir = path.join(root, "content", "topics");
const questionDir = path.join(root, "content", "questions");

const readMarkdown = (dir, id) => fs.readFileSync(path.join(dir, `${id}.md`), "utf8");
const compactLength = (text) => text.replace(/\s/g, "").length;
const countMatches = (text, pattern) => text.match(pattern)?.length ?? 0;
const hasAny = (text, terms) => terms.some((term) => text.includes(term));

const sharedDepthSignals = {
  mechanism: ["机制", "链路", "状态", "协议", "数据流", "执行", "调度"],
  boundary: ["边界", "反例", "不适合", "失败", "降级", "限制"],
  operations: ["指标", "p95", "latency", "error", "retry", "trace", "排障"],
  tradeoff: ["取舍", "成本", "延迟", "吞吐", "准确率", "一致性", "可观测"],
  project: ["项目", "生产", "上线", "SLA", "回滚", "审计", "权限"],
};

const requiredTopicSections = [
  "## 深入技术细节",
  "## 关键数据结构与协议",
  "## 深问准备",
];

const requiredQuestionSections = [
  "## 深挖技术细节",
  "## 边界条件与反例",
  "## 深问准备",
];

const scoreDocument = ({ id, kind, text }) => {
  const minChars = kind === "topic" ? 3600 : 2200;
  const requiredSections = kind === "topic" ? requiredTopicSections : requiredQuestionSections;
  const issues = [];
  const chars = compactLength(text);

  if (chars < minChars) {
    issues.push(`too short: ${chars} < ${minChars}`);
  }

  for (const section of requiredSections) {
    if (!text.includes(section)) {
      issues.push(`missing section: ${section}`);
    }
  }

  for (const [dimension, terms] of Object.entries(sharedDepthSignals)) {
    if (!hasAny(text, terms)) {
      issues.push(`missing depth signal: ${dimension}`);
    }
  }

  if (countMatches(text, /```mermaid/g) < 1) {
    issues.push("missing mermaid diagram");
  }

  if (kind === "topic" && countMatches(text, /^\|.*\|$/gm) < 6) {
    issues.push("topic needs at least one substantial table");
  }

  if (!text.includes("## 来源与延伸阅读") && !text.includes("参考资料")) {
    issues.push("missing source/reference section");
  }

  return { id, kind, chars, issues };
};

const topicReports = topics.map((topic) =>
  scoreDocument({ id: topic.id, kind: "topic", text: readMarkdown(topicDir, topic.id) }),
);
const questionReports = questions.map((question) =>
  scoreDocument({
    id: question.id,
    kind: "question",
    text: readMarkdown(questionDir, question.id),
  }),
);
const failing = [...topicReports, ...questionReports].filter(
  (report) => report.issues.length > 0,
);
const issueCounts = failing.reduce((counts, report) => {
  for (const issue of report.issues) {
    const key = issue.replace(/: .+$/, "");
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}, {});

const sortFailures = (left, right) =>
  right.issues.length - left.issues.length || left.chars - right.chars || left.id.localeCompare(right.id);

const report = {
  totals: {
    topics: topicReports.length,
    questions: questionReports.length,
    failing: failing.length,
    passing: topicReports.length + questionReports.length - failing.length,
  },
  issueCounts,
  topFailing: failing.sort(sortFailures).slice(0, 40),
};

console.log(JSON.stringify(report, null, 2));

if (failing.length > 0) {
  process.exit(1);
}
