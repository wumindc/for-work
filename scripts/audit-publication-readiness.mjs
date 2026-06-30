// @author codex
import fs from "node:fs";
import path from "node:path";
import { categories, domains, questions, topics } from "../src/data/index.ts";

const root = process.cwd();
const topicDir = path.join(root, "content", "topics");
const questionDir = path.join(root, "content", "questions");
const reportPath = path.join(
  root,
  "docs",
  "content-audits",
  "publication-readiness-report.md",
);

const args = new Set(process.argv.slice(2));
const writeReport = args.has("--write-report");
const strict = args.has("--strict");

const compactLength = (text) => text.replace(/\s/g, "").length;
const countMatches = (text, pattern) => text.match(pattern)?.length ?? 0;
const hasAny = (text, terms) => terms.some((term) => text.includes(term));
const readMarkdown = (dir, id) =>
  fs.readFileSync(path.join(dir, `${id}.md`), "utf8");

const categoryById = new Map(categories.map((category) => [category.id, category]));
const domainById = new Map(domains.map((domain) => [domain.id, domain]));
const topicById = new Map(topics.map((topic) => [topic.id, topic]));

const sourceIntentTerms = [
  "用于支持",
  "用于说明",
  "用于确认",
  "用于解释",
  "语义边界",
  "机制说明",
  "工程实践",
  "官方",
  "文档",
];

const incidentTerms = [
  "影响面",
  "止血",
  "根因",
  "回滚",
  "降级",
  "隔离",
  "修复",
  "回归",
  "复盘",
];

const mechanismTerms = [
  "机制",
  "数据流",
  "控制流",
  "状态",
  "协议",
  "字段",
  "schema",
  "trace",
  "链路",
];

const boundaryTerms = [
  "反例",
  "不适合",
  "不能",
  "边界",
  "限制",
  "误用",
  "代价",
  "取舍",
];

const interviewTerms = [
  "30 秒回答",
  "追问",
  "考察点",
  "项目化",
  "常见错误",
  "深问",
];

const hypeTerms = [
  "神器",
  "王炸",
  "吊打",
  "封神",
  "完美",
  "无脑",
  "彻底解决",
];

const absoluteTerms = [
  "绝对",
  "永远",
  "一定不会",
];

const performanceClaimPattern =
  /(速度最快|性能最强|准确率最高|排名第一|全球第一|行业第一|提升\s*\d+|降低\s*\d+|\d+(\.\d+)?\s*(倍|x|X|%))/;

const requiredSectionsByKind = {
  topic: [
    "## 面试定位",
    "## 架构与运行机制",
    "## 系统设计案例",
    "## 真实问题与排障",
    "## 来源与延伸阅读",
  ],
  question: [
    "## 面试定位",
    "## 30 秒回答",
    "## 架构与运行机制",
    "## 多轮追问模拟",
    "## 边界条件与反例",
    "## 来源与延伸阅读",
  ],
};

const issue = (severity, code, message) => ({ severity, code, message });

const scoreDocument = ({ id, kind, text, domainId }) => {
  const issues = [];
  const chars = compactLength(text);
  const minChars = kind === "topic" ? 4200 : 3000;
  const targetChars = kind === "topic" ? 5200 : 3800;
  const linkCount = countMatches(text, /\[[^\]]+\]\(https?:\/\/[^)]+\)/g);
  const mermaidCount = countMatches(text, /```mermaid/g);
  const tableRows = countMatches(text, /^\|.*\|$/gm);

  if (!text.startsWith("# ")) {
    issues.push(issue("blocker", "missing_h1", "文章必须以 H1 标题开头。"));
  }

  if (chars < minChars) {
    issues.push(
      issue(
        "major",
        "too_short",
        `${kind === "topic" ? "知识点" : "面试题"}正文偏短：${chars} < ${minChars}。`,
      ),
    );
  } else if (chars < targetChars) {
    issues.push(
      issue(
        "minor",
        "thin_depth",
        `正文刚过基础线但还不够从容：${chars} < ${targetChars}。`,
      ),
    );
  }

  for (const section of requiredSectionsByKind[kind]) {
    if (!text.includes(section)) {
      issues.push(issue("major", "missing_section", `缺少章节：${section}`));
    }
  }

  if (mermaidCount < 1) {
    issues.push(issue("major", "missing_diagram", "缺少 Mermaid 图。"));
  }

  if (!/图\s*\d/.test(text)) {
    issues.push(issue("major", "missing_figure_caption", "缺少“图 N”图注。"));
  }

  if (!hasAny(text, ["这张图", "图中", "图里", "图 1", "图1"])) {
    issues.push(
      issue("major", "missing_figure_explanation", "缺少对图中节点、边界或状态变化的解释。"),
    );
  }

  if (kind === "topic" && tableRows < 6) {
    issues.push(issue("major", "thin_table", "知识点缺少足够完整的取舍表或字段表。"));
  }

  if (!hasAny(text, mechanismTerms)) {
    issues.push(issue("major", "missing_mechanism", "缺少机制、状态、字段或数据流展开。"));
  }

  if (!hasAny(text, incidentTerms)) {
    issues.push(issue("major", "missing_incident_playbook", "缺少影响面、止血、根因、回归等排障链路。"));
  }

  if (!hasAny(text, boundaryTerms)) {
    issues.push(issue("major", "missing_boundary", "缺少反例、边界条件或误用风险。"));
  }

  if (!hasAny(text, ["指标", "p95", "latency", "error_rate", "retry", "SLA", "成功率"])) {
    issues.push(issue("major", "missing_metrics", "缺少可观测指标或效果验证方式。"));
  }

  if (kind === "question" && !hasAny(text, interviewTerms)) {
    issues.push(issue("major", "missing_interview_scaffolding", "面试题缺少口述、追问或项目化回答结构。"));
  }

  if (linkCount < 2) {
    issues.push(issue("major", "thin_sources", `来源链接偏少：${linkCount} < 2。`));
  }

  if (!hasAny(text, sourceIntentTerms)) {
    issues.push(issue("major", "missing_source_intent", "来源只贴链接不够，必须说明支持了什么结论。"));
  }

  const hypeHits = hypeTerms.filter((term) => text.includes(term));
  if (hypeHits.length > 0) {
    issues.push(
      issue("blocker", "hype_language", `存在发布级文章不宜使用的夸张词：${hypeHits.join("、")}。`),
    );
  }

  const absoluteHits = absoluteTerms.filter((term) => text.includes(term));
  if (absoluteHits.length > 0) {
    issues.push(
      issue("major", "risky_absolute_language", `存在需要人工复核的绝对化表述：${absoluteHits.join("、")}。`),
    );
  }

  if (performanceClaimPattern.test(text) && !hasAny(text, ["来源", "官方", "基准", "benchmark", "实测", "口径"])) {
    issues.push(
      issue(
        "blocker",
        "unqualified_performance_claim",
        "存在性能/排名类表述，但缺少来源、基准或口径说明。",
      ),
    );
  }

  const severityRank = { blocker: 3, major: 2, minor: 1 };
  const score = Math.max(
    0,
    100 -
      issues.reduce((total, item) => {
        if (item.severity === "blocker") return total + 35;
        if (item.severity === "major") return total + 12;
        return total + 4;
      }, 0),
  );

  return {
    id,
    kind,
    domainId,
    chars,
    score,
    readiness:
      issues.some((item) => item.severity === "blocker")
        ? "blocked"
        : score >= 88 && !issues.some((item) => item.severity === "major")
          ? "publishable"
          : "needs_revision",
    issues: issues.sort(
      (left, right) =>
        severityRank[right.severity] - severityRank[left.severity] ||
        left.code.localeCompare(right.code),
    ),
  };
};

const topicReports = topics.map((topic) => {
  const category = categoryById.get(topic.categoryId);
  const domainId = category?.domainId ?? "unknown";
  return scoreDocument({
    id: topic.id,
    kind: "topic",
    text: readMarkdown(topicDir, topic.id),
    domainId,
  });
});

const questionReports = questions.map((question) => {
  const topicId = question.topicIds[0];
  const topic = topicById.get(topicId);
  const category = topic ? categoryById.get(topic.categoryId) : undefined;
  const domainId = category?.domainId ?? "unknown";
  return scoreDocument({
    id: question.id,
    kind: "question",
    text: readMarkdown(questionDir, question.id),
    domainId,
  });
});

const reports = [...topicReports, ...questionReports];
const bySeverity = reports.reduce(
  (acc, report) => {
    for (const item of report.issues) {
      acc[item.severity] += 1;
      acc.codes[item.code] = (acc.codes[item.code] ?? 0) + 1;
    }
    return acc;
  },
  { blocker: 0, major: 0, minor: 0, codes: {} },
);

const domainReports = domains.map((domain) => {
  const items = reports.filter((report) => report.domainId === domain.id);
  const avgScore = items.length
    ? Math.round(items.reduce((total, item) => total + item.score, 0) / items.length)
    : 0;
  return {
    domain: domain.id,
    title: domain.title,
    documents: items.length,
    publishable: items.filter((item) => item.readiness === "publishable").length,
    needsRevision: items.filter((item) => item.readiness === "needs_revision").length,
    blocked: items.filter((item) => item.readiness === "blocked").length,
    avgScore,
  };
});

const sortReports = (left, right) =>
  left.score - right.score ||
  right.issues.length - left.issues.length ||
  left.domainId.localeCompare(right.domainId) ||
  left.id.localeCompare(right.id);

const topPriority = [...reports].sort(sortReports).slice(0, 50);

const report = {
  totals: {
    documents: reports.length,
    topics: topicReports.length,
    questions: questionReports.length,
    publishable: reports.filter((item) => item.readiness === "publishable").length,
    needsRevision: reports.filter((item) => item.readiness === "needs_revision").length,
    blocked: reports.filter((item) => item.readiness === "blocked").length,
    avgScore: Math.round(
      reports.reduce((total, item) => total + item.score, 0) / reports.length,
    ),
  },
  issueCounts: bySeverity,
  domains: domainReports,
  topPriority,
};

const renderMarkdownReport = () => {
  const lines = [
    "# Publication Readiness Audit",
    "",
    "> @author codex",
    "",
    "This report is generated by `npm run audit:publication-readiness`.",
    "It is advisory by default: it identifies the next content-review backlog without blocking build or deploy.",
    "",
    "## Summary",
    "",
    `- Documents: ${report.totals.documents} (${report.totals.topics} topics, ${report.totals.questions} questions)`,
    `- Publishable: ${report.totals.publishable}`,
    `- Needs revision: ${report.totals.needsRevision}`,
    `- Blocked: ${report.totals.blocked}`,
    `- Average score: ${report.totals.avgScore}`,
    `- Issues: blocker ${bySeverity.blocker}, major ${bySeverity.major}, minor ${bySeverity.minor}`,
    "",
    "## Domain Readiness",
    "",
    "| Domain | Docs | Publishable | Needs revision | Blocked | Avg score |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...domainReports.map(
      (item) =>
        `| ${item.title} | ${item.documents} | ${item.publishable} | ${item.needsRevision} | ${item.blocked} | ${item.avgScore} |`,
    ),
    "",
    "## Top Issue Codes",
    "",
    "| Code | Count |",
    "| --- | ---: |",
    ...Object.entries(bySeverity.codes)
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .map(([code, count]) => `| ${code} | ${count} |`),
    "",
    "## First 50 Revision Targets",
    "",
    "| Rank | Kind | Domain | ID | Score | Readiness | Main issues |",
    "| ---: | --- | --- | --- | ---: | --- | --- |",
    ...topPriority.map((item, index) => {
      const issues = item.issues
        .slice(0, 5)
        .map((issueItem) => `${issueItem.severity}:${issueItem.code}`)
        .join("<br>");
      return `| ${index + 1} | ${item.kind} | ${item.domainId} | \`${item.id}\` | ${item.score} | ${item.readiness} | ${issues} |`;
    }),
    "",
    "## How To Use",
    "",
    "1. Start with blocked documents, then low-score `needs_revision` documents.",
    "2. Upgrade in domain batches so terminology and source policy stay consistent.",
    "3. After each batch, run `npm run validate:all`, `npm run audit:technical-depth`, `npm run audit:content-rigor`, and this audit again.",
    "4. Only promote this audit to strict mode after the backlog is intentionally burned down.",
    "",
  ];
  return `${lines.join("\n")}\n`;
};

if (writeReport) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, renderMarkdownReport(), "utf8");
}

console.log(JSON.stringify(report, null, 2));

if (strict && (report.totals.blocked > 0 || report.totals.needsRevision > 0)) {
  process.exit(1);
}
