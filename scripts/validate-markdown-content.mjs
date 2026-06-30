// @author codex
import fs from "node:fs";
import path from "node:path";
import { questions, topics } from "../src/data/index.ts";

const errors = [];
const root = process.cwd();
const topicDir = path.join(root, "content", "topics");
const questionDir = path.join(root, "content", "questions");
const requiredSections = [
  "## 面试定位",
  "## 架构与运行机制",
  "## 系统设计案例",
  "## 真实问题与排障",
];

const minChars = (value) => value.replace(/\s/g, "").length;
const readMarkdown = (dir, id) => {
  const filePath = path.join(dir, `${id}.md`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8");
};
const markdownIds = (dir) =>
  fs.existsSync(dir)
    ? new Set(
        fs
          .readdirSync(dir)
          .filter((fileName) => fileName.endsWith(".md"))
          .map((fileName) => fileName.replace(/\.md$/, "")),
      )
    : new Set();

const validateMarkdown = ({ id, kind, text }) => {
  if (!text.startsWith("# ")) {
    errors.push(`${kind} markdown ${id} must start with an H1 title`);
  }
  if (minChars(text) < 1200) {
    errors.push(`${kind} markdown ${id} is too shallow; expected at least 1200 non-space chars`);
  }
  for (const section of requiredSections) {
    if (!text.includes(section)) {
      errors.push(`${kind} markdown ${id} must include section: ${section}`);
    }
  }
  for (const term of ["架构", "数据流", "指标", "取舍", "追问"]) {
    if (!text.includes(term)) {
      errors.push(`${kind} markdown ${id} must mention ${term}`);
    }
  }
};

const topicIds = new Set(topics.map((topic) => topic.id));
const questionIds = new Set(questions.map((question) => question.id));
const topicMarkdownIds = markdownIds(topicDir);
const questionMarkdownIds = markdownIds(questionDir);

for (const topic of topics) {
  const text = readMarkdown(topicDir, topic.id);
  if (!text) {
    errors.push(`missing topic markdown: ${topic.id}`);
    continue;
  }
  validateMarkdown({ id: topic.id, kind: "topic", text });
}

for (const question of questions) {
  const text = readMarkdown(questionDir, question.id);
  if (!text) {
    errors.push(`missing question markdown: ${question.id}`);
    continue;
  }
  validateMarkdown({ id: question.id, kind: "question", text });
}

for (const id of topicMarkdownIds) {
  if (!topicIds.has(id)) {
    errors.push(`orphan topic markdown without topic data: ${id}`);
  }
}

for (const id of questionMarkdownIds) {
  if (!questionIds.has(id)) {
    errors.push(`orphan question markdown without question data: ${id}`);
  }
}

const missingTopicMarkdown = topics
  .map((topic) => topic.id)
  .filter((id) => !topicMarkdownIds.has(id));
const missingQuestionMarkdown = questions
  .map((question) => question.id)
  .filter((id) => !questionMarkdownIds.has(id));

const report = {
  topics: {
    total: topics.length,
    markdown: topicMarkdownIds.size,
    missing: missingTopicMarkdown.length,
    required: topics.length,
  },
  questions: {
    total: questions.length,
    markdown: questionMarkdownIds.size,
    missing: missingQuestionMarkdown.length,
    required: questions.length,
  },
  missingTopicMarkdown,
  missingQuestionMarkdown,
};

if (errors.length > 0) {
  console.error("Markdown content validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log("Markdown content validation passed.");
console.log(JSON.stringify(report, null, 2));
