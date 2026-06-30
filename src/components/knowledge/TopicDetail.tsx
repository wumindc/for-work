// @author codex
import { CheckCircle2 } from "lucide-react";
import { categories, domainById, sourceById, topicById } from "../../data";
import { topicMarkdownById } from "../../data/markdownContent";
import type { Mastery, ScenarioCase, SystemDesignCase, Topic } from "../../types/knowledge";
import { frequencyLabels, priorityLabels } from "../../utils/labels";
import { Badge } from "../shared/Badge";
import { MarkdownDocument } from "../shared/MarkdownDocument";

type TopicDetailProps = {
  topicId: string | null;
  topicMastery: Record<string, Mastery>;
  onSetTopicMastery: (topicId: string, mastery: Mastery) => void;
  onOpenTopic: (topicId: string) => void;
  onOpenQuestion: (questionId: string) => void;
};

const categoryById = new Map(categories.map((category) => [category.id, category]));

const domainTitleOf = (topic: Topic) => {
  const category = categoryById.get(topic.categoryId);
  const domain = domainById.get(topic.domainId ?? category?.domainId ?? "");
  return domain?.title;
};

const unique = (items: string[]) =>
  items.filter((item, index) => item.trim() && items.indexOf(item) === index);

const contentSections = (topic: Topic) => [
  {
    title: "定义与边界",
    items: unique([
      ...(topic.definition ?? []),
      topic.summary,
      ...topic.mustRemember.slice(0, 2),
    ]),
  },
  {
    title: "核心原理",
    items: unique([
      ...(topic.principles ?? []),
      ...(topic.deepDive?.mentalModel ?? []),
      ...topic.details,
    ]),
  },
  {
    title: "业界方案",
    items: unique([
      ...(topic.industrySolutions ?? []),
      ...(topic.deepDive?.interviewAngles ?? []),
    ]),
  },
  {
    title: "工程落地",
    items: unique([
      ...(topic.engineeringDetails ?? []),
      ...topic.engineeringNotes,
      ...(topic.deepDive?.implementationChecklist ?? []),
    ]),
  },
  {
    title: "性能、稳定性与成本取舍",
    items: unique([...(topic.tradeoffs ?? []), ...(topic.deepDive?.metrics ?? [])]),
  },
  {
    title: "常见问题",
    items: unique(topic.commonPitfalls),
    tone: "warn" as const,
  },
  {
    title: "经验迁移",
    items: unique(topic.experienceBridge ?? []),
  },
].filter((section) => section.items.length > 0);

function TextSection({
  items,
  title,
  tone = "default",
}: {
  items: string[];
  title: string;
  tone?: "default" | "warn";
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <p
            className={`text-sm leading-7 ${
              tone === "warn" ? "text-amber-900" : "text-slate-700"
            }`}
            key={`${title}-${index}-${item}`}
          >
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}

function ScenarioCard({ scenario }: { scenario: ScenarioCase }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-base font-bold text-slate-950">{scenario.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-700">{scenario.context}</p>
      <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm leading-7 text-slate-700">
        {scenario.problem}
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-xs font-bold text-slate-500">设计要点</h4>
          <ul className="mt-2 space-y-2">
            {scenario.design.map((item) => (
              <li className="text-sm leading-6 text-slate-700" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-500">失败模式</h4>
          <ul className="mt-2 space-y-2">
            {scenario.failureModes.map((item) => (
              <li className="text-sm leading-6 text-slate-700" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {scenario.metrics.map((metric) => (
          <Badge key={metric}>{metric}</Badge>
        ))}
      </div>
    </article>
  );
}

function SystemDesignCard({ item }: { item: SystemDesignCase }) {
  const blocks = [
    ["需求", item.requirements],
    ["架构", item.architecture],
    ["数据流", item.dataFlow],
    ["扩展点", item.scalingPoints],
    ["可观测性", item.observability],
    ["取舍", item.tradeoffs],
  ] as const;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-base font-bold text-slate-950">{item.title}</h3>
      {item.architectureDiagram?.length ? (
        <pre className="mt-4 overflow-x-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">
          {item.architectureDiagram.join("\n")}
        </pre>
      ) : null}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {blocks.map(([label, values]) => (
          <div className="rounded-md bg-slate-50 p-3" key={label}>
            <h4 className="text-xs font-bold text-slate-500">{label}</h4>
            <ul className="mt-2 space-y-2">
              {values.map((value) => (
                <li className="text-sm leading-6 text-slate-700" key={value}>
                  {value}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}

export function TopicDetail({
  topicId,
  topicMastery,
  onSetTopicMastery,
}: TopicDetailProps) {
  const topic = topicId ? topicById.get(topicId) : undefined;

  if (!topic) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-600">请选择一个知识点。</p>
      </section>
    );
  }

  const sources = topic.sourceIds
    .map((sourceId) => sourceById.get(sourceId))
    .filter(Boolean);
  const authoredMarkdown = topicMarkdownById.get(topic.id);
  const isLearned = Boolean(topicMastery[topic.id] && topicMastery[topic.id] !== "new");

  return (
    <article className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {domainTitleOf(topic) ? <Badge tone="blue">{domainTitleOf(topic)}</Badge> : null}
            <Badge tone={topic.priority === "must" ? "green" : "amber"}>
              {priorityLabels[topic.priority]}
            </Badge>
            <Badge tone={topic.interviewFrequency === "high" ? "red" : "blue"}>
              {frequencyLabels[topic.interviewFrequency]}
            </Badge>
            <Badge>{isLearned ? "已学习" : "未学习"}</Badge>
          </div>
          <button
            className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition ${
              isLearned
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
            onClick={() =>
              onSetTopicMastery(topic.id, isLearned ? "new" : "can_explain")
            }
            title={isLearned ? "点击取消已学" : "标记为已学习"}
            type="button"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isLearned ? "已学习" : "标记已学"}
          </button>
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-normal text-slate-950">
          {topic.title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-700">{topic.summary}</p>
      </section>

      {authoredMarkdown ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <MarkdownDocument markdown={authoredMarkdown} />
        </section>
      ) : (
        <>
          <div className="grid gap-5 xl:grid-cols-2">
            {contentSections(topic).map((section) => (
              <TextSection
                items={section.items}
                key={section.title}
                title={section.title}
                tone={section.tone}
              />
            ))}
          </div>

          {topic.scenarios?.length ? (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-950">生产应用场景</h2>
              <div className="grid gap-4 xl:grid-cols-2">
                {topic.scenarios.map((scenario) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} />
                ))}
              </div>
            </section>
          ) : null}

          {topic.systemDesignCases?.length ? (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-950">系统设计案例</h2>
              <div className="space-y-4">
                {topic.systemDesignCases.map((item) => (
                  <SystemDesignCard item={item} key={item.id} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      {sources.length ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-950">参考资料</h2>
          <div className="mt-3 space-y-2">
            {sources.map((source) => (
              <a
                className="block text-sm font-semibold leading-6 text-slate-700 hover:text-slate-950"
                href={source?.url}
                key={source?.id}
                rel="noreferrer"
                target="_blank"
              >
                {source?.title}
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
